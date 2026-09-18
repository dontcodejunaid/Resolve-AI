import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Bot, Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';

export const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await signup(email, password, fullName, role);
      if (user.role === 'customer') {
        navigate('/dashboard');
      } else if (user.role === 'employee') {
        navigate('/employee/dashboard');
      } else {
        navigate('/merchant/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white border border-lime-200 p-8 rounded-2xl shadow-xl shadow-lime-900/5">
        <div className="text-center">
          <div className="w-12 h-12 bg-lime-500 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-lime-500/25 mb-3">
            <Bot className="w-7 h-7 text-slate-950" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            One Teammate. One Case. A Verified Outcome.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-lime-700 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-lime-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-lime-500 focus:bg-white transition-all"
                placeholder="Rahul Sharma"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Account Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-50 border border-lime-200 text-slate-900 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-lime-500 focus:bg-white transition-all"
            >
              <option value="customer">Customer</option>
              <option value="employee">Support Employee</option>
              <option value="merchant">Merchant / Manager</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-500 hover:bg-lime-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-md shadow-lime-500/20 flex items-center justify-center space-x-2 transition-all"
          >
            <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-lime-700 hover:text-lime-800 font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

