import React from 'react';
import type { CafeInfo } from '../../types';
import { Utensils, Wifi, Shield } from 'lucide-react';

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
    <div className="min-h-screen bg-white flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Top Half: Dark Studio Gradient with Food Hero Bowl & Hotspots */}
      <div className="relative w-full h-[54vh] sm:h-[58vh] bg-gradient-to-b from-[#2b2d30] via-[#41454a] to-white flex items-center justify-center overflow-hidden">
        
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-radial from-white/10 via-transparent to-transparent opacity-60" />

        {/* Top Status & Table Selector Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
          {/* Cafe Mini Badge */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-white">
            <img
              src={cafe.logo}
              alt={cafe.name}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-xs font-bold tracking-tight">{cafe.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Table Number Pill */}
            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-stone-200">
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

            {/* Quick staff mode toggle */}
            {onSwitchToAdmin && (
              <button
                onClick={onSwitchToAdmin}
                className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:text-white border border-white/15 cursor-pointer"
                title="Staff Portal"
              >
                <Shield className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Big Gourmet Overhead Food Bowl */}
        <div className="relative w-76 h-76 sm:w-92 sm:h-92 mt-4 flex items-center justify-center">
          
          {/* Circular Dotted Orbit Line */}
          <div className="absolute inset-2 border-2 border-dashed border-white/40 rounded-full animate-spin-slow pointer-events-none" />

          {/* Center Gourmet Bowl Photo */}
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=80"
            alt="Chef Special Bowl"
            className="w-68 h-68 sm:w-80 sm:h-80 rounded-full object-cover shadow-2xl ring-6 ring-white/10 drop-shadow-[0_20px_25px_rgba(0,0,0,0.45)]"
          />

          {/* Floating Ingredient Hotspot 1 (Top-Right: Cucumber / Fresh) */}
          <div className="absolute top-6 right-6 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center border border-white/40 animate-pulse">
            <span className="text-base">🥒</span>
          </div>

          {/* Floating Ingredient Hotspot 2 (Mid-Left: Fresh Greens) */}
          <div className="absolute left-3 top-24 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center border border-white/40 animate-bounce duration-1000">
            <span className="text-base">🥬</span>
          </div>

          {/* Floating Ingredient Hotspot 3 (Bottom-Left: Fresh Salad / Poke) */}
          <div className="absolute bottom-10 left-10 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center border border-white/40">
            <span className="text-base">🥗</span>
          </div>

          {/* Frosted Glass Floating Card (Matches 'Elements Foods' from screenshot) */}
          <div className="absolute right-2 top-20 z-10 bg-white/20 backdrop-blur-md border border-white/35 rounded-2xl py-2 px-3.5 shadow-2xl flex items-center gap-2.5 text-white animate-in fade-in duration-500">
            <div className="w-8 h-8 rounded-xl bg-white/30 backdrop-blur-sm flex items-center justify-center text-sm shadow-xs">
              🍳
            </div>
            <div className="leading-tight">
              <p className="text-xs font-black tracking-tight text-white drop-shadow-xs">Elements</p>
              <p className="text-[11px] text-white/80 font-medium">Foods</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Half: Typography, Subtitle & Black Pill Button */}
      <div className="px-6 pb-8 pt-2 max-w-md mx-auto w-full flex-1 flex flex-col justify-between">
        
        {/* Multitone Headline matching exact example typography */}
        <div className="space-y-1">
          {/* Line 1: Solid Black */}
          <h1 className="text-4xl sm:text-5xl font-black text-[#1c1c1e] tracking-tight leading-none">
            Cooking
          </h1>
          
          {/* Line 2: Soft Light Gray */}
          <h2 className="text-4xl sm:text-5xl font-black text-stone-300 tracking-tight leading-none">
            Delicious
          </h2>
          
          {/* Line 3: Medium Gray with Underline Bar */}
          <div className="relative inline-block">
            <h2 className="text-4xl sm:text-5xl font-black text-stone-300 tracking-tight leading-none">
              Like a Chef
            </h2>
            {/* Solid underline bar directly beneath 'Like a Chef' */}
            <div className="h-1 bg-[#1c1c1e] w-full mt-2 rounded-full" />
          </div>

          {/* Subtitle Paragraph */}
          <p className="text-xs sm:text-sm text-stone-400 font-medium leading-relaxed pt-3">
            This digital dining app offers a wide selection of diverse, artisanal dishes and handcrafted coffees suitable for all taste buds!
          </p>

          {/* Subtle Cafe & Wi-Fi info pill */}
          <div className="pt-2 flex items-center gap-3 text-[11px] text-stone-400 font-medium">
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-600" />
              <span>Wi-Fi: {cafe.wifiSsid}</span>
            </span>
            <span>•</span>
            <span>Table #{tableNumber}</span>
          </div>
        </div>

        {/* Big Solid Black Pill 'Get Started' Button (matches screenshot) */}
        <div className="pt-6">
          <button
            onClick={onGetStarted}
            className="w-full py-4 px-6 rounded-full bg-[#18181b] hover:bg-black text-white font-extrabold text-base shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer tracking-wide"
          >
            <span>Get Started</span>
          </button>
          <p className="text-center text-[10px] text-stone-400 mt-2 font-medium">
            {cafe.name} • {cafe.tagline}
          </p>
        </div>
      </div>
    </div>
  );
};
