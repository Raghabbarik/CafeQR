import { useState, useEffect } from 'react';
import type { CafeInfo, MenuItem, CartItem, Order, StaffAlert, OrderStatus } from './types';
import { api } from './services/api';
import { socket } from './services/socket';
import { sound } from './services/sound';

// Customer Components
import { WelcomeHero } from './components/customer/WelcomeHero';
import { Navbar } from './components/customer/Navbar';
import { CategoryBar } from './components/customer/CategoryBar';
import { MenuItemCard } from './components/customer/MenuItemCard';
import { ProductDetailsModal } from './components/customer/ProductDetailsModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CustomerCheckoutModal } from './components/customer/CustomerCheckoutModal';
import { RazorpaySimulatorModal } from './components/customer/RazorpaySimulatorModal';
import { BillReceiptView } from './components/customer/BillReceiptView';
import { CallWaiterModal } from './components/customer/CallWaiterModal';

// Admin Components
import { AdminHeader } from './components/admin/AdminHeader';
import { LiveKDSView } from './components/admin/LiveKDSView';
import { MenuManagerView } from './components/admin/MenuManagerView';
import { TableQRGenerator } from './components/admin/TableQRGenerator';
import { CafeSettingsView } from './components/admin/CafeSettingsView';

import { Loader2 } from 'lucide-react';

