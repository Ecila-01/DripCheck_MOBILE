const mongoose = require('mongoose');

const clothingSchema = new mongoose.Schema({
  icon: { 
    type: String, 
    required: true,
    default: '👕'
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories', 'Swimwear', 'Traditional']
  },
  color: { 
    type: String, 
    default: '',
    trim: true
  },
  size: { 
    type: String, 
    default: '',
    trim: true
  },
  favorite: { 
    type: Boolean, 
    default: false 
  },
  imageUrl: { 
    type: String, 
    default: '' 
  },
  userId: { 
    type: String, 
    required: true,
    index: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt timestamp before saving
clothingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Clothing', clothingSchema);