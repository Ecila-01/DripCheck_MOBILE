const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Clothing = require('../models/Clothing');

// -----------------------------------------------------------
// 1. CLOSET MANAGEMENT ROUTES (CRUD)
// -----------------------------------------------------------

// GET all clothing items for a specific user (Used by Closet and Profile Stats)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Valid userId is required' });
    }

    const items = await Clothing.find({ userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('GET /api/clothing error:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST create clothing item
router.post('/', async (req, res) => {
  try {
    const { userId, ...itemData } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Valid userId is required' });
    }

    const item = new Clothing({ userId, ...itemData });
    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('POST /api/clothing error:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT update clothing item
router.put('/:id', async (req, res) => {
  try {
    const { userId, ...updateData } = req.body;
    const updatedItem = await Clothing.findOneAndUpdate(
      { _id: req.params.id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE clothing item
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    const deletedItem = await Clothing.findOneAndDelete({ _id: req.params.id, userId });
    if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH favorite
router.patch('/:id/favorite', async (req, res) => {
  try {
    const { userId, favorite } = req.body;
    const updatedItem = await Clothing.findOneAndUpdate(
      { _id: req.params.id, userId },
      { favorite },
      { new: true }
    );
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// -----------------------------------------------------------
// 2. RECOMMENDATION LOGIC (Formerly in outfits.js)
// -----------------------------------------------------------

router.get('/recommend/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { temp, condition } = req.query;
    let targetTag = 'warm'; 
    const tempNum = Number(temp);

    if (tempNum >= 25) targetTag = 'hot';
    else if (tempNum <= 15) targetTag = 'cold';
    if (condition === 'Rain' || condition === 'Drizzle') targetTag = 'rainy';

    const getRandomItem = async (category, tag) => {
      const userObjectId = new mongoose.Types.ObjectId(userId); 
      const items = await Clothing.aggregate([
        { $match: { userId: userObjectId, category: category, weatherTags: tag } },
        { $sample: { size: 1 } }
      ]);
      return items.length > 0 ? items[0] : null;
    };

    const [top, bottom, footwear, outerwear] = await Promise.all([
      getRandomItem('Tops', targetTag),
      getRandomItem('Bottoms', targetTag),
      getRandomItem('Footwear', targetTag),
      (targetTag === 'cold' || targetTag === 'rainy') ? getRandomItem('Outerwear', targetTag) : null
    ]);

    if (!top || !bottom) {
      let genericTop = { name: "Comfortable Top", icon: "👕", _id: "gen_top" };
      let genericBottom = { name: "Everyday Pants", icon: "👖", _id: "gen_bot" };
      let genericOuter = null;

      if (targetTag === 'hot') {
        genericTop = { name: "Light T-Shirt", icon: "🎽", _id: "gen_top" };
        genericBottom = { name: "Shorts", icon: "🩳", _id: "gen_bot" };
      } else if (targetTag === 'cold') {
        genericOuter = { name: "Heavy Coat", icon: "🧥", _id: "gen_out" };
      }

      return res.json({
        outfit: {
          top: top || genericTop,
          bottom: bottom || genericBottom,
          outerwear: outerwear || genericOuter,
          footwear: footwear || { name: "Shoes", icon: "👟", _id: "gen_shoe" }
        },
        isFallback: true,
        fallbackMessage: "No appropriate clothes found in your closet! Here is a suggestion:"
      });
    }

    res.json({
      outfit: { top, bottom, outerwear, footwear },
      isFallback: false
    });

  } catch (error) {
    console.error('Recommendation Error:', error);
    res.status(500).json({ message: 'Server error generating outfit' });
  }
});

module.exports = router;