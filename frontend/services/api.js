import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Replace this with your computer's actual IP address
const BASE_URL = 'http://192.168.100.9:3000'; // Your IP from app.js

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000, // Increased timeout for image uploads
});

// Add a request interceptor to include the user ID and handle FormData
api.interceptors.request.use(
  async (config) => {
    // Get user from AsyncStorage
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      config.headers['X-User-Id'] = user.id;
    }

    // Don't set Content-Type for FormData - let axios set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    console.log('Making request to:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response from:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (!error.response) {
      console.error('Network error - is your backend running?', error.message);
    } else {
      console.error('Response error:', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

export const clothingApi = {
  // Get all items
  getAllItems: () => api.get('/clothing/me'),
  
  // Create new item
  createItem: (itemData) => api.post('/clothing', itemData),
  
  // Update item
  updateItem: (id, itemData) => api.put(`/clothing/${id}`, itemData),
  
  // Delete item
  deleteItem: (id) => api.delete(`/clothing/${id}`),
  
  // Toggle favorite
  toggleFavorite: (id) => api.patch(`/clothing/${id}/favorite`),
  
  // Upload image - IMPORTANT: Don't set headers here, let interceptor handle it
  uploadImage: (formData) => api.post('/upload', formData),
  
  // Get stats
  getStats: () => api.get('/clothing/me/stats'),
};

export default api;