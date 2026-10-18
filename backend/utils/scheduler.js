const Order = require('../models/Order');

// Flow of status transitions
const NEXT_STATUS = {
  Placed: { next: 'Accepted', note: 'Restaurant confirmed your order' },
  Accepted: { next: 'Preparing', note: 'Chef has started preparing your food' },
  Preparing: { next: 'Out for Delivery', note: 'Rider is on the way to your doorstep' },
  'Out for Delivery': { next: 'Delivered', note: 'Order delivered safely. Enjoy your meal!' },
};

let schedulerInterval = null;

const startOrderScheduler = () => {
  const intervalSec = parseInt(process.env.ORDER_PROGRESS_INTERVAL_SEC, 10) || 10;
  console.log(`⏱️ Order live simulation scheduler started (Interval: ${intervalSec}s).`);

  schedulerInterval = setInterval(async () => {
    try {
      // Find active orders eligible for progression
      const activeOrders = await Order.find({
        status: { $in: ['Placed', 'Accepted', 'Preparing', 'Out for Delivery'] },
      }).sort({ createdAt: 1 }).limit(50);

      for (const order of activeOrders) {
        const transition = NEXT_STATUS[order.status];
        if (transition) {
          order.status = transition.next;
          order.statusHistory.push({
            status: transition.next,
            at: new Date(),
            note: transition.note,
          });
          await order.save();
          console.log(`[Order Scheduler] Order #${order._id.toString().slice(-6)} advanced to -> "${transition.next}"`);
        }
      }
    } catch (err) {
      console.error('[Order Scheduler Error]:', err.message);
    }
  }, intervalSec * 1000);
};

const stopOrderScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
};

module.exports = {
  startOrderScheduler,
  stopOrderScheduler,
};
