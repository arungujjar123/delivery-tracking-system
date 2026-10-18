import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Search, 
  ArrowRight, 
  AlertCircle,
  Inbox
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import StatsCard from '../components/StatsCard';
import OrderCard from '../components/OrderCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect based on role if needed
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  if (user?.role === 'agent') {
    return <Navigate to="/agent" replace />;
  }

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTrackingId, setSearchTrackingId] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getOrders();
      // Handle response structure (res.data could be array or { orders: [...] })
      const orderList = Array.isArray(res.data) ? res.data : (res.data?.orders || []);
      setOrders(orderList);
    } catch (error) {
      console.error('Error fetching dashboard orders:', error);
      toast.error('Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!searchTrackingId.trim()) {
      toast.error('Please enter a tracking ID');
      return;
    }
    navigate(`/track/${searchTrackingId.trim()}`);
  };

  // Compute customer stats
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) =>
    ['confirmed', 'picked_up', 'in_transit', 'out_for_delivery'].includes(o.status)
  ).length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const pendingOrders = orders.filter((o) => o.status === 'placed').length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6);

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-800/60 px-3 py-1 text-xs font-semibold text-blue-200 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Customer Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Shipper'}!
            </h1>
            <p className="mt-1 text-sm text-blue-100 font-light">
              Manage your shipments, monitor ongoing deliveries, and track live packages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/place-order"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-102"
            >
              <PlusCircle className="w-4 h-4" />
              Book New Shipment
            </Link>
          </div>
        </div>

        {/* Quick Tracking Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTrackingId}
                onChange={(e) => setSearchTrackingId(e.target.value)}
                placeholder="Track any package by Tracking ID or Order ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors shrink-0"
            >
              Track Order
            </button>
          </form>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            icon={Package}
            label="Total Orders"
            value={totalOrders}
            subtext="Lifetime shipments"
            color="blue"
          />
          <StatsCard
            icon={Truck}
            label="In Transit"
            value={activeOrders}
            subtext="Active deliveries on road"
            color="amber"
          />
          <StatsCard
            icon={CheckCircle2}
            label="Delivered"
            value={deliveredOrders}
            subtext="Successfully received"
            color="green"
          />
          <StatsCard
            icon={Clock}
            label="Pending Pickup"
            value={pendingOrders}
            subtext="Awaiting agent pickup"
            color="indigo"
          />
        </div>

        {/* Recent Orders Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Shipments</h2>
              <p className="text-xs text-slate-500">Live overview of your latest shipments</p>
            </div>
            {orders.length > 0 && (
              <Link
                to="/orders"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                <span>View all {orders.length} orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
                <Inbox className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No shipments found</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                You haven't booked any shipments yet. Get started with instant door-to-door delivery booking.
              </p>
              <Link
                to="/place-order"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Book Your First Shipment
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentOrders.map((order) => (
                <OrderCard key={order._id || order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
