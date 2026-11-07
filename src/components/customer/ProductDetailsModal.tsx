import React, { useState } from 'react';
import type { MenuItem } from '../../types';
import { 
  ArrowLeft, 
  Search, 
  Heart, 
  Clock, 
  ChevronDown, 
  Plus, 
  Minus, 
  Sparkles, 
  Check, 
  ShoppingBag,
  Star
} from 'lucide-react';

interface ProductDetailsModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentCartQty: number;
  onAddToCart: (item: MenuItem, qty: number) => void;
  onOpenSearch?: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  item,
  isOpen,
  onClose,
  currentCartQty,
  onAddToCart,
  onOpenSearch,
}) => {
  const [qty, setQty] = useState<number>(currentCartQty > 0 ? currentCartQty : 1);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<string>(item?.portion || 'Regular');
  const [addedToast, setAddedToast] = useState<boolean>(false);

  // Sync qty when item changes
  React.useEffect(() => {
    if (item) {
      setQty(currentCartQty > 0 ? currentCartQty : 1);
      setSelectedSize(item.portion || 'Regular');
    }
  }, [item, currentCartQty]);

  if (!isOpen || !item) return null;

  const mrp = item.mrp || Math.round(item.price * 1.25);
  const savings = mrp - item.price;
  const whyLoveIt = item.whyLoveIt || [
    'Handcrafted with premium selected ingredients',
    'Freshly prepared to order by our culinary team',
    'Perfect balance of flavors and authentic cafe craft'
  ];

  const handleIncrease = () => setQty((prev) => prev + 1);
  const handleDecrease = () => setQty((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAdd = () => {
    onAddToCart(item, qty);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Mobile Card / Sheet (matches the exact left screen in the mock) */}
      <div className="bg-white w-full max-w-md max-h-[92vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom duration-300">
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
          
          {/* Top Hero Section with pastel background & floating round buttons */}
          <div className="relative bg-[#fdf5ed] pt-4 pb-6 px-4 flex flex-col items-center">
            
            {/* Top Navigation Bar: Back, Search, Wishlist */}
            <div className="w-full flex items-center justify-between mb-2">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-stone-700 hover:text-stone-950 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                {onOpenSearch && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSearch();
                    }}
                    className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-stone-700 hover:text-stone-950 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title="Search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                    isLiked ? 'text-red-500' : 'text-stone-400 hover:text-red-500'
                  }`}
                  title="Favorite"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Large Hero Image */}
            <div className="w-full h-64 sm:h-72 flex items-center justify-center py-2">
              <img
                src={item.image}
                alt={item.name}
                className="max-h-full max-w-[85%] object-contain drop-shadow-xl transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>

          {/* Details Body Sheet */}
          <div className="bg-white px-5 pt-5 pb-6 space-y-5 rounded-t-3xl -mt-4 shadow-sm relative z-10">
            
            {/* Prep Time & Portion Dropdown */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span>{item.prepTime || '10 MINS'}</span>
              </div>

              {/* Portion selector pill */}
              <div className="relative">
                <div className="flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200/80 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer">
                  <span>{selectedSize}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Title & Price */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                {/* Veg/Non-Veg icon */}
                <div
                  className={`w-3.5 h-3.5 rounded-xs border-2 flex items-center justify-center ${
                    item.isVeg ? 'border-emerald-600' : 'border-red-600'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  {item.category}
                </span>
                {item.rating && (
                  <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {item.rating}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-black text-stone-900 tracking-tight leading-snug">
                {item.name}
              </h2>

              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl font-black text-[#133e2c]">
                  ₹{item.price}
                </span>
                <span className="text-xs text-stone-400 line-through">
                  MRP ₹{mrp}
                </span>
                {savings > 0 && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Save ₹{savings}
                  </span>
                )}
              </div>
            </div>

            {/* Section: About this product */}
            <div className="space-y-1.5 pt-1">
              <h3 className="text-sm font-extrabold text-stone-900">
                About this product
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Section: Why you'll love it */}
            <div className="space-y-2 pt-1 border-t border-stone-100">
              <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Why you'll love it</span>
              </h3>
              <ul className="space-y-2 text-xs text-stone-600">
                {whyLoveIt.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      ✓
                    </span>
                    <span className="leading-tight">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Bar with Quantity Selector & "Add to cart" Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-stone-200/80 shadow-2xl flex items-center gap-3">
          
          {/* Quantity selector `[-] 01 [+]` */}
          <div className="flex items-center justify-between bg-stone-100 rounded-2xl px-3 py-2 border border-stone-200/80 min-w-[110px]">
            <button
              onClick={handleDecrease}
              className="w-7 h-7 rounded-full bg-[#133e2c] text-white flex items-center justify-center font-bold active:scale-90 transition-transform cursor-pointer"
              title="Decrease"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-extrabold text-sm text-stone-900 font-mono px-2">
              {String(qty).padStart(2, '0')}
            </span>
            <button
              onClick={handleIncrease}
              className="w-7 h-7 rounded-full bg-[#133e2c] text-white flex items-center justify-center font-bold active:scale-90 transition-transform cursor-pointer"
              title="Increase"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to cart Button */}
          <button
            onClick={handleAdd}
            className={`flex-1 py-3.5 px-5 rounded-2xl font-black text-sm text-white shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer ${
              addedToast
                ? 'bg-emerald-600'
                : 'bg-[#133e2c] hover:bg-[#0e2c20]'
            }`}
          >
            {addedToast ? (
              <>
                <Check className="w-4 h-4 animate-bounce" />
                <span>Added to cart!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to cart • ₹{item.price * qty}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
