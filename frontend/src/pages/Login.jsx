import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Bot, Lock, Mail, ArrowRight, AlertCircle, Shield } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('rahul@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'customer') {
        navigate('/dashboard');
      } else if (user.role === 'employee') {
        navigate('/employee/dashboard');
      } else {
        navigate('/merchant/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogins = [
    { label: 'Customer 1 (Rahul)', email: 'rahul@example.com' },
    { label: 'Customer 2 (Aisha)', email: 'aisha@example.com' },
    { label: 'Customer 3 (Arjun)', email: 'arjun@example.com' },
    { label: 'Support Specialist', email: 'agent@resolveai.com' },
    { label: 'Store Manager', email: 'manager@resolvestore.com' },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white border border-lime-200 p-8 rounded-2xl shadow-xl shadow-lime-900/5">
        <div className="text-center">
          <div className="w-16 h-16 bg-white border border-lime-200 rounded-2xl mx-auto flex items-center justify-center p-2 shadow-sm mb-3">
            <img src="/logo.png" alt="RESOLVE.ai" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to RESOLVE<sub className="text-sm font-mono font-bold text-lime-600 lowercase ml-0.5">.ai</sub>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Autonomous Customer-Service Resolution Engine
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-lime-700 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-lime-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-lime-500 focus:bg-white transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-lime-700 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-lime-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-lime-500 focus:bg-white transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-500 hover:bg-lime-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-md shadow-lime-500/20 flex items-center justify-center space-x-2 transition-all"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Pre-fills */}
        <div className="pt-4 border-t border-lime-100">
          <span className="text-[11px] font-mono text-slate-500 block mb-2 text-center uppercase tracking-wider">
            Demo 1-Click Fast Logins
          </span>
          <div className="grid grid-cols-3 gap-2">
            {quickLogins.map((ql) => (
              <button
                key={ql.email}
                type="button"
                onClick={() => {
                  setEmail(ql.email);
                  setPassword('password123');
                }}
                className="text-[11px] py-1.5 px-2 bg-lime-50 border border-lime-200 hover:bg-lime-100 text-lime-900 rounded-lg text-center transition-all truncate font-semibold"
              >
                {ql.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-lime-700 hover:text-lime-800 font-bold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

