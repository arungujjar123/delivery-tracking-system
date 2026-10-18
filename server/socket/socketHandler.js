const Location = require('../models/Location');
const Order = require('../models/Order');
const User = require('../models/User');

/**
 * Configure real-time Socket.io events for order tracking and agent updates
 * @param {object} io - Socket.io server instance
 */
const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join room for a specific order
    socket.on('join:order', (payload) => {
      const orderId = typeof payload === 'object' && payload !== null ? payload.orderId : payload;
      if (orderId) {
        const room = `order_${orderId}`;
        socket.join(room);
        console.log(`[Socket.io] Socket ${socket.id} joined room: ${room}`);
      }
    });

    // Leave room for a specific order
    socket.on('leave:order', (payload) => {
      const orderId = typeof payload === 'object' && payload !== null ? payload.orderId : payload;
      if (orderId) {
        const room = `order_${orderId}`;
        socket.leave(room);
        console.log(`[Socket.io] Socket ${socket.id} left room: ${room}`);
      }
    });

    // Agent registers their personal channel
    socket.on('agent:online', (payload) => {
      const agentId = typeof payload === 'object' && payload !== null ? payload.agentId : payload;
      if (agentId) {
        const room = `agent_${agentId}`;
        socket.join(room);
        console.log(`[Socket.io] Agent ${agentId} joined room: ${room}`);
      }
    });

    // Real-time location stream from delivery agent
    socket.on('location:update', async (data) => {
      try {
        if (!data || data.lat == null || data.lng == null) {
          return;
        }

        const { orderId, agentId, lat, lng } = data;
        const numericLat = Number(lat);
        const numericLng = Number(lng);
        const timestamp = new Date();

        // 1. Record location point in Location history
        if (agentId) {
          await Location.create({
            agent: agentId,
            order: orderId || null,
            lat: numericLat,
            lng: numericLng,
            timestamp
          });

          // Update agent's current location in User document
          await User.findByIdAndUpdate(agentId, {
            currentLocation: { lat: numericLat, lng: numericLng }
          });
        }

        // 2. Update order's current location in Order document
        if (orderId) {
          await Order.findByIdAndUpdate(orderId, {
            currentLocation: { lat: numericLat, lng: numericLng }
          });

          // Broadcast real-time location to subscribers in order room
          io.to(`order_${orderId}`).emit('location:changed', {
            orderId,
            agentId,
            lat: numericLat,
            lng: numericLng,
            timestamp
          });
        }
      } catch (error) {
        console.error('[Socket.io] Error processing location:update:', error.message);
      }
    });

    // Handle client disconnect
    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] Client disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });
};

module.exports = initializeSocket;
