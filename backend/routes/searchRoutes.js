// routes/searchRoutes.js
// GET /api/search?q=keyword&page=1&limit=20&category=&minPrice=&maxPrice=&rating=
// GET /api/search/suggestions?q=keyword   ← autocomplete (debounced on frontend)

const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');

/* ─────────────────────────────────────────────────────────────────────────── */
/*  FULL-TEXT SEARCH                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const {
      q        = '',
      page     = 1,
      limit    = 20,
      category,
      minPrice,
      maxPrice,
      rating,
      sort     = 'relevance', // relevance | price_asc | price_desc | newest
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const query = { isActive: true };

    // Full-text search using MongoDB text index
    if (q && q.trim()) {
      query.$text = { $search: q.trim() };
    }

    if (category) query.category = category.toLowerCase();
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (rating) query.rating = { $gte: parseFloat(rating) };

    // Sort options
    let sortOption = {};
    if (q && q.trim() && sort === 'relevance') {
      sortOption = { score: { $meta: 'textScore' } };
    } else if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'popularity') {
      sortOption = { numReviews: -1, rating: -1 };
    } else {
      sortOption = q && q.trim() ? { score: { $meta: 'textScore' } } : { createdAt: -1 };
    }

    const projection = q && q.trim()
      ? { score: { $meta: 'textScore' } }
      : {};

    const [products, total] = await Promise.all([
      Product.find(query, projection)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .select('name slug description category price mrp rating numReviews image images stock weight isActive tags')
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
      query: q,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed. Please try again.' });
  }
});

/* ─────────────────────────────────────────────────────────────────────────── */
/*  AUTOCOMPLETE SUGGESTIONS                                                   */
/*  Returns up to 8 product name suggestions for search dropdown              */
/* ─────────────────────────────────────────────────────────────────────────── */
router.get('/suggestions', async (req, res) => {
  try {
    const { q = '' } = req.query;
    if (!q.trim() || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    // Regex-based autocomplete (fast, no full-text score needed)
    const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const products = await Product.find(
      { name: regex, isActive: true },
      { name: 1, slug: 1, category: 1, image: 1, price: 1 }
    )
      .limit(8)
      .lean();

    res.json({
      suggestions: products.map(p => ({
        id:       p._id,
        name:     p.name,
        slug:     p.slug,
        category: p.category,
        image:    p.image,
        price:    p.price,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Suggestions failed' });
  }
});

module.exports = router;
