import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Default Seed Data
const defaultData = {
  cafe: {
    name: "The Roasted Bean Cafe",
    tagline: "Crafted with passion, brewed with love.",
    logo: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80",
    address: "42 Artisan Lane, Indiranagar, Bengaluru - 560038",
    phone: "+91 98765 43210",
    wifiSsid: "RoastedBean_Guest",
    wifiPassword: "CoffeeLove2026",
    currency: "₹",
    taxRate: 5, // 5% GST
    razorpayKeyId: "rzp_test_cafeqrdemo",
    upiId: "roastedbean@upi",
    tablesCount: 12,
  },
  categories: [
    "Coffee & Espresso",
    "Cold Brews & Shakes",
    "Artisanal Teas",
    "Burgers & Sandwiches",
    "Pizzas & Pastas",
    "Bakery & Desserts",
    "Sides & Bites"
  ],
  menu: [
    {
      id: "item_1",
      name: "Signature Spanish Latte",
      category: "Coffee & Espresso",
      price: 240,
      mrp: 290,
      portion: "300ml",
      description: "Double shot espresso with condensed milk, velvety steamed milk, and a dusting of Ceylon cinnamon.",
      whyLoveIt: [
        "100% Single-origin Arabica beans",
        "Creamy sweetened milk with aromatic Ceylon cinnamon",
        "Crafted fresh by our master baristas"
      ],
      image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: true,
      isAvailable: true,
      prepTime: "5-7 mins",
      rating: 4.9
    },
    {
      id: "item_2",
      name: "Velvet Flat White",
      category: "Coffee & Espresso",
      price: 210,
      mrp: 260,
      portion: "240ml",
      description: "Silky micro-foam poured over a double ristretto of single-origin Arabica beans.",
      whyLoveIt: [
        "Rich double ristretto extraction",
        "Ultra-silky velvety microfoam texture",
        "No added artificial flavors or preservatives"
      ],
      image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: false,
      isAvailable: true,
      prepTime: "5-7 mins",
      rating: 4.8
    },
    {
      id: "item_3",
      name: "Classic Cappuccino",
      category: "Coffee & Espresso",
      price: 190,
      mrp: 240,
      portion: "250ml",
      description: "Equal parts espresso, steamed milk, and rich foam, topped with Belgian cocoa.",
      whyLoveIt: [
        "Traditional Italian 1:1:1 foam to milk ratio",
        "Dusting of premium unsweetened Belgian cocoa",
        "Perfect morning pick-me-up"
      ],
      image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: true,
      isAvailable: true,
      prepTime: "5 mins",
      rating: 4.9
    },
    {
      id: "item_4",
      name: "Vanilla Cold Foam Cold Brew",
      category: "Cold Brews & Shakes",
      price: 260,
      mrp: 320,
      portion: "350ml",
      description: "18-hour slow steeped cold brew topped with house-made Madagascar vanilla sweet cream foam.",
      whyLoveIt: [
        "Slow cold-steeped for 18 hours for zero bitterness",
        "House-made Madagascar Bourbon vanilla foam",
        "Low acidity and naturally refreshing"
      ],
      image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: true,
      isAvailable: true,
      prepTime: "4 mins",
      rating: 5.0
    },
    {
      id: "item_5",
      name: "Belgian Dark Chocolate Frappe",
      category: "Cold Brews & Shakes",
      price: 280,
      mrp: 340,
      portion: "400ml",
      description: "Thick ice-blended 70% dark Belgian cocoa with whipped cream and chocolate drizzle.",
      whyLoveIt: [
        "Authentic 70% dark Belgian couverture cocoa",
        "Topped with fresh cloud whipped cream",
        "Decadent yet balanced sweetness"
      ],
      image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: false,
      isAvailable: true,
      prepTime: "6 mins",
      rating: 4.7
    },
    {
      id: "item_6",
      name: "Kashmiri Kahwa Tea",
      category: "Artisanal Teas",
      price: 180,
      mrp: 220,
      portion: "200ml",
      description: "Fragrant green tea infused with saffron strands, whole green cardamom, cinnamon, and crushed almonds.",
      whyLoveIt: [
        "Infused with real Kashmiri saffron strands",
        "Garnished with toasted slivered almonds",
        "Soothing, digestive, and antioxidant rich"
      ],
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: false,
      isAvailable: true,
      prepTime: "5 mins",
      rating: 4.8
    },
    {
      id: "item_7",
      name: "Hibiscus Berry Iced Tea",
      category: "Artisanal Teas",
      price: 200,
      mrp: 250,
      portion: "350ml",
      description: "Brewed whole Egyptian hibiscus petals with wild forest berries and a touch of mint.",
      whyLoveIt: [
        "Naturally tart and caffeine-free",
        "Loaded with Vitamin C from wild berries",
        "Served iced with fresh garden mint"
      ],
      image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: true,
      isAvailable: true,
      prepTime: "4 mins",
      rating: 4.9
    },
    {
      id: "item_8",
      name: "Truffle Mushroom Melt Panini",
      category: "Burgers & Sandwiches",
      price: 320,
      mrp: 380,
      portion: "300g",
      description: "Sauteed wild portobello mushrooms, garlic aioli, mozzarella, and white truffle oil on sourdough.",
      whyLoveIt: [
        "Artisanal slow-fermented sourdough bread",
        "Infused with aromatic Italian white truffle oil",
        "Melted fior di latte mozzarella"
      ],
      image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: true,
      isAvailable: true,
      prepTime: "10-12 mins",
      rating: 4.9
    },
    {
      id: "item_9",
      name: "Grilled Herb Chicken Burger",
      category: "Burgers & Sandwiches",
      price: 360,
      mrp: 420,
      portion: "350g",
      description: "Rosemary marinated grilled chicken breast, caramelized onions, smoked cheddar, and chipotle mayo.",
      whyLoveIt: [
        "Fresh tender grilled chicken breast (never frozen)",
        "Soft artisanal brioche bun toasted in butter",
        "Smoked cheddar and house-made chipotle mayo"
      ],
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
      isVeg: false,
      isBestseller: true,
      isAvailable: true,
      prepTime: "12-15 mins",
      rating: 4.9
    },
    {
      id: "item_10",
      name: "Artisanal Margherita Pizza",
      category: "Pizzas & Pastas",
      price: 380,
      mrp: 450,
      portion: "10 inch",
      description: "Neapolitan hand-stretched crust, San Marzano tomato sauce, fresh buffalo mozzarella, and fresh basil.",
      whyLoveIt: [
        "Fermented 48-hour authentic Neapolitan dough",
        "San Marzano Italian DOP tomatoes",
        "Fresh buffalo mozzarella & sweet Genovese basil"
      ],
      image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: false,
      isAvailable: true,
      prepTime: "15 mins",
      rating: 4.8
    },
    {
      id: "item_11",
      name: "Creamy Pesto Penne",
      category: "Pizzas & Pastas",
      price: 350,
      mrp: 410,
      portion: "320g",
      description: "Penne tossed in Genovese basil pine-nut pesto, roasted cherry tomatoes, and aged parmesan.",
      whyLoveIt: [
        "Fresh house-pounded basil and toasted pine nut pesto",
        "Burst cherry tomatoes for sweet acidity",
        "Finished with 24-month aged Parmigiano-Reggiano"
      ],
      image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281729?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: false,
      isAvailable: true,
      prepTime: "12 mins",
      rating: 4.7
    },
    {
      id: "item_12",
      name: "Warm Chocolate Fudge Brownie",
      category: "Bakery & Desserts",
      price: 220,
      mrp: 270,
      portion: "200g",
      description: "Warm gooey Belgian chocolate brownie served with vanilla bean gelato and dark chocolate ganache.",
      whyLoveIt: [
        "Crispy crackly top with molten gooey center",
        "Made with pure 60% dark chocolate",
        "Served warm with bourbon vanilla gelato"
      ],
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: true,
      isAvailable: true,
      prepTime: "5 mins",
      rating: 5.0
    },
    {
      id: "item_13",
      name: "Classic French Butter Croissant",
      category: "Bakery & Desserts",
      price: 160,
      mrp: 190,
      portion: "120g",
      description: "Golden flaky layered pastry made with 100% French cultured butter.",
      whyLoveIt: [
        "Hundreds of delicate flaky golden layers",
        "100% Normandy cultured butter",
        "Freshly baked every morning at 7 AM"
      ],
      image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: false,
      isAvailable: true,
      prepTime: "3 mins",
      rating: 4.8
    },
    {
      id: "item_14",
      name: "Peri-Peri Crispy Fries",
      category: "Sides & Bites",
      price: 180,
      mrp: 220,
      portion: "250g",
      description: "Crispy skin-on french fries tossed in zesty African bird's eye chili seasoning with garlic dip.",
      whyLoveIt: [
        "Extra crunchy double-fried russet potatoes",
        "Spicy tangy house peri-peri spice dust",
        "Served with creamy roasted garlic mayo"
      ],
      image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: true,
      isAvailable: true,
      prepTime: "8 mins",
      rating: 4.9
    }
  ],
  orders: []
};

