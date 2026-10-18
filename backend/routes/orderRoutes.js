const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
