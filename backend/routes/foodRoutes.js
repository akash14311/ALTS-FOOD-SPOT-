const express = require('express');
const router = express.Router();
const {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
} = require('../controllers/foodController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getFoods);
router.get('/:id', getFoodById);

// Admin routes
router.post('/', protect, adminOnly, createFood);
router.put('/:id', protect, adminOnly, updateFood);
router.delete('/:id', protect, adminOnly, deleteFood);

module.exports = router;
