const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  assignAgent,
  getOrderTracking,
  getDeliveryHistory
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// Create order & get filtered orders list
router.route('/')
  .post(protect, createOrder)
  .get(protect, getOrders);

// Delivery history for completed / cancelled orders
router.get('/history', protect, getDeliveryHistory);

// Specific order tracking details
router.get('/:id/track', protect, getOrderTracking);

// Agent assignment (admin only)
router.put('/:id/assign', protect, authorize('admin'), assignAgent);

// Order status update (agent or admin)
router.put('/:id/status', protect, authorize('agent', 'admin'), updateOrderStatus);

// Get single order by ID or Tracking ID
router.get('/:id', protect, getOrderById);

module.exports = router;
