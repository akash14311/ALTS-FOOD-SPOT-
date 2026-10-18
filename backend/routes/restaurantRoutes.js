const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);

// Admin routes
router.post('/', protect, adminOnly, createRestaurant);
router.put('/:id', protect, adminOnly, updateRestaurant);
router.delete('/:id', protect, adminOnly, deleteRestaurant);

module.exports = router;
