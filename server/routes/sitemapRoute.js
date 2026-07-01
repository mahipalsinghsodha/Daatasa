const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

/**
 * GET /sitemap.xml
 * Dynamically generates a sitemap for public pages + all active products.
 * Should be served at the root level: https://daatasa.in/sitemap.xml
 */
router.get('/', async (req, res) => {
  try {
    const BASE_URL = process.env.CLIENT_URL || 'https://daatasa.in';
    const now = new Date().toISOString().split('T')[0];

    // Fetch all active products
    const products = await Product.find({ isActive: { $ne: false } })
      .select('_id updatedAt')
      .lean();

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/products', priority: '0.9', changefreq: 'daily' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact', priority: '0.6', changefreq: 'monthly' },
      { url: '/faq', priority: '0.6', changefreq: 'weekly' },
      { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { url: '/terms', priority: '0.3', changefreq: 'yearly' },
      { url: '/refund-policy', priority: '0.3', changefreq: 'yearly' },
      { url: '/shipping-policy', priority: '0.4', changefreq: 'monthly' },
    ];

    const staticXml = staticPages.map(p => `
    <url>
      <loc>${BASE_URL}${p.url}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>${p.changefreq}</changefreq>
      <priority>${p.priority}</priority>
    </url>`).join('');

    const productXml = products.map(p => `
    <url>
      <loc>${BASE_URL}/products/${p._id}</loc>
      <lastmod>${new Date(p.updatedAt || Date.now()).toISOString().split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}
${productXml}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Sitemap generation failed');
  }
});

module.exports = router;
