const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Coupon description is required'],
    },
    type: {
      type: String,
      enum: ['percent', 'flat', 'freeDelivery'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrder: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    validTill: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ code: 1, isActive: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
