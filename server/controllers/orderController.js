const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const { getIO } = require('../socket/io');

/**
 * @desc    Create a new delivery order
 * @route   POST /api/orders
 * @access  Private (User, Admin)
 */
const createOrder = async (req, res) => {
  try {
    const {
      pickupAddress,
      dropAddress,
      packageDetails,
      estimatedDelivery,
      customer
    } = req.body;

    if (!pickupAddress || !pickupAddress.address || pickupAddress.lat == null || pickupAddress.lng == null) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid pickupAddress with address, lat, and lng'
      });
    }

    if (!dropAddress || !dropAddress.address || dropAddress.lat == null || dropAddress.lng == null) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid dropAddress with address, lat, and lng'
      });
    }

    // Default customer to authenticated user unless admin explicitly assigns to another user
    let customerId = req.user._id;
    if (req.user.role === 'admin' && customer) {
      customerId = customer;
    }

    // Default estimated delivery to 3 hours from now if not specified
    const estDeliveryDate = estimatedDelivery
      ? new Date(estimatedDelivery)
      : new Date(Date.now() + 3 * 60 * 60 * 1000);

    const order = new Order({
      customer: customerId,
      pickupAddress,
      dropAddress,
      packageDetails: packageDetails || {
        description: 'General Parcel',
        weight: 1.0,
        dimensions: 'Standard Box'
      },
      status: 'placed',
      estimatedDelivery: estDeliveryDate,
      currentLocation: {
        lat: pickupAddress.lat,
        lng: pickupAddress.lng
      }
    });

    await order.save();
    await order.populate('customer', 'name email phone');

    // Notify connected admin and client apps via socket
    const io = getIO();
    if (io) {
      io.emit('order:created', order);
    }

    return res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('[Order Controller] CreateOrder error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating order'
    });
  }
};

/**
 * @desc    Get orders (Role-based: user sees own, agent sees assigned, admin sees all)
 * @route   GET /api/orders
 * @access  Private
 */
const getOrders = async (req, res) => {
  try {
    const query = {};

    // Filter by role
    if (req.user.role === 'user') {
      query.customer = req.user._id;
    } else if (req.user.role === 'agent') {
      query.agent = req.user._id;
    }

    // Optional query filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('agent', 'name email phone isAvailable currentLocation')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('[Order Controller] GetOrders error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching orders'
    });
  }
};

/**
 * @desc    Get single order by ID or Tracking ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    let order;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id)
        .populate('customer', 'name email phone')
        .populate('agent', 'name email phone isAvailable currentLocation');
    }

    if (!order) {
      order = await Order.findOne({ trackingId: id.toUpperCase() })
        .populate('customer', 'name email phone')
        .populate('agent', 'name email phone isAvailable currentLocation');
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Permission check: only admin, assigned agent, or owner customer can view full order details
    if (req.user.role === 'user' && !order.customer._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this order'
      });
    }

    if (
      req.user.role === 'agent' &&
      (!order.agent || !order.agent._id.equals(req.user._id))
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: This order is not assigned to you'
      });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('[Order Controller] GetOrderById error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching order details'
    });
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private (Agent, Admin)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, lat, lng } = req.body;

    const validStatuses = [
      'placed',
      'confirmed',
      'picked_up',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
      });
    }

    let order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify agent is assigned to this order
    if (req.user.role === 'agent') {
      if (!order.agent || !order.agent.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You are not assigned to this order'
        });
      }
    }

    order.status = status;

    // Record in status history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status}`
    });

    // If delivered, mark actual delivery timestamp
    if (status === 'delivered') {
      order.actualDelivery = new Date();
    }

    // Update location if supplied in request
    if (lat != null && lng != null) {
      order.currentLocation = { lat: Number(lat), lng: Number(lng) };
    }

    await order.save();

    order = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('agent', 'name email phone isAvailable currentLocation');

    // Emit real-time status update to order room and global channels
    const io = getIO();
    if (io) {
      io.to(`order_${order._id}`).emit('order:statusUpdate', {
        orderId: order._id,
        trackingId: order.trackingId,
        status: order.status,
        statusHistory: order.statusHistory,
        actualDelivery: order.actualDelivery,
        currentLocation: order.currentLocation
      });

      io.emit('order:updated', order);
    }

    return res.status(200).json({
      success: true,
      message: `Order status successfully updated to ${status}`,
      order
    });
  } catch (error) {
    console.error('[Order Controller] UpdateOrderStatus error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating order status'
    });
  }
};

/**
 * @desc    Assign delivery agent to an order
 * @route   PUT /api/orders/:id/assign
 * @access  Private (Admin)
 */
const assignAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide agentId to assign'
      });
    }

    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'agent') {
      return res.status(400).json({
        success: false,
        message: 'Target user is not a valid delivery agent'
      });
    }

    let order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.agent = agent._id;
    order.status = 'confirmed';
    order.statusHistory.push({
      status: 'confirmed',
      timestamp: new Date(),
      note: `Delivery assigned to agent ${agent.name}`
    });

    await order.save();

    order = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('agent', 'name email phone isAvailable currentLocation');

    // Emit real-time assignment notifications
    const io = getIO();
    if (io) {
      io.to(`order_${order._id}`).emit('order:assigned', order);
      io.to(`agent_${agent._id}`).emit('order:assignedToYou', order);
      io.emit('order:updated', order);
    }

    return res.status(200).json({
      success: true,
      message: `Agent ${agent.name} assigned to order successfully`,
      order
    });
  } catch (error) {
    console.error('[Order Controller] AssignAgent error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error assigning agent'
    });
  }
};

/**
 * @desc    Get order tracking data
 * @route   GET /api/orders/:id/track
 * @access  Private
 */
const getOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;

    let order;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id)
        .populate('customer', 'name phone')
        .populate('agent', 'name phone isAvailable currentLocation');
    }

    if (!order) {
      order = await Order.findOne({ trackingId: id.toUpperCase() })
        .populate('customer', 'name phone')
        .populate('agent', 'name phone isAvailable currentLocation');
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order tracking details not found'
      });
    }

    return res.status(200).json({
      success: true,
      tracking: {
        orderId: order._id,
        trackingId: order.trackingId,
        status: order.status,
        pickupAddress: order.pickupAddress,
        dropAddress: order.dropAddress,
        currentLocation: order.currentLocation,
        statusHistory: order.statusHistory,
        estimatedDelivery: order.estimatedDelivery,
        actualDelivery: order.actualDelivery,
        agent: order.agent,
        customer: order.customer,
        packageDetails: order.packageDetails,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('[Order Controller] GetOrderTracking error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching tracking info'
    });
  }
};

/**
 * @desc    Get delivery history (delivered or cancelled orders)
 * @route   GET /api/orders/history
 * @access  Private
 */
const getDeliveryHistory = async (req, res) => {
  try {
    const query = {
      status: { $in: ['delivered', 'cancelled'] }
    };

    if (req.user.role === 'user') {
      query.customer = req.user._id;
    } else if (req.user.role === 'agent') {
      query.agent = req.user._id;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('agent', 'name email phone')
      .sort({ actualDelivery: -1, updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('[Order Controller] GetDeliveryHistory error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching delivery history'
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  assignAgent,
  getOrderTracking,
  getDeliveryHistory
};
