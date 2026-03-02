require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const Clothing = require('./models/Clothing');

const app = express();

// More detailed CORS configuration
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-User-Id', 'Accept'],
  credentials: true
}));

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.method === 'POST' && req.is('multipart/form-data')) {
    console.log('📎 Multipart form data request');
  }
  next();
});

// Configure Cloudinary
console.log('🔧 Configuring Cloudinary...');
console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key present:', !!process.env.CLOUDINARY_API_KEY);
console.log('API Secret present:', !!process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test Cloudinary connection
cloudinary.api.ping()
  .then(result => console.log('✅ Cloudinary connection successful'))
  .catch(error => console.error('❌ Cloudinary connection failed:', error.message));

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'clothing-items',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Import routes
const authRoutes = require('./routes/auth');

// Use routes
app.use('/api/auth', authRoutes);

// ============ CLOTHING ITEMS ROUTES WITH AUTH ============

// Get all clothing items for authenticated user
app.get('/api/clothing/me', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    const items = await Clothing.find({ userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get clothing items by specific user ID (legacy support)
app.get('/api/clothing/:userId', async (req, res) => {
  try {
    const items = await Clothing.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new clothing item for authenticated user
app.post('/api/clothing', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    const newItem = new Clothing({
      ...req.body,
      userId
    });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update clothing item (verify ownership)
app.put('/api/clothing/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    const item = await Clothing.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check if the item belongs to the user
    if (item.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const updatedItem = await Clothing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete clothing item (verify ownership)
app.delete('/api/clothing/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    const item = await Clothing.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check if the item belongs to the user
    if (item.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await Clothing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(400).json({ error: error.message });
  }
});

// Toggle favorite (verify ownership)
app.patch('/api/clothing/:id/favorite', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    const item = await Clothing.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check if the item belongs to the user
    if (item.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    item.favorite = !item.favorite;
    await item.save();
    res.json(item);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(400).json({ error: error.message });
  }
});

// ============ IMAGE UPLOAD ROUTE WITH ENHANCED DEBUGGING ============

// Test endpoint to verify multipart uploads
app.post('/api/test-upload', (req, res) => {
  console.log('🔍 Test upload endpoint hit');
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.get('Content-Type'));
  
  res.json({ 
    message: 'Test endpoint working',
    headers: req.headers,
    contentType: req.get('Content-Type')
  });
});

// Image upload route with better error handling and debugging
app.post('/api/upload', (req, res) => {
  console.log('📸 Upload request received');
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Headers:', req.headers);
  
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Max size is 5MB.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ 
          error: 'Unexpected field name. Expected "image", got: ' + err.field,
          expected: 'image',
          received: err.field
        });
      }
      return res.status(400).json({ error: err.message });
    }
    
    try {
      console.log('📁 File received:', req.file ? 'Yes' : 'No');
      
      if (!req.file) {
        console.log('❌ No file in request');
        // Check if any files were sent
        if (req.files) {
          console.log('Files object exists:', Object.keys(req.files));
        }
        if (req.body) {
          console.log('Body keys:', Object.keys(req.body));
        }
        return res.status(400).json({ 
          error: 'No image file provided',
          receivedFields: req.body ? Object.keys(req.body) : []
        });
      }
      
      console.log('✅ File uploaded successfully:', {
        path: req.file.path,
        size: req.file.size,
        format: req.file.format,
        originalName: req.file.originalname
      });
      
      res.json({ 
        imageUrl: req.file.path,
        message: 'Image uploaded successfully' 
      });
    } catch (error) {
      console.error('❌ Upload processing error:', error);
      res.status(400).json({ error: error.message });
    }
  });
});

// Bulk delete items for a user (optional - for cleanup)
app.delete('/api/clothing/user/:userId', async (req, res) => {
  try {
    const requestingUserId = req.headers['x-user-id'];
    if (!requestingUserId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    // Only allow users to delete their own items
    if (requestingUserId !== req.params.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await Clothing.deleteMany({ userId: req.params.userId });
    res.json({ message: 'All items deleted successfully' });
  } catch (error) {
    console.error('Error bulk deleting items:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get item statistics for authenticated user
app.get('/api/clothing/me/stats', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    const items = await Clothing.find({ userId });
    
    const stats = {
      total: items.length,
      favorites: items.filter(item => item.favorite).length,
      categories: items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {}),
      topColors: items.reduce((acc, item) => {
        if (item.color) {
          acc[item.color] = (acc[item.color] || 0) + 1;
        }
        return acc;
      }, {})
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get item statistics for specific user (legacy support)
app.get('/api/clothing/:userId/stats', async (req, res) => {
  try {
    const items = await Clothing.find({ userId: req.params.userId });
    
    const stats = {
      total: items.length,
      favorites: items.filter(item => item.favorite).length,
      categories: items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {}),
      topColors: items.reduce((acc, item) => {
        if (item.color) {
          acc[item.color] = (acc[item.color] || 0) + 1;
        }
        return acc;
      }, {})
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(400).json({ error: error.message });
  }
});

// ============ TEST ROUTE ============
app.get('/', (req, res) => {
  res.send(`
    <h1>🚀 Backend is running</h1>
    <p>Available endpoints:</p>
    <ul>
      <li>GET / - This page</li>
      <li>POST /api/auth/register - Register user</li>
      <li>POST /api/auth/login - Login user</li>
      <li>GET /api/clothing/me - Get my clothing items</li>
      <li>POST /api/clothing - Create clothing item</li>
      <li>PUT /api/clothing/:id - Update clothing item</li>
      <li>DELETE /api/clothing/:id - Delete clothing item</li>
      <li>PATCH /api/clothing/:id/favorite - Toggle favorite</li>
      <li>POST /api/upload - Upload image</li>
      <li>POST /api/test-upload - Test upload endpoint</li>
      <li>GET /api/clothing/me/stats - Get my stats</li>
    </ul>
  `);
});

// ============ ERROR HANDLING MIDDLEWARE ============
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Handle 404
app.use((req, res) => {
  console.log('❌ 404 Not Found:', req.method, req.url);
  res.status(404).json({ error: 'Endpoint not found' });
});

// ============ START SERVER ============
const os = require('os');
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  
  const interfaces = os.networkInterfaces();
  Object.values(interfaces).forEach((iface) => {
    iface.forEach((details) => {
      if (details.family === 'IPv4' && !details.internal) {
        console.log(`🌐 Network: http://${details.address}:${PORT}`);
      }
    });
  });
  console.log('📝 Server ready to accept requests');
});