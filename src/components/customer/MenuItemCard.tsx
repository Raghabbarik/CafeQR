import React, { useState } from 'react';
import type { MenuItem } from '../../types';
import { Plus, Minus, Clock, Heart } from 'lucide-react';

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
      className={`relative bg-white rounded-2xl border border-stone-200/70 p-3 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group ${
        !item.isAvailable ? 'opacity-60 grayscale-[40%]' : ''
      }`}
    >
      {/* Top Bar: Veg/Non-Veg icon (optional subtle) & Wishlist Heart */}
      <div className="flex items-center justify-between w-full mb-1">
        {/* Subtle Veg / Non-Veg badge */}
        <div
          className={`w-3.5 h-3.5 rounded-xs border-2 flex items-center justify-center ${
            item.isVeg ? 'border-emerald-600' : 'border-red-600'
          }`}
          title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
        </div>

        {/* Heart Wishlist Icon */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={`action-btn p-1 rounded-full text-stone-300 hover:text-red-500 transition-colors cursor-pointer ${
            isLiked ? 'text-red-500' : ''
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
        </button>
      </div>

      {/* Center: Product Image */}
      <div className="w-full h-28 sm:h-32 flex items-center justify-center p-1 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Product Information */}
      <div className="pt-2 flex flex-col flex-1 justify-between">
        <div>
          {/* Light-blue Portion / Size badge */}
          <span className="bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-md inline-block">
            {portion}
          </span>

          {/* Product Title */}
          <h3 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1 mt-1 leading-snug">
            {item.name}
          </h3>

          {/* Prep Time */}
          <div className="flex items-center gap-1 text-[10px] text-stone-400 font-medium mt-0.5">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>{item.prepTime || '10 MINS'}</span>
          </div>
        </div>

        {/* Bottom Price & Add to Cart Row */}
        <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-stone-100">
          <div className="flex items-baseline gap-1">
            <span className="font-black text-[#133e2c] text-sm sm:text-base">
              ₹{item.price}
            </span>
            <span className="text-[10px] text-stone-400 line-through">
              MRP ₹{mrp}
            </span>
          </div>

          {/* Round Dark Green / Espresso + Button or Controller */}
          <div className="action-btn">
            {!item.isAvailable ? (
              <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                Sold Out
              </span>
            ) : quantity > 0 ? (
              <div className="flex items-center bg-[#133e2c] text-white rounded-full px-1.5 py-0.5 text-xs font-bold shadow-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromCart(item);
                  }}
                  className="p-1 hover:bg-black/20 rounded-full active:scale-90 transition-transform cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-1.5 min-w-[16px] text-center font-bold text-xs">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(item);
                  }}
                  className="p-1 hover:bg-black/20 rounded-full active:scale-90 transition-transform cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(item);
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#133e2c] hover:bg-[#0e2c20] text-white flex items-center justify-center font-bold shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Add to cart"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
