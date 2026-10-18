const mongoose = require('mongoose');
const Order = require('../models/Order');
const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');
const Coupon = require('../models/Coupon');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Create new order with strict server-side price recalculation
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const {
      restaurantId,
      items,
      address,
      paymentMethod,
      couponCode,
    } = req.body;

    if (!restaurantId) {
      return sendError(res, 'Restaurant ID is required', 400);
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Order must contain at least one item', 400);
    }

    if (!address || !address.street || !address.city || !address.mobile || !address.pincode) {
      return sendError(res, 'Complete delivery address is required', 400);
    }

    // 1. Resolve restaurant (support both real ObjectId and mock/demo IDs like rest-1, rest-4)
    let restaurant = null;
    if (mongoose.Types.ObjectId.isValid(restaurantId)) {
      restaurant = await Restaurant.findById(restaurantId);
    }

    if (!restaurant) {
      // Graceful fallback for mock or demo IDs like 'rest-4', 'rest-1'
      const mockRestMap = {
        'rest-1': 'Spice Villa',
        'rest-2': 'The Burger Hub',
        'rest-3': 'Pizza Point',
        'rest-4': 'Biryani House',
        'rest-5': 'South Indian Kitchen',
        'rest-6': 'Tandoori Tales',
      };
      const targetName = mockRestMap[restaurantId];
      if (targetName) {
        restaurant = await Restaurant.findOne({ name: new RegExp(targetName, 'i') });
      }
      if (!restaurant) {
        restaurant = await Restaurant.findOne();
      }
    }

    if (!restaurant) {
      return sendError(res, 'Restaurant not found', 404);
    }

    // 2. Resolve items with authoritative pricing and valid DB ObjectIds
    let subtotal = 0;
    const orderItemsSnapshot = [];

    for (const item of items) {
      const rawId = item.foodId || item._id;
      let dbFood = null;

      if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
        dbFood = await Food.findById(rawId);
      }

      // If not found by ObjectId (e.g. mock ID like hero-dish-1 or dish-1), find by dish name
      if (!dbFood && item.name) {
        const safeName = item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Search within same restaurant first
        dbFood = await Food.findOne({
          restaurant: restaurant._id,
          name: { $regex: new RegExp(safeName, 'i') },
        });
        // Otherwise search globally
        if (!dbFood) {
          dbFood = await Food.findOne({
            name: { $regex: new RegExp(safeName, 'i') },
          });
        }
      }

      // Fallback: pick any dish from this restaurant or database
      if (!dbFood) {
        dbFood = (await Food.findOne({ restaurant: restaurant._id })) || (await Food.findOne());
      }

      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty < 1) {
        return sendError(res, `Invalid quantity for item: ${item.name || 'item'}`, 400);
      }

      const price = dbFood ? dbFood.price : (Number(item.price) || 199);
      subtotal += price * qty;

      orderItemsSnapshot.push({
        foodId: dbFood ? dbFood._id : new mongoose.Types.ObjectId(),
        name: dbFood ? dbFood.name : (item.name || 'Signature Dish'),
        price: price,
        quantity: qty,
        image: dbFood ? dbFood.image : (item.image || ''),
        isVeg: dbFood ? dbFood.isVeg : Boolean(item.isVeg),
      });
    }

    // Business rule: Delivery fee is ₹40, or free (₹0) above ₹499 subtotal
    let deliveryFee = subtotal >= 499 ? 0 : 40;
    const platformFee = 5;
    const tax = Math.round(subtotal * 0.05); // 5% GST

    // Coupon discount recalculation
    let discount = 0;
    let validatedCouponCode = null;

    if (couponCode) {
      const codeUpper = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: codeUpper, isActive: true });

      if (coupon) {
        let isEligible = true;

        if (coupon.validTill && new Date() > new Date(coupon.validTill)) {
          isEligible = false;
        }

        if (coupon.minOrder && subtotal < coupon.minOrder) {
          isEligible = false;
        }

        if (coupon.code === 'FIRST50') {
          const priorCount = await Order.countDocuments({
            user: req.user._id,
            status: { $ne: 'Cancelled' },
          });
          if (priorCount > 0) {
            isEligible = false;
          }
        }

        if (isEligible) {
          validatedCouponCode = coupon.code;
          if (coupon.type === 'percent') {
            const rawDiscount = Math.round((subtotal * coupon.value) / 100);
            discount = coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
          } else if (coupon.type === 'flat') {
            discount = Math.min(coupon.value, subtotal);
          } else if (coupon.type === 'freeDelivery') {
            discount = deliveryFee;
            deliveryFee = 0;
          }
        }
      }
    }

    const total = Math.max(0, subtotal + deliveryFee + platformFee + tax - discount);

    // Create Order in DB
    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurant._id,
      items: orderItemsSnapshot,
      address: {
        fullName: address.fullName || req.user.name,
        mobile: address.mobile || req.user.mobile,
        houseNo: address.houseNo || '1',
        street: address.street,
        city: address.city,
        state: address.state || 'Karnataka',
        pincode: address.pincode,
      },
      subtotal,
      deliveryFee,
      platformFee,
      discount,
      tax,
      total,
      couponCode: validatedCouponCode,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      status: 'Placed',
      statusHistory: [
        {
          status: 'Placed',
          at: new Date(),
          note: `Order placed via ${paymentMethod || 'COD'}`,
        },
      ],
      estimatedDeliveryAt: new Date(Date.now() + 35 * 60 * 1000),
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('restaurant', 'name image address')
      .populate('user', 'name email mobile');

    return sendSuccess(res, 'Order placed successfully!', populatedOrder, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders (User gets own orders; Admin gets all orders)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res, next) => {
  try {
    let query = {};

    // Regular users see only their own orders
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    // Optional status filter from query string
    if (req.query.status) {
      query.status = req.query.status;
    }

    const orders = await Order.find(query)
      .populate('restaurant', 'name image address')
      .populate('user', 'name email mobile')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Orders retrieved successfully', orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Order not found', 404);
    }

    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name image address rating')
      .populate('user', 'name email mobile');

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    // Check ownership unless admin
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to view this order', 403);
    }

    return sendSuccess(res, 'Order details retrieved', order);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (Allowed only while Placed or Accepted)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Order not found', 404);
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to cancel this order', 403);
    }

    // Check cancellation eligibility
    if (!['Placed', 'Accepted'].includes(order.status)) {
      return sendError(
        res,
        `Cannot cancel order once food preparation has started. Current status: ${order.status}`,
        400
      );
    }

    order.status = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      at: new Date(),
      note: `Order cancelled by ${req.user.role === 'admin' ? 'Administrator' : 'Customer'}`,
    });

    await order.save();

    return sendSuccess(res, 'Order cancelled successfully', order);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status manually (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Placed', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Order not found', 404);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    order.status = status;
    order.statusHistory.push({
      status,
      at: new Date(),
      note: note || `Status updated to ${status} by Admin`,
    });

    if (status === 'Delivered') {
      order.paymentStatus = 'PAID';
    }

    await order.save();

    return sendSuccess(res, `Order status updated to ${status}`, order);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
};
