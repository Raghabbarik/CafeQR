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
  Star,
  ThumbsUp,
  MessageSquare
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
  const ratingValue = item.rating || 4.8;
  const reviewCount = Math.floor(80 + (item.price * 1.3));

  const whyLoveIt = item.whyLoveIt || [
    'Handcrafted with premium selected ingredients',
    'Freshly prepared to order by our culinary team',
    'Perfect balance of flavors and authentic cafe craft'
  ];

  // Customer reviews sample tailored to the dish
  const customerReviews = [
    {
      author: 'Ananya S.',
      rating: 5,
      date: '2 days ago',
      comment: `Absolutely loved this ${item.name}! Super fresh, flavorful, and presented beautifully.`,
    },
    {
      author: 'Rohan M.',
      rating: 5,
      date: 'Last week',
      comment: 'Top notch quality! One of my favorite orders here at the cafe.',
    },
  ];

  const handleIncrease = () => setQty((prev) => prev + 1);
  const handleDecrease = () => setQty((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAdd = () => {
    onAddToCart(item, qty);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Mobile Card / Sheet */}
      <div className="bg-white w-full max-w-md max-h-[92vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom duration-300">
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
          
          {/* Top Hero Section with soft cream background & image */}
          <div className="relative bg-[#f8f6f2] pt-4 pb-6 px-4 flex flex-col items-center border-b border-stone-100">
            
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

            {/* Large Hero Product Image */}
            <div className="w-full h-56 sm:h-64 flex items-center justify-center py-2">
              <img
                src={item.image}
                alt={item.name}
                className="max-h-full max-w-[85%] object-contain drop-shadow-xl transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>

          {/* Details Body Sheet */}
          <div className="bg-white px-5 pt-4 pb-6 space-y-4">
            
            {/* Prep Time & Portion Dropdown */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span>{item.prepTime || '10 MINS'}</span>
              </div>

              {/* Portion selector pill */}
              <div className="flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200/80 text-xs font-bold px-3 py-1.5 rounded-xl">
                <span>{selectedSize}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Title, Veg Badge & Category */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
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
                {item.isBestseller && (
                  <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    ★ Bestseller
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-black text-stone-900 tracking-tight leading-snug">
                {item.name}
              </h2>

              {/* Price & Savings */}
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-[#133e2c]">
                  ₹{item.price}
                </span>
                <span className="text-sm text-stone-400 line-through">
                  MRP ₹{mrp}
                </span>
                {savings > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    Save ₹{savings}
                  </span>
                )}
              </div>
            </div>

            {/* Ratings & Review Bar */}
            <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-amber-500 text-white font-black text-xs px-2 py-1 rounded-lg shadow-2xs">
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                  <span>{ratingValue}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-800 leading-tight">
                    Excellent Taste
                  </p>
                  <p className="text-[10px] text-stone-500">
                    {reviewCount} verified guest ratings
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-full">
                <ThumbsUp className="w-3 h-3 text-emerald-700" />
                <span>98% Reorder</span>
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

            {/* Customer Reviews Section */}
            <div className="space-y-2.5 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-stone-500" />
                  <span>Customer Reviews</span>
                </h3>
                <span className="text-[11px] font-bold text-[#133e2c]">
                  See all {reviewCount} →
                </span>
              </div>

              <div className="space-y-2">
                {customerReviews.map((rev, idx) => (
                  <div key={idx} className="bg-stone-50 rounded-xl p-2.5 border border-stone-100 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-800">{rev.author}</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                          Verified Order
                        </span>
                      </div>
                      <span className="text-stone-400 text-[10px]">{rev.date}</span>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <p className="text-[11px] text-stone-600 leading-snug">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
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
