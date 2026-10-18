import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ArrowLeft, Home, Compass } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-100 text-blue-600 shadow-inner">
          <Compass className="h-12 w-12 animate-spin [animation-duration:8s]" />
          <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
            <Truck className="h-5 w-5" />
          </div>
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Error 404
        </span>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Lost in Transit
        </h1>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          The dispatch waypoint or shipment record you are looking for does not exist, or has been rerouted to another destination.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all hover:scale-102"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
