const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Order = require('../models/Order');
const Location = require('../models/Location');

const seedData = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/delivery-tracker';

  try {
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('[Seed] Database connected successfully.');

    // Clear existing collections
    console.log('[Seed] Clearing existing Users, Orders, and Locations collections...');
    await User.deleteMany({});
    await Order.deleteMany({});
    await Location.deleteMany({});

    // 1. Create Users
    console.log('[Seed] Creating demo users...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@delivery.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 9876543210'
    });

    const agent1 = await User.create({
      name: 'Rajesh Sharma (Delhi Courier)',
      email: 'agent1@delivery.com',
      password: 'agent123',
      role: 'agent',
      phone: '+91 9811122233',
      isAvailable: true,
      currentLocation: {
        lat: 28.6139,
        lng: 77.2090
      }
    });

    const agent2 = await User.create({
      name: 'Vikram Singh (Mumbai Express)',
      email: 'agent2@delivery.com',
      password: 'agent123',
      role: 'agent',
      phone: '+91 9822233344',
      isAvailable: true,
      currentLocation: {
        lat: 19.0760,
        lng: 72.8777
      }
    });

    const user1 = await User.create({
      name: 'Priya Sharma',
      email: 'user1@delivery.com',
      password: 'user123',
      role: 'user',
      phone: '+91 9833344455'
    });

    const user2 = await User.create({
      name: 'Amit Patel',
      email: 'user2@delivery.com',
      password: 'user123',
      role: 'user',
      phone: '+91 9844455566'
    });

    const user3 = await User.create({
      name: 'Sneha Reddy',
      email: 'user3@delivery.com',
      password: 'user123',
      role: 'user',
      phone: '+91 9855566677'
    });

    console.log('[Seed] Created 1 Admin, 2 Agents, and 3 Regular Users.');

    // 2. Create 5 Sample Orders
    console.log('[Seed] Creating sample orders with Indian metropolitan coordinates...');
    const now = Date.now();

    // Order 1: Placed (Delhi to Noida)
    const order1 = await Order.create({
      trackingId: 'DTDEL001',
      customer: user1._id,
      agent: null,
      pickupAddress: {
        address: 'Connaught Place, Inner Circle, New Delhi',
        lat: 28.6315,
        lng: 77.2167
      },
      dropAddress: {
        address: 'Sector 18, Commercial Belt, Noida, Uttar Pradesh',
        lat: 28.5708,
        lng: 77.3271
      },
      packageDetails: {
        description: 'Smartphones and Accessories',
        weight: 1.2,
        dimensions: '25x20x10 cm'
      },
      status: 'placed',
      estimatedDelivery: new Date(now + 3 * 3600 * 1000),
      currentLocation: {
        lat: 28.6315,
        lng: 77.2167
      },
      statusHistory: [
        {
          status: 'placed',
          timestamp: new Date(now - 30 * 60 * 1000),
          note: 'Order placed by customer via web portal'
        }
      ]
    });

    // Order 2: Confirmed (Gurugram to South Ex Delhi)
    const order2 = await Order.create({
      trackingId: 'DTDEL002',
      customer: user2._id,
      agent: agent1._id,
      pickupAddress: {
        address: 'Cyber Hub, DLF Phase 2, Gurugram, Haryana',
        lat: 28.4950,
        lng: 77.0895
      },
      dropAddress: {
        address: 'South Extension Part II, New Delhi',
        lat: 28.5700,
        lng: 77.2200
      },
      packageDetails: {
        description: 'Legal Contract Documents',
        weight: 0.4,
        dimensions: '30x21x2 cm'
      },
      status: 'confirmed',
      estimatedDelivery: new Date(now + 4 * 3600 * 1000),
      currentLocation: {
        lat: 28.4950,
        lng: 77.0895
      },
      statusHistory: [
        {
          status: 'placed',
          timestamp: new Date(now - 90 * 60 * 1000),
          note: 'Order placed by customer'
        },
        {
          status: 'confirmed',
          timestamp: new Date(now - 45 * 60 * 1000),
          note: `Assigned to delivery agent ${agent1.name}`
        }
      ]
    });

    // Order 3: In Transit (Karol Bagh to Lajpat Nagar Delhi)
    const order3 = await Order.create({
      trackingId: 'DTDEL003',
      customer: user1._id,
      agent: agent1._id,
      pickupAddress: {
        address: 'Karol Bagh Market, New Delhi',
        lat: 28.6514,
        lng: 77.1907
      },
      dropAddress: {
        address: 'Lajpat Nagar Central Market, New Delhi',
        lat: 28.5700,
        lng: 77.2400
      },
      packageDetails: {
        description: 'Artisanal Bakery & Fresh Confectionery',
        weight: 2.5,
        dimensions: '35x30x20 cm'
      },
      status: 'in_transit',
      estimatedDelivery: new Date(now + 1 * 3600 * 1000),
      currentLocation: {
        lat: 28.6139,
        lng: 77.2090
      },
      statusHistory: [
        {
          status: 'placed',
          timestamp: new Date(now - 120 * 60 * 1000),
          note: 'Order placed'
        },
        {
          status: 'confirmed',
          timestamp: new Date(now - 100 * 60 * 1000),
          note: `Assigned to ${agent1.name}`
        },
        {
          status: 'picked_up',
          timestamp: new Date(now - 50 * 60 * 1000),
          note: 'Courier picked up package from store'
        },
        {
          status: 'in_transit',
          timestamp: new Date(now - 20 * 60 * 1000),
          note: 'Package is on the way via Barakhamba Road'
        }
      ]
    });

    // Order 4: Out for Delivery (Bandra to Andheri Mumbai)
    const order4 = await Order.create({
      trackingId: 'DTBOM004',
      customer: user3._id,
      agent: agent2._id,
      pickupAddress: {
        address: 'Hill Road, Bandra West, Mumbai, Maharashtra',
        lat: 19.0596,
        lng: 72.8295
      },
      dropAddress: {
        address: 'Lokhandwala Complex, Andheri West, Mumbai, Maharashtra',
        lat: 19.1363,
        lng: 72.8277
      },
      packageDetails: {
        description: 'Designer Apparel & Handbag',
        weight: 1.8,
        dimensions: '40x30x15 cm'
      },
      status: 'out_for_delivery',
      estimatedDelivery: new Date(now + 45 * 60 * 1000),
      currentLocation: {
        lat: 19.1136,
        lng: 72.8697
      },
      statusHistory: [
        {
          status: 'placed',
          timestamp: new Date(now - 180 * 60 * 1000),
          note: 'Order placed by customer'
        },
        {
          status: 'confirmed',
          timestamp: new Date(now - 150 * 60 * 1000),
          note: `Assigned to agent ${agent2.name}`
        },
        {
          status: 'picked_up',
          timestamp: new Date(now - 90 * 60 * 1000),
          note: 'Package picked up from Bandra boutique'
        },
        {
          status: 'in_transit',
          timestamp: new Date(now - 60 * 60 * 1000),
          note: 'En route via Western Express Highway'
        },
        {
          status: 'out_for_delivery',
          timestamp: new Date(now - 15 * 60 * 1000),
          note: 'Agent is in Andheri area for final doorstep delivery'
        }
      ]
    });

    // Order 5: Delivered (Colaba to Dadar Mumbai) - On-time delivery demo
    const order5 = await Order.create({
      trackingId: 'DTBOM005',
      customer: user2._id,
      agent: agent2._id,
      pickupAddress: {
        address: 'Colaba Causeway, South Mumbai, Maharashtra',
        lat: 18.9067,
        lng: 72.8147
      },
      dropAddress: {
        address: 'Shivaji Park, Dadar West, Mumbai, Maharashtra',
        lat: 19.0178,
        lng: 72.8478
      },
      packageDetails: {
        description: 'Electronics & Audio Headphones',
        weight: 0.9,
        dimensions: '22x18x10 cm'
      },
      status: 'delivered',
      estimatedDelivery: new Date(now - 15 * 60 * 1000), // Estimated 15 mins ago
      actualDelivery: new Date(now - 45 * 60 * 1000), // Delivered 45 mins ago (30 min early!)
      currentLocation: {
        lat: 19.0178,
        lng: 72.8478
      },
      statusHistory: [
        {
          status: 'placed',
          timestamp: new Date(now - 240 * 60 * 1000),
          note: 'Order successfully placed'
        },
        {
          status: 'confirmed',
          timestamp: new Date(now - 210 * 60 * 1000),
          note: `Assigned to ${agent2.name}`
        },
        {
          status: 'picked_up',
          timestamp: new Date(now - 150 * 60 * 1000),
          note: 'Package collected from warehouse'
        },
        {
          status: 'in_transit',
          timestamp: new Date(now - 100 * 60 * 1000),
          note: 'In transit via Marine Drive'
        },
        {
          status: 'out_for_delivery',
          timestamp: new Date(now - 60 * 60 * 1000),
          note: 'Agent arriving at Shivaji Park'
        },
        {
          status: 'delivered',
          timestamp: new Date(now - 45 * 60 * 1000),
          note: 'Delivered securely and signed by recipient'
        }
      ]
    });

    // 3. Create Sample Location Track Records for analytics & map breadcrumbs
    console.log('[Seed] Generating initial location breadcrumb trails...');
    await Location.create([
      {
        agent: agent1._id,
        order: order3._id,
        lat: 28.6514,
        lng: 77.1907,
        timestamp: new Date(now - 50 * 60 * 1000)
      },
      {
        agent: agent1._id,
        order: order3._id,
        lat: 28.6315,
        lng: 77.2167,
        timestamp: new Date(now - 35 * 60 * 1000)
      },
      {
        agent: agent1._id,
        order: order3._id,
        lat: 28.6139,
        lng: 77.2090,
        timestamp: new Date(now - 20 * 60 * 1000)
      },
      {
        agent: agent2._id,
        order: order4._id,
        lat: 19.0596,
        lng: 72.8295,
        timestamp: new Date(now - 90 * 60 * 1000)
      },
      {
        agent: agent2._id,
        order: order4._id,
        lat: 19.0880,
        lng: 72.8500,
        timestamp: new Date(now - 50 * 60 * 1000)
      },
      {
        agent: agent2._id,
        order: order4._id,
        lat: 19.1136,
        lng: 72.8697,
        timestamp: new Date(now - 15 * 60 * 1000)
      }
    ]);

    console.log('====================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY! DEMO CREDENTIALS:');
    console.log('====================================================');
    console.log(' Admin:   admin@delivery.com    / admin123');
    console.log(' Agent 1: agent1@delivery.com   / agent123 (Delhi)');
    console.log(' Agent 2: agent2@delivery.com   / agent123 (Mumbai)');
    console.log(' User 1:  user1@delivery.com    / user123 (Priya Sharma)');
    console.log(' User 2:  user2@delivery.com    / user123 (Amit Patel)');
    console.log(' User 3:  user3@delivery.com    / user123 (Sneha Reddy)');
    console.log(' Sample Orders Created:');
    console.log(`   1. [${order1.trackingId}] Status: ${order1.status}`);
    console.log(`   2. [${order2.trackingId}] Status: ${order2.status}`);
    console.log(`   3. [${order3.trackingId}] Status: ${order3.status}`);
    console.log(`   4. [${order4.trackingId}] Status: ${order4.status}`);
    console.log(`   5. [${order5.trackingId}] Status: ${order5.status}`);
    console.log('====================================================');

    await mongoose.disconnect();
    console.log('[Seed] Database disconnected cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
};

seedData();
