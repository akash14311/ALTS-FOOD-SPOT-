const Food = require('../models/Food');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Get all foods with query filters
// @route   GET /api/foods
// @access  Public
const getFoods = async (req, res, next) => {
  try {
    const { restaurant, category, search, veg, all, available } = req.query;
    const query = {};

    if (all !== 'true') {
      query.isAvailable = true;
    } else if (available !== undefined) {
      query.isAvailable = available === 'true';
    }

    if (restaurant) {
      query.restaurant = restaurant;
    }

    if (category) {
      query.category = category;
    }

    if (veg === 'true') {
      query.isVeg = true;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { description: regex }, { category: regex }];
    }

    const foods = await Food.find(query).populate('restaurant', 'name cuisines rating deliveryTimeMins');
    return sendSuccess(res, 'Dishes retrieved successfully', foods);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single food item
// @route   GET /api/foods/:id
// @access  Public
const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id).populate('restaurant');
    if (!food) {
      return sendError(res, 'Food item not found', 404);
    }
    return sendSuccess(res, 'Dish details retrieved', food);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new food item (Admin only)
// @route   POST /api/foods
// @access  Private/Admin
const createFood = async (req, res, next) => {
  try {
    const food = await Food.create(req.body);
    return sendSuccess(res, 'Dish added to menu successfully', food, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update food item (Admin only)
// @route   PUT /api/foods/:id
// @access  Private/Admin
const updateFood = async (req, res, next) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!food) {
      return sendError(res, 'Food item not found', 404);
    }
    return sendSuccess(res, 'Dish updated successfully', food);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete food item (Admin only)
// @route   DELETE /api/foods/:id
// @access  Private/Admin
const deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) {
      return sendError(res, 'Food item not found', 404);
    }
    return sendSuccess(res, 'Dish deleted from menu successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
};
