import type { CafeInfo, MenuItem, Order, StaffMember, DiningOption, Review } from '../types';

// Dynamic backend URL fallback if relative fetch fails (only for local dev on port 3000 -> 5000)
const getBackendDirectUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalDev = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.');
    if (isLocalDev && window.location.port === '3000') {
      return `${window.location.protocol}//${host}:5000`;
    }
    // In production (Vercel, custom domain), use relative same-origin URL!
    return '';
  }
  return '';
};

async function requestApi(url: string, options?: RequestInit): Promise<Response> {
  try {
    const res = await fetch(url, options);
    // If relative proxy returns 404/502/504 in local dev, try direct backend fallback
    if (!res.ok && (res.status === 404 || res.status === 502 || res.status === 504) && url.startsWith('/api')) {
      const fallbackPrefix = getBackendDirectUrl();
      if (fallbackPrefix) {
        const fallbackUrl = `${fallbackPrefix}${url}`;
        console.warn(`[API] Fetch to ${url} returned ${res.status}, retrying directly to ${fallbackUrl}`);
        return await fetch(fallbackUrl, options);
      }
    }
    return res;
  } catch (err: any) {
    if (url.startsWith('/api')) {
      const fallbackPrefix = getBackendDirectUrl();
      if (fallbackPrefix) {
        const fallbackUrl = `${fallbackPrefix}${url}`;
        console.warn(`[API] Fetch to ${url} failed (${err.message}), retrying directly to ${fallbackUrl}`);
        try {
          const fallbackRes = await fetch(fallbackUrl, options);
          return fallbackRes;
        } catch (fallbackErr: any) {
          console.error(`[API] Direct fallback to ${fallbackUrl} also failed:`, fallbackErr);
          throw fallbackErr;
        }
      }
    }
    throw err;
  }
}

