import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vtpryqwnccaeeuzxunvz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';

let supabase = null;
let isConnected = false;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    console.log('⚡ Supabase Client initialized with project:', SUPABASE_URL);
  } catch (err) {
    console.warn('⚠️ Could not initialize Supabase client:', err.message);
  }
}

// Check if tables are present in Supabase
export async function checkSupabaseHealth() {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('cafe').select('id').limit(1);
    if (!error) {
      isConnected = true;
      console.log('✅ Connected to Supabase tables successfully!');
      return true;
    } else {
      console.log('ℹ️ Supabase reachable, but tables not created yet in public schema:', error.message);
      return false;
    }
  } catch (err) {
    console.warn('⚠️ Supabase health check exception:', err.message);
    return false;
  }
}

export { supabase };

// ---------------- CAFE INFO ----------------
export async function dbGetCafe() {
  if (!supabase || !isConnected) return null;
  const { data, error } = await supabase.from('cafe').select('*').limit(1).single();
  if (error || !data) return null;
  return {
    name: data.name,
    tagline: data.tagline,
    logo: data.logo,
    coverImage: data.cover_image,
    taxRate: Number(data.tax_rate),
    currency: data.currency,
    tablesCount: Number(data.tables_count),
    razorpayKeyId: data.razorpay_key_id,
  };
}

export async function dbUpdateCafe(updates) {
  if (!supabase || !isConnected) return null;
  const payload = {
    updated_at: new Date().toISOString(),
  };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.tagline !== undefined) payload.tagline = updates.tagline;
  if (updates.logo !== undefined) payload.logo = updates.logo;
  if (updates.coverImage !== undefined) payload.cover_image = updates.coverImage;
  if (updates.taxRate !== undefined) payload.tax_rate = updates.taxRate;
  if (updates.currency !== undefined) payload.currency = updates.currency;
  if (updates.tablesCount !== undefined) payload.tables_count = updates.tablesCount;
  if (updates.razorpayKeyId !== undefined) payload.razorpay_key_id = updates.razorpayKeyId;

  const { data, error } = await supabase
    .from('cafe')
    .update(payload)
    .eq('id', 'cafe_main')
    .select()
    .single();

  if (error) {
    console.error('Supabase updateCafe error:', error);
    return null;
  }
  return data;
}

// ---------------- CATEGORIES ----------------
export async function dbGetCategories() {
  if (!supabase || !isConnected) return null;
  const { data, error } = await supabase.from('categories').select('name').order('created_at');
  if (error || !data) return null;
  return data.map((c) => c.name);
}

export async function dbAddCategory(name) {
  if (!supabase || !isConnected) return null;
  const id = `cat_${Date.now()}`;
  const { data, error } = await supabase.from('categories').insert([{ id, name }]).select().single();
  if (error) {
    console.error('Supabase addCategory error:', error);
    return null;
  }
  return data;
}

// ---------------- MENU ITEMS ----------------
export async function dbGetMenuItems() {
  if (!supabase || !isConnected) return null;
  const { data, error } = await supabase.from('menu_items').select('*').order('created_at');
  if (error || !data) return null;
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    price: Number(item.price),
    mrp: item.mrp ? Number(item.mrp) : Math.round(Number(item.price) * 1.25),
    portion: item.portion,
    description: item.description,
    whyLoveIt: Array.isArray(item.why_love_it) ? item.why_love_it : [],
    image: item.image,
    isVeg: Boolean(item.is_veg),
    isBestseller: Boolean(item.is_bestseller),
    isAvailable: Boolean(item.is_available),
    prepTime: item.prep_time,
    rating: item.rating ? Number(item.rating) : 4.8,
  }));
}

export async function dbAddMenuItem(item) {
  if (!supabase || !isConnected) return null;
  const id = item.id || `item_${Date.now()}`;
  const row = {
    id,
    name: item.name,
    category: item.category,
    price: Number(item.price),
    mrp: item.mrp ? Number(item.mrp) : Math.round(Number(item.price) * 1.25),
    portion: item.portion || 'Regular',
    description: item.description || '',
    why_love_it: item.whyLoveIt || [],
    image: item.image || '',
    is_veg: item.isVeg ?? true,
    is_bestseller: item.isBestseller ?? false,
    is_available: item.isAvailable ?? true,
    prep_time: item.prepTime || '10 mins',
    rating: item.rating || 4.8,
  };

  const { data, error } = await supabase.from('menu_items').insert([row]).select().single();
  if (error) {
    console.error('Supabase addMenuItem error:', error);
    return null;
  }
  return data;
}

