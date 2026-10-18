const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getPerformanceReport
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin privileges
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/performance', getPerformanceReport);

module.exports = router;
