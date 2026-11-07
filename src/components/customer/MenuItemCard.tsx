import React from 'react';
import type { MenuItem } from '../../types';
import { Plus, Minus, Clock, Flame } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  quantity,
  onAddToCart,
  onRemoveFromCart,
}) => {
  return (
    <div
      className={`relative bg-white rounded-2xl border border-stone-200/80 p-3.5 sm:p-4 shadow-xs transition-all duration-200 hover:shadow-md flex gap-3.5 sm:gap-4 items-center justify-between ${
        !item.isAvailable ? 'opacity-60 grayscale-[40%]' : ''
      }`}
    >
      {/* Left Details */}
      <div className="flex-1 min-w-0 pr-2">
        {/* Diet Icon & Badges */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {/* Veg / Non-Veg Icon */}
          <div
            className={`w-4 h-4 rounded-xs border-2 flex items-center justify-center p-0.5 ${
              item.isVeg ? 'border-emerald-600' : 'border-red-600'
            }`}
            title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            />
          </div>

          {/* Bestseller Badge */}
          {item.isBestseller && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold tracking-wide uppercase">
              <Flame className="w-2.5 h-2.5 text-amber-600 fill-amber-600" />
              Bestseller
            </span>
          )}

          {/* Prep Time */}
          {item.prepTime && (
            <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 font-medium">
              <Clock className="w-3 h-3 text-stone-400" />
              {item.prepTime}
            </span>
          )}
        </div>

        {/* Item Title */}
        <h3 className="font-bold text-stone-900 text-base leading-snug line-clamp-1">
          {item.name}
        </h3>

        {/* Price */}
        <p className="text-amber-900 font-extrabold text-sm sm:text-base mt-0.5">
          ₹{item.price}
        </p>

        {/* Description */}
        <p className="text-stone-500 text-xs line-clamp-2 mt-1 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Right: Dish Photo & Add / Quantity Button */}
      <div className="relative shrink-0 flex flex-col items-center">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Add Button or Quantity Controller */}
        <div className="absolute -bottom-2 z-10 shadow-md rounded-xl">
          {!item.isAvailable ? (
            <span className="px-3 py-1 bg-stone-200 text-stone-600 text-xs font-bold rounded-xl whitespace-nowrap">
              Sold Out
            </span>
          ) : quantity > 0 ? (
            <div className="flex items-center bg-amber-800 text-white rounded-xl px-1.5 py-1 text-xs font-bold shadow-sm">
              <button
                onClick={() => onRemoveFromCart(item)}
                className="p-1 hover:bg-amber-900 rounded-lg active:scale-90 transition-transform cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 min-w-[20px] text-center font-extrabold text-sm">
                {quantity}
              </span>
              <button
                onClick={() => onAddToCart(item)}
                className="p-1 hover:bg-amber-900 rounded-lg active:scale-90 transition-transform cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(item)}
              className="flex items-center gap-1 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 rounded-xl px-3.5 py-1 text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-700" />
              <span>ADD</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
