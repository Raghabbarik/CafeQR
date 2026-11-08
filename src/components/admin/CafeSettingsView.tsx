import React, { useState } from 'react';
import type { CafeInfo } from '../../types';
import {
  Save,
  CheckCircle,
  Coffee,
  Key,
  Clock,
  MapPin,
  Store,
  Phone,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Plus,
  X
} from 'lucide-react';

interface CafeSettingsViewProps {
  cafe: CafeInfo;
  onSave: (updates: Partial<CafeInfo>) => Promise<void>;
}

export const CafeSettingsView: React.FC<CafeSettingsViewProps> = ({
  cafe,
  onSave,
}) => {
  const [formData, setFormData] = useState<CafeInfo>({
    ...cafe,
    isOpen: cafe.isOpen !== false,
    closedMessage:
      cafe.closedMessage ||
      'We are currently closed for new orders. Please check our opening hours or visit us tomorrow!',
    address:
      cafe.address ||
      '128 Brewmaster Ave, Ground Floor, Indiranagar, Bengaluru 560038',
    phone: cafe.phone || '+91 98765 43210',
    email: cafe.email || 'hello@roastedbean.cafe',
    openingHours: cafe.openingHours || 'Mon - Sun: 8:00 AM - 11:00 PM',
    openTime: cafe.openTime || '08:00 AM',
    closeTime: cafe.closeTime || '11:00 PM',
    googleMapsUrl:
      cafe.googleMapsUrl ||
      'https://maps.google.com/?q=Indiranagar+Bengaluru',
    mapEmbedUrl:
      cafe.mapEmbedUrl ||
      'https://maps.google.com/maps?q=Indiranagar%20Bengaluru&t=&z=14&ie=UTF8&iwloc=&output=embed',
    wifiSsid: cafe.wifiSsid || 'RoastedBean-Guest',
    wifiPassword: cafe.wifiPassword || 'freshcoffee',
    about:
      cafe.about ||
      'Welcome to The Roasted Bean Cafe. We handcraft artisanal coffee using shade-grown 100% Arabica beans from Chikmagalur estates, paired with freshly baked European croissants and gourmet sourdough bites in an ambient botanical setting.',
    features:
      Array.isArray(cafe.features) && cafe.features.length > 0
        ? cafe.features
        : [
            'Free High-Speed Wi-Fi',
            'Specialty Pour-Over & Espresso Bar',
            'Air Conditioned Co-Working Spaces',
            'Pet-Friendly Outdoor Patio',
            'Fresh In-House Artisan Bakery',
            'Vegan & Plant-Based Options',
            'UPI, Card & Cash Payments Accepted',
          ],
    fssaiNumber: cafe.fssaiNumber || '11223344556677',
    gstNumber: cafe.gstNumber || '29ABCDE1234F1Z5',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newFeatureText, setNewFeatureText] = useState('');

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    const currentFeats = formData.features || [];
    setFormData({
      ...formData,
      features: [...currentFeats, newFeatureText.trim()],
    });
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    const currentFeats = formData.features || [];
    setFormData({
      ...formData,
      features: currentFeats.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">

        {/* 1. STORE STATUS & ORDERING AVAILABILITY (FEATURE REQUEST) */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  formData.isOpen
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">
                  Store Status & Online Ordering Control
                </h3>
                <p className="text-xs text-stone-500">
                  Instantly open or close your cafe for customer orders.
                </p>
              </div>
            </div>

            {/* Big Status Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                formData.isOpen
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-rose-600 text-white shadow-xs'
              }`}
            >
              {formData.isOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>

          {/* Toggle Switch */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-stone-900 text-sm">
                Accepting Orders from Customers?
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {formData.isOpen
                  ? 'Cafe is currently OPEN. Customers can add items to cart and place orders.'
                  : 'Cafe is currently CLOSED. Ordering is paused; customers can only browse the menu.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, isOpen: !formData.isOpen })}
              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.isOpen ? 'bg-emerald-600' : 'bg-stone-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formData.isOpen ? 'translate-x-8' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Custom Message when closed */}
          {!formData.isOpen && (
            <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-1.5 animate-in fade-in duration-200">
              <label className="block font-bold text-rose-950">
                Notice Displayed to Customers when Closed
              </label>
              <textarea
                rows={2}
                value={formData.closedMessage}
                onChange={(e) =>
                  setFormData({ ...formData, closedMessage: e.target.value })
                }
                placeholder="e.g. We are closed today for private catering. We reopen tomorrow at 8:00 AM!"
                className="w-full px-3 py-2 bg-white rounded-xl border border-rose-300 text-stone-800 outline-none focus:border-rose-600 resize-none font-medium text-xs"
              />
            </div>
          )}
        </div>

        {/* 2. OPENING & CLOSING TIMINGS */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-base">
                Opening & Closing Timings
              </h3>
              <p className="text-xs text-stone-500">
                Displayed on the customer Cafe Details page and order receipts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Working Days Schedule
              </label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) =>
                  setFormData({ ...formData, openingHours: e.target.value })
                }
                placeholder="e.g. Mon - Sun: 8:00 AM - 11:00 PM"
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Daily Opening Time
              </label>
              <input
                type="text"
                value={formData.openTime}
                onChange={(e) =>
                  setFormData({ ...formData, openTime: e.target.value })
                }
                placeholder="e.g. 08:00 AM"
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Daily Closing Time
              </label>
              <input
                type="text"
                value={formData.closeTime}
                onChange={(e) =>
                  setFormData({ ...formData, closeTime: e.target.value })
                }
                placeholder="e.g. 11:00 PM"
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-bold"
              />
            </div>
          </div>
        </div>

        {/* 3. STORE LOCATION & INTERACTIVE GOOGLE MAP */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-base">
                Location, Address & Google Map
              </h3>
              <p className="text-xs text-stone-500">
                Customers can get directions and view your interactive map on the Cafe Details page.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Full Store Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="e.g. 128 Brewmaster Ave, Ground Floor, Indiranagar, Bengaluru 560038"
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1 flex items-center justify-between">
                  <span>Google Maps Directions URL</span>
                  {formData.googleMapsUrl && (
                    <a
                      href={formData.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-800 hover:underline flex items-center gap-0.5 text-[10px]"
                    >
                      <span>Test Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </label>
                <input
                  type="url"
                  value={formData.googleMapsUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, googleMapsUrl: e.target.value })
                  }
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Google Maps Embed URL (for interactive map)
                </label>
                <input
                  type="url"
                  value={formData.mapEmbedUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, mapEmbedUrl: e.target.value })
                  }
                  placeholder="https://maps.google.com/maps?q=...&output=embed"
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Live Map Preview */}
            {formData.mapEmbedUrl && (
              <div className="pt-2">
                <p className="font-bold text-stone-600 mb-1.5 text-[11px]">
                  Map Preview (as seen by customers):
                </p>
                <div className="w-full h-44 rounded-2xl overflow-hidden border border-stone-300 bg-stone-100 shadow-inner">
                  <iframe
                    title="Admin Map Preview"
                    src={formData.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. CAFE BRANDING & LOGO */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-base">
                Cafe Branding & Identity
              </h3>
              <p className="text-xs text-stone-500">
                Cafe name, tagline, logo, and primary cover image.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Cafe Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Tagline / Slogan (Printed on Bill) *
              </label>
              <input
                type="text"
                required
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-serif italic"
              />
            </div>
          </div>

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
        </div>

        {/* 5. CAFE STORY & AMENITIES */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-base">
                Cafe Story & Highlights
              </h3>
              <p className="text-xs text-stone-500">
                Share your cafe's background and features with visitors.
              </p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              About Our Cafe (Story Description)
            </label>
            <textarea
              rows={3}
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              placeholder="Tell your cafe's story, coffee origin, and specialty offerings..."
              className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-medium text-xs leading-relaxed resize-none"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Highlights & Amenities (Tags)
            </label>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {(formData.features || []).map((feat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold"
                >
                  <span>{feat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="hover:text-red-700 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="e.g. Specialty Cold Brew, Pet Friendly, Free Wi-Fi..."
                className="flex-1 px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 text-xs font-medium"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* 6. CONTACT & WI-FI DETAILS */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-base">
                Contact & Wi-Fi Details
              </h3>
              <p className="text-xs text-stone-500">
                Phone, email, and guest Wi-Fi credentials for customers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Support Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Guest Wi-Fi Name (SSID)</label>
              <input
                type="text"
                value={formData.wifiSsid}
                onChange={(e) => setFormData({ ...formData, wifiSsid: e.target.value })}
                className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-medium"
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
        </div>

        {/* 7. REGULATORY & BILLING */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-base">
                Billing, Taxes & Compliance
              </h3>
              <p className="text-xs text-stone-500">
                GST rate, Razorpay key, and legal food license registrations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">FSSAI License Number</label>
              <input
                type="text"
                value={formData.fssaiNumber}
                onChange={(e) => setFormData({ ...formData, fssaiNumber: e.target.value })}
                placeholder="14-digit FSSAI number"
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                placeholder="e.g. 29ABCDE1234F1Z5"
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-mono uppercase"
              />
            </div>
          </div>

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
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="sticky bottom-4 z-20">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 px-6 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-extrabold text-sm shadow-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <CheckCircle className="w-5 h-5 text-emerald-300" />
                <span>All Cafe Details & Store Status Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save All Cafe Details & Store Configuration</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
