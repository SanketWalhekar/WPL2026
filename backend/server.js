const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const registrationRoutes = require('./routes/registrationRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const auction = require('./routes/auction');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- MongoDB (serverless-safe, cached connection) ----------
let connectionPromise = null;

function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  if (!connectionPromise) {
    if (!process.env.MONGODB_URI) {
      return Promise.reject(new Error('MONGODB_URI is missing in environment variables'));
    }

    console.log('Connecting to MongoDB...');

    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 8000,
        bufferCommands: false
      })
      .then(() => {
        console.log('MongoDB connected successfully');
      })
      .catch((error) => {
        connectionPromise = null; // allow retry on the next request
        throw error;
      });
  }

  return connectionPromise;
}

// Every request waits for the DB before reaching any route
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
});

// ---------- Routes ----------
app.use('/api/registrations', registrationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auction', auction);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WPL Backend API is running'
  });
});

// ---------- Local development only ----------
// Vercel sets process.env.VERCEL, so app.listen never runs there
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
