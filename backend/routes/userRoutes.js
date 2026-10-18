const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Profile routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Address CRUD routes
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

module.exports = router;
