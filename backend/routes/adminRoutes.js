const express = require('express');
const router = express.Router();
const { getAdminStats, getAdminUsers } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/users', protect, adminOnly, getAdminUsers);

module.exports = router;