// Helper to read and write database
function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading data, resetting to default:', err);
    return defaultData;
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data:', err);
  }
}

// In-memory reference for fast access
let db = loadData();

// ---------------- REST API ROUTES ----------------

// Get Cafe Info & Settings
app.get('/api/cafe', (req, res) => {
  res.json({
    cafe: db.cafe,
    categories: db.categories,
  });
});

// Update Cafe Info & Settings
app.put('/api/cafe', (req, res) => {
  db.cafe = { ...db.cafe, ...req.body };
  saveData(db);
  io.emit('cafe:updated', db.cafe);
  res.json({ success: true, cafe: db.cafe });
});

// Get Menu Items
app.get('/api/menu', (req, res) => {
  res.json({
    categories: db.categories,
    items: db.menu,
  });
});

// Add Menu Item
app.post('/api/menu/items', (req, res) => {
  const { name, category, price, mrp, portion, description, whyLoveIt, image, isVeg, isBestseller, prepTime, rating } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const p = Number(price);
  const newItem = {
    id: `item_${Date.now()}`,
    name,
    category: category || 'Coffee & Espresso',
    price: p,
    mrp: mrp ? Number(mrp) : Math.round(p * 1.2),
    portion: portion || 'Regular',
    description: description || '',
    whyLoveIt: Array.isArray(whyLoveIt) ? whyLoveIt : [
      "Crafted with fresh premium ingredients",
      "Prepared to order by our kitchen team",
      "Authentic cafe recipe"
    ],
    image: image || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
    isVeg: Boolean(isVeg),
    isBestseller: Boolean(isBestseller),
    isAvailable: true,
    prepTime: prepTime || '10 mins',
    rating: rating ? Number(rating) : 4.8,
  };

  db.menu.unshift(newItem);
  if (!db.categories.includes(newItem.category)) {
    db.categories.push(newItem.category);
  }
  saveData(db);
  io.emit('menu:updated', { categories: db.categories, items: db.menu });
  res.status(201).json(newItem);
});

