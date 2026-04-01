// backend/routes/outfits.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Clothing = require('../models/Clothing');

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

    // 2. Fetch the outfit components concurrently
    const [top, bottom, footwear, outerwear] = await Promise.all([
      getRandomItem('Tops', targetTag),
      getRandomItem('Bottoms', targetTag),
      getRandomItem('Footwear', targetTag),
      (targetTag === 'cold' || targetTag === 'rainy') ? getRandomItem('Outerwear', targetTag) : null
    ]);

    // 3. Fallback Logic: If we don't have a complete base outfit (Top + Bottom)
    if (!top || !bottom) {
      // Define generic items based on the weather
      let genericTop = { name: "Comfortable Top", icon: "👕", _id: "gen_top" };
      let genericBottom = { name: "Everyday Pants", icon: "👖", _id: "gen_bot" };
      let genericOuter = null;

      if (targetTag === 'hot') {
        genericTop = { name: "Light T-Shirt or Tank", icon: "🎽", _id: "gen_top" };
        genericBottom = { name: "Breathable Shorts", icon: "🩳", _id: "gen_bot" };
      } else if (targetTag === 'warm') {
        genericTop = { name: "Short-sleeve Top", icon: "👕", _id: "gen_top" };
        genericBottom = { name: "Jeans or Chinos", icon: "👖", _id: "gen_bot" };
      } else if (targetTag === 'cold') {
        genericTop = { name: "Long-sleeve or Sweater", icon: "👕", _id: "gen_top" };
        genericBottom = { name: "Warm Pants", icon: "👖", _id: "gen_bot" };
        genericOuter = { name: "Heavy Coat or Jacket", icon: "🧥", _id: "gen_out" };
      } else if (targetTag === 'rainy') {
        genericTop = { name: "Layered Top", icon: "👕", _id: "gen_top" };
        genericBottom = { name: "Dark Pants", icon: "👖", _id: "gen_bot" };
        genericOuter = { name: "Rain Jacket", icon: "🧥", _id: "gen_out" };
      }

      // Return the generic outfit with a flag indicating it's a fallback
      return res.json({
        outfit: {
          top: top || genericTop,
          bottom: bottom || genericBottom,
          outerwear: outerwear || genericOuter,
          footwear: footwear || { name: "Weather-appropriate Shoes", icon: "👟", _id: "gen_shoe" }
        },
        isFallback: true,
        fallbackMessage: "No appropriate clothes found in your closet for this weather! Add more items but for now, here is a general suggestion:"
      });
    }

    // 4. Return the fully database-matched outfit
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