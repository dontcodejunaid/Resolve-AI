import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  ShieldAlert,
  Bot,
  Layers,
  ShoppingBag,
  Sliders,
  CheckCircle2,
  LogOut,
  Sparkles,
  LifeBuoy
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[#090D16]/95 backdrop-blur border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-white">RESOLVE</span>
                  <span className="text-xs font-semibold px-1.5 py-0.2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">AI</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">ONE TEAMMATE. VERIFIED OUTCOME.</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links based on Role */}
          <nav className="hidden md:flex items-center space-x-1">
            {user?.role === 'customer' && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive('/dashboard') ? 'bg-slate-800 text-blue-400 border border-slate-700/60' : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  My Cases
                </Link>
                <Link
                  to="/new-case"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center space-x-1.5 ${
                    isActive('/new-case') ? 'bg-blue-600 text-white' : 'bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/30'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Report Payment Issue</span>
                </Link>
                <Link
                  to="/orders"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive('/orders') ? 'bg-slate-800 text-blue-400 border border-slate-700/60' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Orders
                </Link>
              </>
            )}

            {(user?.role === 'employee' || user?.role === 'admin') && (
              <>
                <Link
                  to="/employee/dashboard"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive('/employee/dashboard') ? 'bg-slate-800 text-blue-400 border border-slate-700/60' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Case Queue
                </Link>
                <Link
                  to="/employee/approvals"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center space-x-1.5 ${
                    isActive('/employee/approvals') ? 'bg-slate-800 text-amber-400 border border-slate-700/60' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Approvals</span>
                </Link>
              </>
            )}

            {(user?.role === 'merchant' || user?.role === 'admin') && (
              <>
                <Link
                  to="/merchant/dashboard"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive('/merchant/dashboard') ? 'bg-slate-800 text-blue-400 border border-slate-700/60' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Merchant Console
                </Link>
                <Link
                  to="/merchant/policies"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive('/merchant/policies') ? 'bg-slate-800 text-blue-400 border border-slate-700/60' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Policies
                </Link>
                <Link
                  to="/merchant/products"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive('/merchant/products') ? 'bg-slate-800 text-blue-400 border border-slate-700/60' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Inventory
                </Link>
              </>
            )}

            {/* Always accessible Demo Lab */}
            <Link
              to="/demo"
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center space-x-1.5 ${
                isActive('/demo') ? 'bg-purple-900/40 text-purple-300 border border-purple-500/50' : 'text-purple-400 hover:bg-purple-950/30'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Demo Lab</span>
            </Link>
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md shadow-sm shadow-blue-500/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
