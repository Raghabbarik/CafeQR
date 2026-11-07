import app from './app.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { dbCreateAlert } from './supabase.js';

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

// Attach io to express app so safeEmit can broadcast
app.set('io', io);

// ---------------- WEBSOCKETS (Local / Dedicated Server) ----------------
io.on('connection', (socket) => {
  socket.on('track_order', (orderId) => {
    socket.join(`order_${orderId}`);
  });

  socket.on('call_waiter', async (payload) => {
    const alert = {
      id: `alert_${Date.now()}`,
      tableNumber: payload.tableNumber || 'Customer',
      type: payload.type || 'Staff Called',
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

export { app, httpServer, io };
