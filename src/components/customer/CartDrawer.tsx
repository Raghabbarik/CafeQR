import React from 'react';
import type { CartItem, CafeInfo } from '../../types';
import { X, Trash2, Plus, Minus, ArrowRight, MessageSquare, ShoppingBag } from 'lucide-react';

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
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxRate = cafe.taxRate || 5;
  const tax = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + tax;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 cursor-pointer"
        onClick={onClose}
      />

      {/* Sliding Drawer Container */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md flex z-50 animate-in slide-in-from-right duration-300">
        <div className="w-full h-full bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-900">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">Your Order Cart</h2>
                <p className="text-xs text-stone-500">{cafe.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition-colors"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center text-stone-400 space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-stone-300" />
                <p className="font-semibold text-stone-600 text-sm">Your cart is empty</p>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  Scan through our menu and add your favorite coffee and dishes!
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
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

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Quantity Controller */}
                        <div className="flex items-center bg-white border border-stone-300 rounded-lg px-1 py-0.5 shadow-2xs">
                          <button
                            onClick={() => onRemoveFromCart(item)}
                            className="p-1 text-stone-600 hover:text-red-600 active:scale-90"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 font-bold text-xs text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onAddToCart(item)}
                            className="p-1 text-stone-600 hover:text-amber-700 active:scale-90"
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
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                    <span>Special Cooking Instructions (Optional)</span>
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
            <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
              {/* Bill Details */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-stone-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & GST ({taxRate}%)</span>
                  <span className="font-semibold text-stone-800">₹{tax}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-stone-950 pt-1.5 border-t border-stone-200">
                  <span>Grand Total</span>
                  <span className="text-amber-900 text-base">₹{total}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-between cursor-pointer"
              >
                <span>Proceed to Pay (₹{total})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