export function App() {
  // App Mode: 'customer' or 'admin'
  const [mode, setMode] = useState<'customer' | 'admin'>('customer');

  // Customer Step: 'welcome' | 'menu' | 'bill'
  const [customerStep, setCustomerStep] = useState<'welcome' | 'menu' | 'bill'>('welcome');

  // Cafe data
  const [cafe, setCafe] = useState<CafeInfo | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Table number from URL query (e.g. ?table=3) or default to 1
  const [tableNumber, setTableNumber] = useState<string>('1');

  // Cart & Checkout state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // Modals & Panels
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);

  // Filters, Sort & Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterVeg, setFilterVeg] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [onlyBestsellers, setOnlyBestsellers] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');

  // Admin State
  const [adminTab, setAdminTab] = useState<'orders' | 'menu' | 'tables' | 'settings'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [alerts, setAlerts] = useState<StaffAlert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Loading
  const [isLoading, setIsLoading] = useState(true);

  // 1. Read table from URL and check if initial path is /admin or #admin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tbl = params.get('table');
      if (tbl) setTableNumber(tbl);

      if (window.location.pathname.includes('/admin') || window.location.hash.includes('admin')) {
        setMode('admin');
      }
    }
  }, []);

  // 2. Fetch Initial Cafe & Menu Data
  useEffect(() => {
    async function initData() {
      try {
        const cafeRes = await api.getCafe();
        setCafe(cafeRes.cafe);
        setCategories(cafeRes.categories);

        const menuRes = await api.getMenu();
        setMenuItems(menuRes.items);

        const ordersRes = await api.getOrders();
        setOrders(ordersRes);
      } catch (err) {
        console.error('Failed to load cafe data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, []);

  // 3. Setup Real-time WebSockets
  useEffect(() => {
    socket.on('order:new', (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev]);
      if (soundEnabled) {
        sound.playOrderBell();
      }
    });

    socket.on('order:updated', (updatedOrder: Order) => {
      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
      
      // Update customer view in real-time if tracking this order
      setCurrentOrder((prev) => {
        if (prev && prev.id === updatedOrder.id) {
          if (soundEnabled) {
            sound.playStatusChime();
          }
          return updatedOrder;
        }
        return prev;
      });
    });

    socket.on('staff:alert', (alert: StaffAlert) => {
      setAlerts((prev) => [alert, ...prev]);
      if (soundEnabled) {
        sound.playOrderBell();
      }
    });

    socket.on('menu:updated', (data: { categories: string[]; items: MenuItem[] }) => {
      if (data.categories) setCategories(data.categories);
      if (data.items) setMenuItems(data.items);
    });

    socket.on('cafe:updated', (updatedCafe: CafeInfo) => {
      setCafe(updatedCafe);
    });

    return () => {
      socket.off('order:new');
      socket.off('order:updated');
      socket.off('staff:alert');
      socket.off('menu:updated');
      socket.off('cafe:updated');
    };
  }, [soundEnabled]);

  // Cart operations
  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleAddToCartWithQty = (item: MenuItem, qty: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: qty } : i));
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const handleRemoveFromCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (!existing) return prev;
      if (existing.quantity === 1) {
        return prev.filter((i) => i.id !== item.id);
      }
      return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i));
    });
  };

  const getItemQuantity = (id: string) => {
    const found = cart.find((i) => i.id === id);
    return found ? found.quantity : 0;
  };

  const totalCartItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartSubtotal = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const cartTax = cafe ? Math.round((cartSubtotal * (cafe.taxRate || 5)) / 100) : 0;
  const cartTotal = cartSubtotal + cartTax;

  // Checkout flow
  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const handleOpenRazorpay = () => {
    setIsCheckoutModalOpen(false);
    setIsRazorpayModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    setIsRazorpayModalOpen(false);

    try {
      const orderPayload = {
        tableNumber,
        customerName,
        customerPhone,
        items: cart.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          isVeg: i.isVeg,
        })),
        notes,
        paymentMethod: 'Razorpay',
        paymentId,
      };

      const created = await api.createOrder(orderPayload);
      setCurrentOrder(created);
      setCart([]);
      setNotes('');
      setCustomerStep('bill');
    } catch (err) {
      console.error('Order creation error:', err);
      alert('Order failed to record, please check network');
    }
  };

  // Admin order status update
  const handleUpdateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(id, status);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Admin menu operations
  const handleAddMenuItem = async (item: Partial<MenuItem>) => {
    await api.addMenuItem(item);
  };

  const handleUpdateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    await api.updateMenuItem(id, updates);
  };

  const handleDeleteMenuItem = async (id: string) => {
    await api.deleteMenuItem(id);
  };

  const handleAddCategory = async (name: string) => {
    await api.addCategory(name);
  };

  const handleUpdateCafeSettings = async (updates: Partial<CafeInfo>) => {
    await api.updateCafe(updates);
  };

  if (isLoading || !cafe) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-amber-700 animate-spin mb-3" />
        <p className="font-bold text-stone-700 text-sm">Preparing your Cafe Menu...</p>
      </div>
    );
  }

  // ---------------- ADMIN / CAFE STAFF VIEW ----------------
  if (mode === 'admin') {
    const activeOrdersCount = orders.filter(
      (o) => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled'
    ).length;

    return (
      <div className="min-h-screen bg-stone-100 flex flex-col">
        <AdminHeader
          cafe={cafe}
          activeTab={adminTab}
          onTabChange={setAdminTab}
          activeOrdersCount={activeOrdersCount}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onExitAdmin={() => setMode('customer')}
        />

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
          {adminTab === 'orders' && (
            <LiveKDSView
              orders={orders}
              alerts={alerts}
              onDismissAlert={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}

          {adminTab === 'menu' && (
            <MenuManagerView
              categories={categories}
              items={menuItems}
              onAddItem={handleAddMenuItem}
              onUpdateItem={handleUpdateMenuItem}
              onDeleteItem={handleDeleteMenuItem}
              onAddCategory={handleAddCategory}
            />
          )}

          {adminTab === 'tables' && (
            <TableQRGenerator
              cafe={cafe}
              onSelectTableForTest={(tbl) => {
                setTableNumber(tbl);
                setMode('customer');
                setCustomerStep('welcome');
              }}
              onUpdateTablesCount={async (count) => {
                await api.updateCafe({ tablesCount: count });
              }}
            />
          )}

          {adminTab === 'settings' && (
            <CafeSettingsView cafe={cafe} onSave={handleUpdateCafeSettings} />
          )}
        </main>
      </div>
    );
  }

  // ---------------- CUSTOMER VIEW: STEP 1 (WELCOME) ----------------
  if (customerStep === 'welcome') {
    return (
      <WelcomeHero
        cafe={cafe}
        tableNumber={tableNumber}
        onTableChange={setTableNumber}
        onGetStarted={() => setCustomerStep('menu')}
        onSwitchToAdmin={() => setMode('admin')}
      />
    );
  }

  // ---------------- CUSTOMER VIEW: STEP 3 (BILL & STATUS TRACKER) ----------------
  if (customerStep === 'bill' && currentOrder) {
    return (
      <BillReceiptView
        order={currentOrder}
        cafe={cafe}
        onOrderMore={() => setCustomerStep('menu')}
      />
    );
  }

  // ---------------- CUSTOMER VIEW: STEP 2 (MENU BROWSING) ----------------
  const filteredMenuItems = (() => {
    const list = menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        selectedCategory === 'All Items' ||
        item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVeg =
        filterVeg === 'all' ? true : filterVeg === 'veg' ? item.isVeg : !item.isVeg;
      const matchesBestseller = onlyBestsellers ? item.isBestseller : true;

      return matchesCategory && matchesSearch && matchesVeg && matchesBestseller;
    });

    if (sortBy === 'price_low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  })();

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-28">
      {/* Sticky Top Navbar */}
      <Navbar
        cafe={cafe}
        tableNumber={tableNumber}
        totalCartItems={totalCartItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWaiter={() => setIsWaiterModalOpen(true)}
        onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
        isSearchOpen={isSearchOpen}
        onGoBackWelcome={() => setCustomerStep('welcome')}
        onSwitchToAdmin={() => setMode('admin')}
      />

      {/* Top Search & Filter Bar (matches mock) */}
      <CategoryBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        filterVeg={filterVeg}
        onFilterVegChange={setFilterVeg}
        onlyBestsellers={onlyBestsellers}
        onToggleBestsellers={() => setOnlyBestsellers(!onlyBestsellers)}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onGoBackWelcome={() => setCustomerStep('welcome')}
      />

      {/* Menu Item 2-Column Responsive Grid (matches mock right screen) */}
      <main className="max-w-4xl mx-auto px-4 py-4 space-y-3.5">
        
        {/* Section Header */}
        <div className="flex items-center justify-between pb-1 pt-1">
          <div>
            <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
              {selectedCategory === 'All' || selectedCategory === 'All Items' ? 'Fresh Items' : selectedCategory}
            </h2>
            <p className="text-[11px] text-stone-400">
              {filteredMenuItems.length} item{filteredMenuItems.length === 1 ? '' : 's'} available
            </p>
          </div>

          <button
            onClick={() => setSelectedCategory('All')}
            className={`text-xs font-bold transition-colors cursor-pointer ${
              selectedCategory !== 'All' && selectedCategory !== 'All Items'
                ? 'text-[#133e2c] hover:underline'
                : 'text-stone-400'
            }`}
          >
            See All
          </button>
        </div>

        {/* 2-Column Product Cards Grid */}
        {filteredMenuItems.length === 0 ? (
          <div className="py-16 text-center text-stone-400 space-y-2">
            <p className="font-bold text-stone-600 text-sm">No items found</p>
            <p className="text-xs text-stone-400">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {filteredMenuItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                quantity={getItemQuantity(item.id)}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onOpenDetails={(item) => setSelectedProduct(item)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Product Details Sheet / Modal (matches mock left screen) */}
      <ProductDetailsModal
        item={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        currentCartQty={selectedProduct ? getItemQuantity(selectedProduct.id) : 0}
        onAddToCart={handleAddToCartWithQty}
        onOpenSearch={() => {
          setSelectedProduct(null);
          setIsSearchOpen(true);
        }}
      />

      {/* Floating Bottom Cart Bar */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 animate-in slide-in-from-bottom-4 duration-200">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-900 hover:to-amber-950 text-white rounded-2xl p-4 shadow-xl shadow-amber-950/30 flex items-center justify-between active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-extrabold text-sm">
                {totalCartItems}
              </div>
              <div className="text-left leading-tight">
                <p className="font-extrabold text-sm">View Cart</p>
                <p className="text-[11px] text-amber-200">Table #{tableNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-black text-base">₹{cartTotal}</span>
              <span className="text-xs bg-white/25 px-2.5 py-1 rounded-lg font-bold">
                Checkout →
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        cafe={cafe}
        tableNumber={tableNumber}
        notes={notes}
        onNotesChange={setNotes}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={() => setCart([])}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Customer Info Modal (Asks Name & Phone Number) */}
      <CustomerCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        totalAmount={cartTotal}
        tableNumber={tableNumber}
        customerName={customerName}
        customerPhone={customerPhone}
        onNameChange={setCustomerName}
        onPhoneChange={setCustomerPhone}
        onProceedToRazorpay={handleOpenRazorpay}
      />

      {/* Razorpay Payment Simulator / Gateway Modal */}
      <RazorpaySimulatorModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        cafe={cafe}
        amount={cartTotal}
        customerName={customerName}
        customerPhone={customerPhone}
        tableNumber={tableNumber}
        onSuccess={handlePaymentSuccess}
      />

      {/* Call Waiter / Assistance Modal */}
      <CallWaiterModal
        isOpen={isWaiterModalOpen}
        onClose={() => setIsWaiterModalOpen(false)}
        tableNumber={tableNumber}
      />
    </div>
  );
}

export default App;
