import { io, Socket } from 'socket.io-client';
import { getBackendBaseUrl } from './api';

const backendUrl = getBackendBaseUrl();

// Connect to the backend server (Render in production, localhost in dev, or relative if same-origin)
export const socket: Socket = io(backendUrl || undefined, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
});

