const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { initIO } = require('./socket/io');
const initializeSocket = require('./socket/socketHandler');

const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize database connection
connectDB();

const app = express();

// Global middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check and root route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Delivery Tracking API is running smoothly',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Real-Time Delivery Tracking API',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route '${req.originalUrl}' not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Create HTTP Server & initialize Socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

// Store io in singleton helper and register event handlers
initIO(io);
initializeSocket(io);

const PORT = process.env.PORT || 5000;

// Start server if this file is run directly
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[Server] Real-Time Delivery Tracking Server running on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = {
  app,
  server,
  io
};
