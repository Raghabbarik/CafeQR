import React, { useState } from 'react';
import type { MenuItem } from '../../types';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Search,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface MenuManagerViewProps {
  categories: string[];
  items: MenuItem[];
  onAddItem: (item: Partial<MenuItem>) => Promise<void>;
  onUpdateItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onAddCategory: (name: string) => Promise<void>;
}

export const MenuManagerView: React.FC<MenuManagerViewProps> = ({
  categories,
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddCategory,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // New Category input state
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    category: categories[0] || 'Coffee & Espresso',
    price: 150,
    description: '',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    isBestseller: false,
    prepTime: '5-7 mins',
  });

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCat === 'All' || item.category === selectedCat;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormError(null);
    setFormData({
      name: '',
      category: categories[0] || 'Coffee & Espresso',
      price: 180,
      description: '',
      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80',
      isVeg: true,
      isBestseller: false,
      prepTime: '8-10 mins',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormError(null);
    setFormData({ ...item });
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price === undefined || isSubmitting) return;

    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingItem) {
        await onUpdateItem(editingItem.id, formData);
      } else {
        await onAddItem(formData);
      }
      setIsAddModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      console.error('Error saving menu item:', err);
      setFormError(err.message || 'Failed to save dish. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStock = async (item: MenuItem) => {
    if (togglingId) return;
    setTogglingId(item.id);
    try {
      await onUpdateItem(item.id, { isAvailable: !item.isAvailable });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (deletingId) return;
    if (!window.confirm(`Delete "${item.name}" from menu? This cannot be undone.`)) return;
    setDeletingId(item.id);
    try {
      await onDeleteItem(item.id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || isAddingCat) return;
    setIsAddingCat(true);
    try {
      await onAddCategory(newCatName.trim());
      setNewCatName('');
      setIsAddCatOpen(false);
    } catch (err: any) {
      alert(`Could not create category: ${err.message || 'Error'}`);
    } finally {
      setIsAddingCat(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Add Item, Add Category */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes to manage..."
              className="w-full pl-10 pr-3 py-2 bg-white rounded-xl text-xs text-stone-800 border border-stone-200 shadow-2xs outline-none focus:border-amber-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddCatOpen(true)}
            className="px-3 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs font-bold transition-colors cursor-pointer"
          >
            + Add Category
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
        {['All', ...categories.filter(c => c !== 'All')].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCat === cat
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Table / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col justify-between transition-all ${
              !item.isAvailable ? 'opacity-60 bg-stone-50/80' : ''
            }`}
          >
            <div className="flex gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-xl object-cover border border-stone-200 shrink-0 bg-stone-100"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center ${
                      item.isVeg ? 'border-emerald-600' : 'border-red-600'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 truncate">
                    {item.category}
                  </span>
                </div>

                <h4 className="font-bold text-stone-900 text-sm truncate">{item.name}</h4>
                <p className="font-black text-amber-900 text-sm mt-0.5">₹{item.price}</p>
                <p className="text-[11px] text-stone-500 line-clamp-1 mt-1">{item.description}</p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
              {/* In-Stock Toggle */}
              <button
                type="button"
                onClick={() => handleToggleStock(item)}
                disabled={togglingId === item.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                  item.isAvailable
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-stone-200 text-stone-600 border-stone-300 hover:bg-stone-300'
                }`}
              >
                {togglingId === item.id ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                ) : (
                  <span className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-emerald-600' : 'bg-stone-500'}`} />
                )}
                <span>{item.isAvailable ? 'In Stock' : 'Sold Out'}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                  title="Edit Dish"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={deletingId === item.id}
                  onClick={() => handleDeleteItem(item)}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  title="Delete Dish"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Dish Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-stone-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-stone-900 mb-4">
              {editingItem ? 'Edit Dish Details' : 'Add New Dish to Menu'}
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Hazelnut Mocha Frappe"
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingredients, flavors, notes..."
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Photo URL</label>
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Prep Time</label>
                  <input
                    type="text"
                    value={formData.prepTime || ''}
                    onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                    placeholder="e.g. 5-7 mins"
                    className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600"
                  />
                </div>

                <div className="flex flex-col justify-end gap-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                    <input
                      type="checkbox"
                      checked={formData.isVeg}
                      onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                      className="rounded accent-emerald-600 w-4 h-4"
                    />
                    <span>Vegetarian (Veg)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                    <input
                      type="checkbox"
                      checked={formData.isBestseller}
                      onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                      className="rounded accent-amber-600 w-4 h-4"
                    />
                    <span>Mark as Bestseller</span>
                  </label>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Menu...</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Save Changes' : 'Add Dish to Menu'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddCatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-stone-200">
            <button
              onClick={() => setIsAddCatOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-stone-900 mb-3">Add Menu Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Mocktails & Coolers"
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 outline-none text-xs"
              />
              <button
                type="submit"
                disabled={isAddingCat}
                className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAddingCat ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Category</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
