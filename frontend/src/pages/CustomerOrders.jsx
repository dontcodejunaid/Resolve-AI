import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { ShoppingBag, PackageCheck, CreditCard, Clock, CheckCircle2 } from 'lucide-react';

export const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await client.get('/orders');
        setOrders(res.data);
      } catch (e) {
        console.error('Failed to load customer orders', e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Your Order History</h1>
        <p className="text-sm text-slate-400 mt-1">
          Confirmed purchases and autonomously recovered orders.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 font-mono text-sm">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-slate-900/90 border border-slate-800 p-12 rounded-2xl text-center space-y-3">
          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No Orders Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once Resolve AI recovers or confirms your order, it will show up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-blue-400">
                  #{ord.order_number}
                </span>
                {ord.is_recovered ? (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded flex items-center space-x-1">
                    <PackageCheck className="w-3 h-3" />
                    <span>RECOVERED BY AI</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 rounded">
                    STANDARD
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="font-mono text-emerald-400 font-bold">{ord.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quantity</span>
                  <span className="font-mono text-slate-200">{ord.quantity}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Paid</span>
                  <span className="font-mono text-slate-200 font-bold">₹{ord.amount} {ord.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Linked</span>
                  <span className="font-mono text-blue-400">Linked ✓</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
                Created: {new Date(ord.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
