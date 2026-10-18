import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Truck, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Navigation, 
  Phone, 
  Radio, 
  CheckCircle2, 
  AlertCircle,
  PackageCheck
} from 'lucide-react';
import { ordersAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/StatusBadge';
import LiveMap from '../components/LiveMap';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const TrackOrder = () => {
  const { id } = useParams();
  const { socket, joinOrder } = useSocket();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastPingTime, setLastPingTime] = useState(null);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getTrackingInfo(id);
      const data = res.data?.order || res.data;
      setOrder(data);
      if (data?.currentLocation) {
        setLastPingTime(new Date());
      }
    } catch (error) {
      console.error('Failed to load tracking data:', error);
      // Fallback: try fetching normal order by ID
      try {
        const fallbackRes = await ordersAPI.getOrderById(id);
        const data = fallbackRes.data?.order || fallbackRes.data;
        setOrder(data);
      } catch (err) {
        toast.error('Unable to fetch live tracking details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, [id]);

  // Real-time socket events
  useEffect(() => {
    if (!id) return;
    joinOrder(id);

    if (!socket) return;

    const handleLocationChange = (data) => {
      // payload may be { orderId, lat, lng }
      if (data.orderId === id || !data.orderId) {
        setOrder((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            currentLocation: {
              lat: Number(data.lat),
              lng: Number(data.lng),
            },
          };
        });
        setLastPingTime(new Date());
      }
    };

    const handleStatusUpdate = ({ orderId, status }) => {
      if (orderId === id) {
        setOrder((prev) => {
          if (!prev) return prev;
          return { ...prev, status };
        });
        toast.success(`Shipment status updated: ${status.replace('_', ' ')}`);
      }
    };

    socket.on('location:changed', handleLocationChange);
    socket.on('order:statusUpdate', handleStatusUpdate);

    return () => {
      socket.off('location:changed', handleLocationChange);
      socket.off('order:statusUpdate', handleStatusUpdate);
    };
  }, [id, socket]);

  if (loading) {
    return <LoadingSpinner message="Connecting to live GPS satellite stream..." />;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Shipment Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">Please verify the Tracking / Order ID and try again.</p>
        <Link to="/dashboard" className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold">
          Go To Dashboard
        </Link>
      </div>
    );
  }

  const trackingId = order.trackingId || order.trackingNumber || (order._id || id).slice(-8).toUpperCase();

  // Milestone Stages
  const steps = [
    { key: 'placed', label: 'Placed' },
    { key: 'picked_up', label: 'Picked Up' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full flex flex-col lg:flex-row overflow-hidden bg-slate-100">
      {/* Left/Bottom Floating Tracking Overlay Panel */}
      <div className="w-full lg:w-[420px] bg-white border-r border-slate-200 z-20 flex flex-col h-full shadow-2xl overflow-y-auto">
        {/* Panel Header */}
        <div className="p-5 border-b border-slate-100 bg-white sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <Link
              to={`/orders/${id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Order Details</span>
            </Link>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE GPS</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tracking Code</span>
              <h2 className="text-xl font-mono font-extrabold text-slate-900 mt-0.5">#{trackingId}</h2>
            </div>
            <StatusBadge status={order.status} size="sm" />
          </div>
        </div>

        {/* Milestone Stepper */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/60">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Shipment Progress</p>
          <div className="relative flex items-center justify-between">
            {/* Background connecting bar */}
            <div className="absolute left-2 right-2 top-3 h-0.5 bg-slate-200 -z-0" />

            {steps.map((step, idx) => {
              const isDone = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                      isCurrent
                        ? 'bg-blue-600 border-white text-white ring-4 ring-blue-100 shadow-md scale-110'
                        : isDone
                        ? 'bg-emerald-500 border-white text-white'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`mt-1.5 text-[9px] font-semibold max-w-[55px] leading-tight ${
                      isCurrent ? 'text-blue-600 font-bold' : isDone ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Route Details */}
        <div className="p-5 space-y-4 border-b border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Route Waypoints</p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Origin Warehouse / Sender</p>
                <p className="text-xs font-semibold text-slate-800">{order.pickupAddress?.address}</p>
              </div>
            </div>

            <div className="ml-3 border-l-2 border-dashed border-slate-200 h-4" />

            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-6 w-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">Recipient Address</p>
                <p className="text-xs font-semibold text-slate-800">{order.dropAddress?.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Driver / Agent Info */}
        <div className="p-5 border-b border-slate-100 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned Driver</p>
          {order.agent ? (
            <div className="rounded-2xl bg-blue-50/60 border border-blue-100 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {order.agent?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{order.agent?.name || 'Field Agent'}</h4>
                  <p className="text-[11px] text-slate-500">{order.agent?.phone || 'Verified Delivery Partner'}</p>
                </div>
              </div>
              {order.agent?.phone && (
                <a
                  href={`tel:${order.agent.phone}`}
                  className="p-2 rounded-xl bg-white text-blue-600 shadow-xs hover:bg-blue-50 border border-blue-200 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Awaiting agent allocation by logistics dispatch</span>
            </div>
          )}
        </div>

        {/* Live GPS Telemetry Footer */}
        <div className="p-5 mt-auto bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              GPS Stream Active
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {lastPingTime ? `Ping: ${lastPingTime.toLocaleTimeString()}` : 'Connected'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Fullscreen Interactive Leaflet Map */}
      <div className="flex-1 h-full w-full relative">
        <LiveMap
          pickup={order.pickupAddress}
          drop={order.dropAddress}
          currentLocation={order.currentLocation}
          height="100%"
        />
      </div>
    </div>
  );
};

export default TrackOrder;
