import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Calendar, Weight, MapPin, Eye, Navigation } from 'lucide-react';
import StatusBadge from './StatusBadge';

const OrderCard = ({ order }) => {
  if (!order) return null;

  const orderId = order._id || order.id || 'N/A';
  const trackingNumber = order.trackingId || order.trackingNumber || (orderId.length > 8 ? orderId.slice(-8).toUpperCase() : orderId);
  const pickupAddress = order.pickupAddress?.address || 'Pickup address not specified';
  const dropAddress = order.dropAddress?.address || 'Destination not specified';
  const description = order.packageDetails?.description || 'Standard Parcel';
  const weight = order.packageDetails?.weight ? `${order.packageDetails.weight} kg` : null;
  const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) : 'Recently';

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl">
      {/* Top Header: Tracking ID & Status */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tracking Number</span>
          <div className="flex items-center gap-2 mt-0.5">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="font-mono text-sm font-bold text-slate-800 tracking-wide group-hover:text-blue-600 transition-colors">
              #{trackingNumber}
            </span>
          </div>
        </div>
        <StatusBadge status={order.status} size="sm" />
      </div>

      {/* Origin & Destination route */}
      <div className="my-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Pickup</p>
            <p className="text-xs font-semibold text-slate-700 truncate">{pickupAddress}</p>
          </div>
        </div>

        <div className="ml-3 border-l-2 border-dashed border-slate-200 h-3" />

        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <MapPin className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Destination</p>
            <p className="text-xs font-semibold text-slate-700 truncate">{dropAddress}</p>
          </div>
        </div>
      </div>

      {/* Package Description & Weight */}
      <div className="rounded-xl bg-slate-50 p-2.5 flex items-center justify-between text-xs text-slate-600 mb-4">
        <span className="font-medium truncate max-w-[170px]" title={description}>
          {description}
        </span>
        {weight && (
          <span className="flex items-center gap-1 font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
            <Weight className="w-3 h-3 text-slate-400" />
            {weight}
          </span>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1 text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{createdAt}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/track/${orderId}`}
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline px-2 py-1 rounded transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            Track
          </Link>

          <Link
            to={`/orders/${orderId}`}
            className="inline-flex items-center gap-1 font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 px-2.5 py-1 rounded-lg transition-colors border border-slate-200/60"
          >
            <Eye className="w-3.5 h-3.5" />
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
