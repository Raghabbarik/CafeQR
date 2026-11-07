import React from 'react';
import { Search, X, Flame } from 'lucide-react';

interface CategoryBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  filterVeg: 'all' | 'veg' | 'non-veg';
  onFilterVegChange: (filter: 'all' | 'veg' | 'non-veg') => void;
  onlyBestsellers: boolean;
  onToggleBestsellers: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearchOpen: boolean;
  onCloseSearch: () => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  filterVeg,
  onFilterVegChange,
  onlyBestsellers,
  onToggleBestsellers,
  searchQuery,
  onSearchChange,
  isSearchOpen,
  onCloseSearch,
}) => {
  const allCategories = ['All', ...categories.filter(c => c !== 'All')];

  return (
    <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs pb-2 pt-2.5">
      <div className="max-w-4xl mx-auto px-4 space-y-2.5">
        {/* Search Input when active */}
        {isSearchOpen && (
          <div className="relative animate-in fade-in duration-200">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search coffee, burgers, pizza, desserts..."
              autoFocus
              className="w-full pl-10 pr-10 py-2.5 bg-stone-100 rounded-xl text-sm text-stone-800 placeholder-stone-400 outline-none border border-transparent focus:border-amber-400 focus:bg-white transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-9 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onCloseSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-800 text-xs font-semibold"
            >
              Done
            </button>
          </div>
        )}

        {/* Horizontal Category Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-0.5">
          {allCategories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-800 text-white shadow-sm scale-102'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Filter Chips Bar (Veg / Non-Veg / Bestseller) */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pt-1">
          {/* Veg / Non-Veg Filter Pills */}
          <div className="inline-flex rounded-lg bg-stone-100 p-0.5 border border-stone-200/80 text-xs font-medium">
            <button
              onClick={() => onFilterVegChange('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterVeg === 'all' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              All Diet
            </button>
            <button
              onClick={() => onFilterVegChange('veg')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                filterVeg === 'veg' ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Veg</span>
            </button>
            <button
              onClick={() => onFilterVegChange('non-veg')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                filterVeg === 'non-veg' ? 'bg-white text-red-800 font-bold shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span>Non-Veg</span>
            </button>
          </div>

          {/* Bestseller Filter Toggle */}
          <button
            onClick={onToggleBestsellers}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              onlyBestsellers
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${onlyBestsellers ? 'text-amber-600 fill-amber-600' : 'text-stone-400'}`} />
            <span>Bestsellers</span>
          </button>
        </div>
      </div>
    </div>
  );
};
