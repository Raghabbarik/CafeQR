import React from 'react';
import type { CafeInfo } from '../../types';
import { ShoppingBag, Bell, Search, Utensils, Shield } from 'lucide-react';

interface NavbarProps {
  cafe: CafeInfo;
  tableNumber: string;
  totalCartItems: number;
  onOpenCart: () => void;
  onOpenWaiter: () => void;
  onToggleSearch: () => void;
  isSearchOpen: boolean;
  onSwitchToAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cafe,
  tableNumber,
  totalCartItems,
  onOpenCart,
  onOpenWaiter,
  onToggleSearch,
  isSearchOpen,
  onSwitchToAdmin,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Left: Cafe Logo & Name (No arrow) */}
        <div className="flex items-center gap-2">
          <img
            src={cafe.logo}
            alt={cafe.name}
            className="w-9 h-9 rounded-xl object-cover border border-amber-200 shadow-xs"
          />
          <div className="leading-tight">
            <h1 className="font-bold text-stone-900 text-sm sm:text-base line-clamp-1">
              {cafe.name}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
              <Utensils className="w-3 h-3 text-amber-600" />
              <span>Table #{tableNumber}</span>
            </div>
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

          {/* Call Waiter */}
          <button
            onClick={onOpenWaiter}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 text-xs font-semibold transition-colors cursor-pointer border border-stone-200"
            title="Call Waiter"
          >
            <Bell className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Call Server</span>
          </button>

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

          {/* Quick Staff / Admin Switcher */}
          <button
            onClick={onSwitchToAdmin}
            className="ml-1 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            title="Staff / Kitchen Mode"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
