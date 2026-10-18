import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Navigation, 
  Truck, 
  MapPin, 
  PackageCheck, 
  CheckCircle2, 
  Radio, 
  Play, 
  Square, 
  RefreshCw, 
  ArrowRight, 
  Phone,
  AlertCircle,
  Inbox
} from 'lucide-react';
import { ordersAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/StatusBadge';
import LiveMap from '../components/LiveMap';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_STEPS = [
  { key: 'picked_up', label: '1. Mark Picked Up' },
  { key: 'in_transit', label: '2. In Transit' },
  { key: 'out_for_delivery', label: '3. Out for Delivery' },
  { key: 'delivered', label: '4. Delivered' },
];

const AgentDashboard = () => {
  const { socket, sendLocationUpdate, joinOrder } = useSocket();

  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const simIntervalRef = useRef(null);

  const fetchAgentOrders = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await ordersAPI.getOrders();
      const list = Array.isArray(res.data) ? res.data : (res.data?.orders || []);
      setOrders(list);

      // Select active delivery (e.g. status not delivered or cancelled)
      const currentActive = list.find((o) =>
        ['confirmed', 'picked_up', 'in_transit', 'out_for_delivery'].includes(o.status)
      );

      setActiveOrder(currentActive || (list.length > 0 ? list[0] : null));

      if (isManual) toast.success('Deliveries refreshed');
    } catch (error) {
      console.error('Failed to load agent orders:', error);
      toast.error('Failed to fetch your assigned deliveries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAgentOrders();
  }, []);

  // Join active order socket room
  useEffect(() => {
    if (activeOrder?._id || activeOrder?.id) {
      joinOrder(activeOrder._id || activeOrder.id);
    }
  }, [activeOrder, joinOrder]);

  // Clean up GPS simulation on unmount
  useEffect(() => {
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  const handleUpdateStatus = async (newStatus) => {
    if (!activeOrder) return;
    const orderId = activeOrder._id || activeOrder.id;

    try {
      setUpdatingStatus(true);
      const res = await ordersAPI.updateStatus(orderId, newStatus);
      const updated = res.data?.order || res.data;

      setActiveOrder((prev) => ({
        ...prev,
        ...updated,
        status: newStatus,
      }));

      setOrders((prev) =>
        prev.map((o) =>
          (o._id || o.id) === orderId ? { ...o, ...updated, status: newStatus } : o
        )
      );

      toast.success(`Status changed to ${newStatus.replace('_', ' ')}`);

      if (newStatus === 'delivered' && isSimulating) {
        stopGpsSimulation();
      }
    } catch (error) {
      console.error('Status update failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update delivery status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // GPS Movement Simulation
  const startGpsSimulation = () => {
    if (!activeOrder) {
      toast.error('No active order to simulate GPS for');
      return;
    }

    const pickupLat = Number(activeOrder.pickupAddress?.lat) || 28.6139;
    const pickupLng = Number(activeOrder.pickupAddress?.lng) || 77.2090;
    const dropLat = Number(activeOrder.dropAddress?.lat) || 19.0760;
    const dropLng = Number(activeOrder.dropAddress?.lng) || 72.8777;

    const totalSteps = 15;
    let currentStep = 0;
    setIsSimulating(true);

    toast.success('Real-time GPS simulation started! Transmitting coordinates...');

    simIntervalRef.current = setInterval(() => {
      currentStep += 1;
      setSimStep(currentStep);

      const ratio = currentStep / totalSteps;
      const lat = Number((pickupLat + (dropLat - pickupLat) * ratio).toFixed(5));
      const lng = Number((pickupLng + (dropLng - pickupLng) * ratio).toFixed(5));

      const orderId = activeOrder._id || activeOrder.id;

      // 1. Send via socket
      sendLocationUpdate(orderId, lat, lng);

      // 2. Update local state
      setActiveOrder((prev) => ({
        ...prev,
        currentLocation: { lat, lng, updatedAt: new Date().toISOString() },
      }));

      if (currentStep >= totalSteps) {
        clearInterval(simIntervalRef.current);
        setIsSimulating(false);
        toast.success('Simulation completed: Parcel arrived at destination!');
      }
    }, 2500);
  };

  const stopGpsSimulation = () => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
    }
    setIsSimulating(false);
    toast('GPS simulation stopped', { icon: '🛑' });
  };

  if (loading) {
    return <LoadingSpinner message="Loading delivery agent cockpit..." />;
  }

  const assignedActive = orders.filter((o) =>
    ['confirmed', 'picked_up', 'in_transit', 'out_for_delivery'].includes(o.status)
  );
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-black/20 px-3 py-1 text-xs font-semibold text-white mb-2">
              <Truck className="w-3.5 h-3.5 text-yellow-200" />
              <span>Delivery Fleet Executive Cockpit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              On-Duty Dispatch Board
            </h1>
            <p className="mt-1 text-sm text-amber-100 font-light">
              Manage assigned shipments, update milestones, and broadcast live GPS.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAgentOrders(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Refresh Deliveries"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Assigned</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{orders.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending Deliveries</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{assignedActive.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Delivered Today</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{deliveredOrders.length}</p>
          </div>
        </div>

        {/* Main Content Area */}
        {activeOrder ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Controls & Status update panel */}
            <div className="lg:col-span-6 space-y-6">
              {/* Active Delivery Card */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Active Shipment Under Delivery
                    </span>
                    <h2 className="text-xl font-mono font-extrabold text-slate-900 mt-0.5">
                      #{activeOrder.trackingId || activeOrder.trackingNumber || activeOrder._id?.slice(-8).toUpperCase()}
                    </h2>
                  </div>
                  <StatusBadge status={activeOrder.status} size="md" />
                </div>

                {/* Addresses */}
                <div className="space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-200/60 text-xs">
                  <div>
                    <span className="font-bold text-emerald-700 uppercase text-[10px] block mb-0.5">
                      Pickup From:
                    </span>
                    <p className="text-slate-800 font-semibold">{activeOrder.pickupAddress?.address}</p>
                  </div>
                  <div className="border-t border-slate-200/80 pt-2">
                    <span className="font-bold text-rose-700 uppercase text-[10px] block mb-0.5">
                      Deliver To:
                    </span>
                    <p className="text-slate-800 font-semibold">{activeOrder.dropAddress?.address}</p>
                  </div>
                </div>

                {/* Stage Progression Buttons */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Advance Shipment Milestone
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {STATUS_STEPS.map((step) => {
                      const isCurrent = activeOrder.status === step.key;
                      return (
                        <button
                          key={step.key}
                          type="button"
                          disabled={updatingStatus || isCurrent}
                          onClick={() => handleUpdateStatus(step.key)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                            isCurrent
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {step.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Real-time GPS Simulation Section */}
                <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className={`w-4 h-4 ${isSimulating ? 'text-emerald-500 animate-pulse' : 'text-blue-600'}`} />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                        GPS Location Broadcaster
                      </h4>
                    </div>
                    {isSimulating && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full animate-pulse">
                        Transmitting ({simStep}/15)
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Simulate real-time GPS telemetry along the route. Emits WebSocket packets to customer tracking screen every 2.5s.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    {!isSimulating ? (
                      <button
                        type="button"
                        onClick={startGpsSimulation}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-101"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Start GPS Simulation
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopGpsSimulation}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-101"
                      >
                        <Square className="w-3.5 h-3.5" />
                        Stop Simulation
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Other Assigned Deliveries List */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Your Assigned Deliveries</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {orders.map((o) => {
                    const isSelected = (o._id || o.id) === (activeOrder._id || activeOrder.id);
                    return (
                      <div
                        key={o._id || o.id}
                        onClick={() => setActiveOrder(o)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <span className="font-mono font-bold text-slate-800">
                            #{o.trackingId || o._id?.slice(-8).toUpperCase()}
                          </span>
                          <p className="text-slate-500 truncate max-w-[200px]">{o.dropAddress?.address}</p>
                        </div>
                        <StatusBadge status={o.status} size="sm" showIcon={false} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Map View */}
            <div className="lg:col-span-6 sticky top-24 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800">Delivery Navigation Route</h3>
                  <Link
                    to={`/track/${activeOrder._id || activeOrder.id}`}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>Full Screen Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="h-[460px] w-full rounded-2xl overflow-hidden">
                  <LiveMap
                    pickup={activeOrder.pickupAddress}
                    drop={activeOrder.dropAddress}
                    currentLocation={activeOrder.currentLocation}
                    height="100%"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <Inbox className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No active shipments assigned</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Logistics dispatch has not assigned any shipments to your profile yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
