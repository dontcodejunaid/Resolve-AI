import React, { useState } from 'react';
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
  LifeBuoy,
  User,
  ChevronDown,
  Building2,
  CreditCard
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, switchAccount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchUser = async (email, role) => {
    setSwitching(true);
    try {
      const newUser = await switchAccount(email);
      if (newUser.role === 'employee') {
        navigate('/employee/dashboard');
      } else if (newUser.role === 'merchant') {
        navigate('/merchant/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to switch demo account', err);
    } finally {
      setSwitching(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  const demoPersonas = [
    { name: 'Rahul Sharma', email: 'rahul@example.com', role: 'Customer 1 (Recovery)' },
    { name: 'Aisha Khan', email: 'aisha@example.com', role: 'Customer 2 (Refund/Stock)' },
    { name: 'Arjun Verma', email: 'arjun@example.com', role: 'Customer 3 (Pending)' },
    { name: 'Dev Specialist', email: 'agent@resolveai.com', role: 'Support Specialist' },
    { name: 'Priya Patel', email: 'manager@resolvestore.com', role: 'Store Manager' },
    { name: 'Bank Provider Sentinel', email: 'bank@gateway.com', role: 'Bank Gateway Provider' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-lime-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-lime-500 flex items-center justify-center shadow-md shadow-lime-500/25 text-black">
                <Bot className="w-5 h-5 font-bold" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">RESOLVE</span>
                  <span className="text-xs font-bold px-1.5 py-0.2 bg-lime-100 text-lime-800 border border-lime-300 rounded">AI</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono tracking-tight hidden sm:block">ONE TEAMMATE. VERIFIED OUTCOME.</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links based on Role */}
          <nav className="hidden md:flex items-center space-x-1">
            {user?.role === 'customer' && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-all ${
                    isActive('/dashboard') ? 'bg-lime-100 text-lime-900 border border-lime-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-lime-50/60'
                  }`}
                >
                  My Cases
                </Link>
                <Link
                  to="/new-case"
                  className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-all flex items-center space-x-1.5 ${
                    isActive('/new-case') ? 'bg-lime-500 text-black shadow-md shadow-lime-500/25' : 'bg-lime-100/80 text-lime-800 hover:bg-lime-200/80 border border-lime-300/80'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-lime-700" />
                  <span>Report Payment Issue</span>
                </Link>
                <Link
                  to="/orders"
                  className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-all ${
                    isActive('/orders') ? 'bg-lime-100 text-lime-900 border border-lime-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-lime-50/60'
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
                  className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-all ${
                    isActive('/employee/dashboard') ? 'bg-lime-100 text-lime-900 border border-lime-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-lime-50/60'
                  }`}
                >
                  Case Queue
                </Link>
                <Link
                  to="/employee/approvals"
                  className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-all flex items-center space-x-1.5 ${
                    isActive('/employee/approvals') ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50/60'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Approvals</span>
                </Link>
              </>
            )}

            {(user?.role === 'merchant' || user?.role === 'admin') && (
              <>
                <Link
                  to="/merchant/dashboard"
                  className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-all ${
                    isActive('/merchant/dashboard') ? 'bg-lime-100 text-lime-900 border border-lime-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-lime-50/60'
                  }`}
                >
                  Merchant Console
                </Link>
                <Link
                  to="/employee/approvals"
                  className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-all flex items-center space-x-1.5 ${
                    isActive('/employee/approvals') ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50/60'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Approvals</span>
                </Link>
                <Link
                  to="/merchant/policies"
                  className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-all ${
                    isActive('/merchant/policies') ? 'bg-lime-100 text-lime-900 border border-lime-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-lime-50/60'
                  }`}
                >
                  Policies
                </Link>
                <Link
                  to="/merchant/products"
                  className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-all ${
                    isActive('/merchant/products') ? 'bg-lime-100 text-lime-900 border border-lime-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-lime-50/60'
                  }`}
                >
                  Inventory
                </Link>
              </>
            )}

            {/* Bank Gateway Portal Link */}
            <Link
              to="/bank"
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-all flex items-center space-x-1.5 ${
                isActive('/bank') ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Bank Gateway</span>
            </Link>

            {/* Always accessible Demo Lab */}
            <Link
              to="/demo"
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-all flex items-center space-x-1.5 ${
                isActive('/demo') ? 'bg-lime-500 text-black shadow-md shadow-lime-500/25' : 'text-lime-800 bg-lime-50 hover:bg-lime-100 border border-lime-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Demo Lab</span>
            </Link>
          </nav>

          {/* User Profile & Demo Persona Switcher */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2.5">
                {/* Demo Persona Quick Select */}
                <div className="relative group">
                  <button
                    disabled={switching}
                    className="flex items-center space-x-2 bg-slate-50 hover:bg-lime-50 border border-slate-200 hover:border-lime-300 px-3 py-1.5 rounded-xl text-xs transition-all"
                  >
                    <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
                    <span className="font-bold text-slate-800">{user.full_name || user.email}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-lime-100 text-lime-800 font-bold">
                      {user.role}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <div className="absolute right-0 mt-1 w-64 bg-white border border-lime-200 rounded-2xl shadow-xl p-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-2 py-1.5 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                      Switch Demo Persona
                    </div>
                    {demoPersonas.map((p) => (
                      <button
                        key={p.email}
                        onClick={() => handleSwitchUser(p.email, p.role)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                          user.email === p.email
                            ? 'bg-lime-100 text-lime-900 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{p.role}</div>
                        </div>
                        {user.email === p.email && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-lime-700 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-lime-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-bold bg-lime-500 hover:bg-lime-400 text-black px-4 py-1.5 rounded-xl shadow-md shadow-lime-500/20"
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

