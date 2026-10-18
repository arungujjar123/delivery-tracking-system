import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Truck, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  Clock, 
  ArrowRight, 
  Search, 
  Layers, 
  CheckCircle, 
  BarChart3, 
  Globe2,
  Box,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Landing = () => {
  const [quickTrackId, setQuickTrackId] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleQuickTrack = (e) => {
    e.preventDefault();
    if (!quickTrackId.trim()) {
      toast.error('Please enter a tracking or order ID');
      return;
    }
    navigate(`/track/${quickTrackId.trim()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900 text-white pt-20 pb-28">
        {/* Subtle grid pattern background */}
        <div 
          className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill tag */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-700/60 border border-blue-400/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-200 mb-6 backdrop-blur-sm shadow-sm">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Next-Gen Logistics Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight">
              Real-Time Delivery Tracking <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Simplified & Transparent.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-blue-100 font-light leading-relaxed">
              Empower your supply chain with live GPS tracking, automated driver dispatching, 
              and end-to-end milestone visibility across nationwide hubs.
            </p>

            {/* Quick Tracking Search Box */}
            <div className="mt-10 max-w-xl mx-auto">
              <form
                onSubmit={handleQuickTrack}
                className="flex flex-col sm:flex-row items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/20"
              >
                <div className="relative flex-1 w-full flex items-center pl-3">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={quickTrackId}
                    onChange={(e) => setQuickTrackId(e.target.value)}
                    placeholder="Enter Tracking ID (e.g. TRK-8921 or Order ID)"
                    className="w-full px-3 py-2.5 text-slate-800 text-sm font-medium placeholder-slate-400 bg-transparent focus:outline-hidden"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:shadow-lg hover:scale-102 active:scale-98"
                >
                  <span>Track Package</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
                >
                  <Box className="w-4 h-4" />
                  Go To Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-800/80 hover:bg-blue-700 text-white border border-blue-400/30 font-semibold text-sm backdrop-blur-sm transition-all hover:-translate-y-0.5"
                  >
                    Log In to Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Decorative wave divider */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-slate-50 [clip-path:polygon(0_100%,100%_100%,100%_0)]" />
      </section>

      {/* Highlights Bar */}
      <section className="relative -mt-6 max-w-6xl mx-auto px-4 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
          <div className="text-center p-2 border-r border-slate-100 last:border-r-0">
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">99.8%</p>
            <p className="text-xs text-slate-500 font-medium mt-1">On-Time Delivery</p>
          </div>
          <div className="text-center p-2 border-r border-slate-100 last:border-r-0">
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">&lt; 30s</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Live GPS Latency</p>
          </div>
          <div className="text-center p-2 border-r border-slate-100 last:border-r-0">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">50K+</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Parcels Handled</p>
          </div>
          <div className="text-center p-2">
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600">24 / 7</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Automated Dispatch</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Enterprise Capabilities</h2>
          <h3 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Engineered for Modern Logistics Speed
          </h3>
          <p className="mt-4 text-slate-600 text-sm sm:text-base">
            From single parcels to complex multi-city fleets, DeliTrack gives full visibility to shippers, dispatchers, and field drivers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="relative group rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-300">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Compass className="h-7 w-7" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">Live GPS Tracking</h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Real-time map updates with automated agent coordinates over WebSockets. Receive instantaneous status updates from pickup to doorstep.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Interactive Leaflet maps</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative group rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-300">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Layers className="h-7 w-7" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">Order Lifecycle Management</h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Comprehensive order management workflow. Shippers easily book pickups, track status histories, and inspect route milestones in one unified interface.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>7-stage delivery milestones</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative group rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-300">
            <div className="h-14 w-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <BarChart3 className="h-7 w-7" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">Admin & Dispatch Hub</h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Smart driver allocation, fleet workload balancing, performance analytics, and on-time SLA reporting for operations supervisors.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Real-time dispatch controls</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-100/60 py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Seamless Flow</span>
            <h3 className="mt-2 text-3xl font-extrabold text-slate-900">How DeliTrack Works</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-xs relative">
              <div className="text-3xl font-black text-blue-100 mb-3">01</div>
              <h5 className="font-bold text-slate-800 text-base mb-1">Book Shipment</h5>
              <p className="text-slate-600 text-xs leading-relaxed">
                Enter pickup and drop coordinates with package dimensions and weight.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-xs relative">
              <div className="text-3xl font-black text-blue-100 mb-3">02</div>
              <h5 className="font-bold text-slate-800 text-base mb-1">Agent Assignment</h5>
              <p className="text-slate-600 text-xs leading-relaxed">
                Admin dispatches the nearest delivery executive directly to the pickup point.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-xs relative">
              <div className="text-3xl font-black text-blue-100 mb-3">03</div>
              <h5 className="font-bold text-slate-800 text-base mb-1">Live GPS Tracking</h5>
              <p className="text-slate-600 text-xs leading-relaxed">
                Sender and receiver stream live transit coordinates in real time over map view.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-xs relative">
              <div className="text-3xl font-black text-blue-100 mb-3">04</div>
              <h5 className="font-bold text-slate-800 text-base mb-1">Doorstep Delivery</h5>
              <p className="text-slate-600 text-xs leading-relaxed">
                Agent marks delivery completion with instant notification and timestamps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to ship with total clarity?</h3>
            <p className="mt-2 text-blue-100 text-sm max-w-xl">
              Join thousands of businesses relying on DeliTrack for ultra-reliable parcel logistics and tracking.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-md hover:bg-blue-50 transition-all hover:scale-102"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-500" />
            <span className="font-bold text-white text-sm">DeliTrack</span>
            <span className="text-slate-600">|</span>
            <span>Real-Time Delivery & Order Management Platform</span>
          </div>
          <p>© {new Date().getFullYear()} DeliTrack Logistics Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
