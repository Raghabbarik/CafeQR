import React from 'react';
import type { CafeInfo } from '../../types';
import { ShoppingBag, Bell, Search, Receipt, ArrowLeft } from 'lucide-react';
import { ImageWithSkeleton } from '../common/ImageWithSkeleton';

interface NavbarProps {
  cafe: CafeInfo;
  totalCartItems: number;
  onOpenCart: () => void;
  onOpenWaiter?: () => void;
  onOpenBill?: () => void;
  onBackToHome?: () => void;
  hasActiveOrder?: boolean;
  onToggleSearch: () => void;
  isSearchOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  cafe,
  totalCartItems,
  onOpenCart,
  onOpenWaiter,
  onOpenBill,
  onBackToHome,
  hasActiveOrder = false,
  onToggleSearch,
  isSearchOpen,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Left: Back to Home + Cafe Logo & Name */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-1 py-1.5 px-2.5 -ml-1 rounded-xl bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-950 font-bold text-xs transition-all cursor-pointer border border-amber-200 shadow-2xs shrink-0"
              title="Back to Welcome / Home Screen"
            >
              <ArrowLeft className="w-4 h-4 text-amber-800" />
              <span className="font-extrabold text-[11px] sm:text-xs">Home</span>
            </button>
          )}
          <ImageWithSkeleton
            src={cafe.logo}
            alt={cafe.name}
            className="w-full h-full object-cover"
            containerClassName="w-9 h-9 rounded-xl border border-amber-200 shadow-xs shrink-0"
          />
          <div className="leading-tight min-w-0">
            <h1 className="font-bold text-stone-900 text-sm sm:text-base truncate">
              {cafe.name}
            </h1>
            <p className="text-xs text-stone-500 font-medium truncate">
              {cafe.tagline || 'Artisanal Coffee & Fresh Bites'}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Search Toggle */}
          <button
            onClick={onToggleSearch}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isSearchOpen ? 'bg-amber-100 text-amber-900' : 'text-stone-600 hover:bg-stone-100'
            }`}
            title="Search dishes"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Call Waiter (Optional) */}
          {onOpenWaiter && (
            <button
              onClick={onOpenWaiter}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 text-xs font-semibold transition-colors cursor-pointer border border-stone-200"
              title="Call Server"
            >
              <Bell className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Call Server</span>
            </button>
          )}

          {/* View Bill / Past Orders */}
          {onOpenBill && (
            <button
              onClick={onOpenBill}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                hasActiveOrder
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
              }`}
              title="View Current or Past Bills"
            >
              <Receipt className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline">Bill</span>
              {hasActiveOrder && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          )}

          {/* Cart Icon with Badge */}
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-xl bg-[#133e2c] hover:bg-[#0e2c20] text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            title="View Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
