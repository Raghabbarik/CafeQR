import React, { useEffect, useState } from 'react';
import type { Order, CafeInfo, OrderStatus } from '../../types';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Printer, 
  Utensils, 
  Sparkles, 
  ChefHat, 
  PartyPopper,
  ArrowLeft,
  Phone,
  User,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Hash,
  Receipt,
  Star,
  MessageSquareHeart,
  Send,
  Loader2
} from 'lucide-react';
import { ImageWithSkeleton } from '../common/ImageWithSkeleton';
import { api } from '../../services/api';

interface BillReceiptViewProps {
  order: Order;
  cafe: CafeInfo;
  onOrderMore: () => void;
  onLookupBills?: () => void;
}

export const BillReceiptView: React.FC<BillReceiptViewProps> = ({
  order,
  cafe,
  onOrderMore,
  onLookupBills,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Customer Feedback state (asked after delivery / on receipt)
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedItemId, setSelectedItemId] = useState<string>(order.items[0]?.id || '');
  const [comment, setComment] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>(order.customerName || '');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(`cafeqr_feedback_${order.id}`));
    } catch {
      return false;
    }
  });
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Check server & localStorage if feedback has already been submitted for this order
  useEffect(() => {
    let isMounted = true;
    if (order.id) {
      try {
        if (localStorage.getItem(`cafeqr_feedback_${order.id}`)) {
          setFeedbackSubmitted(true);
        }
      } catch {}

      // Verify with database to prevent double feedback across devices / sessions
      api.getReviews(undefined, order.id)
        .then((existingRevs) => {
          if (isMounted && Array.isArray(existingRevs) && existingRevs.length > 0) {
            setFeedbackSubmitted(true);
            try {
              localStorage.setItem(`cafeqr_feedback_${order.id}`, 'true');
            } catch {}
          }
        })
        .catch(() => {
          // resilient fallback
        });
    }
    return () => {
      isMounted = false;
    };
  }, [order.id]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || isSubmittingFeedback || feedbackSubmitted) return;

    setIsSubmittingFeedback(true);
    setFeedbackError(null);
    try {
      const selectedItem = order.items.find((i) => i.id === selectedItemId) || order.items[0];
      await api.submitReview({
        orderId: order.id,
        itemId: selectedItem ? selectedItem.id : undefined,
        itemName: selectedItem ? selectedItem.name : 'Cafe Dining Experience',
        customerName: reviewerName.trim() || order.customerName || 'Happy Customer',
        customerPhone: order.customerPhone,
        rating,
        comment: comment.trim(),
        status: 'approved',
      });
      try {
        localStorage.setItem(`cafeqr_feedback_${order.id}`, 'true');
      } catch {}
      setFeedbackSubmitted(true);
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.7 } });
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      if (err.message && (err.message.includes('already been submitted') || err.message.includes('Double feedback'))) {
        try {
          localStorage.setItem(`cafeqr_feedback_${order.id}`, 'true');
        } catch {}
        setFeedbackSubmitted(true);
        setFeedbackError(null);
      } else {
        setFeedbackError(err.message || 'Could not submit review. Please try again.');
      }
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Fire confetti celebration on receipt generation
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#b45309', '#d97706', '#f59e0b', '#10b981'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  const isParcel = order.diningOption === 'parcel' || String(order.tableNumber).toLowerCase().includes('parcel');

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  const handleShareWhatsApp = () => {
    const itemsList = order.items
      .map((i) => `• ${i.quantity}x ${i.name} - ₹${i.price * i.quantity}`)
      .join('\n');

    const message = `🧾 *${cafe.name}*\n"${cafe.tagline}"\n\n*Unique Order ID:* ${order.id}\n*Razorpay Payment ID:* ${order.paymentId}\n*Order Type:* ${isParcel ? '🛍️ Parcel (Takeaway)' : '🍽️ Eat Now (Dine-In)'}\n*Customer:* ${order.customerName}\n\n*Items Ordered:*\n${itemsList}\n\nSubtotal: ₹${order.subtotal}\nGST (${order.taxRate}%): ₹${order.tax}\n*Total Paid:* ₹${order.total} (Razorpay)\n*Status:* ${order.orderStatus.toUpperCase()}\n\nThank you for dining with us! ☕`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const statusSteps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'received', label: 'Order Received', desc: 'Sent to Kitchen' },
    { key: 'preparing', label: 'Preparing', desc: 'Chef is cooking' },
    { key: 'ready', label: 'Ready to Serve', desc: isParcel ? 'Ready at Counter' : 'Ready to serve' },
    { key: 'completed', label: 'Completed', desc: 'Enjoy your meal!' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'received': return 0;
      case 'preparing': return 1;
      case 'ready': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  const currentStep = getStepIndex(order.orderStatus);

  return (
    <div className="min-h-screen bg-stone-100 py-6 px-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Navigation & Actions (Hidden when printing) */}
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={onOrderMore}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Menu</span>
            </button>

            {onLookupBills && (
              <button
                onClick={onLookupBills}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs transition-colors cursor-pointer"
                title="Search all your bills"
              >
                <Receipt className="w-3.5 h-3.5 text-amber-700" />
                <span>All Bills</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 shadow-2xs transition-colors cursor-pointer"
              title="Share Bill via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-800 bg-white hover:bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-300 shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-stone-700" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Live Order Status Banner (No-print) */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-md no-print space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Live Kitchen Status
              </span>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
              order.orderStatus === 'completed'
                ? 'bg-emerald-100 text-emerald-800'
                : order.orderStatus === 'ready'
                ? 'bg-blue-100 text-blue-800 animate-pulse'
                : order.orderStatus === 'preparing'
                ? 'bg-amber-100 text-amber-900'
                : 'bg-stone-100 text-stone-800'
            }`}>
              {order.orderStatus}
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="relative pt-2 pb-1">
            <div className="flex items-center justify-between relative z-10">
              {statusSteps.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.key} className="flex flex-col items-center flex-1 text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-amber-800 text-white ring-4 ring-amber-200 scale-110 shadow-sm'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {idx === 0 ? <CheckCircle2 className="w-4 h-4" /> :
                       idx === 1 ? <ChefHat className="w-4 h-4" /> :
                       idx === 2 ? <Utensils className="w-4 h-4" /> :
                       <PartyPopper className="w-4 h-4" />}
                    </div>
                    <span className={`text-[10px] font-bold mt-1.5 leading-tight ${
                      isCurrent ? 'text-amber-900' : isPassed ? 'text-stone-800' : 'text-stone-400'
                    }`}>
                      {step.label}
                    </span>
                    <span className="text-[9px] text-stone-400 hidden sm:block">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Connecting Bar */}
            <div className="absolute top-6 left-6 right-6 h-1 bg-stone-200 -z-0">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* ================= Customer Feedback & Rating (Post-Delivery ONLY) ================= */}
        {order.orderStatus === 'completed' && (
          <div className="bg-gradient-to-br from-amber-50/70 via-white to-stone-50 rounded-3xl p-5 border border-amber-200/80 shadow-md no-print space-y-3.5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
                  <MessageSquareHeart className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm">
                    How was your meal? Rate your experience
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Your feedback will be featured on the dish's product page!
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Delivered
              </span>
            </div>

            {feedbackSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1.5 animate-in zoom-in-95 duration-200">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <h4 className="font-extrabold text-emerald-950 text-sm">Feedback Received!</h4>
                <p className="text-xs text-emerald-800 font-medium">
                  Thank you! Your feedback for this order has been submitted. Only one review per order is permitted.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-3">
                {/* Star Rating Selector */}
                <div className="flex items-center justify-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-115 active:scale-95 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            active
                              ? 'text-amber-500 fill-amber-400 drop-shadow-xs'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Select which dish to review */}
                {order.items.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Select dish to review:
                    </label>
                    <select
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-xl border border-stone-300 text-stone-800 outline-none focus:border-amber-600"
                    >
                      {order.items.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name} (₹{i.price})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Reviewer Name */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Your Name (optional):
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full text-xs p-2.5 bg-white rounded-xl border border-stone-300 text-stone-800 placeholder-stone-400 outline-none focus:border-amber-600 shadow-2xs"
                  />
                </div>

                {/* Review Text */}
                <div>
                  <textarea
                    rows={2}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you liked (flavor, portion, presentation, delivery speed)..."
                    className="w-full text-xs p-3 bg-white rounded-xl border border-stone-300 text-stone-800 placeholder-stone-400 outline-none focus:border-amber-600 resize-none shadow-2xs"
                  />
                </div>

                {feedbackError && (
                  <p className="text-xs text-red-600 font-semibold">{feedbackError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingFeedback || !comment.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmittingFeedback ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Review...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Customer Review</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ================= Printable Digital Bill ================= */}
        <div
          id="printable-bill"
          className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xl relative overflow-hidden font-sans text-stone-800"
        >
          {/* Subtle Decorative Header Wave */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800" />

          {/* 1. Cafe Logo & Name */}
          <div className="text-center pt-2 pb-4 border-b border-dashed border-stone-300">
            <ImageWithSkeleton
              src={cafe.logo}
              alt={cafe.name}
              className="w-full h-full rounded-2xl object-cover"
              containerClassName="w-16 h-16 rounded-2xl mx-auto border border-amber-200 shadow-xs mb-2 bg-white"
            />
            <h2 className="text-xl font-black text-stone-900 tracking-tight">
              {cafe.name}
            </h2>

            {/* 2. Small Line / Cafe Tagline */}
            <p className="text-xs font-serif italic text-amber-900 mt-1 max-w-xs mx-auto">
              "{cafe.tagline}"
            </p>

            <p className="text-[11px] text-stone-500 mt-1">{cafe.address}</p>
            <p className="text-[10px] text-stone-400 font-mono">Ph: {cafe.phone}</p>
          </div>

          {/* Bill Meta Info: Prominent Unique Order ID & Payment ID Cards */}
          <div className="py-3.5 border-b border-dashed border-stone-300 space-y-2.5">
            
            {/* Top row: Unique Order ID & Table Badge */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                  <Hash className="w-3 h-3 text-stone-400" />
                  <span>Unique Order ID</span>
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono font-black text-stone-900 text-xs sm:text-sm">
                    {order.id}
                  </span>
                  <button
                    onClick={() => handleCopy(order.id, 'orderId')}
                    className="p-1 hover:bg-stone-200 rounded-md transition-colors cursor-pointer text-stone-400 hover:text-stone-700"
                    title="Copy Order ID"
                  >
                    {copiedKey === 'orderId' ? (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Dining Preference: Eat Now vs Parcel */}
              {(() => {
                const isParcel = order.diningOption === 'parcel' || String(order.tableNumber).toLowerCase().includes('parcel');
                return (
                  <div className={`p-2.5 rounded-xl border text-right flex flex-col justify-between ${
                    isParcel
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-amber-50/80 border-amber-200'
                  }`}>
                    <span className={`block text-[10px] uppercase font-bold tracking-wider ${
                      isParcel ? 'text-emerald-800' : 'text-amber-800'
                    }`}>
                      Order Type
                    </span>
                    <span className={`font-extrabold text-sm ${
                      isParcel ? 'text-emerald-950' : 'text-amber-950'
                    }`}>
                      {isParcel ? '🛍️ Parcel' : '🍽️ Eat Now'}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Razorpay Payment ID Box */}
            <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-emerald-700 block text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Razorpay Payment ID</span>
                </span>
                <span className="font-mono font-extrabold text-emerald-950 text-xs mt-0.5 block">
                  {order.paymentId}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-black uppercase tracking-wider">
                  Verified
                </span>
                <button
                  onClick={() => handleCopy(order.paymentId, 'payId')}
                  className="p-1 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer text-emerald-700"
                  title="Copy Payment ID"
                >
                  {copiedKey === 'payId' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Guest Info & Timestamp */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-stone-600">
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="font-medium truncate">{order.customerName}</span>
              </div>
              <div className="flex items-center justify-end gap-1 font-mono text-[11px]">
                <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                <span>{order.customerPhone}</span>
              </div>
              <div className="col-span-2 text-[10px] text-stone-400 flex items-center justify-between pt-1">
                <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                <span>Time: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {/* 3. Orders Itemized List */}
          <div className="py-4 border-b border-dashed border-stone-300">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-stone-400 pb-2">
              <span>Item & Qty</span>
              <span>Amount</span>
            </div>
            <div className="space-y-2 text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div className="flex items-start gap-2 max-w-[70%]">
                    <span className="font-mono text-stone-500 font-bold">{item.quantity}x</span>
                    <div>
                      <span className="font-semibold text-stone-900">{item.name}</span>
                      <span className="text-[10px] text-stone-400 block">@ ₹{item.price}</span>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="mt-3 p-2 rounded-lg bg-stone-50 text-[11px] text-stone-600 border border-stone-200 italic">
                Note: "{order.notes}"
              </div>
            )}
          </div>

          {/* 4. Total Bill Breakdown */}
          <div className="py-3.5 border-b border-dashed border-stone-300 space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-stone-900">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>GST & Taxes ({order.taxRate}%)</span>
              <span className="font-medium text-stone-900">₹{order.tax}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-stone-950 pt-2 border-t border-stone-200">
              <span>Grand Total</span>
              <span className="text-amber-900">₹{order.total}</span>
            </div>
          </div>

          {/* Kitchen Order Status */}
          <div className="pt-3.5">
            <div className="flex items-center justify-between text-xs bg-amber-50 p-3 rounded-2xl border border-amber-200/80">
              <span className="font-bold text-stone-700">Kitchen Order Status</span>
              <span className="font-black uppercase tracking-wider text-amber-950 text-xs bg-amber-200/70 px-2.5 py-0.5 rounded-lg">
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-5 text-[10px] text-stone-400 space-y-1">
            <p>Thank you for dining with us at {cafe.name}!</p>
            <p className="font-mono">Have a wonderful and tasty day ☕</p>
          </div>
        </div>

        {/* Bottom Button to order more */}
        <div className="pt-2 no-print">
          <button
            onClick={onOrderMore}
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Order Another Item / Beverage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
