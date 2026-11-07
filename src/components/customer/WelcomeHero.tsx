import React from 'react';
import type { CafeInfo } from '../../types';
import { Utensils, Shield, ArrowRight, Sparkles, Wifi } from 'lucide-react';

interface WelcomeHeroProps {
  cafe: CafeInfo;
  tableNumber: string;
  onTableChange: (table: string) => void;
  onGetStarted: () => void;
  onSwitchToAdmin?: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  cafe,
  tableNumber,
  onTableChange,
  onGetStarted,
  onSwitchToAdmin,
}) => {
  return (
    <div className="min-h-screen bg-stone-900 flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Full-Bleed Sky & Matcha Latte Hero Background (matching reference screenshot) */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=1400&auto=format&fit=crop&q=85"
          alt="Iced Matcha Latte"
          className="w-full h-full object-cover object-center brightness-95 scale-102 transition-transform duration-1000"
        />
        {/* Soft top gradient for header readability */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/40 via-black/15 to-transparent pointer-events-none" />
        {/* Soft bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      </div>

      {/* Top Floating Bar: Cafe Branding, Table Pill & Staff Portal */}
      <div className="relative z-20 px-4 pt-4 flex items-center justify-between">
        
        {/* Cafe Mini Pill */}
        <div className="flex items-center gap-2 bg-black/45 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white shadow-lg">
          <img
            src={cafe.logo}
            alt={cafe.name}
            className="w-5 h-5 rounded-full object-cover border border-white/40"
          />
          <span className="text-xs font-bold tracking-tight drop-shadow-xs">{cafe.name}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Table Number Pill */}
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 border border-white/40">
            <Utensils className="w-3.5 h-3.5 text-stone-700" />
            <span className="text-[11px] font-bold text-stone-600 uppercase">Table</span>
            <select
              value={tableNumber}
              onChange={(e) => onTableChange(e.target.value)}
              className="bg-stone-100 text-stone-900 font-extrabold text-xs px-1.5 py-0.5 rounded cursor-pointer border-none outline-none"
            >
              {Array.from({ length: cafe.tablesCount || 12 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  #{num}
                </option>
              ))}
            </select>
          </div>

          {/* Staff Mode Switcher */}
          {onSwitchToAdmin && (
            <button
              onClick={onSwitchToAdmin}
              className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:text-white border border-white/20 shadow-lg cursor-pointer transition-colors"
              title="Staff Portal"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Center Hero Heading directly on image (matches screenshot: ✦ NEW + ICED MATCHA LATTE) */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-8 pb-12 my-auto">
        
        {/* Pastel Lime/Yellow "✦ NEW" Badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#eaf49f] text-[#2c3e1e] font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md mb-3 animate-in fade-in zoom-in-90 duration-300">
          <Sparkles className="w-3 h-3 fill-current" />
          <span>NEW</span>
        </div>

        {/* Big Crisp All-Caps Headline */}
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-widest leading-[1.05] uppercase drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)]">
          ICED<br />
          MATCHA<br />
          LATTE
        </h1>
      </div>

      {/* Bottom Sheet Card (matches exact reference screenshot: Welcome Back / Explore our Fall menu / Order Now) */}
      <div className="relative z-20 w-full max-w-md mx-auto">
        <div className="bg-white rounded-t-[36px] sm:rounded-3xl p-6 sm:p-7 shadow-[0_-12px_40px_rgba(0,0,0,0.18)] flex flex-col items-center text-center space-y-4 animate-in slide-in-from-bottom duration-300">
          
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              Welcome Back
            </h2>
            <p className="text-sm font-medium text-stone-500">
              Explore our Fall menu
            </p>
          </div>

          {/* Pill Action Button: "Order Now" with arrow (matches screenshot) */}
          <button
            onClick={onGetStarted}
            className="w-full bg-[#111111] hover:bg-black text-white rounded-full py-4 px-6 flex items-center justify-between shadow-xl active:scale-[0.98] transition-all cursor-pointer group"
          >
            <span className="font-bold text-base pl-2 tracking-wide">
              Order Now
            </span>
            <div className="w-9 h-9 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition-colors">
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Table & Guest Wi-Fi info */}
          <div className="flex items-center justify-center gap-3 text-[11px] text-stone-400 font-medium pt-0.5">
            <span className="font-semibold text-stone-600">Table #{tableNumber}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-600" />
              <span>Wi-Fi: {cafe.wifiSsid}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
