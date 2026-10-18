const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Get all restaurants with filters, search, and sorting
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = async (req, res, next) => {
  try {
    const { search, cuisine, veg, sort, all } = req.query;

    const query = all === 'true' ? {} : { isActive: true };

    // Search by name or cuisine
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { cuisines: regex }];
    }

    // Filter by specific cuisine
    if (cuisine && cuisine.trim()) {
      query.cuisines = new RegExp(cuisine.trim(), 'i');
    }

    // Filter veg only
    if (veg === 'true') {
      query.$or = [{ isVeg: true }, { isPureVeg: true }];
    }

    // Build sort options
    let sortOptions = { rating: -1 }; // Default sort by highest rating
    if (sort === 'rating') {
      sortOptions = { rating: -1 };
    } else if (sort === 'time') {
      sortOptions = { deliveryTimeMins: 1 };
    } else if (sort === 'price') {
      sortOptions = { priceRange: 1 };
    }

    const restaurants = await Restaurant.find(query).sort(sortOptions);

    return sendSuccess(res, 'Restaurants retrieved successfully', restaurants);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single restaurant with all categorized foods
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return sendError(res, 'Restaurant not found', 404);
    }

    // Fetch all available foods for this restaurant
    const foods = await Food.find({ restaurant: restaurant._id, isAvailable: true });

    // Group foods by category
    const menuByCategory = foods.reduce((acc, item) => {
      const cat = item.category || 'Specialties';
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(item);
      return acc;
    }, {});

    return sendSuccess(res, 'Restaurant details retrieved', {
      restaurant,
      foods,
      menuByCategory,
      categories: Object.keys(menuByCategory),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new restaurant (Admin only)
// @route   POST /api/restaurants
// @access  Private/Admin
const createRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    return sendSuccess(res, 'Restaurant created successfully', restaurant, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant (Admin only)
// @route   PUT /api/restaurants/:id
// @access  Private/Admin
const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!restaurant) {
      return sendError(res, 'Restaurant not found', 404);
    }
    return sendSuccess(res, 'Restaurant updated successfully', restaurant);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete restaurant (Admin only)
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
      return sendError(res, 'Restaurant not found', 404);
    }
    // Also delete foods for this restaurant
    await Food.deleteMany({ restaurant: req.params.id });
    return sendSuccess(res, 'Restaurant and associated dishes deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
