const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Food item name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Dish image URL is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    category: {
      type: String,
      required: [true, 'Menu category is required'],
      trim: true,
      index: true,
    },
    quantity: {
      type: String,
      default: '1 Portion (Serves 1-2)',
      trim: true,
    },
    nutrition: {
      calories: { type: Number, default: 450 },
      protein: { type: Number, default: 18 },
      carbs: { type: Number, default: 52 },
      fat: { type: Number, default: 16 },
      fiber: { type: Number, default: 5 },
      sugar: { type: Number, default: 6 },
      sodium: { type: Number, default: 450 },
    },
    isVeg: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

foodSchema.index({ name: 'text', description: 'text' });
foodSchema.index({ isAvailable: 1, isPopular: 1 });
foodSchema.index({ restaurant: 1, isAvailable: 1 });
foodSchema.index({ category: 1, isAvailable: 1 });

module.exports = mongoose.model('Food', foodSchema);
