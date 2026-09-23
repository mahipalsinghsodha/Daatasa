// routes/searchRoutes.js
// GET /api/search?q=keyword&page=1&limit=20&category=&minPrice=&maxPrice=&rating=
// GET /api/search/suggestions?q=keyword   ← autocomplete (debounced on frontend)

const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');

const SYNONYM_MAP = {
  deshi: ['deshi', 'desi'],
  desi: ['desi', 'deshi'],
  ghree: ['ghree', 'ghee'],
  ghe: ['ghe', 'ghee'],
  belona: ['belona', 'bilona', 'bilone', 'valona'],
  bilona: ['bilona', 'belona', 'bilone', 'valona'],
  valona: ['valona', 'bilona', 'belona'],
  datasa: ['datasa', 'daatasa', 'dataasa'],
  dataasa: ['dataasa', 'daatasa', 'datasa'],
  daatasa: ['daatasa', 'dataasa', 'datasa'],
  shudh: ['shudh', 'shuddh', 'pure'],
  shuddh: ['shuddh', 'shudh', 'pure'],
  asli: ['asli', 'pure'],
  gai: ['gai', 'gaay', 'cow'],
  gaay: ['gaay', 'gai', 'cow'],
  'no 1': ['no 1', 'no.1', 'no1', 'best', 'bilona', 'ghee'],
  'no1': ['no1', 'no 1', 'best', 'bilona', 'ghee']
};

const buildSynonymRegex = (term) => {
  if (!term || typeof term !== 'string') return null;
  const words = term.trim().toLowerCase().split(/\s+/);
  const regexParts = words.map(w => {
    const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (SYNONYM_MAP[w]) {
      return `(${[...new Set([escaped, ...SYNONYM_MAP[w]])].join('|')})`;
    }
    return escaped;
  });
  return new RegExp(regexParts.join('.*'), 'i');
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  FULL-TEXT & FUZZY SEARCH                                                   */
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

    // Search using regex with synonym expansion (covers deshi, belona, ghree, datasa, etc.)
    if (q && q.trim()) {
      const synRegex = buildSynonymRegex(q);
      query.$or = [
        { name: synRegex },
        { description: synRegex },
        { tags: synRegex },
        { category: synRegex }
      ];
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
    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'popularity') {
      sortOption = { numReviews: -1, rating: -1 };
    } else {
      sortOption = { rating: -1, createdAt: -1 };
    }

    const [products, total] = await Promise.all([
      Product.find(query)
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

    const synRegex = buildSynonymRegex(q);

    const products = await Product.find(
      {
        isActive: true,
        $or: [
          { name: synRegex },
          { tags: synRegex },
          { category: synRegex }
        ]
      },
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
