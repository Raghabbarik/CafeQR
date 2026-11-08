import React, { useState } from 'react';
import type { MenuItem } from '../../types';
import { Plus, Minus, Clock, Heart } from 'lucide-react';
import { ImageWithSkeleton } from '../common/ImageWithSkeleton';

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (item: MenuItem) => void;
  onOpenDetails: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  quantity,
  onAddToCart,
  onRemoveFromCart,
  onOpenDetails,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const mrp = item.mrp || Math.round(item.price * 1.25);
  const portion = item.portion || 'Regular';

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent triggering details modal when clicking the + / - buttons or heart
    const target = e.target as HTMLElement;
    if (target.closest('.action-btn')) return;
    onOpenDetails(item);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative bg-white rounded-2xl border border-stone-200/80 p-2 sm:p-2.5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group active:scale-[0.99] ${
        !item.isAvailable ? 'opacity-60 grayscale-[40%]' : ''
      }`}
    >
      {/* Full-width Product Image with Floating Veg/Non-Veg & Heart Badges ON TOP */}
      <div className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-stone-100 mb-1.5">
        <ImageWithSkeleton
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          containerClassName="w-full h-full"
          loading="lazy"
        />

        {/* Soft top gradient overlay for badge readability */}
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/40 via-black/10 to-transparent pointer-events-none" />

        {/* Floating Top-Left: Veg / Non-Veg badge */}
        <div className="absolute top-1.5 left-1.5 z-10">
          <div
            className={`w-4 h-4 rounded-xs border-2 bg-white/95 backdrop-blur-xs shadow-xs flex items-center justify-center ${
              item.isVeg ? 'border-emerald-600' : 'border-red-600'
            }`}
            title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
          >
            <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
          </div>
        </div>

        {/* Floating Top-Right: Wishlist Heart */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={`action-btn absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-white/95 backdrop-blur-xs shadow-xs flex items-center justify-center transition-all hover:scale-110 active:scale-90 cursor-pointer ${
            isLiked ? 'text-red-500' : 'text-stone-400 hover:text-red-500'
          }`}
          title="Add to favorites"
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Floating Bottom-Left: Bestseller Pill */}
        {item.isBestseller && (
          <div className="absolute bottom-1.5 left-1.5 z-10">
            <span className="text-[9px] font-black uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded shadow-xs tracking-tight">
              ★ Bestseller
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="pt-1.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Portion / Size badge */}
          <span className="bg-sky-50 text-sky-700 text-[9px] font-bold px-1.5 py-0.5 rounded inline-block">
            {portion}
          </span>

          {/* Product Title */}
          <h3 className="font-bold text-stone-900 text-xs line-clamp-1 mt-0.5 leading-tight">
            {item.name}
          </h3>

          {/* Prep Time */}
          <div className="flex items-center gap-1 text-[9px] text-stone-400 font-medium mt-0.5">
            <Clock className="w-2.5 h-2.5 text-stone-400" />
            <span>{item.prepTime || '10 MINS'}</span>
          </div>
        </div>

        {/* Bottom Price & Add to Cart Row */}
        <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-stone-100">
          <div className="flex items-baseline gap-1">
            <span className="font-black text-[#133e2c] text-xs sm:text-sm">
              ₹{item.price}
            </span>
            <span className="text-[9px] text-stone-400 line-through">
              ₹{mrp}
            </span>
          </div>

          {/* Add button / Stepper */}
          <div className="action-btn">
            {!item.isAvailable ? (
              <span className="text-[9px] font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                Sold Out
              </span>
            ) : quantity > 0 ? (
              <div className="flex items-center bg-[#133e2c] text-white rounded-full px-1 py-0.5 text-[11px] font-bold shadow-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromCart(item);
                  }}
                  className="p-0.5 hover:bg-black/20 rounded-full active:scale-90 transition-transform cursor-pointer"
                  title="Remove one"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <span className="px-1 min-w-[14px] text-center font-bold text-[11px]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(item);
                  }}
                  className="p-0.5 hover:bg-black/20 rounded-full active:scale-90 transition-transform cursor-pointer"
                  title="Add one"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(item);
                }}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#133e2c] hover:bg-[#0e2c20] text-white flex items-center justify-center font-bold shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Add to cart"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
