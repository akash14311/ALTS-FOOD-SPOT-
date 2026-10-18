const express = require('express');
const router = express.Router();
const {
  toggleFavorite,
  getFavorites,
  deleteFavorite,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.post('/:id', protect, toggleFavorite);
router.get('/', protect, getFavorites);
router.delete('/:id', protect, deleteFavorite);

module.exports = router;