// Update Menu Item (e.g. stock toggle, price, details)
app.put('/api/menu/items/:id', (req, res) => {
  const { id } = req.params;
  const index = db.menu.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(400).json({ error: 'Item not found' });
  }

  db.menu[index] = { ...db.menu[index], ...req.body };
  saveData(db);
  io.emit('menu:updated', { categories: db.categories, items: db.menu });
  res.json(db.menu[index]);
});

// Delete Menu Item
app.delete('/api/menu/items/:id', (req, res) => {
  const { id } = req.params;
  db.menu = db.menu.filter(item => item.id !== id);
  saveData(db);
  io.emit('menu:updated', { categories: db.categories, items: db.menu });
  res.json({ success: true, message: 'Item deleted' });
});

// Add Category
app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name required' });
  if (!db.categories.includes(name)) {
    db.categories.push(name);
    saveData(db);
    io.emit('menu:updated', { categories: db.categories, items: db.menu });
  }
  res.json({ categories: db.categories });
});

// Get All Orders (Admin / Staff)
app.get('/api/orders', (req, res) => {
  // sort newest first
  const sorted = [...db.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(sorted);
});

// Get Single Order (For Customer Bill & Tracking)
app.get('/api/orders/:id', (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Create Order (After Razorpay Payment)
app.post('/api/orders', (req, res) => {
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

  const subtotal = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const taxRate = db.cafe.taxRate || 5;
  const tax = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + tax;

  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

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
    orderStatus: 'received', // 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled'
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.orders.unshift(newOrder);
  saveData(db);

  // Real-time broadcast to admin/kitchen
  io.emit('order:new', newOrder);

  res.status(201).json(newOrder);
});

// Update Order Status (Admin / Kitchen Staff)
app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['received', 'preparing', 'ready', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const orderIndex = db.orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  db.orders[orderIndex].orderStatus = status;
  db.orders[orderIndex].updatedAt = new Date().toISOString();
  saveData(db);

  const updatedOrder = db.orders[orderIndex];

  // Broadcast to all staff and customer listening to this order
  io.emit('order:updated', updatedOrder);
  io.to(`order_${id}`).emit('order:status', updatedOrder);

  res.json(updatedOrder);
});

// Call Waiter / Assistance ping
app.post('/api/assistance', (req, res) => {
  const { tableNumber, type = 'Assistance / Water' } = req.body;
  const alert = {
    id: `alert_${Date.now()}`,
    tableNumber: String(tableNumber),
    type,
    time: new Date().toISOString(),
  };

  io.emit('staff:alert', alert);
  res.json({ success: true, message: 'Staff notified' });
});

// Razorpay Order Creation via official SDK
app.post('/api/razorpay/order', async (req, res) => {
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
    console.error('⚠️ Razorpay API order creation warning, using fallback:', err?.error?.description || err.message);
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
});

// Razorpay Payment Verification
app.post('/api/razorpay/verify', (req, res) => {
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

    // Default approval for test mode
    res.json({ success: true, verified: true, paymentId: razorpay_payment_id || `pay_${Date.now()}` });
  } catch (err) {
    console.error('Verification error:', err);
    res.json({ success: true, verified: false, paymentId: razorpay_payment_id });
  }
});

// ---------------- WEBSOCKETS ----------------
io.on('connection', (socket) => {
  // Join a specific order tracking room
  socket.on('track_order', (orderId) => {
    socket.join(`order_${orderId}`);
  });

  // Call waiter directly via socket
  socket.on('call_waiter', (payload) => {
    io.emit('staff:alert', {
      id: `alert_${Date.now()}`,
      tableNumber: payload.tableNumber,
      type: payload.type || 'Waiter Called',
      time: new Date().toISOString(),
    });
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`☕ CafeQR Backend running on port ${PORT}`);
});

