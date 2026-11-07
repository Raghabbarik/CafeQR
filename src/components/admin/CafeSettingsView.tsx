import React, { useState } from 'react';
import type { CafeInfo } from '../../types';
import { Save, CheckCircle, Coffee, Key } from 'lucide-react';

interface CafeSettingsViewProps {
  cafe: CafeInfo;
  onSave: (updates: Partial<CafeInfo>) => Promise<void>;
}

export const CafeSettingsView: React.FC<CafeSettingsViewProps> = ({
  cafe,
  onSave,
}) => {
  const [formData, setFormData] = useState<CafeInfo>({ ...cafe });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-stone-100 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-stone-900 text-base">Cafe Branding & Store Configuration</h3>
            <p className="text-xs text-stone-500">
              Customize the details shown on customer screens, QR codes, and digital bill receipts.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Cafe Name & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Cafe Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Small Line / Tagline (Printed on Bill) *
              </label>
              <input
                type="text"
                required
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Crafted with passion, brewed with love."
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-serif italic"
              />
            </div>
          </div>

          {/* Logo & Cover Image URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Cafe Logo URL</label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Cover Photo URL</label>
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Address & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Store Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-mono"
              />
            </div>
          </div>

          {/* Wi-Fi Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Guest Wi-Fi Name (SSID)</label>
              <input
                type="text"
                value={formData.wifiSsid}
                onChange={(e) => setFormData({ ...formData, wifiSsid: e.target.value })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Guest Wi-Fi Password</label>
              <input
                type="text"
                value={formData.wifiPassword}
                onChange={(e) => setFormData({ ...formData, wifiPassword: e.target.value })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-mono"
              />
            </div>
          </div>

          {/* Tax Rate & Razorpay Key */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-amber-50/50 rounded-2xl border border-amber-200">
            <div>
              <label className="block font-bold text-stone-700 mb-1">GST / Tax Rate (%)</label>
              <input
                type="number"
                min={0}
                max={28}
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-bold"
              />
              <p className="text-[10px] text-stone-400 mt-1">Calculated automatically on checkout</p>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-blue-600" />
                <span>Razorpay Key ID</span>
              </label>
              <input
                type="text"
                value={formData.razorpayKeyId}
                onChange={(e) => setFormData({ ...formData, razorpayKeyId: e.target.value })}
                placeholder="rzp_test_... or rzp_live_..."
                className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 outline-none focus:border-blue-600 font-mono text-[11px]"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                Supports simulated instant checkout and live Razorpay keys
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  <span>Settings Saved Successfully!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
