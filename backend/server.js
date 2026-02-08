require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));

// connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// test route
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// start server
const os = require('os');

// start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);

  const interfaces = os.networkInterfaces();

  Object.values(interfaces).forEach((iface) => {
    iface.forEach((details) => {
      if (details.family === 'IPv4' && !details.internal) {
        console.log(`🌐 Backend available at: http://${details.address}:${PORT}`);
      }
    });
  });
});
