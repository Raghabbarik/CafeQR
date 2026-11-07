import React from 'react';
import type { CafeInfo } from '../../types';
import { Utensils, Wifi, MapPin, ArrowRight, Coffee, Sparkles } from 'lucide-react';

interface WelcomeHeroProps {
  cafe: CafeInfo;
  tableNumber: string;
  onTableChange: (table: string) => void;
  onGetStarted: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  cafe,
  tableNumber,
  onTableChange,
  onGetStarted,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-stone-50 to-white flex flex-col justify-between">
      {/* Top Banner & Cafe Photo */}
      <div className="relative h-72 sm:h-80 w-full overflow-hidden shadow-md">
        <img
          src={cafe.coverImage}
          alt={cafe.name}
          className="w-full h-full object-cover brightness-75 scale-105 transition-transform duration-700 hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        {/* Floating Table Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 border border-amber-200">
          <Utensils className="w-4 h-4 text-amber-700" />
          <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Table</span>
          <select
            value={tableNumber}
            onChange={(e) => onTableChange(e.target.value)}
            className="bg-amber-100/80 text-amber-900 font-bold text-sm px-2 py-0.5 rounded cursor-pointer border-none outline-none"
          >
            {Array.from({ length: cafe.tablesCount || 12 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                #{num}
              </option>
            ))}
          </select>
        </div>

        {/* Cafe Logo & Title on Banner */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3.5">
          <img
            src={cafe.logo}
            alt="Logo"
            className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-xl bg-white"
          />
          <div className="text-white pb-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/80 backdrop-blur-sm text-xs font-medium tracking-wide mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Digital QR Menu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">
              {cafe.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-5 py-6 max-w-lg mx-auto w-full flex-1 flex flex-col justify-between">
        <div className="space-y-5">
          {/* Tagline / Small Line */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 shadow-sm text-center">
            <p className="text-amber-950 font-serif italic text-base sm:text-lg">
              "{cafe.tagline}"
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs text-stone-600">
            <div className="bg-white p-3 rounded-xl border border-stone-200/70 shadow-xs flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-stone-800">Address</p>
                <p className="text-stone-500 line-clamp-2 mt-0.5">{cafe.address}</p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-stone-200/70 shadow-xs flex items-start gap-2.5">
              <Wifi className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-stone-800">Free Wi-Fi</p>
                <p className="text-stone-500 truncate mt-0.5">{cafe.wifiSsid}</p>
                <p className="text-[10px] text-stone-400 font-mono">Key: {cafe.wifiPassword}</p>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-white p-4 rounded-xl border border-stone-200/70 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">How It Works</h3>
            <div className="flex items-center gap-3 text-sm text-stone-700">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0">1</span>
              <span>Browse our fresh chef-curated menu</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-700">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0">2</span>
              <span>Add items to cart & pay securely via Razorpay</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-700">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0">3</span>
              <span>Get instant digital bill & track your live order</span>
            </div>
          </div>
        </div>

        {/* Big Get Started Button */}
        <div className="pt-6 pb-2">
          <button
            onClick={onGetStarted}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-bold text-lg shadow-xl shadow-amber-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <Coffee className="w-5 h-5 text-amber-200 group-hover:rotate-12 transition-transform" />
            <span>Get Started & View Menu</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-center text-[11px] text-stone-400 mt-2">
            Table #{tableNumber} • Contactless Dining Experience
          </p>
        </div>
      </div>
    </div>
  );
};
