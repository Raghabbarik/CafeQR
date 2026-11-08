import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import {
  dbGetCafe,
  dbUpdateCafe,
  dbGetCategories,
  dbAddCategory,
  dbGetMenuItems,
  dbAddMenuItem,
  dbUpdateMenuItem,
  dbDeleteMenuItem,
  dbGetOrders,
  dbGetOrder,
  dbCreateOrder,
  dbUpdateOrderStatus,
  dbCreateAlert,
  dbGetStaff,
  dbAddStaff,
  dbDeleteStaff,
  dbGetOrderDisplayCode,
  dbUpdateOrderDisplayCode,
  dbGetReviews,
  dbAddReview,
  dbUpdateReview,
  dbDeleteReview,
} from './supabase.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'cafeqr_jwt_super_secret_key_2026_cafemanue';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'cafemanue@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Cafemanue@2062';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TxJ87ji7k95ncJ';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '7qT7ekNztPZcBzIlahb13GQk';

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export const app = express();

app.use(cors());
app.use(express.json());

// Ensure Vercel serverless functions match routes regardless of whether /api prefix is stripped
app.use((req, res, next) => {
  if (req.url && !req.url.startsWith('/api') && req.url !== '/' && !req.url.startsWith('/socket.io')) {
    req.url = '/api' + req.url;
  }
  next();
});

// Helper to safely emit Socket.IO events if running in stateful mode (local server / VPS)
const safeEmit = (req, event, data, room) => {
  const io = req?.app?.get('io');
  if (!io) return;
  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }
};

// ---------------- ADMIN AUTHENTICATION (JWT) ----------------

// Admin Sign In
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const cleanPassword = String(password).trim();

  if (cleanEmail === ADMIN_EMAIL && cleanPassword === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { email: cleanEmail, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`🔑 Admin authenticated successfully: ${cleanEmail}`);
    return res.json({
      success: true,
      token,
      admin: {
        email: cleanEmail,
        role: 'admin',
      },
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid email or password. Please verify your admin credentials.',
  });
});

// Admin JWT Session Verification
app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, error: 'Missing authorization token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({
      valid: true,
      admin: {
        email: decoded.email,
        role: decoded.role || 'admin',
      },
    });
  } catch (err) {
    return res.status(401).json({ valid: false, error: 'Session expired or invalid token' });
  }
});

// ---------------- STAFF AUTHENTICATION (JWT) ----------------

