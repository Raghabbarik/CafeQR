import { io, Socket } from 'socket.io-client';

// Connect to the backend server (relative path via Vite proxy or direct)
export const socket: Socket = io({
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
});

