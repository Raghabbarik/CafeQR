import React, { useState } from 'react';
import type { CafeInfo } from '../../types';
import {
  MapPin,
  Clock,
  Phone,
  Wifi,
  ExternalLink,
  Check,
  Copy,
  Coffee,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ChevronUp
} from 'lucide-react';
import { ImageWithSkeleton } from '../common/ImageWithSkeleton';
import { extractCleanMapEmbedUrl, extractCleanDirectionsUrl } from '../../utils/mapUtils';

interface CafeDetailsSectionProps {
  cafe: CafeInfo;
  onOrderNow: () => void;
}

export const CafeDetailsSection: React.FC<CafeDetailsSectionProps> = ({
  cafe,
  onOrderNow,
}) => {
  const [copiedWifi, setCopiedWifi] = useState(false);
  const isCafeOpen = cafe.isOpen !== false;

  const handleCopyWifi = () => {
    if (!cafe.wifiPassword) return;
    navigator.clipboard.writeText(cafe.wifiPassword);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const defaultMapEmbed = extractCleanMapEmbedUrl(cafe.mapEmbedUrl, cafe.address);
  const googleMapsDirectionsUrl = extractCleanDirectionsUrl(cafe.googleMapsUrl, cafe.address);

  const features =
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
        ];

  return (
    <section id="cafe-details" className="w-full bg-[#faf7f2] text-stone-900 pt-10 pb-20 px-4 sm:px-6 relative select-none">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Cafe Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-stone-200/90 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl p-1 bg-amber-50 border-2 border-amber-200/80 shadow-md mb-3.5 overflow-hidden">
            <ImageWithSkeleton
              src={cafe.logo}
              alt={cafe.name}
              className="w-full h-full rounded-xl object-cover"
              containerClassName="w-full h-full rounded-xl"
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {cafe.name}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-amber-900/80 mt-1 max-w-md italic">
            "{cafe.tagline || 'Artisanal Coffee & Fresh Gourmet Bites'}"
          </p>

          {/* Live Store Status Pill */}
          <div className="mt-4">
            {isCafeOpen ? (
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Open for Orders • Closes at {cafe.closeTime || '11:00 PM'}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-300 text-rose-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Currently Closed for Orders • Opens at {cafe.openTime || '8:00 AM'}</span>
              </div>
            )}
          </div>

          {!isCafeOpen && cafe.closedMessage && (
            <p className="text-xs text-rose-700 bg-rose-50/80 rounded-xl p-2.5 mt-3 border border-rose-200/60 max-w-md">
              {cafe.closedMessage}
            </p>
          )}

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mt-6 pt-5 border-t border-stone-100">
            {cafe.phone && (
              <a
                href={`tel:${cafe.phone}`}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/70 text-amber-900 transition-all active:scale-95 cursor-pointer"
              >
                <Phone className="w-4 h-4 mb-1 text-amber-800" />
                <span className="text-[11px] font-bold">Call Cafe</span>
              </a>
            )}

            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-stone-100/80 hover:bg-stone-200/80 border border-stone-200 text-stone-800 transition-all active:scale-95 cursor-pointer"
            >
              <MapPin className="w-4 h-4 mb-1 text-stone-700" />
              <span className="text-[11px] font-bold">Directions</span>
            </a>

            {cafe.wifiSsid && (
              <button
                type="button"
                onClick={handleCopyWifi}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/70 text-emerald-900 transition-all active:scale-95 cursor-pointer"
              >
                {copiedWifi ? (
                  <Check className="w-4 h-4 mb-1 text-emerald-600" />
                ) : (
                  <Wifi className="w-4 h-4 mb-1 text-emerald-700" />
                )}
                <span className="text-[11px] font-bold">
                  {copiedWifi ? 'Copied!' : 'Wi-Fi Password'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onOrderNow}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <Coffee className="w-4 h-4 mb-1 text-amber-200" />
              <span className="text-[11px] font-bold">Order Menu</span>
            </button>
          </div>
        </div>

        {/* Operating Hours & Timings */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-stone-200/90 space-y-3">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-stone-100">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm">Opening & Closing Hours</h3>
              <p className="text-[11px] text-stone-500">Operating schedule & service availability</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-0.5">
                Working Days
              </span>
              <p className="font-bold text-xs text-stone-800">
                {cafe.openingHours || 'Monday – Sunday'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-0.5">
                Daily Hours
              </span>
              <p className="font-bold text-xs text-stone-800">
                {cafe.openTime || '08:00 AM'} – {cafe.closeTime || '11:00 PM'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-stone-600">
            <span className="px-2.5 py-1 bg-amber-50 rounded-lg font-semibold text-amber-900">
              ☕ Dine-In Available
            </span>
            <span className="px-2.5 py-1 bg-amber-50 rounded-lg font-semibold text-amber-900">
              🥡 Takeaway / Parcel
            </span>
            <span className="px-2.5 py-1 bg-amber-50 rounded-lg font-semibold text-amber-900">
              📱 Table QR Digital Ordering
            </span>
          </div>
        </div>

        {/* Location & Embedded Interactive Map */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-stone-200/90 space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-sm">Location & Directions</h3>
                <p className="text-[11px] text-stone-500">Visit us in person or navigate via GPS</p>
              </div>
            </div>

            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 hover:underline"
            >
              <span>Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <p className="text-xs text-stone-700 font-medium leading-relaxed bg-stone-50 p-3 rounded-2xl border border-stone-200/80">
            {cafe.address || '128 Brewmaster Ave, Ground Floor, Indiranagar, Bengaluru 560038'}
          </p>

          {/* Embedded Google Map iframe */}
          <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-stone-200 shadow-inner relative bg-stone-100">
            <iframe
              title={`${cafe.name} Location Map`}
              src={defaultMapEmbed}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full grayscale-[15%] contrast-[1.05]"
            />
          </div>
        </div>

        {/* Wi-Fi & Guest Connectivity */}
        {cafe.wifiSsid && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-stone-200/90 space-y-3">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-sm">Complimentary Guest Wi-Fi</h3>
                <p className="text-[11px] text-stone-500">Free high-speed internet for all guests</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
                  Network (SSID)
                </span>
                <p className="font-mono font-bold text-xs text-stone-900">
                  {cafe.wifiSsid}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
                    Password
                  </span>
                  <p className="font-mono font-bold text-xs text-stone-900">
                    {cafe.wifiPassword || 'freshcoffee'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyWifi}
                  className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-stone-600 hover:text-emerald-700 border border-stone-200 transition-colors cursor-pointer"
                  title="Copy Wi-Fi Password"
                >
                  {copiedWifi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* About & Cafe Story */}
        {cafe.about && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-stone-200/90 space-y-2.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-stone-900 text-sm">About Our Story</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-normal pt-1">
              {cafe.about}
            </p>
          </div>
        )}

        {/* Features & Amenities */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-stone-200/90 space-y-3">
          <h3 className="font-extrabold text-stone-900 text-sm">Highlights & Amenities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs font-semibold text-stone-800"
              >
                <div className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Transparency Information */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-stone-200/90 space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100">
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-stone-900 text-sm">Contact & Registration Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-stone-700">
            {cafe.phone && (
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                <span className="text-[10px] text-stone-400 block font-bold">Contact Phone</span>
                <a href={`tel:${cafe.phone}`} className="font-mono font-bold hover:underline">
                  {cafe.phone}
                </a>
              </div>
            )}

            {cafe.email && (
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                <span className="text-[10px] text-stone-400 block font-bold">Support Email</span>
                <a href={`mailto:${cafe.email}`} className="font-mono font-bold hover:underline truncate block">
                  {cafe.email}
                </a>
              </div>
            )}

            {cafe.fssaiNumber && (
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                <span className="text-[10px] text-stone-400 block font-bold">FSSAI License</span>
                <span className="font-mono font-bold">{cafe.fssaiNumber}</span>
              </div>
            )}

            {cafe.gstNumber && (
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                <span className="text-[10px] text-stone-400 block font-bold">GSTIN</span>
                <span className="font-mono font-bold">{cafe.gstNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Menu CTA Button & Scroll Back Up */}
        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={onOrderNow}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer ${
              isCafeOpen
                ? 'bg-amber-800 hover:bg-amber-900 text-white'
                : 'bg-stone-800 hover:bg-stone-900 text-stone-200'
            }`}
          >
            <span>{isCafeOpen ? 'Browse Full Menu & Order Now' : 'Browse Menu (Orders Paused)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleScrollToTop}
            className="w-full py-2.5 text-center text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ChevronUp className="w-4 h-4" />
            <span>Back to Top (Welcome Screen)</span>
          </button>
        </div>

      </div>
    </section>
  );
};
