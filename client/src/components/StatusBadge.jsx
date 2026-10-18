import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  PackageCheck, 
  Truck, 
  Navigation, 
  CheckCheck, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';

const statusConfig = {
  placed: {
    label: 'Order Placed',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    icon: CheckCircle2,
  },
  picked_up: {
    label: 'Picked Up',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
    icon: PackageCheck,
  },
  in_transit: {
    label: 'In Transit',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    icon: Truck,
  },
  out_for_delivery: {
    label: 'Out For Delivery',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    icon: Navigation,
  },
  delivered: {
    label: 'Delivered',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCheck,
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    icon: XCircle,
  },
};

const formatStatus = (rawStatus) => {
  if (!rawStatus) return 'Unknown';
  return rawStatus
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const StatusBadge = ({ status, size = 'md', showIcon = true }) => {
  const normalizedKey = (status || '').toLowerCase().trim();
  const config = statusConfig[normalizedKey] || {
    label: formatStatus(status),
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    icon: AlertCircle,
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-semibold gap-2',
  }[size] || 'px-2.5 py-1 text-xs font-semibold gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} transition-colors shadow-xs`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0 animate-pulse`} />
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span className="tracking-wide">{config.label}</span>
    </span>
  );
};

export default StatusBadge;
