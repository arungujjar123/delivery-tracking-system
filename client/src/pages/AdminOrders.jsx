import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Search, 
  Filter, 
  UserCheck, 
  Eye, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  X,
  Navigation
} from 'lucide-react';
import { ordersAPI, usersAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal for assigning agent
  const [activeAssignOrder, setActiveAssignOrder] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const [ordersRes, agentsRes] = await Promise.allSettled([
        ordersAPI.getOrders(),
        usersAPI.getAgents(),
      ]);

      if (ordersRes.status === 'fulfilled') {
        const list = Array.isArray(ordersRes.value.data)
          ? ordersRes.value.data
          : ordersRes.value.data?.orders || [];
        setOrders(list);
      }

      if (agentsRes.status === 'fulfilled') {
        const agentList = Array.isArray(agentsRes.value.data)
          ? agentsRes.value.data
          : agentsRes.value.data?.agents || [];
        setAgents(agentList);
      }

      if (isManual) toast.success('Orders refreshed');
    } catch (error) {
      console.error('Error fetching admin orders data:', error);
      toast.error('Failed to load orders or agents');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAssignModal = (order) => {
    setActiveAssignOrder(order);
    setSelectedAgentId(order.agent?._id || order.agent || '');
  };

  const closeAssignModal = () => {
    setActiveAssignOrder(null);
    setSelectedAgentId('');
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!activeAssignOrder || !selectedAgentId) {
      toast.error('Please pick an agent');
      return;
    }

    try {
      setAssigning(true);
      const orderId = activeAssignOrder._id || activeAssignOrder.id;
      const res = await ordersAPI.assignAgent(orderId, selectedAgentId);
      const updated = res.data?.order || res.data;

      // Update state
      const assignedAgentObj = agents.find((a) => (a._id || a.id) === selectedAgentId);
      setOrders((prev) =>
        prev.map((o) =>
          (o._id || o.id) === orderId ? { ...o, ...updated, agent: assignedAgentObj || selectedAgentId } : o
        )
      );

      toast.success('Agent assigned successfully');
      closeAssignModal();
    } catch (error) {
      console.error('Failed to assign agent:', error);
      toast.error(error.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && (o.status || '').toLowerCase() !== statusFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const trk = (o.trackingId || o.trackingNumber || o._id || '').toLowerCase();
      const pickup = (o.pickupAddress?.address || '').toLowerCase();
      const drop = (o.dropAddress?.address || '').toLowerCase();
      const user = (o.user?.name || o.userId?.name || '').toLowerCase();
      const agent = (o.agent?.name || '').toLowerCase();

      return trk.includes(q) || pickup.includes(q) || drop.includes(q) || user.includes(q) || agent.includes(q);
    }
    return true;
  });

  if (loading) {
    return <LoadingSpinner message="Loading orders registry..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              All Logistics Shipments
            </h1>
            <p className="text-sm text-slate-500">
              Admin dispatch control, driver allocation, and live tracking access
            </p>
          </div>

          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="self-start sm:self-auto inline-flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Tracking ID, customer, agent, or address..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-hidden focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="placed">Placed</option>
              <option value="confirmed">Confirmed</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Tracking Code</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Route (Pickup → Drop)</th>
                  <th className="py-3.5 px-4">Assigned Agent</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const id = order._id || order.id;
                    const tracking = order.trackingId || order.trackingNumber || id?.slice(-8).toUpperCase();
                    const agentName = order.agent?.name || (typeof order.agent === 'string' ? 'Agent ID' : null);

                    return (
                      <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-blue-600">#{tracking}</div>
                          <span className="text-[10px] text-slate-400 truncate block max-w-[120px]">
                            {order.packageDetails?.description || 'Parcel'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={order.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 max-w-[240px]">
                          <div className="truncate font-medium text-slate-800" title={order.pickupAddress?.address}>
                            <span className="text-emerald-600 font-bold">From:</span> {order.pickupAddress?.address}
                          </div>
                          <div className="truncate text-slate-500 mt-0.5" title={order.dropAddress?.address}>
                            <span className="text-rose-600 font-bold">To:</span> {order.dropAddress?.address}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {agentName ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              {agentName}
                            </span>
                          ) : (
                            <button
                              onClick={() => openAssignModal(order)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-md border border-amber-200 transition-colors"
                            >
                              + Assign Agent
                            </button>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => openAssignModal(order)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Assign/Reassign Agent"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/track/${id}`}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Live Track"
                            >
                              <Navigation className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/orders/${id}`}
                              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Manage
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Agent Assignment */}
        {activeAssignOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative">
              <button
                onClick={closeAssignModal}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-900 mb-1">Assign Delivery Executive</h3>
              <p className="text-xs text-slate-500 mb-4">
                Order #{activeAssignOrder.trackingId || activeAssignOrder._id}
              </p>

              <form onSubmit={handleSaveAssignment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Select Agent
                  </label>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="">-- Choose Field Executive --</option>
                    {agents.map((ag) => (
                      <option key={ag._id || ag.id} value={ag._id || ag.id}>
                        {ag.name} ({ag.phone || ag.email || 'Agent'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeAssignModal}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assigning}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md disabled:opacity-60"
                  >
                    {assigning ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
