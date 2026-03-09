const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Clothing = require('../models/Clothing');

// GET all clothing items for a specific user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const items = await Clothing.find({ userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('GET /api/clothing error:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST create clothing item for a specific user
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/clothing body:', req.body);

    const { userId, icon, name, category, color, imageUri, weatherTags, layerWeight, occasion, favorite, lastWorn } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const item = new Clothing({
      userId,
      icon,
      name,
      category,
      color,
      imageUri,
      weatherTags,
      layerWeight,
      occasion,
      favorite,
      lastWorn,
    });

    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('POST /api/clothing error:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT update clothing item, only if it belongs to the user
router.put('/:id', async (req, res) => {
  try {
    const { userId, ...updateData } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const updatedItem = await Clothing.findOneAndUpdate(
      { _id: req.params.id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Clothing item not found or not owned by user' });
    }

    res.json(updatedItem);
  } catch (error) {
    console.error('PUT /api/clothing/:id error:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE clothing item, only if it belongs to the user
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const deletedItem = await Clothing.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!deletedItem) {
      return res.status(404).json({ message: 'Clothing item not found or not owned by user' });
    }

    res.json({ message: 'Clothing item deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/clothing/:id error:', error);
    res.status(500).json({ message: error.message });
  }
});

// PATCH favorite, only if it belongs to the user
router.patch('/:id/favorite', async (req, res) => {
  try {
    const { userId, favorite } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const updatedItem = await Clothing.findOneAndUpdate(
      { _id: req.params.id, userId },
      { favorite },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Clothing item not found or not owned by user' });
    }

    res.json(updatedItem);
  } catch (error) {
    console.error('PATCH /api/clothing/:id/favorite error:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;