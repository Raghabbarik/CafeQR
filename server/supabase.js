import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vtpryqwnccaeeuzxunvz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase configuration in environment variables.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

console.log('⚡ Supabase Client initialized:', SUPABASE_URL);

// ---------------- CAFE INFO ----------------
export async function dbGetCafe() {
  const { data, error } = await supabase.from('cafe').select('*').limit(1).single();
  if (error || !data) {
    if (error) console.error('dbGetCafe error:', error.message);
    return null;
  }

  let plainTagline = data.tagline || 'Artisanal Coffee & Fresh Gourmet Bites';
  let heroConfig = {
    badge: 'NEW',
    title: 'ICED\nMATCHA\nLATTE',
    cardTitle: 'Welcome Back',
    cardSubtitle: 'Explore our Fall menu',
    buttonText: 'Order Now',
  };
  let staffList = [];
  let orderDisplayCode = '8899';

  try {
    if (data.tagline && data.tagline.trim().startsWith('{')) {
      const parsed = JSON.parse(data.tagline);
      if (parsed && typeof parsed === 'object') {
        if (parsed.tagline) plainTagline = parsed.tagline;
        if (parsed.hero) {
          heroConfig = { ...heroConfig, ...parsed.hero };
        } else {
          if (parsed.heroBadge) heroConfig.badge = parsed.heroBadge;
          if (parsed.heroTitle) heroConfig.title = parsed.heroTitle;
          if (parsed.heroCardTitle) heroConfig.cardTitle = parsed.heroCardTitle;
          if (parsed.heroCardSubtitle) heroConfig.cardSubtitle = parsed.heroCardSubtitle;
          if (parsed.heroButtonText) heroConfig.buttonText = parsed.heroButtonText;
        }
        if (Array.isArray(parsed.staff)) {
          staffList = parsed.staff;
        }
        if (parsed.orderDisplayCode) {
          orderDisplayCode = String(parsed.orderDisplayCode);
        }
      }
    }
  } catch (e) {
    // tagline is plain string
  }

  return {
    name: data.name,
    tagline: plainTagline,
    logo: data.logo,
    coverImage: data.cover_image,
    taxRate: Number(data.tax_rate),
    currency: data.currency,
    tablesCount: Number(data.tables_count),
    razorpayKeyId: data.razorpay_key_id,
    hero: heroConfig,
    staff: staffList,
    orderDisplayCode: orderDisplayCode,
  };
}

export async function dbUpdateCafe(updates) {
  // First get existing row to preserve tagline or hero if partially updated
  const { data: existing } = await supabase.from('cafe').select('*').limit(1).single();
  
  let currentHero = {
    badge: 'NEW',
    title: 'ICED\nMATCHA\nLATTE',
    cardTitle: 'Welcome Back',
    cardSubtitle: 'Explore our Fall menu',
    buttonText: 'Order Now',
  };
  let currentPlainTagline = existing?.tagline || 'Artisanal Coffee & Fresh Gourmet Bites';
  let currentStaff = [];
  let currentOrderDisplayCode = '8899';
  
  if (existing?.tagline && existing.tagline.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(existing.tagline);
      if (parsed.tagline) currentPlainTagline = parsed.tagline;
      if (parsed.hero) currentHero = { ...currentHero, ...parsed.hero };
      if (Array.isArray(parsed.staff)) currentStaff = parsed.staff;
      if (parsed.orderDisplayCode) currentOrderDisplayCode = String(parsed.orderDisplayCode);
    } catch (e) {}
  }

  const payload = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.logo !== undefined) payload.logo = updates.logo;
  if (updates.coverImage !== undefined) payload.cover_image = updates.coverImage;
  if (updates.taxRate !== undefined) payload.tax_rate = updates.taxRate;
  if (updates.currency !== undefined) payload.currency = updates.currency;
  if (updates.tablesCount !== undefined) payload.tables_count = updates.tablesCount;
  if (updates.razorpayKeyId !== undefined) payload.razorpay_key_id = updates.razorpayKeyId;

  // If hero, tagline, staff, or orderDisplayCode is provided, encode into tagline JSON
  if (
    updates.hero !== undefined ||
    updates.tagline !== undefined ||
    updates.staff !== undefined ||
    updates.orderDisplayCode !== undefined
  ) {
    const newTagline = updates.tagline !== undefined ? updates.tagline : currentPlainTagline;
    const newHero = updates.hero !== undefined ? { ...currentHero, ...updates.hero } : currentHero;
    const newStaff = updates.staff !== undefined ? updates.staff : currentStaff;
    const newCode = updates.orderDisplayCode !== undefined ? updates.orderDisplayCode : currentOrderDisplayCode;
    
    payload.tagline = JSON.stringify({
      tagline: newTagline,
      hero: newHero,
      staff: newStaff,
      orderDisplayCode: newCode,
    });
  }

  const { data, error } = await supabase
    .from('cafe')
    .update(payload)
    .eq('id', 'cafe_main')
    .select()
    .single();

  if (error) {
    console.error('dbUpdateCafe error:', error.message);
    throw new Error(error.message);
  }
  return data;
}

