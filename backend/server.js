require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const os = require('os');

const clothingRoutes = require('./routes/clothing');
const authRoutes = require('./routes/auth');
const trendsRoute = require('./routes/trends');
const outfitsRoute = require('./routes/outfits');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/clothing', clothingRoutes);
app.use('/api/trends', trendsRoute);
app.use('/api/outfits', outfitsRoute);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

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