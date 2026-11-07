import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  X, 
  Check, 
  Sparkles, 
  Search,
  RotateCcw
} from 'lucide-react';

interface FilterSidebarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  filterVeg: 'all' | 'veg' | 'non-veg';
  onFilterVegChange: (filter: 'all' | 'veg' | 'non-veg') => void;
  onlyBestsellers: boolean;
  onToggleBestsellers: () => void;
  sortBy: 'featured' | 'price_low' | 'price_high' | 'rating';
  onSortByChange: (sort: 'featured' | 'price_low' | 'price_high' | 'rating') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryItemCounts?: Record<string, number>;
  totalItemsCount?: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  filterVeg,
  onFilterVegChange,
  onlyBestsellers,
  onToggleBestsellers,
  sortBy,
  onSortByChange,
  searchQuery,
  onSearchChange,
  categoryItemCounts = {},
  totalItemsCount = 0,
}) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const allCategories = ['All Items', ...categories.filter((c) => c !== 'All' && c !== 'All Items')];

  // Count active filters
  const activeFiltersCount =
    (selectedCategory !== 'All Items' && selectedCategory !== 'All' ? 1 : 0) +
    (filterVeg !== 'all' ? 1 : 0) +
    (onlyBestsellers ? 1 : 0) +
    (sortBy !== 'featured' ? 1 : 0);

  const handleResetFilters = () => {
    onSelectCategory('All Items');
    onFilterVegChange('all');
    if (onlyBestsellers) onToggleBestsellers();
    onSortByChange('featured');
    onSearchChange('');
  };

  // Content shared between Desktop persistent sidebar and Mobile slide-out drawer
  const sidebarContent = (
    <div className="flex flex-col h-full space-y-5 text-stone-800">
      
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-stone-900">Filters</h3>
            <p className="text-[11px] text-stone-400">Refine cafe menu</p>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={handleResetFilters}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 1. Dietary Preference (Pure Veg / Non-Veg / All) */}
      <div className="space-y-2">
        <label className="block text-[11px] font-black uppercase tracking-wider text-stone-400">
          Diet Preference
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-2xl">
          <button
            type="button"
            onClick={() => onFilterVegChange('all')}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterVeg === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => onFilterVegChange('veg')}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              filterVeg === 'veg'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
            <span>Veg</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterVegChange('non-veg')}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              filterVeg === 'non-veg'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-300"></span>
            <span>Non-Veg</span>
          </button>
        </div>
      </div>

      {/* 2. Sort Options */}
      <div className="space-y-2">
        <label className="block text-[11px] font-black uppercase tracking-wider text-stone-400">
          Sort By
        </label>
        <div className="space-y-1">
          {[
            { key: 'featured', label: 'Featured & Popular' },
            { key: 'price_low', label: 'Price: Low to High' },
            { key: 'price_high', label: 'Price: High to Low' },
            { key: 'rating', label: 'Top Rated ⭐' },
          ].map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => onSortByChange(s.key as any)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sortBy === s.key
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <span>{s.label}</span>
              {sortBy === s.key && <Check className="w-3.5 h-3.5 text-amber-700" />}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Special Offers & Bestsellers Toggle */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onToggleBestsellers}
          className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
            onlyBestsellers
              ? 'bg-amber-500/10 border-amber-400 text-amber-950 font-black'
              : 'bg-white border-stone-200 text-stone-700 font-bold hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className={`w-4 h-4 ${onlyBestsellers ? 'text-amber-600 fill-amber-500' : 'text-stone-400'}`} />
            <span>Chef's Bestsellers Only</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            onlyBestsellers ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500'
          }`}>
            {onlyBestsellers ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* 4. Menu Categories List */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        <label className="block text-[11px] font-black uppercase tracking-wider text-stone-400">
          Categories
        </label>
        <div className="space-y-1">
          {allCategories.map((cat) => {
            const isSelected =
              selectedCategory === cat ||
              ((selectedCategory === 'All' || selectedCategory === 'All Items') && cat === 'All Items');
            const count =
              cat === 'All Items'
                ? totalItemsCount
                : categoryItemCounts[cat] || 0;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  onSelectCategory(cat);
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#133e2c] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span className="truncate pr-2">{cat}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Top Search & Filter Bar (Replaces the messy double-row pill bar) */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-3 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center gap-2.5">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search coffee, pastries, dishes..."
              className="w-full pl-10 pr-9 py-2.5 bg-stone-100/90 rounded-full text-xs sm:text-sm text-stone-800 placeholder-stone-400 outline-none border border-transparent focus:border-stone-300 focus:bg-white transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Small Sidebar Toggle Button (Opens Slide-out Drawer on Mobile / Compact screens) */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-extrabold border transition-all cursor-pointer whitespace-nowrap shadow-xs active:scale-95 ${
              activeFiltersCount > 0
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-stone-900 text-white border-stone-900 hover:bg-black'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-amber-700 text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

        </div>

        {/* Active Filter Chips (if any active filters) */}
        {activeFiltersCount > 0 && (
          <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto hide-scrollbar pt-2">
            {selectedCategory !== 'All Items' && selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-[#133e2c]/10 text-[#133e2c] border border-[#133e2c]/20 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0">
                Category: {selectedCategory}
                <X
                  className="w-3 h-3 cursor-pointer hover:opacity-75"
                  onClick={() => onSelectCategory('All Items')}
                />
              </span>
            )}

            {filterVeg !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0">
                {filterVeg === 'veg' ? 'Veg Only' : 'Non-Veg'}
                <X
                  className="w-3 h-3 cursor-pointer hover:opacity-75"
                  onClick={() => onFilterVegChange('all')}
                />
              </span>
            )}

            {onlyBestsellers && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0">
                Bestsellers Only
                <X
                  className="w-3 h-3 cursor-pointer hover:opacity-75"
                  onClick={onToggleBestsellers}
                />
              </span>
            )}

            {sortBy !== 'featured' && (
              <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 border border-stone-200 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0">
                Sort: {sortBy.replace('_', ' ')}
                <X
                  className="w-3 h-3 cursor-pointer hover:opacity-75"
                  onClick={() => onSortByChange('featured')}
                />
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-stone-400 hover:text-stone-600 underline shrink-0 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Mobile Slide-Out Filter Sidebar Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          <div className="relative z-10 w-80 max-w-[85%] h-full bg-white p-5 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-200 overflow-y-auto">
            {sidebarContent}
            
            <div className="pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-full py-3 bg-[#133e2c] text-white rounded-xl font-bold text-xs shadow-md cursor-pointer hover:bg-[#0f2e21]"
              >
                Apply Filters & View Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Export the standalone small sidebar for desktop layout
export const DesktopFilterSidebar: React.FC<FilterSidebarProps> = (props) => {
  const {
    categories,
    selectedCategory,
    onSelectCategory,
    filterVeg,
    onFilterVegChange,
    onlyBestsellers,
    onToggleBestsellers,
    sortBy,
    onSortByChange,
    categoryItemCounts = {},
    totalItemsCount = 0,
  } = props;

  const allCategories = ['All Items', ...categories.filter((c) => c !== 'All' && c !== 'All Items')];

  const activeFiltersCount =
    (selectedCategory !== 'All Items' && selectedCategory !== 'All' ? 1 : 0) +
    (filterVeg !== 'all' ? 1 : 0) +
    (onlyBestsellers ? 1 : 0) +
    (sortBy !== 'featured' ? 1 : 0);

  const handleResetFilters = () => {
    onSelectCategory('All Items');
    onFilterVegChange('all');
    if (onlyBestsellers) onToggleBestsellers();
    onSortByChange('featured');
    props.onSearchChange('');
  };

  return (
    <aside className="w-64 shrink-0 bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-5 sticky top-24 self-start">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-stone-900">Filters</h3>
            <p className="text-[11px] text-stone-400">Refine cafe menu</p>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={handleResetFilters}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Diet Filter */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-black uppercase tracking-wider text-stone-400">
          Diet Preference
        </label>
        <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 rounded-2xl">
          <button
            type="button"
            onClick={() => onFilterVegChange('all')}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterVeg === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onFilterVegChange('veg')}
            className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              filterVeg === 'veg'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
            <span>Veg</span>
          </button>
          <button
            type="button"
            onClick={() => onFilterVegChange('non-veg')}
            className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              filterVeg === 'non-veg'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-300"></span>
            <span>Non-Veg</span>
          </button>
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-black uppercase tracking-wider text-stone-400">
          Sort By
        </label>
        <div className="space-y-1">
          {[
            { key: 'featured', label: 'Featured & Popular' },
            { key: 'price_low', label: 'Price: Low to High' },
            { key: 'price_high', label: 'Price: High to Low' },
            { key: 'rating', label: 'Top Rated ⭐' },
          ].map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => onSortByChange(s.key as any)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sortBy === s.key
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <span>{s.label}</span>
              {sortBy === s.key && <Check className="w-3.5 h-3.5 text-amber-700" />}
            </button>
          ))}
        </div>
      </div>

      {/* Offers */}
      <div>
        <button
          type="button"
          onClick={onToggleBestsellers}
          className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
            onlyBestsellers
              ? 'bg-amber-500/10 border-amber-400 text-amber-950 font-black'
              : 'bg-white border-stone-200 text-stone-700 font-bold hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className={`w-3.5 h-3.5 ${onlyBestsellers ? 'text-amber-600 fill-amber-500' : 'text-stone-400'}`} />
            <span>Bestsellers Only</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            onlyBestsellers ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500'
          }`}>
            {onlyBestsellers ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-1.5 pt-1">
        <label className="block text-[11px] font-black uppercase tracking-wider text-stone-400">
          Categories
        </label>
        <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
          {allCategories.map((cat) => {
            const isSelected =
              selectedCategory === cat ||
              ((selectedCategory === 'All' || selectedCategory === 'All Items') && cat === 'All Items');
            const count =
              cat === 'All Items'
                ? totalItemsCount
                : categoryItemCounts[cat] || 0;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#133e2c] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span className="truncate pr-2">{cat}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};