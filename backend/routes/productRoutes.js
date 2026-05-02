const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const { logAction } = require('../utils/logger');
const dbCheck = require('../middleware/dbCheck');

// Get all products with optional category filter
router.get('/', dbCheck, async (req, res) => {
  try {
    const { category, featured, search } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (req.query.all !== 'true') {
      query.isActive = { $ne: false }; // Supports old docs without isActive 
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      message: error.message || 'Error fetching products',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get single product
router.get('/:id', dbCheck, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    res.status(500).json({ 
      message: error.message || 'Error fetching product',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Create product (Admin with 'products' permission or Superadmin)
router.post('/', auth, auth.admin, auth.hasPermission('products'), async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    await logAction(req, 'CREATE_PRODUCT', 'PRODUCT', product._id, {
      name: product.name,
      price: product.price,
      category: product.category
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product (Admin with 'products' permission or Superadmin)
router.put('/:id', auth, auth.admin, auth.hasPermission('products'), async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    await logAction(req, 'UPDATE_PRODUCT', 'PRODUCT', product._id, {
      name: product.name,
      changes: req.body // simplified for now
    });

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product (Admin with 'products' permission or Superadmin)
router.delete('/:id', auth, auth.admin, auth.hasPermission('products'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await logAction(req, 'DELETE_PRODUCT', 'PRODUCT', product._id, {
      name: product.name
    });

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
