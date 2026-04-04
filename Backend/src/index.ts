// ─── Server Bootstrap ─── Express + Socket.IO + TikTok ───
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import apiRoutes from './routes/api.js';
import { gameManager } from './GameManager.js';
import { tiktokService } from './TikTokService.js';

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── Express App ───
const app = express();
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use('/api', apiRoutes);

// ─── HTTP Server ───
const httpServer = createServer(app);

// ─── Socket.IO ───
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ─── Socket.IO Connection Handler ───
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Send current game state on connect
  socket.emit('init', gameManager.getState());

  // Send TikTok connection status
  socket.emit('tiktok:status', tiktokService.getStatus());

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ─── GameManager → Socket.IO bridge ───
gameManager.on('move', (data) => {
  io.emit('game:move', data);
});

gameManager.on('winner', (data) => {
  io.emit('game:winner', data);
});

gameManager.on('stateChange', (state) => {
  io.emit('game:stateChange', state);
});

// ─── TikTok → GameManager + Socket.IO bridge ───
tiktokService.on('gift', (giftData) => {
  gameManager.processGift(giftData);
});

tiktokService.on('follow', (data) => {
  io.emit('tiktok:follow', data);
});

tiktokService.on('share', (data) => {
  io.emit('tiktok:share', data);
});

tiktokService.on('like', (data) => {
  io.emit('tiktok:like', data);
});

tiktokService.on('disconnected', () => {
  io.emit('tiktok:status', { connected: false, username: '' });
});

// ─── Start Server ───
httpServer.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   ⚡ TIKTOK NATION RACE - BACKEND ⚡     ║');
  console.log(`║   Server running on port ${PORT}            ║`);
  console.log(`║   Frontend URL: ${FRONTEND_URL}    ║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
});
