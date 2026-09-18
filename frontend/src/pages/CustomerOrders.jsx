import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { formatActualDateTime } from '../utils/dateUtils';
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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Order History</h1>
        <p className="text-sm text-slate-600 mt-1">
          Confirmed purchases and autonomously recovered orders.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-lime-700 font-mono text-sm">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-lime-200 p-12 rounded-2xl text-center space-y-3 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">No Orders Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once RESOLVE<sub className="text-xs font-mono font-bold text-lime-600 lowercase ml-0.5">.ai</sub> recovers or confirms your order, it will show up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white border border-lime-200 p-5 rounded-2xl shadow-sm space-y-4 hover:border-lime-400 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-lime-700">
                  #{ord.order_number}
                </span>
                {ord.is_recovered ? (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-lime-100 text-lime-800 border border-lime-300 rounded flex items-center space-x-1">
                    <PackageCheck className="w-3 h-3 text-lime-700" />
                    <span>RECOVERED BY AI</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded">
                    STANDARD
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-mono text-lime-700 font-bold">{ord.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quantity</span>
                  <span className="font-mono text-slate-800">{ord.quantity}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid</span>
                  <span className="font-mono text-slate-900 font-bold">₹{ord.amount} {ord.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Linked</span>
                  <span className="font-mono text-lime-700 font-semibold">Linked ✓</span>
                </div>
              </div>

              <div className="pt-3 border-t border-lime-100 text-[11px] font-mono text-slate-400">
                Created: {formatActualDateTime(ord.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

