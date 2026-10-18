const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Restaurant image URL is required'],
    },
    banner: {
      type: String,
      default: '',
    },
    cuisines: {
      type: [String],
      required: [true, 'At least one cuisine is required'],
      validate: [(val) => val.length > 0, 'Provide at least one cuisine'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.2,
      min: 1,
      max: 5,
    },
    deliveryTimeMins: {
      type: Number,
      default: 30,
    },
    priceRange: {
      type: String,
      enum: ['₹', '₹₹', '₹₹₹'],
      default: '₹₹',
    },
    isVeg: {
      type: Boolean,
      default: false,
    },
    isPureVeg: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: 'Bangalore' },
      state: { type: String, default: 'Karnataka' },
      pincode: { type: String, default: '560001' },
    },
  },
  {
    timestamps: true,
  }
);

// Text index for searching
restaurantSchema.index({ name: 'text', cuisines: 'text' });
restaurantSchema.index({ isActive: 1, rating: -1 });
restaurantSchema.index({ cuisines: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
