import React, { useState, useEffect } from 'react';
import type { MenuItem, Review } from '../../types';
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
  MessageSquare,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { ImageWithSkeleton } from '../common/ImageWithSkeleton';
import { api } from '../../services/api';

interface ProductDetailsModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentCartQty: number;
  onAddToCart: (item: MenuItem, qty: number) => void;
  onOpenSearch?: () => void;
  isStoreClosed?: boolean;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  item,
  isOpen,
  onClose,
  currentCartQty,
  onAddToCart,
  onOpenSearch,
  isStoreClosed = false,
}) => {
  const [qty, setQty] = useState<number>(currentCartQty > 0 ? currentCartQty : 1);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<string>(item?.portion || 'Regular');
  const [addedToast, setAddedToast] = useState<boolean>(false);

  // Live reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(false);

  // Fetch reviews when modal opens or item changes
  useEffect(() => {
    if (isOpen && item) {
      setQty(currentCartQty > 0 ? currentCartQty : 1);
      setSelectedSize(item.portion || 'Regular');

      setIsLoadingReviews(true);
      api.getReviews(item.id)
        .then((data) => {
          setReviews(data || []);
        })
        .catch((err) => {
          console.warn('Could not fetch reviews:', err);
        })
        .finally(() => {
          setIsLoadingReviews(false);
        });
    }
  }, [item?.id, isOpen, currentCartQty]);

  if (!isOpen || !item) return null;

  const mrp = item.mrp || Math.round(item.price * 1.25);
  const savings = mrp - item.price;

  // Calculate live average rating from approved reviews
  const approvedReviews = reviews.filter((r) => r.status !== 'hidden');
  const averageRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
    : (item.rating || 4.8).toFixed(1);
  const totalReviewsCount = approvedReviews.length > 0 ? approvedReviews.length : Math.floor(25 + (item.price * 0.4));

  const whyLoveIt = item.whyLoveIt && item.whyLoveIt.length > 0 ? item.whyLoveIt : [
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
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Mobile Card / Sheet */}
      <div className="bg-white w-full max-w-md max-h-[92vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom duration-300">
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
          
          {/* Top Full-Bleed Product Image Banner with Floating Navigation Directly ON TOP */}
          <div className="relative w-full h-72 sm:h-80 bg-stone-900 overflow-hidden">
            <ImageWithSkeleton
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              containerClassName="w-full h-full"
            />

            {/* Top dark gradient for button contrast */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 via-black/25 to-transparent pointer-events-none" />
            {/* Bottom dark gradient for category text */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

            {/* Floating Top Bar DIRECTLY ON TOP OF IMAGE: Back Arrow, Search, Wishlist */}
            <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/95 hover:bg-white text-stone-900 shadow-xl flex items-center justify-center hover:scale-105 active:scale-90 transition-all cursor-pointer backdrop-blur-md"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {onOpenSearch && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSearch();
                    }}
                    className="w-10 h-10 rounded-full bg-white/95 hover:bg-white text-stone-900 shadow-xl flex items-center justify-center hover:scale-105 active:scale-90 transition-all cursor-pointer backdrop-blur-md"
                    title="Search menu"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-90 cursor-pointer backdrop-blur-md ${
                    isLiked ? 'text-red-500' : 'text-stone-500 hover:text-red-500'
                  }`}
                  title="Favorite"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Floating Bottom Info on Image: Veg / Non-Veg Badge & Category */}
            <div className="absolute bottom-3.5 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-xs border-2 bg-white flex items-center justify-center shadow-md ${
                    item.isVeg ? 'border-emerald-600' : 'border-red-600'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-white drop-shadow-md">
                  {item.category}
                </span>
              </div>

              {item.isBestseller && (
                <span className="text-[10px] font-extrabold uppercase bg-amber-500 text-white px-2.5 py-1 rounded-full shadow-md tracking-wider">
                  ★ Bestseller
                </span>
              )}
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
                  <span>{averageRating}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-800 leading-tight">
                    Excellent Taste
                  </p>
                  <p className="text-[10px] text-stone-500">
                    {totalReviewsCount} guest ratings
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
                {item.description || 'Delicious artisanal preparation made fresh with the highest quality cafe ingredients.'}
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
                  <MessageSquare className="w-4 h-4 text-amber-800" />
                  <span>Guest Reviews & Feedback</span>
                </h3>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified Orders Only</span>
                </span>
              </div>

              {/* Reviews List */}
              {isLoadingReviews ? (
                <div className="p-4 flex items-center justify-center gap-2 text-xs text-stone-400">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                  <span>Loading customer reviews...</span>
                </div>
              ) : approvedReviews.length === 0 ? (
                <div className="p-4 text-center bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-xs text-stone-600 font-semibold">
                    No reviews yet for this dish.
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Reviews can only be submitted by verified diners after order delivery.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {approvedReviews.map((rev) => (
                    <div key={rev.id} className="bg-stone-50 rounded-xl p-3 border border-stone-100 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-800">{rev.customerName}</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                            Verified Guest
                          </span>
                        </div>
                        <span className="text-stone-400 text-[10px]">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>

                      <p className="text-[11px] text-stone-600 leading-snug">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                  <div className="text-center pt-1">
                    <p className="text-[10px] text-stone-400">
                      🔒 Only diners who ordered and received this dish can write reviews.
                    </p>
                  </div>
                </div>
              )}
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
          {isStoreClosed ? (
            <button
              disabled
              className="flex-1 py-3.5 px-5 rounded-2xl font-black text-sm text-stone-500 bg-stone-300 shadow-none flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <span>Cafe Closed for Orders</span>
            </button>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};
