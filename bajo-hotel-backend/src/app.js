import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import hotelRoutes from './routes/hotelRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import extraRoutes from './routes/extraRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base / Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Labuan Bajo Hotel Booking API is running smoothly 🚀',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/hotels', hotelRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/extras', extraRoutes);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} tidak ditemukan`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Server is running on port ${PORT}`);
  console.log(` Access API: http://localhost:${PORT}`);
  console.log(`===================================================`);
});

export default app;
