import type { CafeInfo, MenuItem, Order } from '../types';

export const api = {
  // Cafe details
  async getCafe(): Promise<{ cafe: CafeInfo; categories: string[] }> {
    const res = await fetch('/api/cafe');
    if (!res.ok) throw new Error('Failed to fetch cafe details');
    return res.json();
  },

  async updateCafe(cafe: Partial<CafeInfo>): Promise<{ success: boolean; cafe: CafeInfo }> {
    const res = await fetch('/api/cafe', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cafe),
    });
    if (!res.ok) throw new Error('Failed to update cafe details');
    return res.json();
  },

  // Menu items
  async getMenu(): Promise<{ categories: string[]; items: MenuItem[] }> {
    const res = await fetch('/api/menu');
    if (!res.ok) throw new Error('Failed to fetch menu');
    return res.json();
  },

  async addMenuItem(item: Partial<MenuItem>): Promise<MenuItem> {
    const res = await fetch('/api/menu/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add menu item');
    return res.json();
  },

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const res = await fetch(`/api/menu/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update menu item');
    return res.json();
  },

  async deleteMenuItem(id: string): Promise<void> {
    const res = await fetch(`/api/menu/items/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete menu item');
  },

  async addCategory(name: string): Promise<{ categories: string[] }> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to add category');
    return res.json();
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}`);
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  },

  async createOrder(orderData: {
    tableNumber: string;
    customerName: string;
    customerPhone: string;
    items: { id: string; name: string; price: number; quantity: number; isVeg: boolean }[];
    notes?: string;
    paymentMethod: string;
    paymentId: string;
  }): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  async updateOrderStatus(id: string, status: Order['orderStatus']): Promise<Order> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  // Call waiter / assistance
  async callAssistance(tableNumber: string, type: string = 'Water / Assistance'): Promise<void> {
    await fetch('/api/assistance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableNumber, type }),
    });
  },

  // Razorpay order creation helper
  async createRazorpayOrder(amount: number): Promise<{
    id: string;
    currency: string;
    amount: number;
    keyId: string;
    receipt: string;
    isReal?: boolean;
  }> {
    const res = await fetch('/api/razorpay/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Failed to initiate Razorpay payment');
    return res.json();
  },

  async verifyRazorpayPayment(payload: {
    razorpay_order_id?: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
  }): Promise<{ success: boolean; paymentId: string }> {
    const res = await fetch('/api/razorpay/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Verification request failed');
    return res.json();
  },
};
