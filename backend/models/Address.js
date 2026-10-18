const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, '10-digit mobile number is required'],
      trim: true,
    },
    houseNo: {
      type: String,
      required: [true, 'Flat / House number is required'],
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'Street or Area is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, '6-digit pincode is required'],
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Address', addressSchema);
