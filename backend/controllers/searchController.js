const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const { sendSuccess } = require('../utils/response');

// @desc    Global search across restaurants, dishes, and cuisines
// @route   GET /api/search?q=
// @access  Public
const searchAll = async (req, res, next) => {
  try {
    const q = req.query.q ? req.query.q.trim() : '';

    if (!q) {
      return sendSuccess(res, 'Empty search query', {
        restaurants: [],
        foods: [],
        cuisines: [],
      });
    }

    const regex = new RegExp(q, 'i');

    // 1. Search matching restaurants
    const restaurants = await Restaurant.find({
      isActive: true,
      $or: [{ name: regex }, { cuisines: regex }, { 'address.city': regex }],
    }).limit(10);

    // 2. Search matching foods
    const foods = await Food.find({
      isAvailable: true,
      $or: [{ name: regex }, { description: regex }, { category: regex }],
    })
      .populate('restaurant', 'name rating deliveryTimeMins')
      .limit(20);

    // 3. Extract unique matching cuisines
    const matchingCuisines = new Set();
    restaurants.forEach((r) => {
      r.cuisines.forEach((c) => {
        if (regex.test(c)) {
          matchingCuisines.add(c);
        }
      });
    });

    return sendSuccess(res, 'Search completed', {
      restaurants,
      foods,
      cuisines: Array.from(matchingCuisines),
      query: q,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchAll,
};
