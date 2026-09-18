import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { Package, Plus, Minus, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const MerchantProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await client.get('/merchant/products');
      setProducts(res.data);
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const adjustStock = async (product, delta) => {
    const newStock = Math.max(0, product.stock + delta);
    setUpdatingId(product.id);
    try {
      const res = await client.put(`/merchant/products/${product.id}`, {
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        currency: product.currency,
        stock: newStock,
        is_active: product.is_active,
      });
      setProducts(products.map(p => p.id === product.id ? res.data : p));
    } catch (err) {
      console.error('Failed to update stock', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Product Inventory & Stock</h1>
          <p className="text-sm text-slate-400 mt-1">
            Control real-time item availability to test AI recovery paths vs out-of-stock refund flows.
          </p>
        </div>

        <button
          onClick={fetchProducts}
          className="p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-xs font-mono transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 font-mono text-sm">
          Loading inventory...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">#{prod.id}</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border uppercase ${
                      prod.stock > 0
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                        : 'bg-red-950/60 text-red-400 border-red-800/60'
                    }`}
                  >
                    {prod.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{prod.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                  {prod.description}
                </p>

                <div className="pt-2 text-xl font-mono font-bold text-white">
                  ₹{prod.price} <span className="text-xs text-slate-500 font-normal">{prod.currency}</span>
                </div>
              </div>

              {/* Stock Controls */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Live Inventory</span>
                  <span className="font-mono text-base font-extrabold text-blue-400">
                    {prod.stock} units
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => adjustStock(prod, -1)}
                    disabled={updatingId === prod.id || prod.stock <= 0}
                    className="py-1.5 px-3 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Decrease</span>
                  </button>

                  <button
                    onClick={() => adjustStock(prod, 5)}
                    disabled={updatingId === prod.id}
                    className="py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+5 Stock</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