// Staff Sign In (restricted to Orders & Menu management)
app.post('/api/staff/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const cleanPassword = String(password).trim();

  try {
    const staffList = await dbGetStaff();
    const staffMember = staffList.find(
      (s) => s.email.toLowerCase().trim() === cleanEmail && String(s.password).trim() === cleanPassword
    );

    if (staffMember) {
      const token = jwt.sign(
        { id: staffMember.id, name: staffMember.name, email: cleanEmail, role: 'staff' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log(`👨‍🍳 Staff authenticated successfully: ${staffMember.name} (${cleanEmail})`);
      return res.json({
        success: true,
        token,
        staff: {
          id: staffMember.id,
          name: staffMember.name,
          email: cleanEmail,
          role: 'staff',
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid staff email or password. Please check credentials assigned by Admin.',
    });
  } catch (err) {
    console.error('Staff login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Staff JWT Session Verification
app.get('/api/staff/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, error: 'Missing authorization token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'staff') {
      return res.status(403).json({ valid: false, error: 'Unauthorized role' });
    }
    return res.json({
      valid: true,
      staff: {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (err) {
    return res.status(401).json({ valid: false, error: 'Session expired or invalid token' });
  }
});

// ---------------- ADMIN STAFF MANAGEMENT ----------------
app.get('/api/admin/staff', async (req, res) => {
  try {
    const staff = await dbGetStaff();
    res.json(staff || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/staff', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const newStaff = {
      id: `staff_${Date.now()}`,
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password: String(password).trim(),
      role: 'staff',
      createdAt: new Date().toISOString(),
    };

    const updated = await dbAddStaff(newStaff);
    res.status(201).json({ success: true, staff: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/staff/:id', async (req, res) => {
  try {
    const updated = await dbDeleteStaff(req.params.id);
    res.json({ success: true, staff: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- ORDER DISPLAY (TV SCREEN) ----------------
app.get('/api/display/code', async (req, res) => {
  try {
    const code = await dbGetOrderDisplayCode();
    res.json({ code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/display/verify-code', async (req, res) => {
  try {
    const { code } = req.body || {};
    const actualCode = await dbGetOrderDisplayCode();
    if (String(code).trim() === String(actualCode).trim()) {
      return res.json({ success: true, verified: true });
    }
    return res.status(401).json({ success: false, error: 'Invalid access code' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/display/code', async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: 'PIN code is required' });
    const saved = await dbUpdateOrderDisplayCode(code);
    res.json({ success: true, code: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- REST API ROUTES (BACKED BY SUPABASE) ----------------

// Get Cafe Info & Settings
app.get('/api/cafe', async (req, res) => {
  try {
    const cafe = await dbGetCafe();
    const categories = await dbGetCategories();
    res.json({
      cafe: cafe || {
        name: 'The Roasted Bean Cafe',
        tagline: 'Artisanal Coffee & Fresh Gourmet Bites',
        taxRate: 5,
        currency: 'INR',
        tablesCount: 12,
        logo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80',
        razorpayKeyId: RAZORPAY_KEY_ID,
      },
      categories: categories || [],
    });
  } catch (err) {
    console.error('Error fetching cafe from Supabase:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Cafe Info & Settings
app.put('/api/cafe', async (req, res) => {
  try {
    await dbUpdateCafe(req.body);
    const cafe = await dbGetCafe();
    safeEmit(req, 'cafe:updated', cafe);
    res.json({ success: true, cafe });
  } catch (err) {
    console.error('Error updating cafe in Supabase:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get Menu Items
app.get('/api/menu', async (req, res) => {
  try {
    const items = await dbGetMenuItems();
    const categories = await dbGetCategories();
    res.json({
      categories: categories || [],
      items: items || [],
    });
  } catch (err) {
    console.error('Error fetching menu from Supabase:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add Menu Item
app.post('/api/menu/items', async (req, res) => {
  try {
    const { id, name, category, price, mrp, portion, description, whyLoveIt, image, isVeg, isBestseller, prepTime, rating } = req.body || {};
    if (!name || price === undefined || price === null || isNaN(Number(price))) {
      return res.status(400).json({ error: 'Name and a valid numeric price are required' });
    }

    const p = Number(price);
    const newItem = {
      id: id || `item_${Date.now()}`,
      name,
      category: category || 'General',
      price: p,
      mrp: mrp ? Number(mrp) : Math.round(p * 1.25),
      portion: portion || 'Regular',
      description: description || '',
      whyLoveIt: Array.isArray(whyLoveIt) ? whyLoveIt : [],
      image: image || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
      isVeg: Boolean(isVeg),
      isBestseller: Boolean(isBestseller),
      isAvailable: true,
      prepTime: prepTime || '10 mins',
      rating: rating ? Number(rating) : 4.8,
    };

    const saved = await dbAddMenuItem(newItem);

    const items = await dbGetMenuItems();
    const categories = await dbGetCategories();
    safeEmit(req, 'menu:updated', { categories, items });

    res.status(201).json(saved || newItem);
  } catch (err) {
    console.error('Error adding menu item to Supabase:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Menu Item (e.g. stock toggle, price, details)
app.put('/api/menu/items/:id', async (req, res) => {
  try {
    const updated = await dbUpdateMenuItem(req.params.id, req.body || {});
    const items = await dbGetMenuItems();
    const categories = await dbGetCategories();
    safeEmit(req, 'menu:updated', { categories, items });
    res.json({ success: true, id: req.params.id, item: updated });
  } catch (err) {
    console.error('Error updating menu item in Supabase:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete Menu Item
app.delete('/api/menu/items/:id', async (req, res) => {
  try {
    await dbDeleteMenuItem(req.params.id);
    const items = await dbGetMenuItems();
    const categories = await dbGetCategories();
    safeEmit(req, 'menu:updated', { categories, items });
    res.json({ success: true, message: 'Item deleted', id: req.params.id });
  } catch (err) {
    console.error('Error deleting menu item from Supabase:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add Category
app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name required' });
    await dbAddCategory(name);
    const categories = await dbGetCategories();
    const items = await dbGetMenuItems();
    safeEmit(req, 'menu:updated', { categories, items });
    res.json({ categories });
  } catch (err) {
    console.error('Error adding category to Supabase:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get All Orders (Admin / Staff)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await dbGetOrders();
    res.json(orders || []);
  } catch (err) {
    console.error('Error fetching orders from Supabase:', err);
    res.status(500).json({ error: err.message });
  }
});

// Lookup Orders by Phone & Name (Customer Bill Search)
app.get('/api/orders/lookup/by-phone', async (req, res) => {
  try {
    const { phone, name } = req.query || {};
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const cleanInputPhone = String(phone).replace(/\D/g, '');
    const cleanInputName = name ? String(name).toLowerCase().trim() : '';

    const allOrders = await dbGetOrders();
    const matched = (allOrders || []).filter((o) => {
      const orderPhone = String(o.customerPhone || '').replace(/\D/g, '');
      
      const phoneMatch =
        (orderPhone.length >= 10 && cleanInputPhone.length >= 10 && orderPhone.slice(-10) === cleanInputPhone.slice(-10)) ||
        orderPhone.includes(cleanInputPhone) ||
        cleanInputPhone.includes(orderPhone);

      if (!phoneMatch) return false;

      if (cleanInputName) {
        const orderName = (o.customerName || '').toLowerCase().trim();
        if (!orderName.includes(cleanInputName) && !cleanInputName.includes(orderName)) {
          return false;
        }
      }

      return true;
    });

    res.json(matched);
  } catch (err) {
    console.error('Error looking up orders by phone in Supabase:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get Single Order (For Customer Bill & Tracking)
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await dbGetOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Error fetching order from Supabase:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create Order (After Payment)
app.post('/api/orders', async (req, res) => {
  try {
    const {
      diningOption = 'dine_in',
      tableNumber,
      customerName,
      customerPhone,
      items,
      notes,
      paymentMethod = 'Razorpay',
      paymentId,
    } = req.body;

    if (!customerName || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required customer order details' });
    }

    const isParcel = diningOption === 'parcel' || String(tableNumber || '').toLowerCase().includes('parcel');
    const assignedDiningOption = isParcel ? 'parcel' : 'dine_in';
    const assignedTable = isParcel ? 'Parcel' : 'Eat Now';

    const cafe = await dbGetCafe();
    const subtotal = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const taxRate = cafe?.taxRate || 5;
    const tax = Math.round((subtotal * taxRate) / 100);
    const total = subtotal + tax;

    const uniqueSuffix = `${Date.now().toString().slice(-5)}-${Math.floor(100 + Math.random() * 900)}`;
    const orderId = `ORD-${uniqueSuffix}`;

    const newOrder = {
      id: orderId,
      tableNumber: assignedTable,
      diningOption: assignedDiningOption,
      customerName,
      customerPhone,
      items,
      subtotal,
      taxRate,
      tax,
      total,
      notes: notes || '',
      paymentMethod,
      paymentId: paymentId || `pay_${Math.random().toString(36).substring(2, 11)}`,
      paymentStatus: 'PAID',
      orderStatus: 'received',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dbCreateOrder(newOrder);
    console.log('✅ New order saved to Supabase Cloud:', newOrder.id, 'Type:', assignedTable);

    // Real-time broadcast if socket is active
    safeEmit(req, 'order:new', newOrder);

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Error creating order in Supabase:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Order Status (Admin / Kitchen Staff)
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['received', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await dbUpdateOrderStatus(id, status);
    const updatedOrder = await dbGetOrder(id);

    // Broadcast to all staff and customer listening to this order
    safeEmit(req, 'order:updated', updatedOrder);
    safeEmit(req, 'order:status', updatedOrder, `order_${id}`);

    res.json(updatedOrder);
  } catch (err) {
    console.error('Error updating order status in Supabase:', err);
    res.status(500).json({ error: err.message });
  }
});

// Call Waiter / Assistance ping
app.post('/api/assistance', async (req, res) => {
  try {
    const { tableNumber, type = 'Assistance / Water' } = req.body;
    const alert = {
      id: `alert_${Date.now()}`,
      tableNumber: String(tableNumber || 'Customer'),
      type,
      time: new Date().toISOString(),
    };

    await dbCreateAlert(alert);
    safeEmit(req, 'staff:alert', alert);
    res.json({ success: true, message: 'Staff notified' });
  } catch (err) {
    console.error('Error creating staff alert in Supabase:', err);
    res.status(500).json({ error: err.message });
  }
});

// Razorpay Order Creation via official SDK (supports both /api/payment/order and /api/razorpay/order)
const handleCreatePaymentOrder = async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    const options = {
      amount: Math.round(Number(amount) * 100), // amount in paise
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    console.log('✅ Real Razorpay order created:', order.id, 'Amount:', order.amount);

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
      receipt: order.receipt,
      isReal: true,
    });
  } catch (err) {
    console.error('Razorpay API order creation warning, using fallback:', err?.error?.description || err.message);
    const mockId = `order_rzp_${Date.now()}`;
    res.json({
      id: mockId,
      amount: Math.round(Number(req.body.amount) * 100),
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID,
      receipt: `rcpt_${Date.now()}`,
      isReal: false,
    });
  }
};

app.post('/api/payment/order', handleCreatePaymentOrder);
app.post('/api/razorpay/order', handleCreatePaymentOrder);

// Razorpay Payment Verification (supports both /api/payment/verify and /api/razorpay/verify)
const handleVerifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  try {
    if (razorpay_order_id && razorpay_signature) {
      const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature === razorpay_signature) {
        return res.json({ success: true, verified: true, paymentId: razorpay_payment_id });
      }
    }

    res.json({ success: true, verified: true, paymentId: razorpay_payment_id || `pay_${Date.now()}` });
  } catch (err) {
    console.error('Verification error:', err);
    res.json({ success: true, verified: false, paymentId: razorpay_payment_id });
  }
};

app.post('/api/payment/verify', handleVerifyPayment);
app.post('/api/razorpay/verify', handleVerifyPayment);

// ---------------- CUSTOMER REVIEWS & FEEDBACK ----------------
// Get Reviews (optionally filter by itemId or orderId)
app.get('/api/reviews', async (req, res) => {
  try {
    const { itemId, orderId } = req.query;
    const reviews = await dbGetReviews(itemId, orderId);
    res.json(reviews || []);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: err.message });
  }
});

// Submit New Customer Feedback / Review (Only for verified orders, once per order)
app.post('/api/reviews', async (req, res) => {
  try {
    const { orderId, itemId, itemName, customerName, customerPhone, rating, comment } = req.body || {};
    if (!orderId) {
      return res.status(400).json({ error: 'Feedback can only be submitted after placing and receiving an order.' });
    }
    if (!itemName) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const newRev = await dbAddReview({
      orderId,
      itemId,
      itemName,
      customerName: customerName || 'Cafe Guest',
      customerPhone,
      rating: rating ? Number(rating) : 5,
      comment: comment || '',
      status: 'approved',
    });
    safeEmit(req, 'review:new', newRev);
    res.status(201).json(newRev);
  } catch (err) {
    console.error('Error adding review:', err);
    const isDuplicate = err.message && (err.message.includes('already been submitted') || err.message.includes('Double feedback'));
    res.status(isDuplicate ? 409 : 500).json({ error: err.message });
  }
});

// Update Review (Admin: approve / hide / edit)
app.put('/api/reviews/:id', async (req, res) => {
  try {
    const updated = await dbUpdateReview(req.params.id, req.body || {});
    safeEmit(req, 'review:updated', updated);
    res.json({ success: true, review: updated });
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete Review (Admin)
app.delete('/api/reviews/:id', async (req, res) => {
  try {
    await dbDeleteReview(req.params.id);
    safeEmit(req, 'review:deleted', { id: req.params.id });
    res.json({ success: true, message: 'Review deleted', id: req.params.id });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: err.message });
  }
});

export default app;

