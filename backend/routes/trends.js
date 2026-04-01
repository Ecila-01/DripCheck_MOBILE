// backend/routes/trends.js
const express = require('express');
const router = express.Router();

router.get('/popular', async (req, res) => {
  try {
    const NEWS_API_KEY = process.env.NEWS_API_KEY; 
    
    // 1. Stricter query focusing ONLY on clothes and styling
   // Make the query hyper-specific to students and young adults  
    const query = '("streetwear" OR "Gen Z fashion" OR "college outfits" OR "back to school fashion" OR "affordable style")';
    
    // 2. Restrict results to dedicated fashion and lifestyle domains
    const domains = 'vogue.com,hypebeast.com,gq.com,highsnobiety.com,refinery29.com,elle.com,whowhatwear.com';
    
    // 3. Fetch from NewsAPI (Notice we added &domains=${domains} to this URL!)
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&domains=${domains}&language=en&sortBy=publishedAt&pageSize=15&apiKey=${NEWS_API_KEY}`
    );
    
    const data = await response.json();

    if (data.status !== 'ok') {
      return res.status(400).json({ message: 'Failed to fetch trends' });
    }

    // Filter out articles that don't have images
    const articlesWithImages = data.articles.filter(article => article.urlToImage !== null);

    res.json({ trends: articlesWithImages });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ message: 'Server error fetching trends' });
  }
});

module.exports = router;