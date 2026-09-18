import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { Sliders, Save, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export const MerchantPolicies = () => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await client.get('/merchant/policies');
        setPolicy(res.data);
      } catch (e) {
        console.error('Failed to load merchant policies', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await client.put('/merchant/policies', {
        order_recovery_enabled: policy.order_recovery_enabled,
        refund_enabled: policy.refund_enabled,
        refund_approval_required: policy.refund_approval_required,
        refund_approval_threshold: parseFloat(policy.refund_approval_threshold),
        auto_retry_limit: parseInt(policy.auto_retry_limit),
        recon_delay_seconds: parseInt(policy.recon_delay_seconds),
        policy_text: policy.policy_text,
      });
      setPolicy(res.data);
      setSuccessMsg('Policy configuration saved successfully and synced to knowledge layer.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to save policy', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-lime-700 font-mono text-sm">Loading policy settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Merchant Resolution Policies</h1>
        <p className="text-sm text-slate-600 mt-1">
          Configure deterministic thresholds, authorization rules, and autonomous AI resolution boundaries.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-lime-100 border border-lime-300 rounded-xl text-lime-900 text-xs flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-lime-700" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-lime-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Policy Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-lime-50/60 border border-lime-200">
            <div>
              <span className="text-sm font-semibold text-slate-900 block">Automated Order Recovery</span>
              <span className="text-xs text-slate-500">Allow AI to recover missing orders without re-charging customer when stock is available</span>
            </div>
            <input
              type="checkbox"
              checked={policy.order_recovery_enabled}
              onChange={(e) => setPolicy({ ...policy, order_recovery_enabled: e.target.checked })}
              className="w-5 h-5 accent-lime-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-lime-50/60 border border-lime-200">
            <div>
              <span className="text-sm font-semibold text-slate-900 block">Refund Authorization</span>
              <span className="text-xs text-slate-500">Permit issuance of refunds for out-of-stock items or unrecoverable checkouts</span>
            </div>
            <input
              type="checkbox"
              checked={policy.refund_enabled}
              onChange={(e) => setPolicy({ ...policy, refund_enabled: e.target.checked })}
              className="w-5 h-5 accent-lime-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-lime-50/60 border border-lime-200">
            <div>
              <span className="text-sm font-semibold text-slate-900 block">Require Human Approval for Large Refunds</span>
              <span className="text-xs text-slate-500">Enforce manager sign-off when refund amount meets or exceeds threshold</span>
            </div>
            <input
              type="checkbox"
              checked={policy.refund_approval_required}
              onChange={(e) => setPolicy({ ...policy, refund_approval_required: e.target.checked })}
              className="w-5 h-5 accent-lime-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Numeric Thresholds */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Approval Threshold (₹ INR)
            </label>
            <input
              type="number"
              step="0.01"
              value={policy.refund_approval_threshold}
              onChange={(e) => setPolicy({ ...policy, refund_approval_threshold: e.target.value })}
              className="w-full bg-slate-50 border border-lime-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 font-mono outline-none focus:border-lime-500 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Auto-Retry Limit
            </label>
            <input
              type="number"
              value={policy.auto_retry_limit}
              onChange={(e) => setPolicy({ ...policy, auto_retry_limit: e.target.value })}
              className="w-full bg-slate-50 border border-lime-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 font-mono outline-none focus:border-lime-500 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Background Recon Delay (Sec)
            </label>
            <input
              type="number"
              value={policy.recon_delay_seconds}
              onChange={(e) => setPolicy({ ...policy, recon_delay_seconds: e.target.value })}
              className="w-full bg-slate-50 border border-lime-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 font-mono outline-none focus:border-lime-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Policy Text (for Cognee knowledge layer) */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Store Policy Rules Text (Synthesized by Cognee & AI Agent)
          </label>
          <textarea
            rows={4}
            value={policy.policy_text || ''}
            onChange={(e) => setPolicy({ ...policy, policy_text: e.target.value })}
            className="w-full bg-slate-50 border border-lime-200 text-slate-900 text-xs rounded-xl p-3.5 outline-none focus:border-lime-500 focus:bg-white font-mono leading-relaxed transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-lime-500 hover:bg-lime-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 px-6 rounded-xl text-xs flex items-center space-x-2 shadow-md shadow-lime-500/20 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Policy...' : 'Save & Publish Policy'}</span>
        </button>
      </form>
    </div>
  );
};

