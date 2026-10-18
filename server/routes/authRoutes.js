const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public authentication routes
router.post('/register', register);
router.post('/login', login);

// Private profile route
router.get('/me', protect, getMe);

module.exports = router;
