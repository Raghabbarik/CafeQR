import { useState, useEffect } from 'react';
import type { CafeInfo, MenuItem, CartItem, Order, StaffAlert, OrderStatus, StaffMember, DiningOption } from './types';
import { api } from './services/api';
import { socket } from './services/socket';
import { sound } from './services/sound';

// Customer Components
import { WelcomeHero } from './components/customer/WelcomeHero';
import { Navbar } from './components/customer/Navbar';
import { FilterSidebar, DesktopFilterSidebar } from './components/customer/FilterSidebar';
import { MenuItemCard } from './components/customer/MenuItemCard';
import { ProductDetailsModal } from './components/customer/ProductDetailsModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CustomerCheckoutModal } from './components/customer/CustomerCheckoutModal';
import { BillReceiptView } from './components/customer/BillReceiptView';
import { BillLookupModal } from './components/customer/BillLookupModal';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginView } from './components/admin/AdminLoginView';
import type { AdminTab } from './components/admin/AdminSidebar';

// Staff & TV Display Components
import { StaffLoginView } from './components/staff/StaffLoginView';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { OrderDisplayBoard } from './components/display/OrderDisplayBoard';

// Initial resilient fallback data (eliminates blocking loading screens on Vercel)
import { DEFAULT_CAFE, DEFAULT_CATEGORIES, DEFAULT_MENU_ITEMS } from './data/initialMenuData';

import { WifiOff } from 'lucide-react';