export async function dbUpdateMenuItem(id, updates) {
  if (!supabase || !isConnected) return null;
  const payload = {
    updated_at: new Date().toISOString(),
  };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.price !== undefined) payload.price = Number(updates.price);
  if (updates.mrp !== undefined) payload.mrp = Number(updates.mrp);
  if (updates.portion !== undefined) payload.portion = updates.portion;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.whyLoveIt !== undefined) payload.why_love_it = updates.whyLoveIt;
  if (updates.image !== undefined) payload.image = updates.image;
  if (updates.isVeg !== undefined) payload.is_veg = updates.isVeg;
  if (updates.isBestseller !== undefined) payload.is_bestseller = updates.isBestseller;
  if (updates.isAvailable !== undefined) payload.is_available = updates.isAvailable;
  if (updates.prepTime !== undefined) payload.prep_time = updates.prepTime;
  if (updates.rating !== undefined) payload.rating = updates.rating;

  const { data, error } = await supabase
    .from('menu_items')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase updateMenuItem error:', error);
    return null;
  }
  return data;
}

export async function dbDeleteMenuItem(id) {
  if (!supabase || !isConnected) return null;
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) {
    console.error('Supabase deleteMenuItem error:', error);
    return false;
  }
  return true;
}

// ---------------- ORDERS ----------------
export async function dbGetOrders() {
  if (!supabase || !isConnected) return null;
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error || !data) return null;
  return data.map((o) => ({
    id: o.id,
    tableNumber: o.table_number,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    items: o.items,
    subtotal: Number(o.subtotal),
    tax: Number(o.tax),
    total: Number(o.total),
    paymentMethod: o.payment_method,
    paymentId: o.payment_id,
    orderStatus: o.order_status,
    notes: o.notes,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  }));
}

export async function dbGetOrder(id) {
  if (!supabase || !isConnected) return null;
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error || !data) return null;
  return {
    id: data.id,
    tableNumber: data.table_number,
    customerName: data.customer_name,
    customerPhone: data.customer_phone,
    items: data.items,
    subtotal: Number(data.subtotal),
    tax: Number(data.tax),
    total: Number(data.total),
    paymentMethod: data.payment_method,
    paymentId: data.payment_id,
    orderStatus: data.order_status,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function dbCreateOrder(order) {
  if (!supabase || !isConnected) return null;
  const row = {
    id: order.id,
    table_number: String(order.tableNumber),
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    items: order.items,
    subtotal: order.subtotal,
    tax: order.tax,
    total: order.total,
    payment_method: order.paymentMethod || 'Razorpay',
    payment_id: order.paymentId,
    order_status: order.orderStatus || 'received',
    notes: order.notes || '',
    created_at: order.createdAt || new Date().toISOString(),
    updated_at: order.updatedAt || new Date().toISOString(),
  };

  const { data, error } = await supabase.from('orders').insert([row]).select().single();
  if (error) {
    console.error('Supabase createOrder error:', error);
    return null;
  }
  return order;
}

export async function dbUpdateOrderStatus(id, status) {
  if (!supabase || !isConnected) return null;
  const { data, error } = await supabase
    .from('orders')
    .update({ order_status: status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase updateOrderStatus error:', error);
    return null;
  }
  return data;
}

// ---------------- STAFF ALERTS ----------------
export async function dbCreateAlert(alert) {
  if (!supabase || !isConnected) return null;
  const row = {
    id: alert.id,
    table_number: String(alert.tableNumber),
    type: alert.type,
    resolved: false,
    created_at: alert.time || new Date().toISOString(),
  };
  const { error } = await supabase.from('staff_alerts').insert([row]);
  if (error) console.error('Supabase createAlert error:', error);
  return alert;
}
