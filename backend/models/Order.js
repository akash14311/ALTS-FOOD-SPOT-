const mongoose = require('mongoose');

const orderItemSnapshotSchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
    isVeg: { type: Boolean, default: false },
  },
  { _id: false }
);

const orderAddressSnapshotSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    houseNo: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['Placed', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    },
    at: {
      type: Date,
      default: Date.now,
    },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    items: {
      type: [orderItemSnapshotSchema],
      required: true,
      validate: [(val) => val.length > 0, 'An order must contain at least one item'],
    },
    address: {
      type: orderAddressSnapshotSchema,
      required: true,
    },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    platformFee: { type: Number, default: 5 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String, default: null },
    paymentMethod: {
      type: String,
      enum: ['COD', 'UPI', 'CARD'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PAID',
    },
    status: {
      type: String,
      enum: ['Placed', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Placed',
      index: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: () => [{ status: 'Placed', at: new Date(), note: 'Order successfully placed' }],
    },
    estimatedDeliveryAt: {
      type: Date,
      default: () => new Date(Date.now() + 35 * 60 * 1000), // Default 35 mins from now
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