// ---------------- STAFF HELPERS ----------------
export async function dbGetStaff() {
  const cafe = await dbGetCafe();
  return cafe?.staff || [];
}

export async function dbAddStaff(newStaff) {
  const cafe = await dbGetCafe();
  const currentStaff = cafe?.staff || [];
  
  // check if email already exists
  const existingIndex = currentStaff.findIndex(
    (s) => s.email.toLowerCase().trim() === newStaff.email.toLowerCase().trim()
  );
  let updatedStaff;
  if (existingIndex >= 0) {
    updatedStaff = [...currentStaff];
    updatedStaff[existingIndex] = { ...updatedStaff[existingIndex], ...newStaff };
  } else {
    updatedStaff = [...currentStaff, newStaff];
  }

  await dbUpdateCafe({ staff: updatedStaff });
  return updatedStaff;
}

export async function dbDeleteStaff(staffId) {
  const cafe = await dbGetCafe();
  const currentStaff = cafe?.staff || [];
  const updatedStaff = currentStaff.filter((s) => s.id !== staffId);
  await dbUpdateCafe({ staff: updatedStaff });
  return updatedStaff;
}

export async function dbGetOrderDisplayCode() {
  const cafe = await dbGetCafe();
  return cafe?.orderDisplayCode || '8899';
}

export async function dbUpdateOrderDisplayCode(code) {
  await dbUpdateCafe({ orderDisplayCode: String(code).trim() });
  return String(code).trim();
}

// ---------------- CATEGORIES ----------------
export async function dbGetCategories() {
  const { data, error } = await supabase.from('categories').select('name').order('created_at');
  if (error || !data) {
    if (error) console.error('dbGetCategories error:', error.message);
    return [];
  }
  return data.map((c) => c.name);
}

export async function dbAddCategory(name) {
  const id = `cat_${Date.now()}`;
  const { data, error } = await supabase.from('categories').insert([{ id, name }]).select().single();
  if (error) {
    console.error('dbAddCategory error:', error.message);
    throw new Error(error.message);
  }
  return data;
}

// ---------------- MENU ITEMS ----------------
export async function dbGetMenuItems() {
  const { data, error } = await supabase.from('menu_items').select('*').order('created_at');
  if (error || !data) {
    if (error) console.error('dbGetMenuItems error:', error.message);
    return [];
  }
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
    console.error('dbAddMenuItem error:', error.message);
    throw new Error(error.message);
  }
  return data;
}

export async function dbUpdateMenuItem(id, updates) {
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
    console.error('dbUpdateMenuItem error:', error.message);
    throw new Error(error.message);
  }
  return data;
}

export async function dbDeleteMenuItem(id) {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) {
    console.error('dbDeleteMenuItem error:', error.message);
    throw new Error(error.message);
  }
  return true;
}

// ---------------- ORDERS ----------------
export async function dbGetOrders() {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error || !data) {
    if (error) console.error('dbGetOrders error:', error.message);
    return [];
  }
  return data.map((o) => {
    const isParcel = String(o.table_number || '').toLowerCase().includes('parcel') || String(o.table_number || '').toLowerCase().includes('takeaway');
    return {
      id: o.id,
      tableNumber: isParcel ? 'Parcel' : 'Eat Now',
      diningOption: isParcel ? 'parcel' : 'dine_in',
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
    };
  });
}

export async function dbGetOrder(id) {
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error || !data) {
    if (error) console.error('dbGetOrder error:', error.message);
    return null;
  }
  const isParcel = String(data.table_number || '').toLowerCase().includes('parcel') || String(data.table_number || '').toLowerCase().includes('takeaway');
  return {
    id: data.id,
    tableNumber: isParcel ? 'Parcel' : 'Eat Now',
    diningOption: isParcel ? 'parcel' : 'dine_in',
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
  const isParcel = order.diningOption === 'parcel' || String(order.tableNumber || '').toLowerCase().includes('parcel');
  const tableVal = isParcel ? 'Parcel' : 'Eat Now';
  const row = {
    id: order.id,
    table_number: tableVal,
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
    console.error('dbCreateOrder error:', error.message);
    throw new Error(error.message);
  }
  return order;
}

export async function dbUpdateOrderStatus(id, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ order_status: status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('dbUpdateOrderStatus error:', error.message);
    throw new Error(error.message);
  }
  return data;
}

// ---------------- STAFF ALERTS ----------------
export async function dbCreateAlert(alert) {
  const row = {
    id: alert.id,
    table_number: String(alert.tableNumber),
    type: alert.type,
    resolved: false,
    created_at: alert.time || new Date().toISOString(),
  };
  const { error } = await supabase.from('staff_alerts').insert([row]);
  if (error) console.error('dbCreateAlert error:', error.message);
  return alert;
}
