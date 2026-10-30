const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const {
  otpStore,
  normalizeIdentifier,
  generateSecureOtp,
  hashOtp,
  verifyOtp: verifyOtpService,
  dispatchOtp,
} = require('../utils/otpService');

// Helper to generate 7-day JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'altsfoodspot_super_secure_college_mini_project_secret_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return sendError(res, 'Please provide name, email, mobile, and password', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'An account with this email already exists', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      passwordHash,
      role: 'user',
    });

    const token = generateToken(user._id);

    return sendSuccess(
      res,
      'Registration successful! Welcome to ALTS FOOD spot.',
      {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          avatar: user.avatar,
        },
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please enter email and password', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user._id);

    return sendSuccess(res, 'Logged in successfully', {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedAddresses');
    return sendSuccess(res, 'User profile retrieved', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Dispatch secure OTP to email or phone
// @route   POST /api/auth/send-otp
// @desc    Dispatch secure OTP to email or phone
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res, next) => {
  try {
    const { identifier: rawIdentifier, channel } = req.body;
    if (!rawIdentifier) {
      return sendError(res, 'Please provide an email address or mobile number', 400);
    }

    const { identifier, type } = normalizeIdentifier(rawIdentifier, channel);

    // Extract client IP address for distributed rate limiting
    const clientIp =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    // Rate limit & cooldown checks (60s cooldown, max 3 dispatches / 15 mins)
    const rateCheck = otpStore.checkRateLimit(identifier, clientIp);
    if (!rateCheck.allowed) {
      return sendError(res, rateCheck.reason, 429);
    }

    // Generate cryptographic OTP & persist hash with 5-minute TTL
    const otp = generateSecureOtp();
    const hash = hashOtp(identifier, otp);
    otpStore.saveOtp(identifier, clientIp, hash);

    // Dispatch via SMS / Email (logs to terminal console)
    await dispatchOtp(identifier, type, otp);

    const targetLabel = type === 'email' ? 'email' : 'mobile phone';
    return sendSuccess(res, `Verification code dispatched to your ${targetLabel} (${identifier})`, {
      identifier,
      type,
      cooldownSeconds: 60,
    });
  } catch (error) {
    return sendError(res, error.message || 'Failed to dispatch verification code', 400);
  }
};

// @desc    Verify OTP, lookup or auto-create user, mint session JWT
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    const { identifier: rawIdentifier, code, name, channel, secondaryIdentifier } = req.body;

    if (!rawIdentifier || !code) {
      return sendError(res, 'Identifier and verification code are required', 400);
    }

    const trimmedCode = String(code).trim();
    if (!/^\d{6}$/.test(trimmedCode)) {
      return sendError(res, 'Verification code must be exactly 6 digits', 400);
    }

    const { identifier, type } = normalizeIdentifier(rawIdentifier, channel);

    // Constant-time verification & max attempts enforcement
    const result = verifyOtpService(identifier, trimmedCode);
    if (!result.success) {
      return sendError(res, result.error, 400);
    }

    // Lookup existing user by email or mobile
    let user;
    if (type === 'email') {
      user = await User.findOne({ email: identifier.toLowerCase() });
    } else {
      const cleanPhone = identifier.replace(/\D/g, '').slice(-10);
      user = await User.findOne({ mobile: cleanPhone });
    }

    // If user exists, mark the verified channel
    if (user) {
      if (type === 'email') {
        user.isEmailVerified = true;
      } else {
        user.isMobileVerified = true;
      }
      await user.save();
    }

    // If user does not exist, auto-create user (Instant Signup / Account Creation)
    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      const derivedName = name?.trim() || (type === 'email' ? identifier.split('@')[0] : `Foodie_${identifier.slice(-4)}`);
      
      let derivedEmail = type === 'email' ? identifier.toLowerCase() : '';
      let derivedMobile = type === 'phone' ? identifier.replace(/\D/g, '').slice(-10) : '';

      // Check if secondary identifier was provided (e.g. phone when verifying email or vice-versa)
      if (secondaryIdentifier) {
        if (type === 'email' && /^\d{10}$/.test(secondaryIdentifier.replace(/\D/g, ''))) {
          derivedMobile = secondaryIdentifier.replace(/\D/g, '').slice(-10);
        } else if (type === 'phone' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(secondaryIdentifier.trim())) {
          derivedEmail = secondaryIdentifier.trim().toLowerCase();
        }
      }

      if (!derivedEmail) {
        derivedEmail = `user_${identifier.replace(/\D/g, '').slice(-10)}@altsfoodspot.com`;
      }
      if (!derivedMobile) {
        derivedMobile = '9888877771';
      }

      // Generate random secure password hash to satisfy schema
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name: derivedName,
        email: derivedEmail,
        mobile: derivedMobile,
        passwordHash,
        role: 'user',
        isEmailVerified: type === 'email',
        isMobileVerified: type === 'phone',
      });
    }

    const token = generateToken(user._id);

    return sendSuccess(
      res,
      isNewUser ? 'Account created successfully! Welcome to ALTS FOOD spot.' : 'Logged in successfully!',
      {
        token,
        isNewUser,
        redirect: '/dashboard',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          isMobileVerified: user.isMobileVerified,
        },
      }
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  sendOtp,
  verifyOtp,
};
