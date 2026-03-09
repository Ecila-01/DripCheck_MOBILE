import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system/legacy';
import colors from '../constants/colors';
import ClothingCard from '../components/ClothingCard';
import ClothingFormModal from '../components/ClothingFormModal';
import styles from '../styles/ClosetScreenStyles';
import { Platform } from 'react-native';

const categories = [
  'All',
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Footwear',
  'Accessories',
  'Swimwear',
  'Traditional',
];

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
    icon: '👕',
    name: '',
    category: 'Tops',
    color: '',
    imageUri: '',
    weatherTags: [],
    layerWeight: 'light',
    occasion: 'casual',
  });
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchClothingItems();
    } finally {
      setRefreshing(false);
    }
  };
  useEffect(() => {
    if (user?.id) {
      fetchClothingItems();
    }
  }, [user]);

  const fetchClothingItems = async (showLoader = true) => {
    try {
      if (!user?.id) {
        setClothingItems([]);
        return;
      }
      if (showLoader) setLoadingItems(true);
      
      const response = await fetch(`${API_URL}/api/clothing?userId=${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch clothing items');
      }

      const mappedItems = data.map((item) => ({
        id: item._id,
        ...item,
      }));

      setClothingItems(mappedItems);
    } catch (error) {
      console.error('Fetch clothing error:', error);
      Alert.alert('Error', error.message || 'Failed to load clothing items');
    } finally {
      if (showLoader) setLoadingItems(false);
    }
  };

  const resetForm = () => {
    setItemForm({
      icon: '👕',
      name: '',
      category: 'Tops',
      color: '',
      imageUri: '',
      weatherTags: [],
      layerWeight: 'light',
      occasion: 'casual',
    });
  };

  const handleAddItem = () => {
    setEditingItem(null);
    resetForm();
    setModalVisible(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      icon: item.icon || '👕',
      name: item.name || '',
      category: item.category || 'Tops',
      color: item.color || '',
      imageUri: item.imageUri || '',
      weatherTags: item.weatherTags || [],
      layerWeight: item.layerWeight || 'light',
      occasion: item.occasion || 'casual',
    });
    setModalVisible(true);
  };

  const saveImageToDocumentStorage = async (uri) => {
    if (!uri) return '';

    try {
      if (
        FileSystem.documentDirectory &&
        uri.startsWith(FileSystem.documentDirectory)
      ) {
        return uri;
      }

      const folderPath = `${FileSystem.documentDirectory}clothing-images/`;

      const folderInfo = await FileSystem.getInfoAsync(folderPath);
      if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(folderPath, { intermediates: true });
      }

      const originalName = uri.split('/').pop() || 'clothing.jpg';
      const cleanName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const newFileName = `${Date.now()}-${cleanName}`;
      const newPath = `${folderPath}${newFileName}`;

      await FileSystem.copyAsync({
        from: uri,
        to: newPath,
      });

      return newPath;
    } catch (error) {
      console.error('Error saving image to document storage:', error);
      throw new Error('Failed to save image locally');
    }
  };

  const createClothingInBackend = async (payload) => {
    const response = await fetch(`${API_URL}/api/clothing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        userId: user.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create clothing item');
    }

    return data;
  };

  const updateClothingInBackend = async (id, payload) => {
    const response = await fetch(`${API_URL}/api/clothing/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        userId: user.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update clothing item');
    }

    return data;
  };

  const handleSaveItem = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'No logged-in user found');
      return;
    }
    if (!itemForm.name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    if (itemForm.weatherTags.length === 0) {
      Alert.alert('Error', 'Please select at least one suitable weather tag');
      return;
    }

    try {
      setSaving(true);

      let finalImageUri = itemForm.imageUri;

      if (itemForm.imageUri) {
        finalImageUri = await saveImageToDocumentStorage(itemForm.imageUri);
      }

      const payload = {
        icon: itemForm.icon,
        name: itemForm.name.trim(),
        category: itemForm.category,
        color: itemForm.color.trim(),
        imageUri: finalImageUri,
        weatherTags: itemForm.weatherTags,
        layerWeight: itemForm.layerWeight,
        occasion: itemForm.occasion,
      };

      if (editingItem) {
        const updatedFromBackend = await updateClothingInBackend(editingItem.id, payload);

        setClothingItems((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? {
                  id: updatedFromBackend._id || item.id,
                  ...item,
                  ...updatedFromBackend,
                }
              : item
          )
        );

        Alert.alert('Success', 'Item updated successfully!');
      } else {
        const createdFromBackend = await createClothingInBackend(payload);

        const newItem = {
          id: createdFromBackend._id,
          ...createdFromBackend,
        };

        setClothingItems((prev) => [newItem, ...prev]);
        Alert.alert('Success', 'Item added to your closet!');
      }

      setModalVisible(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error('Save item error:', error);
      Alert.alert('Error', error.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
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
              const response = await fetch(
                `${API_URL}/api/clothing/${itemId}?userId=${user.id}`,
                {
                  method: 'DELETE',
                }
              );

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.message || 'Failed to delete item');
              }

              setClothingItems((prev) => prev.filter((item) => item.id !== itemId));
              Alert.alert('Success', 'Item removed from closet');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', error.message || 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const toggleFavorite = async (itemId) => {
    try {
      const target = clothingItems.find((item) => item.id === itemId);
      if (!target) return;

      const updatedFavorite = !target.favorite;

      const response = await fetch(`${API_URL}/api/clothing/${itemId}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          favorite: updatedFavorite,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update favorite');
      }

      setClothingItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, favorite: data.favorite } : item
        )
      );
    } catch (error) {
      console.error('Favorite toggle error:', error);
      Alert.alert('Error', error.message || 'Failed to update favorite');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Tops: '👕',
      Bottoms: '👖',
      Dresses: '👗',
      Outerwear: '🧥',
      Footwear: '👟',
      Accessories: '🧣',
      Swimwear: '👙',
      Traditional: '👘',
    };
    return icons[category] || '👕';
  };

  const filteredItems = clothingItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.color &&
        item.color.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.occasion &&
        item.occasion.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.weatherTags &&
        item.weatherTags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    const matchesFavorite = showFavoritesOnly ? item.favorite : true;

    return matchesCategory && matchesSearch && matchesFavorite;
  });

  const renderClothingItem = ({ item }) => (
    <ClothingCard
      icon={item.icon}
      name={item.name}
      color={item.color}
      favorite={item.favorite}
      imageUri={item.imageUri}
      onPress={() => handleEditItem(item)}
      onToggleFavorite={() => toggleFavorite(item.id)}
      onDelete={() => handleDeleteItem(item.id)}
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
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === category && styles.categoryChipTextActive,
        ]}
      >
        {category === 'All' ? '👥 All' : `${getCategoryIcon(category)} ${category}`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[colors.offWhiteBackground, colors.mainWhite]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.offWhiteBackground}
      />

      <SafeAreaView style={styles.safeArea}>
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
            <Text style={styles.itemCount}>
              {loadingItems ? 'Loading...' : `${filteredItems.length} items`}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleAddItem}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.headerButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, color, occasion, or weather..."
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

        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👕</Text>
            <Text style={styles.emptyStateTitle}>
              {loadingItems ? 'Loading clothes...' : 'No items found'}
            </Text>
            <Text style={styles.emptyStateText}>
              {loadingItems
                ? 'Fetching your closet from the database...'
                : searchQuery
                ? 'Try a different search term'
                : showFavoritesOnly
                ? "You haven't favorited any items yet"
                : 'Tap the + button to add your first clothing item'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderClothingItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}

        <ClothingFormModal
          visible={modalVisible}
          editingItem={editingItem}
          itemForm={itemForm}
          setItemForm={setItemForm}
          onSave={handleSaveItem}
          onClose={() => {
            setModalVisible(false);
            setEditingItem(null);
            resetForm();
          }}
          categories={categories.filter((c) => c !== 'All')}
          getCategoryIcon={getCategoryIcon}
          saving={saving}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ClosetScreen;