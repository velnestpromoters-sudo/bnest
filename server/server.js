require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { Server } = require('socket.io');
const paymentRoutes = require('./routes/paymentRoutes');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use('/api/payment', paymentRoutes);

// 3-Minute Render Free Tier Anti-Sleep Keep-Alive Ping (Dual Mode)
const https = require('https');

// Keep references to URLs to ping
const PING_URLS = [
  'https://bnest-backend-oz7c.onrender.com', // Backend
  'https://homyvo.onrender.com',             // Frontend
];

setInterval(() => {
  PING_URLS.forEach(url => {
    https.get(url).on('error', (err) => {
      console.log(`Ping error for ${url}:`, err.message);
    });
  });
  console.log(`Fired anti-sleep heartbeat ping to ${PING_URLS.length} services`);
}, 3 * 60 * 1000);

const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});