export const api = {
  // Cafe details
  async getCafe(): Promise<{ cafe: CafeInfo; categories: string[] }> {
    const res = await requestApi('/api/cafe');
    if (!res.ok) throw new Error('Failed to fetch cafe details');
    return res.json();
  },

  async updateCafe(cafe: Partial<CafeInfo>): Promise<{ success: boolean; cafe: CafeInfo }> {
    const res = await requestApi('/api/cafe', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cafe),
    });
    if (!res.ok) throw new Error('Failed to update cafe details');
    return res.json();
  },

  // Menu items
  async getMenu(): Promise<{ categories: string[]; items: MenuItem[] }> {
    const res = await requestApi('/api/menu');
    if (!res.ok) throw new Error('Failed to fetch menu');
    return res.json();
  },

  async addMenuItem(item: Partial<MenuItem>): Promise<MenuItem> {
    const res = await requestApi('/api/menu/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add menu item');
    }
    return res.json();
  },

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<any> {
    const res = await requestApi(`/api/menu/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update menu item');
    }
    return res.json();
  },

  async deleteMenuItem(id: string): Promise<void> {
    const res = await requestApi(`/api/menu/items/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete menu item');
    }
  },

  async addCategory(name: string): Promise<{ categories: string[] }> {
    const res = await requestApi('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add category');
    }
    return res.json();
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const res = await requestApi('/api/orders');
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrder(id: string): Promise<Order> {
    const res = await requestApi(`/api/orders/${id}`);
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  },

  async lookupOrdersByPhone(phone: string, name?: string): Promise<Order[]> {
    const params = new URLSearchParams({ phone: phone.trim() });
    if (name && name.trim()) params.append('name', name.trim());
    const res = await requestApi(`/api/orders/lookup/by-phone?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to lookup orders');
    return res.json();
  },

  async createOrder(orderData: {
    tableNumber?: string;
    diningOption?: DiningOption;
    customerName: string;
    customerPhone: string;
    items: { id: string; name: string; price: number; quantity: number; isVeg: boolean }[];
    notes?: string;
    paymentMethod: string;
    paymentId: string;
  }): Promise<Order> {
    const res = await requestApi('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  async updateOrderStatus(id: string, status: Order['orderStatus']): Promise<Order> {
    const res = await requestApi(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  // Call waiter / assistance
  async callAssistance(tableNumber: string, type: string = 'Water / Assistance'): Promise<void> {
    await requestApi('/api/assistance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableNumber, type }),
    });
  },

  // Razorpay order creation helper (uses /api/payment/order which is immune to adblockers)
  async createRazorpayOrder(amount: number): Promise<{
    id: string;
    currency: string;
    amount: number;
    keyId: string;
    receipt: string;
    isReal?: boolean;
  }> {
    try {
      const res = await requestApi('/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend payment order endpoint unreachable, using client fallback order:', err);
    }

    // Always provide a resilient fallback so the official Razorpay checkout popup still opens in direct mode!
    return {
      id: `order_rzp_${Date.now()}`,
      currency: 'INR',
      amount: Math.round(Number(amount) * 100),
      keyId: 'rzp_test_TxJ87ji7k95ncJ',
      receipt: `rcpt_${Date.now()}`,
      isReal: false,
    };
  },

  async verifyRazorpayPayment(payload: {
    razorpay_order_id?: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
  }): Promise<{ success: boolean; paymentId: string }> {
    const res = await requestApi('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Verification request failed');
    return res.json();
  },

  // Admin JWT Authentication
  async loginAdmin(credentials: { email: string; password: string }): Promise<{
    success: boolean;
    token: string;
    admin: { email: string; role: string };
  }> {
    const res = await requestApi('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Invalid email or password');
    }
    if (data.token) {
      localStorage.setItem('cafeqr_admin_token', data.token);
    }
    return data;
  },

  async verifyAdminToken(token?: string): Promise<{ valid: boolean; admin?: { email: string; role: string } }> {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('cafeqr_admin_token') : null);
    if (!activeToken) return { valid: false };

    try {
      const res = await requestApi('/api/admin/verify', {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      if (!res.ok) {
        localStorage.removeItem('cafeqr_admin_token');
        return { valid: false };
      }
      return await res.json();
    } catch {
      return { valid: false };
    }
  },

  logoutAdmin(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cafeqr_admin_token');
    }
  },

  getAdminToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('cafeqr_admin_token') : null;
  },

  // Staff JWT Authentication
  async loginStaff(credentials: { email: string; password: string }): Promise<{
    success: boolean;
    token: string;
    staff: StaffMember;
  }> {
    const res = await requestApi('/api/staff/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Invalid staff email or password');
    }
    if (data.token) {
      localStorage.setItem('cafeqr_staff_token', data.token);
    }
    return data;
  },

  async verifyStaffToken(token?: string): Promise<{ valid: boolean; staff?: StaffMember }> {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('cafeqr_staff_token') : null);
    if (!activeToken) return { valid: false };

    try {
      const res = await requestApi('/api/staff/verify', {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      if (!res.ok) {
        localStorage.removeItem('cafeqr_staff_token');
        return { valid: false };
      }
      return await res.json();
    } catch {
      return { valid: false };
    }
  },

  logoutStaff(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cafeqr_staff_token');
    }
  },

  getStaffToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('cafeqr_staff_token') : null;
  },

  // Staff Management (Admin)
  async getStaffList(): Promise<StaffMember[]> {
    const res = await requestApi('/api/admin/staff');
    if (!res.ok) throw new Error('Failed to fetch staff list');
    return res.json();
  },

  async addStaff(member: { name: string; email: string; password: string }): Promise<StaffMember[]> {
    const res = await requestApi('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add staff member');
    return data.staff;
  },

  async deleteStaff(id: string): Promise<StaffMember[]> {
    const res = await requestApi(`/api/admin/staff/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete staff member');
    return data.staff;
  },

  // TV Order Display Code
  async getOrderDisplayCode(): Promise<string> {
    const res = await requestApi('/api/display/code');
    if (!res.ok) throw new Error('Failed to fetch display code');
    const data = await res.json();
    return data.code;
  },

  async updateOrderDisplayCode(code: string): Promise<string> {
    const res = await requestApi('/api/admin/display/code', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update display code');
    return data.code;
  },

  async verifyDisplayCode(code: string): Promise<boolean> {
    const res = await requestApi('/api/display/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    return Boolean(res.ok && data.verified);
  },

  // Customer Reviews & Feedback
  async getReviews(itemId?: string, orderId?: string): Promise<Review[]> {
    const params = new URLSearchParams();
    if (itemId) params.append('itemId', itemId);
    if (orderId) params.append('orderId', orderId);
    const qs = params.toString();
    const url = qs ? `/api/reviews?${qs}` : '/api/reviews';
    const res = await requestApi(url);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  async submitReview(review: Partial<Review>): Promise<Review> {
    const res = await requestApi('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit review');
    }
    return res.json();
  },

  async updateReview(id: string, updates: Partial<Review>): Promise<Review> {
    const res = await requestApi(`/api/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update review');
    }
    const data = await res.json();
    return data.review;
  },

  async deleteReview(id: string): Promise<void> {
    const res = await requestApi(`/api/reviews/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete review');
    }
  },
};
