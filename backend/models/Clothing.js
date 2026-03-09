const mongoose = require('mongoose');

const clothingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    icon: {
      type: String,
      default: '👕',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Tops',
        'Bottoms',
        'Dresses',
        'Outerwear',
        'Footwear',
        'Accessories',
        'Swimwear',
        'Traditional',
      ],
    },
    color: {
      type: String,
      default: '',
    },
    imageUri: {
      type: String,
      default: '',
    },
    weatherTags: {
      type: [String],
      default: [],
    },
    layerWeight: {
      type: String,
      enum: ['light', 'medium', 'heavy'],
      default: 'light',
    },
    occasion: {
      type: String,
      enum: ['casual', 'school', 'formal', 'sports'],
      default: 'casual',
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    lastWorn: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Clothing', clothingSchema);