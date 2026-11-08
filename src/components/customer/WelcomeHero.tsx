import React from 'react';
import type { CafeInfo } from '../../types';
import { Sparkles, Receipt, ChevronDown, AlertCircle } from 'lucide-react';
import { SlideToOrder } from './SlideToOrder';
import { ImageWithSkeleton } from '../common/ImageWithSkeleton';

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
  const isCafeOpen = cafe.isOpen !== false;
  const heroBadge = cafe.hero?.badge || 'for you.';
  const heroTitle = cafe.hero?.title || 'ICED\nMATCHA\nLATTE';
  const heroCardTitle = cafe.hero?.cardTitle || 'Welcome Back';
  const heroCardSubtitle = cafe.hero?.cardSubtitle || 'Explore our Fall menu';
  const heroButtonText = isCafeOpen
    ? (cafe.hero?.buttonText || 'Order Now')
    : 'View Menu (Orders Paused)';
  const heroImage =
    cafe.hero?.coverImage ||
    cafe.coverImage ||
    'https://i.pinimg.com/736x/3c/05/c5/3c05c5bb573c8774bac97aab37b2fcbd.jpg';

  const titleLines = heroTitle.split('\n');

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src && !img.src.includes('images.weserv.nl') && img.src.startsWith('http')) {
      const cleanUrl = img.src.replace(/^https?:\/\//, '');
      img.src = `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}`;
    }
  };

  const handleScrollToDetails = () => {
    const detailsEl = document.getElementById('cafe-details');
    if (detailsEl) {
      detailsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="top" className="min-h-screen h-[100dvh] bg-stone-900 flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Full-Bleed Admin Uploaded Hero Background (Direct rendering - Instant on reload & navigation) */}
      <div className="absolute inset-0 z-0 bg-[#140e0c] overflow-hidden">
        {heroImage && (
          <img
            key={heroImage}
            src={heroImage}
            alt={heroCardTitle}
            onError={handleImageError}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center brightness-95 scale-102"
          />
        )}

        {/* Soft top gradient for header readability */}
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/55 via-black/20 to-transparent pointer-events-none" />
        {/* Soft bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/40 via-black/15 to-transparent pointer-events-none" />
      </div>

      {/* Center Hero Heading directly on image: Centered Cafe Logo + ✦ NEW + Headline */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center text-center px-4 pt-4 sm:pt-6 pb-2 sm:pb-4">
        
        {/* Centered Cafe Logo */}
        <div className="mb-2 sm:mb-2.5 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-full p-1 bg-white/25 backdrop-blur-md border-2 border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.35)] overflow-hidden transition-transform hover:scale-105">
            <ImageWithSkeleton
              src={cafe.logo}
              alt={cafe.name}
              className="w-full h-full rounded-full object-cover"
              containerClassName="w-full h-full rounded-full"
            />
          </div>
          <p className="text-white/95 text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] mt-1 sm:mt-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {cafe.name}
          </p>
        </div>

        {/* Pastel Lime/Yellow Badge or Store Status */}
        {isCafeOpen ? (
          heroBadge && (
            <div className="inline-flex items-center gap-1.5 bg-[#eaf49f] text-[#2c3e1e] font-black text-[11px] sm:text-xs px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-md mb-2 sm:mb-2.5 animate-in fade-in zoom-in-90 duration-300">
              <Sparkles className="w-3 h-3 fill-current" />
              <span>{heroBadge}</span>
            </div>
          )
        ) : (
          <div className="inline-flex items-center gap-1.5 bg-rose-600/90 text-white font-black text-[11px] sm:text-xs px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-md mb-2 sm:mb-2.5 animate-in fade-in zoom-in-90 duration-300 backdrop-blur-xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Store Closed for Orders</span>
          </div>
        )}

        {/* Big Crisp All-Caps Headline (Editable) */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-widest leading-[1.1] uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
          {titleLines.map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              {idx < titleLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </h1>
      </div>

      {/* Bottom Sheet Card (Editable: Welcome Back / Explore our Fall menu / Order Now) */}
      <div className="relative z-20 w-full max-w-md mx-auto shrink-0">
        <div className="bg-white rounded-t-[32px] sm:rounded-3xl pt-3.5 sm:pt-4 pb-3 sm:pb-4 px-5 sm:px-7 shadow-[0_-12px_40px_rgba(0,0,0,0.18)] flex flex-col items-center text-center space-y-2 sm:space-y-2.5 animate-in slide-in-from-bottom duration-300">
          
          <div className="space-y-0.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              {heroCardTitle}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-stone-500">
              {isCafeOpen
                ? heroCardSubtitle
                : (cafe.closedMessage || 'Cafe is currently closed for new orders')}
            </p>
          </div>

          {/* Slide Arrow to Order Button */}
          <div className="w-full -mt-0.5">
            <SlideToOrder
              label={heroButtonText}
              onComplete={onGetStarted}
            />
          </div>

          {/* Check Bill Button */}
          {onCheckBill && (
            <button
              onClick={onCheckBill}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-2xl bg-stone-50 hover:bg-stone-100 active:scale-[0.99] border border-stone-200 text-stone-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-800" />
              <span>Check Bill / View Past Orders</span>
            </button>
          )}

          {/* Scroll down to Cafe Details indicator */}
          <button
            type="button"
            onClick={handleScrollToDetails}
            className="pt-1 inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-900 text-[11px] font-bold tracking-wide transition-all cursor-pointer active:scale-95"
            title="View Cafe Address, Timings & Details"
          >
            <span>Scroll down for Cafe Details & Location</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce text-amber-800" />
          </button>
        </div>
      </div>
    </div>
  );
};
