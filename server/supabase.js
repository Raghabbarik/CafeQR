import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vtpryqwnccaeeuzxunvz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Z99XkqOmtMDvcObUOt9Qtw_E7BoQCcp';

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

  const heroCover = heroConfig.coverImage || data.cover_image || '';
  heroConfig.coverImage = heroCover;

  return {
    name: data.name,
    tagline: plainTagline,
    logo: data.logo,
    coverImage: heroCover,
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
  let currentReviews = [];
  
  if (existing?.tagline && existing.tagline.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(existing.tagline);
      if (parsed.tagline) currentPlainTagline = parsed.tagline;
      if (parsed.hero) currentHero = { ...currentHero, ...parsed.hero };
      if (Array.isArray(parsed.staff)) currentStaff = parsed.staff;
      if (parsed.orderDisplayCode) currentOrderDisplayCode = String(parsed.orderDisplayCode);
      if (Array.isArray(parsed.reviews)) currentReviews = parsed.reviews;
    } catch (e) {}
  }

  const payload = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.logo !== undefined) payload.logo = updates.logo;
  if (updates.coverImage !== undefined) {
    payload.cover_image = updates.coverImage;
    currentHero.coverImage = updates.coverImage;
  }
  if (updates.hero && updates.hero.coverImage !== undefined) {
    payload.cover_image = updates.hero.coverImage;
    currentHero.coverImage = updates.hero.coverImage;
  }
  if (updates.taxRate !== undefined) payload.tax_rate = updates.taxRate;
  if (updates.currency !== undefined) payload.currency = updates.currency;
  if (updates.tablesCount !== undefined) payload.tables_count = updates.tablesCount;
  if (updates.razorpayKeyId !== undefined) payload.razorpay_key_id = updates.razorpayKeyId;

  // If hero, tagline, staff, orderDisplayCode, or reviews is provided, encode into tagline JSON
  if (
    updates.hero !== undefined ||
    updates.tagline !== undefined ||
    updates.staff !== undefined ||
    updates.orderDisplayCode !== undefined ||
    updates.reviews !== undefined
  ) {
    const newTagline = updates.tagline !== undefined ? updates.tagline : currentPlainTagline;
    const newHero = updates.hero !== undefined ? { ...currentHero, ...updates.hero } : currentHero;
    const newStaff = updates.staff !== undefined ? updates.staff : currentStaff;
    const newCode = updates.orderDisplayCode !== undefined ? updates.orderDisplayCode : currentOrderDisplayCode;
    const newReviews = updates.reviews !== undefined ? updates.reviews : currentReviews;
    
    payload.tagline = JSON.stringify({
      tagline: newTagline,
      hero: newHero,
      staff: newStaff,
      orderDisplayCode: newCode,
      reviews: newReviews,
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
  const cleanName = (name || '').trim();
  if (!cleanName) return null;

  try {
    const { data: existing } = await supabase.from('categories').select('*').eq('name', cleanName).limit(1);
    if (existing && existing.length > 0) {
      return existing[0];
    }
  } catch (e) {
    // continue to insert
  }

  const id = `cat_${Date.now()}`;
  const { data, error } = await supabase
    .from('categories')
    .upsert([{ id, name: cleanName }], { onConflict: 'name' })
    .select();

  if (error) {
    console.error('dbAddCategory error:', error.message);
    throw new Error(error.message);
  }
  return data?.[0] || { id, name: cleanName };
}

// ---------------- MENU ITEMS ----------------
export async function dbGetMenuItems() {
  const { data, error } = await supabase.from('menu_items').select('*').order('created_at');
  if (error || !data) {
    if (error) console.error('dbGetMenuItems error:', error.message);
    return [];
  }
  return data.map((item) => ({
    id: String(item.id),
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
  const id = item.id ? String(item.id) : `item_${Date.now()}`;
  const row = {
    id,
    name: item.name,
    category: item.category || 'General',
    price: Number(item.price),
    mrp: item.mrp ? Number(item.mrp) : Math.round(Number(item.price) * 1.25),
    portion: item.portion || 'Regular',
    description: item.description || '',
    why_love_it: Array.isArray(item.whyLoveIt) ? item.whyLoveIt : [],
    image: item.image || '',
    is_veg: item.isVeg ?? true,
    is_bestseller: item.isBestseller ?? false,
    is_available: item.isAvailable ?? true,
    prep_time: item.prepTime || '10 mins',
    rating: item.rating ? Number(item.rating) : 4.8,
  };

  const { data, error } = await supabase.from('menu_items').upsert([row]).select();
  if (error) {
    console.error('dbAddMenuItem error:', error.message);
    throw new Error(error.message);
  }
  return data?.[0] || row;
}

export async function dbUpdateMenuItem(id, updates) {
  const strId = String(id);
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
  if (updates.isVeg !== undefined) payload.is_veg = Boolean(updates.isVeg);
  if (updates.isBestseller !== undefined) payload.is_bestseller = Boolean(updates.isBestseller);
  if (updates.isAvailable !== undefined) payload.is_available = Boolean(updates.isAvailable);
  if (updates.prepTime !== undefined) payload.prep_time = updates.prepTime;
  if (updates.rating !== undefined) payload.rating = Number(updates.rating);

  // Try update first
  const { data, error } = await supabase
    .from('menu_items')
    .update(payload)
    .eq('id', strId)
    .select();

  if (error) {
    console.error('dbUpdateMenuItem update error:', error.message);
    throw new Error(error.message);
  }

  // If item wasn't in Supabase yet, upsert it so it is saved permanently
  if (!data || data.length === 0) {
    const fullRow = {
      id: strId,
      name: updates.name || 'Menu Item',
      category: updates.category || 'General',
      price: updates.price ? Number(updates.price) : 100,
      mrp: updates.mrp ? Number(updates.mrp) : (updates.price ? Math.round(Number(updates.price) * 1.25) : 125),
      portion: updates.portion || 'Regular',
      description: updates.description || '',
      why_love_it: Array.isArray(updates.whyLoveIt) ? updates.whyLoveIt : [],
      image: updates.image || '',
      is_veg: updates.isVeg ?? true,
      is_bestseller: updates.isBestseller ?? false,
      is_available: updates.isAvailable ?? true,
      prep_time: updates.prepTime || '10 mins',
      rating: updates.rating ? Number(updates.rating) : 4.8,
    };
    const insertRes = await supabase.from('menu_items').upsert([fullRow]).select();
    if (insertRes.error) {
      console.error('dbUpdateMenuItem upsert fallback error:', insertRes.error.message);
      throw new Error(insertRes.error.message);
    }
    return insertRes.data?.[0] || fullRow;
  }

  return data[0];
}

export async function dbDeleteMenuItem(id) {
  const strId = String(id);
  const { error } = await supabase.from('menu_items').delete().eq('id', strId);
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

// ---------------- REVIEWS & FEEDBACK ----------------
const DEFAULT_REVIEWS = [
  {
    id: 'rev_1',
    itemId: 'item_1',
    itemName: 'Iced Matcha Latte',
    customerName: 'Ananya S.',
    customerPhone: '9876543210',
    rating: 5,
    comment: 'Hands down the best Iced Matcha Latte in town! Perfect sweetness and rich ceremonial grade flavor.',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'rev_2',
    itemId: 'item_1',
    itemName: 'Iced Matcha Latte',
    customerName: 'Rohan M.',
    customerPhone: '9876543211',
    rating: 5,
    comment: 'Super refreshing and velvety smooth. My go-to order every morning!',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'rev_3',
    itemId: 'item_7',
    itemName: 'Butter Croissant',
    customerName: 'Priya K.',
    customerPhone: '9876543212',
    rating: 5,
    comment: 'Warm, flaky layers with real French butter. Goes amazingly with espresso.',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'rev_4',
    itemId: 'item_2',
    itemName: 'Artisanal Cappuccino',
    customerName: 'Vikram D.',
    customerPhone: '9876543213',
    rating: 5,
    comment: 'Rich crema and wonderful latte art. Outstanding coffee bean roast quality.',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

export async function dbGetReviews(itemId, orderId) {
  // 1. Try querying dedicated Supabase reviews table if created
  try {
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (itemId) {
      query = query.eq('item_id', String(itemId));
    }
    if (orderId) {
      query = query.eq('order_id', String(orderId));
    }
    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      return data.map((r) => ({
        id: String(r.id),
        orderId: r.order_id,
        itemId: r.item_id,
        itemName: r.item_name,
        customerName: r.customer_name,
        customerPhone: r.customer_phone,
        rating: Number(r.rating || 5),
        comment: r.comment || '',
        status: r.status || 'approved',
        createdAt: r.created_at,
      }));
    }
  } catch (err) {
    // continue to fallback
  }

  // 2. Cloud Fallback: Read reviews from cafe.tagline JSON
  try {
    const { data: cafe } = await supabase.from('cafe').select('tagline').limit(1).single();
    if (cafe?.tagline && cafe.tagline.trim().startsWith('{')) {
      const parsed = JSON.parse(cafe.tagline);
      if (Array.isArray(parsed.reviews) && parsed.reviews.length > 0) {
        let revs = parsed.reviews;
        if (itemId) {
          revs = revs.filter((r) => r.itemId === itemId || r.itemName === itemId);
        }
        if (orderId) {
          revs = revs.filter((r) => String(r.orderId) === String(orderId));
        }
        return revs;
      }
    }
  } catch (err) {
    console.warn('Error reading fallback reviews:', err.message);
  }

  // 3. Return defaults filtered (only when not querying for a specific orderId)
  if (orderId) {
    return [];
  }
  if (itemId) {
    return DEFAULT_REVIEWS.filter((r) => r.itemId === itemId || r.itemName === itemId);
  }
  return DEFAULT_REVIEWS;
}

export async function dbAddReview(review) {
  // Prevent duplicate feedback for the same order (one review per order)
  if (review.orderId && !String(review.orderId).startsWith('admin_')) {
    const existing = await dbGetReviews(null, review.orderId);
    if (existing && existing.length > 0) {
      throw new Error('Feedback has already been submitted for this order. Double feedback is not allowed.');
    }
  }

  const newReview = {
    id: review.id || `rev_${Date.now()}`,
    orderId: review.orderId || null,
    itemId: review.itemId ? String(review.itemId) : null,
    itemName: review.itemName || 'Cafe Order',
    customerName: review.customerName || 'Happy Customer',
    customerPhone: review.customerPhone || '',
    rating: Number(review.rating || 5),
    comment: review.comment || '',
    status: review.status || 'approved',
    createdAt: review.createdAt || new Date().toISOString(),
  };

  // Try saving to Supabase table
  try {
    const row = {
      id: newReview.id,
      order_id: newReview.orderId,
      item_id: newReview.itemId,
      item_name: newReview.itemName,
      customer_name: newReview.customerName,
      customer_phone: newReview.customerPhone,
      rating: newReview.rating,
      comment: newReview.comment,
      status: newReview.status,
      created_at: newReview.createdAt,
    };
    const { data, error } = await supabase.from('reviews').insert([row]).select().single();
    if (!error && data) {
      return newReview;
    }
  } catch (e) {
    // continue to fallback
  }

  // Fallback: save to cafe tagline JSON
  try {
    const currentReviews = await dbGetReviews();
    const updated = [newReview, ...currentReviews.filter((r) => r.id !== newReview.id)];
    await dbUpdateCafe({ reviews: updated });
  } catch (e) {
    console.error('dbAddReview fallback error:', e.message);
  }

  return newReview;
}

export async function dbUpdateReview(id, updates) {
  const strId = String(id);
  // Try table
  try {
    const rowUpdates = {};
    if (updates.status !== undefined) rowUpdates.status = updates.status;
    if (updates.comment !== undefined) rowUpdates.comment = updates.comment;
    if (updates.rating !== undefined) rowUpdates.rating = Number(updates.rating);
    const { data, error } = await supabase.from('reviews').update(rowUpdates).eq('id', strId).select();
    if (!error && data && data.length > 0) {
      return data[0];
    }
  } catch (e) {}

  // Fallback in JSON
  const currentReviews = await dbGetReviews();
  const updated = currentReviews.map((r) => (r.id === strId ? { ...r, ...updates } : r));
  await dbUpdateCafe({ reviews: updated });
  return updated.find((r) => r.id === strId);
}

export async function dbDeleteReview(id) {
  const strId = String(id);
  // Try table
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', strId);
    if (!error) return true;
  } catch (e) {}

  // Fallback in JSON
  const currentReviews = await dbGetReviews();
  const updated = currentReviews.filter((r) => r.id !== strId);
  await dbUpdateCafe({ reviews: updated });
  return true;
}

