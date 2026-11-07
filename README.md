# ☕ CafeQR - Digital QR Menu, Table Ordering & Kitchen Display System

A modern, lightning-fast full-stack web application designed for cafes, restaurants, and coffee shops. It provides an automated contactless customer dining experience via table QR code scanning and an instant, zero-login admin & kitchen staff portal with live WebSockets.

---

## 🌟 Key Features

### 1. 📱 Customer Web App (Mobile-First Experience)
- **Table QR Scan & Welcome Hero:**
  - Detects table number directly from the QR code (e.g. `/?table=3`).
  - Displays cafe logo, cover banner, cafe name, tagline, address, and guest Wi-Fi details.
  - Smooth animated **"Get Started & View Menu"** entry.
- **Interactive Digital Menu:**
  - Horizontal scrolling category tabs (*Coffee & Espresso, Cold Brews & Shakes, Artisanal Teas, Bakery & Desserts, Burgers & Sandwiches, Pizzas & Pastas, Sides & Bites*).
  - Quick filters: **All Diet**, **🌱 Veg Only**, **🍗 Non-Veg**, and **⭐ Bestsellers**.
  - Real-time search bar for dishes and ingredients.
  - Food cards with appetizing photos, preparation time, pricing, and 1-click `[-] qty [+]` quantity controls.
- **Cart & Table Checkout:**
  - Slide-over cart drawer with itemized summary.
  - Special kitchen cooking notes input (e.g., *"Less sugar, extra hot milk"*).
  - Bill breakdown (Item Subtotal + 5% GST + Grand Total).
- **Guest Details & Razorpay Payment:**
  - One-click checkout modal asking for **Customer Full Name** and **10-Digit Mobile Number**.
  - Integrated **Razorpay Payment Gateway**:
    - Supports simulated one-click instant verification (UPI QR code, GPay, PhonePe, Cards, NetBanking).
    - Also supports live Razorpay keys configured via settings.
- **🧾 Instant Digital Bill & Live Order Tracking:**
  - Generated immediately after successful payment.
  - Displays **Cafe Logo**, **Cafe Name**, and **Small Custom Tagline** (*"Crafted with passion, brewed with love."*).
  - Detailed receipt with Order ID, Table #, Date & Time, Customer Name & Phone, itemized orders list, subtotal, GST, and grand total.
  - **Live Order Status Stepper:**
    - `Received` ➔ `Preparing` ➔ `Ready to Serve` ➔ `Completed`
    - Updates in **real-time without page reload** via WebSockets when the kitchen updates the status!
  - Thermal-style **Print Bill / Save Invoice** button with print-optimized CSS.
- **🛎️ Call Waiter / Assistance Bell:**
  - Customers can tap "Call Server" to request drinking water, cutlery/napkins, or assistance, which pings the kitchen staff dashboard with an audio chime!

---

### 2. 👨‍🍳 Admin & Cafe Staff Portal (No Sign-In / Login Required)
- **Direct Frictionless Access:**
  - Switch to staff mode directly by clicking the shield icon in the header or visiting `http://localhost:3000/#admin`.
  - Zero login/signup hurdles for cafe owners and kitchen staff.
- **Live Kitchen Display System (KDS):**
  - Real-time feed of all incoming table orders.
  - **Pleasant Web Audio chime** automatically rings whenever a new order is placed or a waiter is called!
  - One-click order status progression:
    - `Start Preparing 👨‍🍳` ➔ `Mark Ready to Serve 🔔` ➔ `Complete & Served ✅` (or Cancel).
  - Order elapsed timer, customer details, table number, and cooking notes.
  - Filter orders by *Active Live, Received, In Kitchen, Ready, Completed, or All*.
- **☕ Menu & Stock Manager:**
  - Add new dishes with name, category, price, veg/non-veg status, photo URL, description, and prep time.
  - Instant **In-Stock / Sold-Out** toggle switch (immediately disables the item on customers' phones in real-time).
  - Edit dish details or delete items.
  - Add new menu categories on the fly.
- **🖨️ Table QR Code Generator:**
  - Visual grid of all tables (Tables 1 to 12+).
  - Stylish printable table tent cards with cafe logo, table number, and crisp scannable QR code.
  - "Test Scan" button to simulate customer opening that table's menu directly.
  - Print individual table cards or batch print all tent cards.
- **⚙️ Cafe Branding & Settings:**
  - Edit Cafe Name, Tagline / Small line on bill, Logo URL, Cover Photo, Address, Phone, Wi-Fi credentials, GST Rate (%), and Razorpay Key ID.

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- npm

### Start Development Server
```bash
npm run dev
```
This runs both:
- **Backend API & WebSockets Server**: `http://localhost:5000`
- **Frontend Vite Client**: `http://localhost:3000`

---

## 📂 Project Structure

```
cafeqr/
├── server/
│   ├── index.js          # Express server with Socket.IO & REST endpoints
│   └── data/
│       └── store.json    # Persistent JSON database (auto-seeded)
├── src/
│   ├── types.ts          # TypeScript models & interfaces
│   ├── services/
│   │   ├── api.ts        # REST client & API calls
│   │   ├── socket.ts     # Real-time Socket.IO client
│   │   └── sound.ts      # Web Audio API chime bell player
│   ├── components/
│   │   ├── customer/     # Customer Mobile Web App components
│   │   │   ├── WelcomeHero.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── CategoryBar.tsx
│   │   │   ├── MenuItemCard.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── CustomerCheckoutModal.tsx
│   │   │   ├── RazorpaySimulatorModal.tsx
│   │   │   ├── BillReceiptView.tsx
│   │   │   └── CallWaiterModal.tsx
│   │   └── admin/        # Admin & Staff components
│   │       ├── AdminHeader.tsx
│   │       ├── LiveKDSView.tsx
│   │       ├── MenuManagerView.tsx
│   │       ├── TableQRGenerator.tsx
│   │       └── CafeSettingsView.tsx
│   ├── App.tsx           # Main application shell & router
│   ├── main.tsx          # Application entrypoint
│   └── index.css         # Tailwind CSS & thermal print styling
├── package.json
└── vite.config.ts
```
