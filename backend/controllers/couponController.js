const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Get all active coupons
// @route   GET /api/coupons
// @access  Public
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({ isActive: true }).sort({ minOrder: 1 });
    return sendSuccess(res, 'Active coupons retrieved', coupons);
  } catch (error) {
    next(error);
  }
};

// @desc    Validate a coupon code and calculate discount
// @route   POST /api/coupons/validate
// @access  Public (optional user authentication)
const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    const userId = req.user ? req.user._id : req.body.userId;

    if (!code) {
      return sendError(res, 'Please enter a coupon code', 400);
    }

    if (subtotal === undefined || subtotal < 0) {
      return sendError(res, 'Invalid cart subtotal for coupon calculation', 400);
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return sendError(res, 'Invalid or inactive coupon code', 400);
    }

    // Check validity date
    if (coupon.validTill && new Date() > new Date(coupon.validTill)) {
      return sendError(res, 'This coupon has expired', 400);
    }

    // Check minimum order requirement
    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return sendError(
        res,
        `Minimum order of ₹${coupon.minOrder} required for coupon ${coupon.code}. Add ₹${coupon.minOrder - subtotal} more!`,
        400
      );
    }

    // Special Check: FIRST50 requires 0 prior orders
    if (coupon.code === 'FIRST50' && userId) {
      const priorOrdersCount = await Order.countDocuments({
        user: userId,
        status: { $ne: 'Cancelled' },
      });
      if (priorOrdersCount > 0) {
        return sendError(res, 'Coupon FIRST50 is only valid on your very first order', 400);
      }
    }

    // Calculate discount amount
    let discount = 0;
    if (coupon.type === 'percent') {
      const rawDiscount = Math.round((subtotal * coupon.value) / 100);
      discount = coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
    } else if (coupon.type === 'flat') {
      discount = Math.min(coupon.value, subtotal);
    } else if (coupon.type === 'freeDelivery') {
      // Waives delivery fee (standard ₹40)
      discount = 40;
    }

    return sendSuccess(res, `Coupon ${coupon.code} applied successfully! You save ₹${discount}`, {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      minOrder: coupon.minOrder,
      maxDiscount: coupon.maxDiscount,
      description: coupon.description,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCoupons,
  validateCoupon,
};
