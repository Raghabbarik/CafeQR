import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, Tag, X } from 'lucide-react';

interface CategoryBarProps {
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
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
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
}) => {
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const [isCatPickerOpen, setIsCatPickerOpen] = React.useState(false);

  const allCategories = ['All Items', ...categories.filter(c => c !== 'All' && c !== 'All Items')];

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-2xs pb-2.5 pt-3">
      <div className="max-w-4xl mx-auto px-4 space-y-2.5">
        
        {/* Top Search Bar (full-width rounded search input, arrow completely removed) */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for coffee, food, desserts..."
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

        {/* Filter Pills Row (matches: Filter icon, Sort By, Category, Offers) */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pt-0.5">
          
          {/* Diet Filter Toggle (Sliders icon button) */}
          <button
            onClick={() => {
              if (filterVeg === 'all') onFilterVegChange('veg');
              else if (filterVeg === 'veg') onFilterVegChange('non-veg');
              else onFilterVegChange('all');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
              filterVeg !== 'all'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
            title="Diet filter"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
            <span>{filterVeg === 'veg' ? 'Veg Only' : filterVeg === 'non-veg' ? 'Non-Veg' : 'Filter'}</span>
          </button>

          {/* Sort By Dropdown Pill */}
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                sortBy !== 'featured'
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
              <span>Sort By</span>
            </button>

            {isSortOpen && (
              <div className="absolute left-0 top-9 z-40 bg-white rounded-2xl shadow-xl border border-stone-200 py-1 min-w-[150px] animate-in fade-in duration-150">
                {[
                  { key: 'featured', label: 'Featured' },
                  { key: 'price_low', label: 'Price: Low to High' },
                  { key: 'price_high', label: 'Price: High to Low' },
                  { key: 'rating', label: 'Top Rated ⭐' },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => {
                      onSortByChange(s.key as any);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold cursor-pointer ${
                      sortBy === s.key ? 'bg-amber-50 text-amber-900 font-bold' : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Dropdown Pill */}
          <div className="relative">
            <button
              onClick={() => setIsCatPickerOpen(!isCatPickerOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory !== 'All Items' && selectedCategory !== 'All'
                  ? 'bg-[#133e2c] text-white border-[#133e2c]'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span>{selectedCategory === 'All Items' || selectedCategory === 'All' ? 'Category' : selectedCategory}</span>
              <span className="text-[10px]">⌄</span>
            </button>

            {isCatPickerOpen && (
              <div className="absolute left-0 top-9 z-40 bg-white rounded-2xl shadow-xl border border-stone-200 py-1 min-w-[180px] max-h-60 overflow-y-auto animate-in fade-in duration-150">
                {allCategories.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onSelectCategory(c);
                      setIsCatPickerOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold cursor-pointer ${
                      selectedCategory === c ? 'bg-[#133e2c] text-white font-bold' : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Offers / Bestsellers Pill */}
          <button
            onClick={onToggleBestsellers}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
              onlyBestsellers
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-amber-600" />
            <span>Offers</span>
          </button>
        </div>

        {/* Horizontal Category Badges Bar */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pt-1">
          {allCategories.map((cat) => {
            const isActive = selectedCategory === cat || (cat === 'All Items' && selectedCategory === 'All');
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat === 'All Items' ? 'All' : cat)}
                className={`whitespace-nowrap px-3.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#133e2c] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
