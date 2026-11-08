import React, { useState, useEffect } from 'react';
import type { Review, MenuItem } from '../../types';
import { api } from '../../services/api';
import { 
  Star, 
  MessageSquareHeart, 
  Trash2, 
  Eye, 
  EyeOff, 
  Plus, 
  Search, 
  X, 
  Loader2
} from 'lucide-react';

interface FeedbackManagerViewProps {
  menuItems: MenuItem[];
}

export const FeedbackManagerView: React.FC<FeedbackManagerViewProps> = ({ menuItems }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const [selectedDish, setSelectedDish] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'hidden'>('all');

  // Add review modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newItemId, setNewItemId] = useState<string>(menuItems[0]?.id || '');
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReviews();
      setReviews(data || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleStatus = async (review: Review) => {
    setActionLoadingId(review.id);
    const newStatus = review.status === 'approved' ? 'hidden' : 'approved';
    try {
      await api.updateReview(review.id, { status: newStatus });
      setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, status: newStatus } : r)));
    } catch (err: any) {
      alert(`Could not update review status: ${err.message || 'Error'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (review: Review) => {
    if (!window.confirm(`Delete review from "${review.customerName}"? This cannot be undone.`)) return;
    setActionLoadingId(review.id);
    try {
      await api.deleteReview(review.id);
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
    } catch (err: any) {
      alert(`Could not delete review: ${err.message || 'Error'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const targetDish = menuItems.find((i) => i.id === newItemId) || menuItems[0];
      const created = await api.submitReview({
        itemId: targetDish?.id,
        itemName: targetDish?.name || 'Cafe Special',
        customerName: newCustomerName.trim() || 'Verified Guest',
        rating: newRating,
        comment: newComment.trim(),
        status: 'approved',
      });
      setReviews((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      setNewCustomerName('');
      setNewComment('');
      setNewRating(5);
    } catch (err: any) {
      alert(`Could not create review: ${err.message || 'Error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.itemName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase());
    const matchesRating = selectedRating === 'all' || r.rating === selectedRating;
    const matchesDish = selectedDish === 'all' || r.itemId === selectedDish || r.itemName === selectedDish;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesRating && matchesDish && matchesStatus;
  });

  // Analytics summary
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / totalReviews).toFixed(1)
    : '5.0';
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const fiveStarCount = reviews.filter((r) => Number(r.rating) === 5).length;
  const positivePercent = totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-xs">
              <MessageSquareHeart className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
                Guest Reviews & Feedback
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Customer reviews collected after delivery. Control what is published on product pages.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial / Review</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Total Reviews</p>
          <p className="text-2xl font-black text-stone-900">{totalReviews}</p>
          <p className="text-[10px] text-stone-500">Collected from guests</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Average Rating</p>
          <div className="flex items-center gap-1.5">
            <p className="text-2xl font-black text-amber-600">{avgRating}</p>
            <div className="flex text-amber-400">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <p className="text-[10px] text-stone-500">Across all dishes</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Approved & Live</p>
          <p className="text-2xl font-black text-emerald-600">{approvedCount}</p>
          <p className="text-[10px] text-stone-500">Visible on menu details</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">5-Star Ratio</p>
          <p className="text-2xl font-black text-stone-900">{positivePercent}%</p>
          <p className="text-[10px] text-emerald-600 font-semibold">Top guest satisfaction</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, dish, or review text..."
              className="w-full pl-10 pr-3 py-2 bg-stone-50 rounded-xl text-xs text-stone-800 border border-stone-200 outline-none focus:border-amber-600"
            />
          </div>

          {/* Dish selector */}
          <select
            value={selectedDish}
            onChange={(e) => setSelectedDish(e.target.value)}
            className="px-3 py-2 bg-stone-50 rounded-xl text-xs font-semibold text-stone-700 border border-stone-200 outline-none focus:border-amber-600"
          >
            <option value="all">All Dishes</option>
            {menuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          {/* Rating filter */}
          <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
            {(['all', 5, 4, 3, 2, 1] as const).map((r) => (
              <button
                key={String(r)}
                onClick={() => setSelectedRating(r)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRating === r
                    ? 'bg-amber-800 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {r === 'all' ? 'All ★' : `${r}★`}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 border-l border-stone-200 pl-2">
            {(['all', 'approved', 'hidden'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold uppercase transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin text-amber-700" />
          <p className="text-xs font-bold">Loading guest feedback...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-stone-300 space-y-2">
          <MessageSquareHeart className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-extrabold text-stone-800 text-base">No Reviews Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {search || selectedRating !== 'all' || selectedDish !== 'all'
              ? 'No reviews match your current filters. Try resetting search.'
              : 'As customers receive orders and submit feedback, reviews will appear here for you to control.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className={`bg-white rounded-2xl border p-4 shadow-2xs flex flex-col justify-between space-y-3 transition-all ${
                rev.status === 'hidden'
                  ? 'border-stone-200 bg-stone-50/70 opacity-60'
                  : 'border-stone-200/90'
              }`}
            >
              <div className="space-y-2">
                {/* Header row: Customer & Dish */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm truncate">
                        {rev.customerName}
                      </span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full shrink-0">
                        {rev.itemName}
                      </span>
                    </div>
                    {rev.customerPhone && (
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                        Ph: {rev.customerPhone}
                      </p>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                      rev.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {rev.status === 'approved' ? '✓ Live on Menu' : 'Hidden'}
                  </span>
                </div>

                {/* Stars & Date */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < (rev.rating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-200'
                        }`}
                      />
                    ))}
                    <span className="font-bold text-stone-700 ml-1">
                      {rev.rating}.0
                    </span>
                  </div>

                  <span className="text-stone-400 text-[10px]">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Comment Text */}
                <p className="text-xs text-stone-700 italic leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  "{rev.comment}"
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={actionLoadingId === rev.id}
                  onClick={() => handleToggleStatus(rev)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                    rev.status === 'approved'
                      ? 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  }`}
                  title={rev.status === 'approved' ? 'Hide from public menu' : 'Publish to menu'}
                >
                  {actionLoadingId === rev.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : rev.status === 'approved' ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                      <span>Hide from Menu</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Publish Live</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={actionLoadingId === rev.id}
                  onClick={() => handleDelete(rev)}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                  title="Delete Review Permanently"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Review / Testimonial Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-stone-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-stone-900 mb-1">
              Add Verified Customer Testimonial
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Add a customer quote or featured review that appears on the product details sheet.
            </p>

            <form onSubmit={handleCreateReview} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Dish to Review *</label>
                <select
                  value={newItemId}
                  onChange={(e) => setNewItemId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600"
                >
                  {menuItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="e.g. Shalini Verma"
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Star Rating (1 - 5)</label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewRating(s)}
                      className="p-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          newRating >= s
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-stone-700 text-xs ml-2">
                    {newRating} Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Review Feedback *</label>
                <textarea
                  rows={3}
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="What did the customer say about the dish?..."
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Review...</span>
                    </>
                  ) : (
                    <span>Publish Review to Menu</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
