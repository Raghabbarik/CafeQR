import React, { useState, useEffect, useRef } from 'react';
import type { CartItem, CafeInfo } from '../../types';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  MessageSquare, 
  ShoppingBag,
  ChevronUp,
  ChevronDown 
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  cafe: CafeInfo;
  notes: string;
  onNotesChange: (notes: string) => void;
  onAddToCart: (item: CartItem) => void;
  onRemoveFromCart: (item: CartItem) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  cafe,
  notes,
  onNotesChange,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onProceedToCheckout,
}) => {
  // Half-page to full-page expandable bottom sheet state on mobile
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset to half-sheet whenever opened
  useEffect(() => {
    if (isOpen) {
      setIsExpanded(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxRate = cafe.taxRate || 5;
  const tax = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + tax;

  // Touch gesture handling on drag handle
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    if (deltaY < -30) {
      // Swiped UP -> expand to full sheet
      setIsExpanded(true);
    } else if (deltaY > 40) {
      // Swiped DOWN -> collapse to half or close
      if (isExpanded) {
        setIsExpanded(false);
      } else {
        onClose();
      }
    }
    setTouchStartY(null);
  };

  // Scroll detection: auto-expand when user scrolls down
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 10 && !isExpanded) {
      setIsExpanded(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 cursor-pointer"
        onClick={onClose}
      />

      {/* Sliding Sheet / Drawer Container:
          On mobile: bottom docked half-sheet (h-[55vh] expandable to h-[92vh])
          On desktop: right docked full-height drawer */}
      <div 
        className={`fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto w-full sm:max-w-md flex z-50 ${
          isExpanded ? 'h-[92vh]' : 'h-[55vh]'
        } sm:h-full transition-[height] duration-300 ease-out animate-in slide-in-from-bottom sm:slide-in-from-right`}
      >
        <div className="w-full h-full bg-white shadow-2xl flex flex-col justify-between rounded-t-3xl sm:rounded-none overflow-hidden">
          
          {/* Mobile Top Drag Handle Bar */}
          <div
            onClick={() => setIsExpanded((prev) => !prev)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full pt-2.5 pb-1 flex flex-col items-center justify-center cursor-pointer select-none sm:hidden bg-stone-50 border-b border-stone-100 shrink-0"
            title={isExpanded ? "Collapse to half sheet" : "Expand to full cart"}
          >
            <div className="w-12 h-1.5 bg-stone-300 hover:bg-stone-400 rounded-full transition-colors" />
            <span className="text-[10px] text-stone-400 font-medium mt-1 flex items-center gap-1">
              {isExpanded ? (
                <>Tap to collapse <ChevronDown className="w-3 h-3" /></>
              ) : (
                <>Swipe up or scroll for full view <ChevronUp className="w-3 h-3" /></>
              )}
            </span>
          </div>

          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-900">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900">Your Order Cart</h2>
                <p className="text-[11px] sm:text-xs text-stone-500">{cafe.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Item List */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-3.5"
          >
            {cartItems.length === 0 ? (
              <div className="py-12 sm:py-16 text-center text-stone-400 space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-stone-300" />
                <p className="font-semibold text-stone-600 text-sm">Your cart is empty</p>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  Scan through our menu and add your favorite coffee and dishes!
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2.5">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/70"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        {/* Veg / Non-Veg badge */}
                        <div
                          className={`w-3.5 h-3.5 shrink-0 rounded-xs border flex items-center justify-center ${
                            item.isVeg ? 'border-emerald-600' : 'border-red-600'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-stone-900 text-sm truncate">{item.name}</p>
                          <p className="text-xs text-stone-500">₹{item.price} each</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {/* Quantity Controller */}
                        <div className="flex items-center bg-white border border-stone-300 rounded-lg px-1 py-0.5 shadow-2xs">
                          <button
                            onClick={() => onRemoveFromCart(item)}
                            className="p-1 text-stone-600 hover:text-red-600 active:scale-90 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 font-bold text-xs text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onAddToCart(item)}
                            className="p-1 text-stone-600 hover:text-amber-700 active:scale-90 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-extrabold text-sm text-stone-900 min-w-[50px] text-right">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Special Instructions */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                      <span>Special Cooking Instructions (Optional)</span>
                    </div>
                    {!isExpanded && (
                      <span 
                        onClick={() => setIsExpanded(true)}
                        className="text-[10px] text-amber-700 font-bold cursor-pointer hover:underline sm:hidden"
                      >
                        Expand View ↑
                      </span>
                    )}
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="e.g. Less spicy, extra hot milk, no onions..."
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 outline-none focus:border-amber-500 focus:bg-amber-50/20 transition-all resize-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* Bottom Checkout Section */}
          {cartItems.length > 0 && (
            <div className="p-3.5 sm:p-4 border-t border-stone-200 bg-stone-50 space-y-2.5 sm:space-y-3 shrink-0">
              {/* Bill Details */}
              <div className="space-y-1 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-stone-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & GST ({taxRate}%)</span>
                  <span className="font-semibold text-stone-800">₹{tax}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-stone-950 pt-1 border-t border-stone-200">
                  <span>Grand Total</span>
                  <span className="text-amber-900 text-base">₹{total}</span>
                </div>
              </div>

              {/* Checkout Button */}
              {cafe.isOpen !== false ? (
                <button
                  onClick={onProceedToCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>Proceed to Pay (₹{total})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="space-y-1">
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl bg-stone-300 text-stone-500 font-bold text-sm shadow-none flex items-center justify-between cursor-not-allowed"
                  >
                    <span>Cafe is Closed for Orders</span>
                    <span className="text-[10px] uppercase font-black tracking-wider bg-stone-400 text-white px-2 py-0.5 rounded">
                      Paused
                    </span>
                  </button>
                  <p className="text-[11px] text-center text-rose-700 font-medium">
                    {cafe.closedMessage || 'Online ordering is currently paused by the cafe.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