export function App() {
  // App Mode: 'customer' | 'admin' | 'staff' | 'display'
  const [mode, setMode] = useState<'customer' | 'admin' | 'staff' | 'display'>('customer');

  // Online / Offline connectivity tracker
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  // Admin JWT Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Staff JWT Authentication State
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean>(false);
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);

  // Customer Step: 'welcome' | 'menu' | 'bill'
  const [customerStep, setCustomerStep] = useState<'welcome' | 'menu' | 'bill'>('welcome');

  // Dining option: 'dine_in' (Eat Now) or 'parcel' (Takeaway)
  const [diningOption, setDiningOption] = useState<DiningOption>('dine_in');

  // Cafe data (Instant ready-to-render defaults; updates live from API)
  const [cafe, setCafe] = useState<CafeInfo>(() => {
    const baseHero = DEFAULT_CAFE.hero || {
      badge: 'NEW',
      title: 'ICED\nMATCHA\nLATTE',
      cardTitle: 'Welcome Back',
      cardSubtitle: 'Explore our Fall menu',
      buttonText: 'Order Now',
    };

    try {
      // Clear legacy hardcoded cover image if stored
      const legacyCover = localStorage.getItem('cafeqr_hero_cover');
      if (legacyCover && legacyCover.includes('536256263959')) {
        localStorage.removeItem('cafeqr_hero_cover');
      }

      const cachedCover = localStorage.getItem('cafeqr_admin_cover_image') || localStorage.getItem('cafeqr_hero_cover');
      if (cachedCover && !cachedCover.includes('536256263959')) {
        return {
          ...DEFAULT_CAFE,
          coverImage: cachedCover,
          hero: { ...baseHero, coverImage: cachedCover },
        };
      }
    } catch {}
    return {
      ...DEFAULT_CAFE,
      coverImage: '',
      hero: { ...baseHero, coverImage: '' },
    };
  });
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('cafeqr_cached_menu');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.categories) && parsed.categories.length) {
          return parsed.categories;
        }
      }
    } catch {}
    return DEFAULT_CATEGORIES;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const cached = localStorage.getItem('cafeqr_cached_menu');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.items) && parsed.items.length) {
          return parsed.items;
        }
      }
    } catch {}
    return DEFAULT_MENU_ITEMS;
  });

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
  const [isBillLookupOpen, setIsBillLookupOpen] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  // Filters, Sort & Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterVeg, setFilterVeg] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [onlyBestsellers, setOnlyBestsellers] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');

  // Admin State
  const [adminTab, setAdminTab] = useState<AdminTab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [alerts, setAlerts] = useState<StaffAlert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Navigation helpers for /admin, /staff, /orderdisplay routing
  const navigateToAdmin = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/admin');
    }
    setMode('admin');
  };

  const navigateToStaff = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/staff');
    }
    setMode('staff');
  };

  const navigateToCustomer = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
    setMode('customer');
  };

  const handleAdminLogout = () => {
    api.logoutAdmin();
    setIsAdminAuthenticated(false);
  };

  const handleStaffLogout = () => {
    api.logoutStaff();
    setIsStaffAuthenticated(false);
    setCurrentStaff(null);
  };

  // 1. Network connectivity, routes (/admin, /staff, /orderdisplay), and JWT token verification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Check if user had an active order before reload
      const savedOrderId = sessionStorage.getItem('cafeqr_active_order_id');
      if (savedOrderId) {
        api.getOrder(savedOrderId)
          .then((ord) => {
            if (ord) setCurrentOrder(ord);
          })
          .catch(() => {});
      }

      const syncRouteFromLocation = () => {
        const path = window.location.pathname.toLowerCase();
        const hash = window.location.hash.toLowerCase();

        if (path.startsWith('/admin') || hash.includes('admin')) {
          setMode('admin');
        } else if (path.startsWith('/staff') || hash.includes('staff')) {
          setMode('staff');
        } else if (path.startsWith('/orderdisplay') || hash.includes('orderdisplay')) {
          setMode('display');
        } else {
          setMode('customer');
        }
      };

      window.addEventListener('popstate', syncRouteFromLocation);
      syncRouteFromLocation();

      // Check existing Admin JWT Token in localStorage
      const adminToken = api.getAdminToken();
      if (adminToken) {
        api.verifyAdminToken(adminToken).then((res) => {
          setIsAdminAuthenticated(res.valid);
        });
      }

      // Check existing Staff JWT Token in localStorage
      const staffToken = api.getStaffToken();
      if (staffToken) {
        api.verifyStaffToken(staffToken).then((res) => {
          if (res.valid && res.staff) {
            setIsStaffAuthenticated(true);
            setCurrentStaff(res.staff);
          }
        });
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('popstate', syncRouteFromLocation);
      };
    }
  }, []);

  // 2. Fetch Initial Cafe & Menu Data in Parallel (High-speed concurrent sync; never blocks screen)
  useEffect(() => {
    async function initData() {
      try {
        const [cafeRes, menuRes, ordersRes] = await Promise.all([
          api.getCafe().catch(() => null),
          api.getMenu().catch(() => null),
          mode === 'admin' || mode === 'staff' ? api.getOrders().catch(() => []) : Promise.resolve([]),
        ]);

        if (cafeRes && cafeRes.cafe) {
          const freshCafe = cafeRes.cafe;
          const freshCover = freshCafe.hero?.coverImage || freshCafe.coverImage || '';
          try {
            if (freshCover && !freshCover.includes('536256263959')) {
              localStorage.setItem('cafeqr_admin_cover_image', freshCover);
              localStorage.setItem('cafeqr_hero_cover', freshCover);
            } else {
              localStorage.removeItem('cafeqr_admin_cover_image');
              localStorage.removeItem('cafeqr_hero_cover');
            }
          } catch {}
          setCafe(freshCafe);
          if (Array.isArray(cafeRes.categories) && cafeRes.categories.length) {
            setCategories(cafeRes.categories);
          }
        }

        if (menuRes && Array.isArray(menuRes.items) && menuRes.items.length) {
          setMenuItems(menuRes.items);
          if (Array.isArray(menuRes.categories) && menuRes.categories.length) {
            setCategories(menuRes.categories);
          }
          try {
            localStorage.setItem('cafeqr_cached_menu', JSON.stringify({
              categories: menuRes.categories || [],
              items: menuRes.items,
            }));
          } catch {}
        }

        if (Array.isArray(ordersRes) && ordersRes.length) {
          setOrders(ordersRes);
        }
      } catch (err) {
        console.warn('Initial cloud sync notice (using cached/fallback menu):', err);
      }
    }
    initData();
  }, [mode]);

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
      if (data.items) {
        setMenuItems(data.items);
        try {
          localStorage.setItem('cafeqr_cached_menu', JSON.stringify({
            categories: data.categories || [],
            items: data.items,
          }));
        } catch {}
      }
    });

    socket.on('cafe:updated', (updatedCafe: CafeInfo) => {
      const cover = updatedCafe?.hero?.coverImage || updatedCafe?.coverImage || '';
      try {
        if (cover && !cover.includes('536256263959')) {
          localStorage.setItem('cafeqr_admin_cover_image', cover);
          localStorage.setItem('cafeqr_hero_cover', cover);
        } else {
          localStorage.removeItem('cafeqr_admin_cover_image');
          localStorage.removeItem('cafeqr_hero_cover');
        }
      } catch {}
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

  // 4. Background polling fallback for Vercel Serverless (when WebSockets are disconnected)
  useEffect(() => {
    const pollTimer = setInterval(() => {
      if (!socket.connected) {
        if (mode === 'admin' || mode === 'staff') {
          api.getOrders().then(setOrders).catch(() => {});
        }
        if (currentOrder && currentOrder.orderStatus !== 'completed' && currentOrder.orderStatus !== 'cancelled') {
          api.getOrder(currentOrder.id)
            .then((fresh) => {
              if (fresh && fresh.orderStatus !== currentOrder.orderStatus) {
                if (soundEnabled) sound.playStatusChime();
                setCurrentOrder(fresh);
              }
            })
            .catch(() => {});
        }
      }
    }, 5000);

    return () => clearInterval(pollTimer);
  }, [mode, currentOrder, soundEnabled]);

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

  // Dynamic helper to ensure Razorpay official checkout SDK is loaded in DOM
  const loadRazorpaySDK = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        setTimeout(() => {
          if ((window as any).Razorpay) resolve(true);
        }, 500);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleOpenRazorpay = async () => {
    try {
      setIsPaymentLoading(true);

      // Ensure SDK is ready
      const isLoaded = await loadRazorpaySDK();
      if (!isLoaded || !(window as any).Razorpay) {
        const confirmPlace = window.confirm(
          'Could not load the online payment gateway (network or ad-blocker detected).\n\nWould you like to confirm the order and pay via UPI / Cash at the counter?'
        );
        if (confirmPlace) {
          setIsCheckoutModalOpen(false);
          await handlePaymentSuccess(`counter_${Date.now()}`);
        }
        setIsPaymentLoading(false);
        return;
      }

      // 1. Create order on backend (fail-safe fallback prevents "Failed to fetch")
      const rzpOrder = await api.createRazorpayOrder(cartTotal);
      console.log('✅ Razorpay order prepared:', rzpOrder);

      // Close guest modal
      setIsCheckoutModalOpen(false);

      // Only pass order_id if it's a real order id from Razorpay API
      const hasRealOrderId = rzpOrder.isReal && rzpOrder.id && !rzpOrder.id.startsWith('order_rzp_');

      // 2. Open official Razorpay Checkout popup directly
      const options: any = {
        key: rzpOrder.keyId || cafe?.razorpayKeyId || 'rzp_test_TxJ87ji7k95ncJ',
        amount: rzpOrder.amount, // in paise
        currency: rzpOrder.currency || 'INR',
        name: cafe?.name || 'The Roasted Bean Cafe',
        description: `${diningOption === 'parcel' ? 'Parcel Takeaway' : 'Eat in Cafe'} - Order Total: ₹${cartTotal}`,
        image: cafe?.logo || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=80',
        order_id: hasRealOrderId ? rzpOrder.id : undefined,
        prefill: {
          name: customerName.trim() || 'Guest',
          contact: customerPhone.replace(/\D/g, '').slice(-10) || '9876543210',
        },
        theme: {
          color: '#133e2c',
        },
        handler: async function (response: any) {
          console.log('✅ Official Razorpay payment succeeded:', response);
          try {
            const verifyRes = await api.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await handlePaymentSuccess(verifyRes.paymentId || response.razorpay_payment_id);
          } catch {
            await handlePaymentSuccess(response.razorpay_payment_id || `pay_${Date.now()}`);
          }
        },
        modal: {
          ondismiss: function () {
            setIsPaymentLoading(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        console.warn('Razorpay payment failed:', resp);
        const desc = resp.error?.description || resp.error?.reason || 'Transaction was declined or cancelled.';
        alert(`Payment Not Completed: ${desc}\n\nTip: In Razorpay Test Mode, select "Success" to simulate a completed payment.`);
        setIsPaymentLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Razorpay initiation error:', err);
      const confirmPlace = window.confirm(
        `Payment could not be completed (${err.message || 'Connection issue'}).\n\nWould you like to confirm this order and pay via UPI / Cash at the counter?`
      );
      if (confirmPlace) {
        await handlePaymentSuccess(`counter_${Date.now()}`);
      }
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      const orderPayload = {
        diningOption,
        tableNumber: diningOption === 'parcel' ? 'Parcel' : 'Eat Now',
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
      sessionStorage.setItem('cafeqr_active_order_id', created.id);
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

  // Admin / Staff menu operations (instant local update + persistent cloud save)
  const handleAddMenuItem = async (item: Partial<MenuItem>) => {
    try {
      const newItem = await api.addMenuItem(item);
      // Immediately reflect in UI for admin, staff, and customer menus
      setMenuItems((prev) => {
        const without = prev.filter((i) => i.id !== newItem.id);
        return [newItem, ...without];
      });
      if (newItem.category && !categories.includes(newItem.category)) {
        setCategories((prev) => [...prev, newItem.category]);
      }
      // Re-sync with cloud database in background
      api.getMenu().then((fresh) => {
        if (fresh?.items && Array.isArray(fresh.items) && fresh.items.length) {
          setMenuItems(fresh.items);
        }
        if (fresh?.categories && Array.isArray(fresh.categories) && fresh.categories.length) {
          setCategories(fresh.categories);
        }
      }).catch((err) => console.warn('Background menu sync notice:', err));
    } catch (err: any) {
      console.error('Failed to add menu item:', err);
      alert(`Could not add dish: ${err.message || 'Server error'}`);
      throw err;
    }
  };

  const handleUpdateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      // Optimistically update UI immediately
      setMenuItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
      if (updates.category && !categories.includes(updates.category)) {
        setCategories((prev) => [...prev, updates.category!]);
      }
      await api.updateMenuItem(id, updates);
      // Re-sync with cloud database
      api.getMenu().then((fresh) => {
        if (fresh?.items && Array.isArray(fresh.items) && fresh.items.length) {
          setMenuItems(fresh.items);
        }
      }).catch((err) => console.warn('Background menu sync notice:', err));
    } catch (err: any) {
      console.error('Failed to update menu item:', err);
      alert(`Could not save dish changes: ${err.message || 'Server error'}`);
      throw err;
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      // Optimistically remove from UI immediately
      setMenuItems((prev) => prev.filter((item) => item.id !== id));
      await api.deleteMenuItem(id);
      // Re-sync with cloud database
      api.getMenu().then((fresh) => {
        if (fresh?.items && Array.isArray(fresh.items)) {
          setMenuItems(fresh.items);
        }
      }).catch((err) => console.warn('Background menu sync notice:', err));
    } catch (err: any) {
      console.error('Failed to delete menu item:', err);
      alert(`Could not delete dish: ${err.message || 'Server error'}`);
      throw err;
    }
  };

  const handleAddCategory = async (name: string) => {
    try {
      const clean = name.trim();
      setCategories((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
      const res = await api.addCategory(clean);
      if (res?.categories && Array.isArray(res.categories)) {
        setCategories(res.categories);
      }
    } catch (err: any) {
      console.error('Failed to add category:', err);
      alert(`Could not add category: ${err.message || 'Server error'}`);
      throw err;
    }
  };

  const handleUpdateCafeSettings = async (updates: Partial<CafeInfo>) => {
    try {
      const newCover = updates.hero?.coverImage !== undefined ? updates.hero.coverImage : updates.coverImage;
      if (newCover !== undefined) {
        try {
          if (newCover && !newCover.includes('536256263959')) {
            localStorage.setItem('cafeqr_admin_cover_image', newCover);
            localStorage.setItem('cafeqr_hero_cover', newCover);
          } else {
            localStorage.removeItem('cafeqr_admin_cover_image');
            localStorage.removeItem('cafeqr_hero_cover');
          }
        } catch {}
      }
      setCafe((prev) => ({ ...prev, ...updates }));
      const res = await api.updateCafe(updates);
      if (res?.cafe) {
        setCafe(res.cafe);
        const savedCover = res.cafe.hero?.coverImage || res.cafe.coverImage || '';
        try {
          if (savedCover && !savedCover.includes('536256263959')) {
            localStorage.setItem('cafeqr_admin_cover_image', savedCover);
            localStorage.setItem('cafeqr_hero_cover', savedCover);
          } else {
            localStorage.removeItem('cafeqr_admin_cover_image');
            localStorage.removeItem('cafeqr_hero_cover');
          }
        } catch {}
      }
    } catch (err: any) {
      console.error('Failed to update cafe settings:', err);
      alert(`Could not save cafe settings: ${err.message || 'Server error'}`);
      throw err;
    }
  };

  // ---------------- TV ORDER DISPLAY BOARD (/orderdisplay) ----------------
  if (mode === 'display') {
    return (
      <OrderDisplayBoard
        cafe={cafe}
        onExitToCustomer={navigateToCustomer}
      />
    );
  }

  // ---------------- STAFF PORTAL (/staff) ----------------
  if (mode === 'staff') {
    if (!isStaffAuthenticated) {
      return (
        <StaffLoginView
          cafe={cafe}
          onLoginSuccess={(staff) => {
            setIsStaffAuthenticated(true);
            setCurrentStaff(staff);
          }}
          onExitToCustomer={navigateToCustomer}
          onGoToAdmin={navigateToAdmin}
        />
      );
    }

    return (
      <StaffDashboard
        cafe={cafe}
        currentStaff={currentStaff}
        orders={orders}
        alerts={alerts}
        categories={categories}
        menuItems={menuItems}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onExitStaff={navigateToCustomer}
        onLogout={handleStaffLogout}
        onDismissAlert={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onAddItem={handleAddMenuItem}
        onUpdateItem={handleUpdateMenuItem}
        onDeleteItem={handleDeleteMenuItem}
        onAddCategory={handleAddCategory}
      />
    );
  }

  // ---------------- ADMIN / CAFE MANAGER VIEW (/admin) ----------------
  if (mode === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <AdminLoginView
          cafe={cafe}
          onLoginSuccess={() => {
            setIsAdminAuthenticated(true);
          }}
          onExitToCustomer={navigateToCustomer}
          onGoToStaff={navigateToStaff}
        />
      );
    }

    return (
      <AdminDashboard
        cafe={cafe}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        orders={orders}
        alerts={alerts}
        categories={categories}
        menuItems={menuItems}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onExitAdmin={navigateToCustomer}
        onLogout={handleAdminLogout}
        onDismissAlert={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onAddItem={handleAddMenuItem}
        onUpdateItem={handleUpdateMenuItem}
        onDeleteItem={handleDeleteMenuItem}
        onAddCategory={handleAddCategory}
        onUpdateCafeSettings={handleUpdateCafeSettings}
      />
    );
  }

  // Customer Selects a Past Order from Lookup Modal
  const handleSelectLookupOrder = (order: Order) => {
    setCurrentOrder(order);
    sessionStorage.setItem('cafeqr_active_order_id', order.id);
    setCustomerStep('bill');
    setIsBillLookupOpen(false);
  };

  // ---------------- CUSTOMER VIEW: STEP 1 (WELCOME) ----------------
  if (customerStep === 'welcome') {
    return (
      <>
        {!isOnline && (
          <div className="bg-amber-600 text-white text-xs font-bold text-center py-2 px-4 sticky top-0 z-50 flex items-center justify-center gap-2 shadow-md">
            <WifiOff className="w-3.5 h-3.5 animate-pulse" />
            <span>Offline Mode: Internet disconnected. Menu items are loaded from local cache.</span>
          </div>
        )}
        <WelcomeHero
          cafe={cafe}
          onGetStarted={() => setCustomerStep('menu')}
          onCheckBill={() => setIsBillLookupOpen(true)}
        />
        <BillLookupModal
          isOpen={isBillLookupOpen}
          onClose={() => setIsBillLookupOpen(false)}
          onSelectOrder={handleSelectLookupOrder}
          currentOrder={currentOrder}
          initialPhone={customerPhone}
          initialName={customerName}
        />
      </>
    );
  }

  // ---------------- CUSTOMER VIEW: STEP 3 (BILL & STATUS TRACKER) ----------------
  if (customerStep === 'bill' && currentOrder) {
    return (
      <>
        <BillReceiptView
          order={currentOrder}
          cafe={cafe}
          onOrderMore={() => setCustomerStep('menu')}
          onLookupBills={() => setIsBillLookupOpen(true)}
        />
        <BillLookupModal
          isOpen={isBillLookupOpen}
          onClose={() => setIsBillLookupOpen(false)}
          onSelectOrder={handleSelectLookupOrder}
          currentOrder={currentOrder}
          initialPhone={customerPhone}
          initialName={customerName}
        />
      </>
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

  const categoryItemCounts = menuItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-28">
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-bold text-center py-2 px-4 sticky top-0 z-50 flex items-center justify-center gap-2 shadow-md">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>Offline Mode: Internet disconnected. Menu items are loaded from local cache.</span>
        </div>
      )}
      {/* Sticky Top Navbar */}
      <Navbar
        cafe={cafe}
        totalCartItems={totalCartItems}
        onBackToHome={() => setCustomerStep('welcome')}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenBill={() => {
          if (currentOrder) {
            setCustomerStep('bill');
          } else {
            setIsBillLookupOpen(true);
          }
        }}
        hasActiveOrder={Boolean(currentOrder)}
        onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
        isSearchOpen={isSearchOpen}
      />

      {/* Top Search & Filter Bar (with mobile slide-out drawer) */}
      <FilterSidebar
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
        categoryItemCounts={categoryItemCounts}
        totalItemsCount={menuItems.length}
      />

      {/* Main Layout: Small Sidebar on Desktop + Menu Products Grid */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col lg:flex-row items-start gap-6">
        
        {/* Desktop Small Filter Sidebar */}
        <div className="hidden lg:block">
          <DesktopFilterSidebar
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
            categoryItemCounts={categoryItemCounts}
            totalItemsCount={menuItems.length}
          />
        </div>

        {/* Products Column */}
        <div className="flex-1 min-w-0 w-full space-y-3.5">
          {/* Active Order Tracker Pill (If customer placed an order & is ordering more) */}
          {currentOrder && (
            <div>
              <div
                onClick={() => setCustomerStep('bill')}
                className="p-3 rounded-2xl bg-[#133e2c] text-white shadow-md flex items-center justify-between cursor-pointer hover:bg-[#0e2c20] transition-all active:scale-[0.99] border border-emerald-500/30"
              >
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div className="text-xs">
                    <span className="font-extrabold text-amber-300 mr-1.5">{currentOrder.id}:</span>
                    <span className="font-medium text-stone-200">
                      {currentOrder.orderStatus === 'completed'
                        ? 'Fulfilled & Served ✅'
                        : currentOrder.orderStatus === 'ready'
                        ? 'Ready to Serve 🔔'
                        : currentOrder.orderStatus === 'preparing'
                        ? 'In Kitchen (Preparing 👨‍🍳)'
                        : 'Order Confirmed'}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-emerald-200 bg-white/15 px-2.5 py-1 rounded-lg">
                  View Live Bill →
                </span>
              </div>
            </div>
          )}

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
              onClick={() => setSelectedCategory('All Items')}
              className={`text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory !== 'All' && selectedCategory !== 'All Items'
                  ? 'text-[#133e2c] hover:underline'
                  : 'text-stone-400'
              }`}
            >
              See All
            </button>
          </div>

          {/* 2-Column Product Cards Grid (compact & responsive) */}
          {filteredMenuItems.length === 0 ? (
            <div className="py-16 text-center text-stone-400 space-y-2">
              <p className="font-bold text-stone-600 text-sm">No items found</p>
              <p className="text-xs text-stone-400">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
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
        </div>

      </div>

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
                <p className="text-[11px] text-amber-200">
                  {diningOption === 'parcel' ? 'Takeaway Parcel 🛍️' : 'Eat in Cafe 🍽️'}
                </p>
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
        notes={notes}
        onNotesChange={setNotes}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={() => setCart([])}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Customer Info Modal (Asks Eat Now vs Parcel, Name, Phone & Notes) */}
      <CustomerCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        totalAmount={cartTotal}
        diningOption={diningOption}
        onDiningOptionChange={setDiningOption}
        customerName={customerName}
        customerPhone={customerPhone}
        notes={notes}
        onNotesChange={setNotes}
        onNameChange={setCustomerName}
        onPhoneChange={setCustomerPhone}
        onProceedToRazorpay={handleOpenRazorpay}
        isLoading={isPaymentLoading}
      />

      {/* Bill Lookup Modal (Search past bills by phone & name) */}
      <BillLookupModal
        isOpen={isBillLookupOpen}
        onClose={() => setIsBillLookupOpen(false)}
        onSelectOrder={handleSelectLookupOrder}
        currentOrder={currentOrder}
        initialPhone={customerPhone}
        initialName={customerName}
      />
    </div>
  );
}

export default App;
