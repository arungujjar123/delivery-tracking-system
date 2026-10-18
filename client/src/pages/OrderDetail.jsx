import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Package, 
  MapPin, 
  Clock, 
  User, 
  Calendar, 
  ArrowLeft, 
  Navigation, 
  Weight, 
  Phone, 
  CheckCircle2, 
  ShieldAlert, 
  UserCheck, 
  RefreshCw,
  Share2
} from 'lucide-react';
import { ordersAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/StatusBadge';
import LiveMap from '../components/LiveMap';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_PROGRESSION = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'picked_up', label: 'Picked Up' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket, joinOrder } = useSocket();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assigningAgent, setAssigningAgent] = useState(false);

  // Fetch Order Details
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getOrderById(id);
      const orderData = res.data?.order || res.data;
      setOrder(orderData);
      if (orderData.agent?._id || orderData.agent) {
        setSelectedAgentId(orderData.agent?._id || orderData.agent);
      }
    } catch (error) {
      console.error('Failed to load order details:', error);
      toast.error('Could not fetch order details');
    } finally {
      setLoading(false);
    }
  };

  // If Admin, load agents list for assignment dropdown
  useEffect(() => {
    if (user?.role === 'admin') {
      usersAPI.getAgents()
        .then((res) => {
          const agentList = Array.isArray(res.data) ? res.data : (res.data?.agents || []);
          setAgents(agentList);
        })
        .catch((err) => console.error('Failed to load agents:', err));
    }
  }, [user?.role]);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Real-time Socket Setup
  useEffect(() => {
    if (!id) return;
    joinOrder(id);

    if (!socket) return;

    const handleStatusUpdate = ({ orderId, status, statusHistory }) => {
      if (orderId === id) {
        setOrder((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status,
            statusHistory: statusHistory || [
              ...(prev.statusHistory || []),
              { status, timestamp: new Date().toISOString() },
            ],
          };
        });
        toast.success(`Order status updated to: ${status.replace('_', ' ')}`);
      }
    };

    const handleLocationChange = ({ orderId, lat, lng }) => {
      if (orderId === id) {
        setOrder((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            currentLocation: { lat, lng, updatedAt: new Date().toISOString() },
          };
        });
      }
    };

    const handleOrderAssigned = ({ orderId, agentId, agent }) => {
      if (orderId === id) {
        setOrder((prev) => {
          if (!prev) return prev;
          return { ...prev, agent: agent || agentId };
        });
        toast.success('New agent assigned to this shipment');
      }
    };

    socket.on('order:statusUpdate', handleStatusUpdate);
    socket.on('location:changed', handleLocationChange);
    socket.on('order:assigned', handleOrderAssigned);

    return () => {
      socket.off('order:statusUpdate', handleStatusUpdate);
      socket.off('location:changed', handleLocationChange);
      socket.off('order:assigned', handleOrderAssigned);
    };
  }, [id, socket]);

  // Handle Status Update (For Agent / Admin)
  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await ordersAPI.updateStatus(id, newStatus);
      const updated = res.data?.order || res.data;
      setOrder((prev) => ({
        ...prev,
        ...updated,
        status: newStatus,
      }));
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Agent Assignment (Admin Only)
  const handleAssignAgent = async (e) => {
    e.preventDefault();
    if (!selectedAgentId) {
      toast.error('Please choose a delivery agent');
      return;
    }

    try {
      setAssigningAgent(true);
      const res = await ordersAPI.assignAgent(id, selectedAgentId);
      const updated = res.data?.order || res.data;
      setOrder((prev) => ({
        ...prev,
        ...updated,
      }));
      toast.success('Agent assigned successfully');
    } catch (error) {
      console.error('Failed to assign agent:', error);
      toast.error(error.response?.data?.message || 'Failed to assign agent');
    } finally {
      setAssigningAgent(false);
    }
  };

  const copyTrackingLink = () => {
    const trackingUrl = `${window.location.origin}/track/${id}`;
    navigator.clipboard.writeText(trackingUrl);
    toast.success('Live tracking link copied to clipboard!');
  };

  if (loading) {
    return <LoadingSpinner message="Fetching order details..." />;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order not found</h2>
        <p className="text-sm text-slate-500 mt-1">This shipment record may have been removed or does not exist.</p>
        <Link to="/orders" className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold">
          Return to Orders
        </Link>
      </div>
    );
  }

  const trackingId = order.trackingId || order.trackingNumber || (order._id || id).slice(-8).toUpperCase();
  const history = order.statusHistory || [];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to={user?.role === 'admin' ? '/admin/orders' : '/orders'}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shipments</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={copyTrackingLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </button>

            <Link
              to={`/track/${id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-102"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Full Screen Live Track</span>
            </Link>
          </div>
        </div>

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Tracking Identifier
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-900 mt-1">
                #{trackingId}
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Created: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</span>
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <span className="text-xs text-slate-400 font-medium">Shipment Status</span>
              <StatusBadge status={order.status} size="lg" />
            </div>
          </div>

          {/* Quick Info Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Package</span>
              <p className="text-sm font-bold text-slate-800 truncate">{order.packageDetails?.description || 'Parcel'}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Weight</span>
              <p className="text-sm font-bold text-slate-800">
                {order.packageDetails?.weight ? `${order.packageDetails.weight} kg` : '1.0 kg'}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Shipper / User</span>
              <p className="text-sm font-bold text-slate-800 truncate">
                {order.user?.name || order.userId?.name || 'Customer'}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Assigned Driver</span>
              <p className="text-sm font-bold text-slate-800 truncate">
                {order.agent?.name || (order.agent ? 'Agent Assigned' : 'Unassigned')}
              </p>
            </div>
          </div>
        </div>

        {/* Admin or Agent Action Controls */}
        {(user?.role === 'admin' || user?.role === 'agent') && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/80 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>Operations Management Controls</span>
            </h3>

            {/* Admin: Agent Assignment */}
            {user?.role === 'admin' && (
              <form onSubmit={handleAssignAgent} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Assign Delivery Agent
                  </label>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="">-- Choose Field Agent --</option>
                    {agents.map((ag) => (
                      <option key={ag._id || ag.id} value={ag._id || ag.id}>
                        {ag.name} ({ag.email || ag.phone || 'Agent'})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={assigningAgent}
                  className="w-full sm:w-auto mt-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  {assigningAgent ? 'Assigning...' : 'Update Agent'}
                </button>
              </form>
            )}

            {/* Agent / Admin: Status Update Stepper */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-2">
                Quick Update Status
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_PROGRESSION.map((step) => (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => handleUpdateStatus(step.key)}
                    disabled={updatingStatus || order.status === step.key}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      order.status === step.key
                        ? 'bg-blue-600 text-white shadow-xs cursor-default'
                        : 'bg-white hover:bg-blue-100/60 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Grid: Details + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Details: Route, Addresses, Timeline */}
          <div className="lg:col-span-7 space-y-6">
            {/* Origin & Destination Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Pickup Origin</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">{order.pickupAddress?.address}</p>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  {order.pickupAddress?.lat}, {order.pickupAddress?.lng}
                </p>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
                <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase mb-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>Final Destination</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">{order.dropAddress?.address}</p>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  {order.dropAddress?.lat}, {order.dropAddress?.lng}
                </p>
              </div>
            </div>

            {/* Status History Timeline */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Delivery Milestone Timeline</span>
              </h3>

              {history.length === 0 ? (
                <div className="relative pl-6 pb-2 border-l-2 border-blue-500">
                  <div className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-blue-600" />
                  <p className="text-xs font-bold text-slate-800 capitalize">
                    {order.status?.replace('_', ' ')}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recent'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {history.map((item, index) => {
                    const isLatest = index === history.length - 1;
                    return (
                      <div key={index} className="relative pl-7 group">
                        {/* Connecting Line */}
                        {index < history.length - 1 && (
                          <div className="absolute left-[7px] top-3.5 bottom-[-24px] w-0.5 bg-slate-200" />
                        )}
                        {/* Marker Dot */}
                        <div
                          className={`absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                            isLatest ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-blue-600'
                          }`}
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800 capitalize">
                            {item.status ? item.status.replace('_', ' ') : 'Status Updated'}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recorded'}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Live Map Preview */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Live Delivery Route</h3>
                <Link
                  to={`/track/${id}`}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Expand Map
                </Link>
              </div>

              <div className="h-[420px] w-full rounded-2xl overflow-hidden">
                <LiveMap
                  pickup={order.pickupAddress}
                  drop={order.dropAddress}
                  currentLocation={order.currentLocation}
                  height="100%"
                />
              </div>

              {order.currentLocation && (
                <div className="mt-3 rounded-xl bg-blue-50 border border-blue-200 p-2.5 flex items-center justify-between text-xs text-blue-900">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    Agent Live Coordinates:
                  </span>
                  <span className="font-mono text-[11px]">
                    {Number(order.currentLocation.lat).toFixed(4)}, {Number(order.currentLocation.lng).toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
