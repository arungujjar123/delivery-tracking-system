const User = require('../models/User');

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/users
 * @access  Private (Admin)
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('[User Controller] GetUsers error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching users'
    });
  }
};

/**
 * @desc    Get all delivery agents (admin only)
 * @route   GET /api/users/agents
 * @access  Private (Admin)
 */
const getAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' })
      .select('-password')
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: agents.length,
      agents
    });
  } catch (error) {
    console.error('[User Controller] GetAgents error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching agents'
    });
  }
};

/**
 * @desc    Get single user by ID (admin only)
 * @route   GET /api/users/:id
 * @access  Private (Admin)
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('[User Controller] GetUserById error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user details'
    });
  }
};

/**
 * @desc    Update user profile or role (admin only)
 * @route   PUT /api/users/:id
 * @access  Private (Admin)
 */
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, email, role, phone, isAvailable, currentLocation, password } = req.body;

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (role && ['user', 'agent', 'admin'].includes(role)) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (isAvailable !== undefined) user.isAvailable = Boolean(isAvailable);
    if (currentLocation) user.currentLocation = currentLocation;
    if (password && password.length >= 6) {
      user.password = password; // pre-save hook will hash this
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('[User Controller] UpdateUser error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating user'
    });
  }
};

/**
 * @desc    Delete user account (admin only)
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting own account
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own active admin account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('[User Controller] DeleteUser error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting user'
    });
  }
};

module.exports = {
  getUsers,
  getAgents,
  getUserById,
  updateUser,
  deleteUser
};
