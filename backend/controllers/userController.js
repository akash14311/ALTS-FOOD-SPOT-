const User = require('../models/User');
const Address = require('../models/Address');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedAddresses');
    return sendSuccess(res, 'User profile retrieved', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (name, mobile, avatar)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const { name, mobile, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (name) user.name = name.trim();
    if (mobile) user.mobile = mobile.trim();
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    return sendSuccess(res, 'Profile updated successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      avatar: user.avatar,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all addresses of the logged-in user
// @route   GET /api/users/addresses
// @access  Private
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    return sendSuccess(res, 'Saved addresses retrieved', addresses);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res, next) => {
  try {
    const { fullName, mobile, houseNo, street, city, state, pincode, isDefault } = req.body;

    if (!fullName || !mobile || !houseNo || !street || !city || !pincode) {
      return sendError(res, 'Please provide all required address fields', 400);
    }

    // If marked default, unset previous default
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    // Check if this is the first address, make it default if so
    const existingCount = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = isDefault || existingCount === 0;

    const address = await Address.create({
      user: req.user._id,
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      houseNo: houseNo.trim(),
      street: street.trim(),
      city: city.trim(),
      state: (state || 'Karnataka').trim(),
      pincode: pincode.trim(),
      isDefault: shouldBeDefault,
    });

    // Add to user's savedAddresses array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { savedAddresses: address._id },
    });

    return sendSuccess(res, 'Address saved successfully', address, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing address
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
      return sendError(res, 'Address not found', 404);
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    Object.assign(address, req.body);
    await address.save();

    return sendSuccess(res, 'Address updated successfully', address);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!address) {
      return sendError(res, 'Address not found', 404);
    }

    // Remove from user's savedAddresses
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { savedAddresses: address._id },
    });

    return sendSuccess(res, 'Address deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};
