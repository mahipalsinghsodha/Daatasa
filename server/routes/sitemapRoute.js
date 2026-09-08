const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Blog = require('../models/Blog');

/**
 * GET /sitemap.xml
 * Dynamically generates a sitemap for public pages + categories + blogs + all active products.
 * Accessible at root level: https://daatasa.com/sitemap.xml (or https://daatasa.in/sitemap.xml)
 */
router.get('/', async (req, res) => {
  try {
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const host = req.headers.host;
    const defaultHost = process.env.CLIENT_URL || 'https://daatasa.com';
    const BASE_URL = host && !host.includes('localhost') ? `${protocol}://${host}` : defaultHost;
    const now = new Date().toISOString().split('T')[0];

    // Parallel fetch of all public entities
    const [products, categories, blogs] = await Promise.all([
      Product.find({ isActive: { $ne: false } }).select('_id updatedAt name').lean().catch(() => []),
      Category.find().select('slug updatedAt').lean().catch(() => []),
      Blog.find({ isActive: { $ne: false } }).select('slug updatedAt').lean().catch(() => [])
    ]);

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/products', priority: '0.9', changefreq: 'daily' },
      { url: '/blogs', priority: '0.8', changefreq: 'daily' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/how-it-works', priority: '0.7', changefreq: 'monthly' },
      { url: '/b2b', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact', priority: '0.6', changefreq: 'monthly' },
      { url: '/faq', priority: '0.6', changefreq: 'weekly' },
      { url: '/gift-cards', priority: '0.5', changefreq: 'monthly' },
      { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { url: '/terms', priority: '0.3', changefreq: 'yearly' },
      { url: '/refund-policy', priority: '0.3', changefreq: 'yearly' },
      { url: '/shipping-policy', priority: '0.4', changefreq: 'monthly' },
      { url: '/disclaimer', priority: '0.3', changefreq: 'yearly' },
    ];

    const staticXml = staticPages.map(p => `
    <url>
      <loc>${BASE_URL}${p.url}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>${p.changefreq}</changefreq>
      <priority>${p.priority}</priority>
    </url>`).join('');

    const categoryXml = categories.map(c => `
    <url>
      <loc>${BASE_URL}/category/${c.slug}</loc>
      <lastmod>${new Date(c.updatedAt || Date.now()).toISOString().split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.85</priority>
    </url>`).join('');

    const blogXml = blogs.map(b => `
    <url>
      <loc>${BASE_URL}/blogs/${b.slug}</loc>
      <lastmod>${new Date(b.updatedAt || Date.now()).toISOString().split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`).join('');

    const productXml = products.map(p => `
    <url>
      <loc>${BASE_URL}/products/${p._id}</loc>
      <lastmod>${new Date(p.updatedAt || Date.now()).toISOString().split('T')[0]}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.9</priority>
    </url>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}
${categoryXml}
${blogXml}
${productXml}
</urlset>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(xml.trim());
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Sitemap generation failed');
  }
});

module.exports = router;

