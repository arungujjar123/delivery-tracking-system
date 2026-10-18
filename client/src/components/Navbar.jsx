import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Package, 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  Shield, 
  LogOut, 
  Menu, 
  X, 
  MapPin, 
  ChevronDown,
  Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out');
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const linkClass = (path) =>
    `inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
      isActive(path)
        ? 'bg-blue-700/80 text-white shadow-xs'
        : 'text-blue-100 hover:bg-blue-600/70 hover:text-white'
    }`;

  const mobileLinkClass = (path) =>
    `flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-blue-700 text-white font-semibold'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* DeliTrack Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition-transform group-hover:scale-105">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center">
                Deli<span className="text-emerald-400">Track</span>
              </span>
              <span className="text-[10px] -mt-1 tracking-wider text-blue-200 font-medium uppercase">
                Real-Time Logistics
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={linkClass('/dashboard')}>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                {/* Role specific links */}
                {user?.role === 'admin' && (
                  <>
                    <Link to="/admin" className={linkClass('/admin')}>
                      <Shield className="w-4 h-4 text-emerald-300" />
                      Admin Hub
                    </Link>
                    <Link to="/admin/orders" className={linkClass('/admin/orders')}>
                      <Package className="w-4 h-4" />
                      Manage Orders
                    </Link>
                    <Link to="/admin/users" className={linkClass('/admin/users')}>
                      <Users className="w-4 h-4" />
                      Users & Agents
                    </Link>
                  </>
                )}

                {user?.role === 'agent' && (
                  <>
                    <Link to="/agent" className={linkClass('/agent')}>
                      <Navigation className="w-4 h-4 text-amber-300" />
                      Agent Portal
                    </Link>
                    <Link to="/orders" className={linkClass('/orders')}>
                      <Package className="w-4 h-4" />
                      All Deliveries
                    </Link>
                  </>
                )}

                {user?.role === 'user' && (
                  <>
                    <Link to="/orders" className={linkClass('/orders')}>
                      <Package className="w-4 h-4" />
                      My Orders
                    </Link>
                    <Link
                      to="/place-order"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all hover:shadow-md"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Book Shipment
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link to="/" className={linkClass('/')}>
                  Home
                </Link>
              </>
            )}
          </div>

          {/* User Profile / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 rounded-full bg-blue-800/60 pl-2 pr-3 py-1.5 text-sm hover:bg-blue-800 transition-colors focus:outline-hidden"
                >
                  <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs uppercase text-white shadow-xs">
                    {user?.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold leading-none">{user?.name || 'Account'}</p>
                    <span className="text-[10px] font-medium text-blue-200 capitalize">
                      {user?.role || 'user'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-300" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-white py-1 shadow-xl ring-1 ring-black/5 text-slate-800 z-50 animate-in fade-in slide-in-from-top-1"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:bg-blue-600/70 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-blue-600 hover:bg-blue-50 shadow-sm transition-all hover:shadow"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-blue-100 hover:bg-blue-600 hover:text-white focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pt-2 pb-4 space-y-1 text-slate-800 shadow-xl animate-in slide-in-from-top duration-200">
          {isAuthenticated ? (
            <>
              <div className="px-3 py-2 border-b border-slate-100 mb-2">
                <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 capitalize">
                  {user?.role}
                </span>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClass('/dashboard')}
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                Dashboard
              </Link>

              {user?.role === 'user' && (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass('/orders')}
                  >
                    <Package className="w-4 h-4 text-blue-600" />
                    My Orders
                  </Link>
                  <Link
                    to="/place-order"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass('/place-order')}
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    Book Shipment
                  </Link>
                </>
              )}

              {user?.role === 'agent' && (
                <>
                  <Link
                    to="/agent"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass('/agent')}
                  >
                    <Navigation className="w-4 h-4 text-amber-600" />
                    Agent Portal
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass('/orders')}
                  >
                    <Package className="w-4 h-4 text-blue-600" />
                    Deliveries
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass('/admin')}
                  >
                    <Shield className="w-4 h-4 text-emerald-600" />
                    Admin Hub
                  </Link>
                  <Link
                    to="/admin/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass('/admin/orders')}
                  >
                    <Package className="w-4 h-4 text-blue-600" />
                    Manage Orders
                  </Link>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass('/admin/users')}
                  >
                    <Users className="w-4 h-4 text-blue-600" />
                    Users & Agents
                  </Link>
                </>
              )}

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
