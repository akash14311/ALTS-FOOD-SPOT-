const Favorite = require('../models/Favorite');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Toggle favorite on a restaurant or food
// @route   POST /api/favorites/:id
// @access  Private
const toggleFavorite = async (req, res, next) => {
  try {
    const refId = req.params.id;
    const { type } = req.body; // 'restaurant' | 'food'

    if (!type || !['restaurant', 'food'].includes(type)) {
      return sendError(res, 'Type must be either "restaurant" or "food"', 400);
    }

    const existing = await Favorite.findOne({
      user: req.user._id,
      type,
      refId,
    });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return sendSuccess(res, 'Removed from favorites', { isFavorite: false, refId, type });
    }

    const created = await Favorite.create({
      user: req.user._id,
      type,
      refId,
    });

    return sendSuccess(res, 'Added to favorites', { isFavorite: true, favorite: created }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).sort({ createdAt: -1 });

    const restaurantIds = favorites.filter((f) => f.type === 'restaurant').map((f) => f.refId);
    const foodIds = favorites.filter((f) => f.type === 'food').map((f) => f.refId);

    const [restaurants, foods] = await Promise.all([
      Restaurant.find({ _id: { $in: restaurantIds } }),
      Food.find({ _id: { $in: foodIds } }).populate('restaurant', 'name'),
    ]);

    return sendSuccess(res, 'Favorites retrieved', {
      restaurants,
      foods,
      rawFavorites: favorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete favorite by ID
// @route   DELETE /api/favorites/:id
// @access  Private
const deleteFavorite = async (req, res, next) => {
  try {
    const fav = await Favorite.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!fav) {
      return sendError(res, 'Favorite not found', 404);
    }

    return sendSuccess(res, 'Favorite removed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleFavorite,
  getFavorites,
  deleteFavorite,
};
