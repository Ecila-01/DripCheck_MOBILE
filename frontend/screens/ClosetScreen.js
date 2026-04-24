import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StatusBar, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';
import ClothingCard from '../components/ClothingCard';
import ClothingFormModal from '../components/ClothingFormModal';
import styles from '../styles/ClosetScreenStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import our separated helpers!
import { 
  categories, 
  getCategoryIcon, 
  uploadImageToCloudinary,
  apiFetchClothing, 
  apiCreateClothing, 
  apiUpdateClothing, 
  apiDeleteClothing, 
  apiToggleFavorite 
} from '../utils/closetHelpers';

const ClosetScreen = ({ setActiveTab, user, API_URL }) => {
  const [clothingItems, setClothingItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [itemForm, setItemForm] = useState({
    icon: '👕', name: '', category: 'Tops', color: '', imageUri: '', weatherTags: [], layerWeight: 'light', occasion: 'casual',
  });

  useEffect(() => {
    if (user?.id) fetchItems();
  }, [user]);

  const fetchItems = async (showLoader = true) => {
    if (!user?.id) return setClothingItems([]);
    if (showLoader) setLoadingItems(true);
    
    try {
      const items = await apiFetchClothing(API_URL, user.id);
      setClothingItems(items);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      if (showLoader) setLoadingItems(false);
    }
  };
  // Function to persist data for Offline Mode
  const saveToOfflineCache = async (items) => {
    try {
      await AsyncStorage.setItem('offline_closet', JSON.stringify(items));
      console.log("📦 Closet cached for offline use.");
    } catch (e) {
      console.error("Failed to save offline cache", e);
    }
  };

  // Trigger cache update whenever clothingItems changes
  useEffect(() => {
    if (clothingItems.length > 0) {
      saveToOfflineCache(clothingItems);
    }
  }, [clothingItems]);
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchItems(false);
    setRefreshing(false);
  };

  const resetForm = () => {
    setItemForm({ icon: '👕', name: '', category: 'Tops', color: '', imageUri: '', weatherTags: [], layerWeight: 'light', occasion: 'casual' });
  };

  const handleAddItem = () => {
    setEditingItem(null);
    resetForm();
    setModalVisible(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemForm({ ...item, icon: item.icon || '👕', category: item.category || 'Tops', layerWeight: item.layerWeight || 'light', occasion: item.occasion || 'casual' });
    setModalVisible(true);
  };

  const handleSaveItem = async () => {
    if (!itemForm.name.trim() || itemForm.weatherTags.length === 0) {
      return Alert.alert('Error', 'Please enter a name and select at least one weather tag.');
    }

    try {
      setSaving(true);
      let finalImageUri = itemForm.imageUri;

      // Only upload if there is a local image (file://) 
      if (finalImageUri && !finalImageUri.startsWith('http')) {
        const cloudUrl = await uploadImageToCloudinary(finalImageUri);
        
        if (!cloudUrl) {
          Alert.alert('Upload Failed', 'Could not save image to cloud. Please try again.');
          setSaving(false);
          return;
        }
        // Swap the local device path for the permanent Cloudinary URL
        finalImageUri = cloudUrl; 
      }

      const payload = { ...itemForm, name: itemForm.name.trim(), color: itemForm.color.trim(), imageUri: finalImageUri };

      if (editingItem) {
        const updatedItem = await apiUpdateClothing(API_URL, user.id, editingItem.id, payload);
        setClothingItems(prev => prev.map(item => item.id === editingItem.id ? { id: updatedItem._id || item.id, ...item, ...updatedItem } : item));
        Alert.alert('Success', 'Item updated successfully!');
      } else {
        const newItem = await apiCreateClothing(API_URL, user.id, payload);
        setClothingItems(prev => [{ id: newItem._id, ...newItem }, ...prev]);
        Alert.alert('Success', 'Item added to your closet!');
      }

      setModalVisible(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = (itemId) => {
    Alert.alert('Delete Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await apiDeleteClothing(API_URL, user.id, itemId);
            setClothingItems(prev => prev.filter(item => item.id !== itemId));
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        }
      }
    ]);
  };

  const toggleFavorite = async (itemId) => {
    try {
      const target = clothingItems.find(item => item.id === itemId);
      if (!target) return;
      
      const data = await apiToggleFavorite(API_URL, user.id, itemId, !target.favorite);
      setClothingItems(prev => prev.map(item => item.id === itemId ? { ...item, favorite: data.favorite } : item));
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const filteredItems = clothingItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.color && item.color.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFavorite = showFavoritesOnly ? item.favorite : true;
    return matchesCategory && matchesSearch && matchesFavorite;
  });

  return (
    <LinearGradient colors={[colors.offWhiteBackground, colors.mainWhite]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.offWhiteBackground} />
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setActiveTab('Home')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.headerButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>MY VIRTUAL CLOSET</Text>
            <Text style={styles.itemCount}>{loadingItems ? 'Loading...' : `${filteredItems.length} items`}</Text>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={handleAddItem} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.headerButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput style={styles.searchInput} placeholder="Search closet..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor={colors.textSecondary} />
        </View>

        {/* Filters */}
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
            {categories.map(cat => (
              <TouchableOpacity key={cat} style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]} onPress={() => setSelectedCategory(cat)}>
                <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>{cat === 'All' ? '👥 All' : `${getCategoryIcon(cat)} ${cat}`}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={[styles.favoriteFilter, showFavoritesOnly && styles.favoriteFilterActive]} onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}>
            <Text style={styles.favoriteFilterIcon}>⭐</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        <FlatList
          data={filteredItems}
          renderItem={({ item }) => (
            <ClothingCard {...item} onPress={() => handleEditItem(item)} onToggleFavorite={() => toggleFavorite(item.id)} onDelete={() => handleDeleteItem(item.id)} />
          )}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />

        {/* Modal */}
        <ClothingFormModal
          visible={modalVisible} editingItem={editingItem} itemForm={itemForm} setItemForm={setItemForm}
          onSave={handleSaveItem} onClose={() => { setModalVisible(false); setEditingItem(null); resetForm(); }}
          categories={categories.filter(c => c !== 'All')} getCategoryIcon={getCategoryIcon} saving={saving}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ClosetScreen;