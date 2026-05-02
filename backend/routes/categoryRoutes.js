const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const { logAction } = require('../utils/logger');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create category (Admin with 'categories' permission or Superadmin)
router.post('/', auth, auth.admin, auth.hasPermission('categories'), async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();

    await logAction(req, 'CREATE_CATEGORY', 'CATEGORY', category._id, {
      name: category.name,
      slug: category.slug
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update category (Admin with 'categories' permission or Superadmin)
router.put('/:id', auth, auth.admin, auth.hasPermission('categories'), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await logAction(req, 'UPDATE_CATEGORY', 'CATEGORY', category._id, {
      name: category.name,
      changes: req.body
    });

    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete category (Admin with 'categories' permission or Superadmin)
router.delete('/:id', auth, auth.admin, auth.hasPermission('categories'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await logAction(req, 'DELETE_CATEGORY', 'CATEGORY', category._id, {
      name: category.name
    });

    await category.deleteOne();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
