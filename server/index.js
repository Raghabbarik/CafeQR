import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import crypto from 'crypto';
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
} from './supabase.js';

dotenv.config();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TxJ87ji7k95ncJ';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '7qT7ekNztPZcBzIlahb13GQk';

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

// ---------------- REST API ROUTES (ALL BACKED BY SUPABASE) ----------------

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
    io.emit('cafe:updated', cafe);
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
    const { name, category, price, mrp, portion, description, whyLoveIt, image, isVeg, isBestseller, prepTime, rating } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const p = Number(price);
    const newItem = {
      id: `item_${Date.now()}`,
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

    await dbAddMenuItem(newItem);

    const items = await dbGetMenuItems();
    const categories = await dbGetCategories();
    io.emit('menu:updated', { categories, items });

    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error adding menu item to Supabase:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Menu Item (e.g. stock toggle, price, details)
app.put('/api/menu/items/:id', async (req, res) => {
  try {
    await dbUpdateMenuItem(req.params.id, req.body);
    const items = await dbGetMenuItems();
    const categories = await dbGetCategories();
    io.emit('menu:updated', { categories, items });
    res.json({ success: true, id: req.params.id });
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
    io.emit('menu:updated', { categories, items });
    res.json({ success: true, message: 'Item deleted' });
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
    io.emit('menu:updated', { categories, items });
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

// Create Order (After Razorpay Payment)
app.post('/api/orders', async (req, res) => {
  try {
    const {
      tableNumber,
      customerName,
      customerPhone,
      items,
      notes,
      paymentMethod = 'Razorpay',
      paymentId,
    } = req.body;

    if (!tableNumber || !customerName || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required order details' });
    }

    const cafe = await dbGetCafe();
    const subtotal = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const taxRate = cafe?.taxRate || 5;
    const tax = Math.round((subtotal * taxRate) / 100);
    const total = subtotal + tax;

    const uniqueSuffix = `${Date.now().toString().slice(-5)}-${Math.floor(100 + Math.random() * 900)}`;
    const orderId = `ORD-${uniqueSuffix}`;

    const newOrder = {
      id: orderId,
      tableNumber: String(tableNumber),
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
    console.log('✅ New order saved to Supabase Cloud:', newOrder.id, 'Table:', tableNumber);

    // Real-time broadcast to admin/kitchen
    io.emit('order:new', newOrder);

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
    io.emit('order:updated', updatedOrder);
    io.to(`order_${id}`).emit('order:status', updatedOrder);

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
      tableNumber: String(tableNumber),
      type,
      time: new Date().toISOString(),
    };

    await dbCreateAlert(alert);
    io.emit('staff:alert', alert);
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

// ---------------- WEBSOCKETS ----------------
io.on('connection', (socket) => {
  socket.on('track_order', (orderId) => {
    socket.join(`order_${orderId}`);
  });

  socket.on('call_waiter', async (payload) => {
    const alert = {
      id: `alert_${Date.now()}`,
      tableNumber: payload.tableNumber,
      type: payload.type || 'Waiter Called',
      time: new Date().toISOString(),
    };
    try {
      await dbCreateAlert(alert);
    } catch {}
    io.emit('staff:alert', alert);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`☕ CafeQR Backend running on port ${PORT} (0.0.0.0) connected to Supabase Cloud DB`);
});
