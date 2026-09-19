import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import {
  Package,
  Plus,
  Minus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Sparkles,
  Store,
  Tag,
  ArrowRight
} from 'lucide-react';

export const MerchantProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

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

  const adjustStock = async (product, delta, directValue = null) => {
    const newStock = directValue !== null ? directValue : Math.max(0, product.stock + delta);
    setUpdatingId(product.id);
    try {
      const res = await client.put(`/merchant/products/${product.id}`, {
        name: product.name,
        description: product.description,
        category: product.category || 'apparel',
        sku: product.sku,
        image_url: product.image_url,
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

  const categories = ['all', 'outerwear', 'tops', 'bottoms', 'accessories'];

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-lime-400 text-slate-950 rounded-full">
              AURA STUDIO
            </span>
            <span className="text-xs font-mono text-slate-400">Inventory & Stock Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Product Catalog & Live Stock</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Control real-time item availability. Toggle stock levels to test <strong>AI Autonomous Recovery</strong> (stock &gt; 0) vs <strong>Human Manager Refund Approval</strong> (stock = 0).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="https://aura-nine-virid.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono font-bold transition-all shadow-sm group"
          >
            <span>Aura Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-lime-400" />
          </a>

          <button
            onClick={fetchProducts}
            className="p-2.5 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-lime-500/20"
            title="Refresh Inventory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-lime-200 shadow-sm">
        {/* Category Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold capitalize transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-lime-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat === 'all' ? 'All Catalog' : cat}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by SKU, title..."
            className="w-full bg-slate-50 border border-lime-200 text-slate-900 text-xs rounded-xl pl-9 pr-3.5 py-2 outline-none focus:border-lime-500 focus:bg-white font-mono transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-lime-700 font-mono text-sm space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-lime-600" />
          <div>Synchronizing catalog with Aura Studio...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between ${
                prod.stock === 0 ? 'border-amber-300 bg-amber-50/20' : 'border-lime-200 hover:border-lime-400'
              }`}
            >
              <div className="space-y-3.5">
                {/* Product Image & Badges */}
                <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={prod.image_url || "/assets/images/hoodie.jpg"}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = '/assets/images/hoodie.jpg'; }}
                  />
                  
                  <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                    {prod.sku && (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-extrabold bg-slate-900/90 text-lime-300 backdrop-blur-sm rounded-md shadow-sm">
                        {prod.sku}
                      </span>
                    )}
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white/90 text-slate-800 backdrop-blur-sm rounded-md uppercase">
                      {prod.category || 'apparel'}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-mono font-extrabold rounded-lg shadow-sm border uppercase ${
                        prod.stock > 0
                          ? 'bg-lime-500 text-slate-950 border-lime-400'
                          : 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      }`}
                    >
                      {prod.stock > 0 ? `${prod.stock} IN STOCK` : 'OUT OF STOCK'}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{prod.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1 line-clamp-2 min-h-[32px]">
                    {prod.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xl font-mono font-extrabold text-slate-900">
                    ₹{Number(prod.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    <span className="text-xs text-slate-400 font-normal ml-1">{prod.currency}</span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">ID: {prod.id}</span>
                </div>
              </div>

              {/* Stock Controls & Test Action */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider">Live Inventory</span>
                  <span className={`font-mono text-sm font-extrabold ${prod.stock > 0 ? 'text-lime-700' : 'text-rose-600'}`}>
                    {prod.stock} units available
                  </span>
                </div>

                {/* Quick Stock Buttons */}
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => adjustStock(prod, -1)}
                    disabled={updatingId === prod.id || prod.stock <= 0}
                    className="py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg text-xs font-bold transition-all font-mono"
                    title="Decrease 1 Unit"
                  >
                    -1
                  </button>

                  <button
                    onClick={() => adjustStock(prod, 1)}
                    disabled={updatingId === prod.id}
                    className="py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg text-xs font-bold transition-all font-mono"
                    title="Increase 1 Unit"
                  >
                    +1
                  </button>

                  <button
                    onClick={() => adjustStock(prod, 5)}
                    disabled={updatingId === prod.id}
                    className="py-1.5 bg-lime-100 hover:bg-lime-200 text-lime-900 rounded-lg text-xs font-bold transition-all font-mono"
                    title="Add 5 Units"
                  >
                    +5
                  </button>

                  <button
                    onClick={() => adjustStock(prod, 0, prod.stock > 0 ? 0 : 10)}
                    disabled={updatingId === prod.id}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all font-mono ${
                      prod.stock > 0
                        ? 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                    }`}
                    title={prod.stock > 0 ? 'Set stock to 0 to trigger refund approval flow' : 'Restock 10 units'}
                  >
                    {prod.stock > 0 ? 'Set 0' : '+10'}
                  </button>
                </div>

                {/* Quick Test Prompt Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    navigate('/new-case', {
                      state: {
                        prefillProduct: prod.id,
                        prefillRequest: `I purchased the ${prod.name} (₹${prod.price}) on Aura Studio, but checkout timed out and no order was generated.`
                      }
                    });
                  }}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-lime-400 rounded-xl text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test In Case Creation</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


