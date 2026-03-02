import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import colors from '../constants/colors';
import ClothingCard from '../components/ClothingCard';
import { clothingApi } from '../services/api';

const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories', 'Swimwear', 'Traditional'];

const ClosetScreen = ({ setActiveTab }) => {
  const [clothingItems, setClothingItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state for new/edit item
  const [itemForm, setItemForm] = useState({
    icon: '👕',
    name: '',
    category: 'Tops',
    color: '',
    size: '',
    imageUrl: '',
  });

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await clothingApi.getAllItems();
      setClothingItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      Alert.alert('Error', 'Failed to load your closet items. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  // Filter items based on category, search, and favorites
  const filteredItems = clothingItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.color && item.color.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFavorite = showFavoritesOnly ? item.favorite : true;
    
    return matchesCategory && matchesSearch && matchesFavorite;
  });

  const handleAddItem = () => {
    setEditingItem(null);
    setItemForm({
      icon: '👕',
      name: '',
      category: 'Tops',
      color: '',
      size: '',
      imageUrl: '',
    });
    setModalVisible(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      icon: item.icon,
      name: item.name,
      category: item.category,
      color: item.color || '',
      size: item.size || '',
      imageUrl: item.imageUrl || '',
    });
    setModalVisible(true);
  };

  const handleSaveItem = async () => {
    if (!itemForm.name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    try {
      if (editingItem) {
        // Update existing item
        const response = await clothingApi.updateItem(editingItem._id, itemForm);
        setClothingItems(prev =>
          prev.map(item => item._id === editingItem._id ? response.data : item)
        );
        Alert.alert('Success', 'Item updated successfully!');
      } else {
        // Add new item
        const response = await clothingApi.createItem(itemForm);
        setClothingItems(prev => [response.data, ...prev]);
        Alert.alert('Success', 'Item added to your closet!');
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item. Please try again.');
    }
  };

  const handleDeleteItem = (itemId) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to remove this item from your closet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await clothingApi.deleteItem(itemId);
              setClothingItems(prev => prev.filter(item => item._id !== itemId));
              Alert.alert('Success', 'Item removed from closet');
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const toggleFavorite = async (itemId) => {
    try {
      const response = await clothingApi.toggleFavorite(itemId);
      setClothingItems(prev =>
        prev.map(item => item._id === itemId ? response.data : item)
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to add images');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: false, // Don't use base64 for large images
    });
  
    if (!result.canceled) {
      try {
        setUploadingImage(true);
        
        // Get the file extension and mime type
        const uri = result.assets[0].uri;
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const ext = match?.[1] || 'jpg';
        const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  
        // Create form data correctly for React Native
        const formData = new FormData();
        formData.append('image', {
          uri: uri,
          type: mimeType,
          name: filename || `upload.${ext}`,
        });
  
        // Upload to backend with correct headers
        const uploadResponse = await clothingApi.uploadImage(formData);
        
        // Update form with image URL
        setItemForm({ ...itemForm, imageUrl: uploadResponse.data.imageUrl });
        Alert.alert('Success', 'Image uploaded!');
      } catch (error) {
        console.error('Upload error:', error);
        Alert.alert('Error', 'Failed to upload image: ' + (error.message || 'Unknown error'));
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Tops': '👕',
      'Bottoms': '👖',
      'Dresses': '👗',
      'Outerwear': '🧥',
      'Footwear': '👟',
      'Accessories': '🧣',
      'Swimwear': '👙',
      'Traditional': '👘',
    };
    return icons[category] || '👕';
  };

  const renderClothingItem = ({ item }) => (
    <ClothingCard
      icon={item.icon}
      name={item.name}
      color={item.color}
      favorite={item.favorite}
      imageUrl={item.imageUrl}
      onPress={() => handleEditItem(item)}
      onToggleFavorite={() => toggleFavorite(item._id)}
      onDelete={() => handleDeleteItem(item._id)}
    />
  );

  const renderCategoryChip = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryChip,
        selectedCategory === category && styles.categoryChipActive,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryChipText,
        selectedCategory === category && styles.categoryChipTextActive,
      ]}>
        {category === 'All' ? '👥 All' : `${getCategoryIcon(category)} ${category}`}
      </Text>
    </TouchableOpacity>
  );

  // Loading state
  if (loading) {
    return (
      <LinearGradient
        colors={[colors.offWhiteBackground, colors.mainWhite]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primaryBlue} />
            <Text style={styles.loadingText}>Loading your closet...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.offWhiteBackground, colors.mainWhite]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.offWhiteBackground} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setActiveTab('Home')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.headerButtonText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>MY VIRTUAL CLOSET</Text>
            <Text style={styles.itemCount}>{filteredItems.length} items</Text>
          </View>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleAddItem}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.headerButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or color..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map(renderCategoryChip)}
          </ScrollView>
          
          <TouchableOpacity
            style={[
              styles.favoriteFilter,
              showFavoritesOnly && styles.favoriteFilterActive,
            ]}
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Text style={styles.favoriteFilterIcon}>⭐</Text>
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👕</Text>
            <Text style={styles.emptyStateTitle}>No items found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery 
                ? "Try a different search term"
                : showFavoritesOnly
                ? "You haven't favorited any items yet"
                : "Tap the + button to add your first clothing item"}
            </Text>
          </View>
        )}

        {/* Grid of Clothing Items */}
        <FlatList
          data={filteredItems}
          renderItem={renderClothingItem}
          keyExtractor={(item) => item._id}
          numColumns={3}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />

        {/* Add/Edit Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Icon Picker */}
                <View style={styles.iconPickerContainer}>
                  <Text style={styles.modalLabel}>Icon</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['👕', '👖', '👗', '🧥', '👟', '👔', '🧣', '🧤', '🧦', '👘', '👙', '👓'].map(icon => (
                      <TouchableOpacity
                        key={icon}
                        style={[
                          styles.iconOption,
                          itemForm.icon === icon && styles.iconOptionActive,
                        ]}
                        onPress={() => setItemForm({ ...itemForm, icon })}
                      >
                        <Text style={styles.iconOptionText}>{icon}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Image Upload Option */}
                <TouchableOpacity 
                  style={styles.imageUploadButton} 
                  onPress={pickImage}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="small" color={colors.primaryBlue} />
                  ) : (
                    <>
                      <Text style={styles.imageUploadIcon}>📷</Text>
                      <Text style={styles.imageUploadText}>
                        {itemForm.imageUrl ? 'Change Photo' : 'Upload Photo'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Image Preview if available */}
                {itemForm.imageUrl ? (
                  <View style={styles.imagePreviewContainer}>
                    <Text style={styles.imagePreviewText}>✓ Image uploaded</Text>
                  </View>
                ) : null}

                {/* Name Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.modalLabel}>Name *</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={itemForm.name}
                    onChangeText={(text) => setItemForm({ ...itemForm, name: text })}
                    placeholder="e.g., Blue T-Shirt"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                {/* Category Picker */}
                <View style={styles.inputContainer}>
                  <Text style={styles.modalLabel}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.filter(c => c !== 'All').map(category => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryOption,
                          itemForm.category === category && styles.categoryOptionActive,
                        ]}
                        onPress={() => setItemForm({ ...itemForm, category })}
                      >
                        <Text style={[
                          styles.categoryOptionText,
                          itemForm.category === category && styles.categoryOptionTextActive,
                        ]}>
                          {getCategoryIcon(category)} {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Color Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.modalLabel}>Color</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={itemForm.color}
                    onChangeText={(text) => setItemForm({ ...itemForm, color: text })}
                    placeholder="e.g., Blue, Black, Red"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                {/* Size Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.modalLabel}>Size</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={itemForm.size}
                    onChangeText={(text) => setItemForm({ ...itemForm, size: text })}
                    placeholder="e.g., S, M, L, 32, 9"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveItem}>
                  <Text style={styles.saveButtonText}>
                    {editingItem ? 'Update Item' : 'Add to Closet'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 28,
    color: colors.primaryBlue,
    fontWeight: '300',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryBlue,
    letterSpacing: 1,
  },
  itemCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  clearIcon: {
    fontSize: 18,
    color: colors.textSecondary,
    padding: 4,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingRight: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  categoryChipActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  categoryChipText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  favoriteFilter: {
    width: 40,
    height: 40,
    backgroundColor: colors.white,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  favoriteFilterActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  favoriteFilterIcon: {
    fontSize: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  gridContent: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  modalClose: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.offWhiteBackground,
  },
  inputContainer: {
    marginBottom: 16,
  },
  iconPickerContainer: {
    marginBottom: 16,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.offWhiteBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionActive: {
    borderColor: colors.primaryBlue,
    backgroundColor: colors.white,
  },
  iconOptionText: {
    fontSize: 24,
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.offWhiteBackground,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  imageUploadIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  imageUploadText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  imagePreviewContainer: {
    backgroundColor: colors.success + '20',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  imagePreviewText: {
    color: colors.success,
    fontSize: 14,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.offWhiteBackground,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  categoryOptionActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  categoryOptionText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  categoryOptionTextActive: {
    color: colors.white,
  },
  saveButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ClosetScreen;