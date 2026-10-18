const express = require('express');
const router = express.Router();
const {
  getUsers,
  getAgents,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All user management routes require admin privileges
router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);
router.get('/agents', getAgents);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
