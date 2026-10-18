const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Order = require('../models/Order');
const { sendSuccess } = require('../utils/response');

// @desc    Get dashboard metrics, 7-day trends, and top foods
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalRestaurants, totalFoods, allOrders] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Restaurant.countDocuments(),
      Food.countDocuments(),
      Order.find({ status: { $ne: 'Cancelled' } }),
    ]);

    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Calculate last 7 days metrics
    const days = 7;
    const dailyStats = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));

      const ordersOnDay = allOrders.filter(
        (o) => new Date(o.createdAt) >= dayStart && new Date(o.createdAt) <= dayEnd
      );

      const revenueOnDay = ordersOnDay.reduce((sum, o) => sum + (o.total || 0), 0);

      dailyStats.push({
        date: dateStr,
        orders: ordersOnDay.length,
        revenue: revenueOnDay,
      });
    }

    // Top 5 popular foods by items sold across orders
    const foodSalesMap = {};
    allOrders.forEach((order) => {
      order.items.forEach((item) => {
        const name = item.name;
        if (!foodSalesMap[name]) {
          foodSalesMap[name] = { name, count: 0, revenue: 0 };
        }
        foodSalesMap[name].count += item.quantity || 1;
        foodSalesMap[name].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    const topFoods = Object.values(foodSalesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Active orders count
    const activeOrdersCount = await Order.countDocuments({
      status: { $in: ['Placed', 'Accepted', 'Preparing', 'Out for Delivery'] },
    });

    return sendSuccess(res, 'Admin stats retrieved successfully', {
      totals: {
        users: totalUsers,
        restaurants: totalRestaurants,
        foods: totalFoods,
        orders: totalOrders,
        revenue: totalRevenue,
        activeOrders: activeOrdersCount,
      },
      dailyStats,
      topFoods,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    return sendSuccess(res, 'Users retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAdminUsers,
};
