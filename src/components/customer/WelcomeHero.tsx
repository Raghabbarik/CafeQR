import React from 'react';
import type { CafeInfo } from '../../types';
import { Sparkles, Wifi, Receipt } from 'lucide-react';
import { SlideToOrder } from './SlideToOrder';

interface WelcomeHeroProps {
  cafe: CafeInfo;
  onGetStarted: () => void;
  onCheckBill?: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  cafe,
  onGetStarted,
  onCheckBill,
}) => {
  const heroBadge = cafe.hero?.badge || 'NEW';
  const heroTitle = cafe.hero?.title || 'ICED\nMATCHA\nLATTE';
  const heroCardTitle = cafe.hero?.cardTitle || 'Welcome Back';
  const heroCardSubtitle = cafe.hero?.cardSubtitle || 'Explore our Fall menu';
  const heroButtonText = cafe.hero?.buttonText || 'Order Now';
  const heroImage = cafe.coverImage || 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=1400&auto=format&fit=crop&q=85';

  const titleLines = heroTitle.split('\n');

  return (
    <div className="min-h-screen h-[100dvh] bg-stone-900 flex flex-col justify-end relative overflow-hidden select-none">
      
      {/* Full-Bleed Sky & Matcha Latte Hero Background (editable from admin) */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt={heroCardTitle}
          className="w-full h-full object-cover object-center brightness-95 scale-102 transition-transform duration-1000"
        />
        {/* Soft top gradient for header readability */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/40 via-black/15 to-transparent pointer-events-none" />
        {/* Soft bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      </div>

      {/* Center Hero Heading directly on image: Centered Cafe Logo + ✦ NEW + Headline */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-4 sm:pt-8 pb-2 sm:pb-3 mt-auto mb-2.5 sm:mb-4">
        
        {/* Centered Cafe Logo */}
        <div className="mb-2 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-white/25 backdrop-blur-md border-2 border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.35)] overflow-hidden transition-transform hover:scale-105">
            <img
              src={cafe.logo}
              alt={cafe.name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <p className="text-white/95 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] mt-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {cafe.name}
          </p>
        </div>

        {/* Pastel Lime/Yellow Badge (Editable: e.g. ✦ NEW) */}
        {heroBadge && (
          <div className="inline-flex items-center gap-1.5 bg-[#eaf49f] text-[#2c3e1e] font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md mb-2 animate-in fade-in zoom-in-90 duration-300">
            <Sparkles className="w-3 h-3 fill-current" />
            <span>{heroBadge}</span>
          </div>
        )}

        {/* Big Crisp All-Caps Headline (Editable) */}
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-widest leading-[1.08] uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
          {titleLines.map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              {idx < titleLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </h1>
      </div>

      {/* Bottom Sheet Card (Editable: Welcome Back / Explore our Fall menu / Order Now) */}
      <div className="relative z-20 w-full max-w-md mx-auto">
        <div className="bg-white rounded-t-[36px] sm:rounded-3xl pt-4 sm:pt-5 pb-5 sm:pb-6 px-5 sm:px-7 shadow-[0_-12px_40px_rgba(0,0,0,0.18)] flex flex-col items-center text-center space-y-3 animate-in slide-in-from-bottom duration-300">
          
          <div className="space-y-0.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              {heroCardTitle}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-stone-500">
              {heroCardSubtitle}
            </p>
          </div>

          {/* Slide Arrow to Order Button (Slightly moved upward for optimal ergonomics) */}
          <div className="w-full -mt-0.5">
            <SlideToOrder
              label={heroButtonText}
              onComplete={onGetStarted}
            />
          </div>

          {/* Check Bill Button (Underneath Order Now as requested) */}
          {onCheckBill && (
            <button
              onClick={onCheckBill}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-stone-50 hover:bg-stone-100 active:scale-[0.99] border border-stone-200 text-stone-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-amber-800" />
              <span>Check Bill / View Past Orders</span>
            </button>
          )}

          {/* Guest Wi-Fi info */}
          {cafe.wifiSsid ? (
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-medium pt-0.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>Complimentary Guest Wi-Fi: {cafe.wifiSsid}</span>
            </div>
          ) : (
            <p className="text-[11px] text-stone-400 font-medium pt-0.5">
              Freshly brewed coffee & gourmet artisanal bites
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
