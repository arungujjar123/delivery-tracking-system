const Order = require('../models/Order');
const User = require('../models/User');

/**
 * @desc    Get system dashboard overview stats
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalOrders,
      activeDeliveries,
      completedOrders,
      cancelledOrders,
      placedOrders,
      totalUsers,
      totalAgents,
      recentOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({
        status: { $in: ['confirmed', 'picked_up', 'in_transit', 'out_for_delivery'] }
      }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.countDocuments({ status: 'placed' }),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'agent' }),
      Order.find()
        .populate('customer', 'name email phone')
        .populate('agent', 'name email phone isAvailable currentLocation')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        activeDeliveries,
        completedOrders,
        cancelledOrders,
        placedOrders,
        totalUsers,
        totalAgents
      },
      recentOrders
    });
  } catch (error) {
    console.error('[Admin Controller] GetDashboardStats error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching dashboard statistics'
    });
  }
};

/**
 * @desc    Get detailed performance metrics & analytics report
 * @route   GET /api/admin/performance
 * @access  Private (Admin)
 */
const getPerformanceReport = async (req, res) => {
  try {
    // 1. Calculate orders by status
    const statusCountsAgg = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const initialStatuses = {
      placed: 0,
      confirmed: 0,
      picked_up: 0,
      in_transit: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0
    };

    const ordersByStatus = statusCountsAgg.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, initialStatuses);

    // 2. Query delivered orders for on-time delivery rate & avg delivery duration
    const deliveredOrders = await Order.find({ status: 'delivered' }).select(
      'trackingId createdAt estimatedDelivery actualDelivery agent'
    );

    let onTimeCount = 0;
    let totalWithEstimatedTime = 0;
    let totalDurationMs = 0;
    let durationCount = 0;

    deliveredOrders.forEach((order) => {
      const actual = order.actualDelivery ? new Date(order.actualDelivery).getTime() : null;
      const estimated = order.estimatedDelivery ? new Date(order.estimatedDelivery).getTime() : null;
      const created = order.createdAt ? new Date(order.createdAt).getTime() : null;

      if (actual && estimated) {
        totalWithEstimatedTime++;
        if (actual <= estimated) {
          onTimeCount++;
        }
      }

      if (actual && created && actual >= created) {
        totalDurationMs += actual - created;
        durationCount++;
      }
    });

    const onTimeRate =
      totalWithEstimatedTime > 0
        ? Number(((onTimeCount / totalWithEstimatedTime) * 100).toFixed(1))
        : 100;

    const avgDurationMinutes =
      durationCount > 0
        ? Math.round(totalDurationMs / (durationCount * 60 * 1000))
        : 0;

    const avgDurationHours = Number((avgDurationMinutes / 60).toFixed(1));

    // 3. Agent performance breakdown
    const agentPerformanceAgg = await Order.aggregate([
      {
        $match: { agent: { $ne: null } }
      },
      {
        $group: {
          _id: '$agent',
          totalAssigned: { $sum: 1 },
          deliveredCount: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          inTransitCount: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$status',
                    ['confirmed', 'picked_up', 'in_transit', 'out_for_delivery']
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'agentInfo'
        }
      },
      {
        $unwind: '$agentInfo'
      },
      {
        $project: {
          _id: 1,
          name: '$agentInfo.name',
          email: '$agentInfo.email',
          phone: '$agentInfo.phone',
          isAvailable: '$agentInfo.isAvailable',
          totalAssigned: 1,
          deliveredCount: 1,
          inTransitCount: 1,
          completionRate: {
            $cond: [
              { $gt: ['$totalAssigned', 0] },
              {
                $multiply: [
                  { $divide: ['$deliveredCount', '$totalAssigned'] },
                  100
                ]
              },
              0
            ]
          }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      performance: {
        totalDelivered: deliveredOrders.length,
        onTimeDeliveries: onTimeCount,
        evaluatedForOnTime: totalWithEstimatedTime,
        onTimeRatePercent: onTimeRate,
        avgDurationMinutes,
        avgDurationHours,
        ordersByStatus,
        agentPerformance: agentPerformanceAgg
      }
    });
  } catch (error) {
    console.error('[Admin Controller] GetPerformanceReport error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error generating performance report'
    });
  }
};

module.exports = {
  getDashboardStats,
  getPerformanceReport
};
