import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal, Image, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import styles from '../styles/ClosetScreenStyles';
import colors from '../constants/colors';
import { Alert, Platform } from 'react-native';



const weatherOptions = ['hot', 'warm', 'cold', 'rainy'];
const layerWeights = ['light', 'medium', 'heavy'];
const occasionOptions = ['casual', 'school', 'formal', 'sports'];

const ClothingFormModal = ({
  visible,
  editingItem,
  itemForm,
  setItemForm,
  onSave,
  onClose,
  categories,
  getCategoryIcon,
  saving
}) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [itemForm.imageUri, visible]);


  const toggleWeatherTag = (tag) => {
    const selected = itemForm.weatherTags.includes(tag);

    const updatedTags = selected
      ? itemForm.weatherTags.filter((t) => t !== tag)
      : [...itemForm.weatherTags, tag];

    setItemForm({ ...itemForm, weatherTags: updatedTags });
  };
// Helper to handle the result from either picker
  const handlePickerResult = (result) => {
    console.log("Picker Result Received:", result.canceled ? "Canceled" : "Success");
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      console.log("New URI picked:", selectedUri);
      
      setImageError(false);
      // We spread the form to ensure a new object reference is created
      setItemForm(prev => ({
        ...prev,
        imageUri: selectedUri,
      }));
    }
  };
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permission required to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // New Array Syntax
      quality: 0.7,
      allowsEditing: true,    // 💡 Fixes many Android "Ghost URI" issues
      aspect: [1, 1],
    });
    handlePickerResult(result);
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      alert('Camera is only supported on mobile devices.');
      return;
  }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert('Permission required to use the camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'], // New Array Syntax
      quality: 0.7,
      allowsEditing: true,    // Forces a clean temp file creation
      aspect: [1, 1],
    });
    handlePickerResult(result);
  };

  const showImage = itemForm.imageUri && !imageError;

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </Text>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* CENTERED TOP SECTION */}
            <View style={localStyles.topSectionContainer}>
              
              {/* Centered Image Preview Box */}
              <View style={localStyles.imagePreviewContainer}>
                {showImage ? (
                  <>
                    <Image
                      key={itemForm.imageUri}
                      source={{ uri: itemForm.imageUri }}
                      style={localStyles.previewImage}
                      resizeMode="cover"
                      onError={() => setImageError(true)}
                    />
                    <Text style={localStyles.helperText}>Ready to upload!</Text>
                  </>
                ) : (
                  <View style={localStyles.placeholderBox}>
                    <Text style={localStyles.placeholderIcon}>👕</Text>
                    <Text style={localStyles.placeholderTitle}>No image selected</Text>
                  </View>
                )}
              </View>

              {/* Styled Action Buttons in a Row */}
              <View style={localStyles.uploadOptionsRow}>
                <TouchableOpacity 
                  style={[localStyles.actionButton, { marginRight: 12 }]} 
                  onPress={takePhoto}
                >
                  <Text style={localStyles.actionButtonText}>📸 Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={localStyles.actionButton} 
                  onPress={pickImage}
                >
                  <Text style={localStyles.actionButtonText}>🖼️ Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.modalLabel}>Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={itemForm.name}
                onChangeText={(text) =>
                  setItemForm({ ...itemForm, name: text })
                }
                placeholder="e.g., Blue T-Shirt"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.modalLabel}>Category</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      itemForm.category === category &&
                        styles.categoryOptionActive,
                    ]}
                    onPress={() => setItemForm({ ...itemForm, category })}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        itemForm.category === category &&
                          styles.categoryOptionTextActive,
                      ]}
                    >
                      {getCategoryIcon(category)} {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.modalLabel}>Color</Text>

              <TextInput
                style={styles.modalInput}
                value={itemForm.color}
                onChangeText={(text) =>
                  setItemForm({ ...itemForm, color: text })
                }
                placeholder="e.g., Blue, Black, Red"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.modalLabel}>Suitable Weather *</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {weatherOptions.map((tag) => {
                  const selected = itemForm.weatherTags.includes(tag);

                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.categoryOption,
                        selected && styles.categoryOptionActive,
                      ]}
                      onPress={() => toggleWeatherTag(tag)}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          selected && styles.categoryOptionTextActive,
                        ]}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.modalLabel}>Layer Weight</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {layerWeights.map((weight) => (
                  <TouchableOpacity
                    key={weight}
                    style={[
                      styles.categoryOption,
                      itemForm.layerWeight === weight &&
                        styles.categoryOptionActive,
                    ]}
                    onPress={() =>
                      setItemForm({ ...itemForm, layerWeight: weight })
                    }
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        itemForm.layerWeight === weight &&
                          styles.categoryOptionTextActive,
                      ]}
                    >
                      {weight}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.modalLabel}>Occasion</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {occasionOptions.map((occasion) => (
                  <TouchableOpacity
                    key={occasion}
                    style={[
                      styles.categoryOption,
                      itemForm.occasion === occasion &&
                        styles.categoryOptionActive,
                    ]}
                    onPress={() =>
                      setItemForm({ ...itemForm, occasion })
                    }
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        itemForm.occasion === occasion &&
                          styles.categoryOptionTextActive,
                      ]}
                    >
                      {occasion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={onSave}
              disabled={saving} // ⬅️ Use 'saving' here
            >
              {saving ? ( // ⬅️ Use 'saving' here
                <ActivityIndicator color={colors.mainWhite} />
              ) : (
                <Text style={styles.saveButtonText}>
                  {editingItem ? 'Update Item' : 'Add to Closet'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  topSectionContainer: {
    alignItems: 'center', // This is the fix for the left-alignment!
    marginBottom: 20,
    marginTop: 10,
  },
  imagePreviewContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  previewImage: {
    width: 140,
    height: 140,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.primaryBlue,
    fontWeight: '600',
  },
  placeholderBox: {
    width: 140,
    height: 140,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderStyle: 'dashed',
  },
  placeholderIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  placeholderTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  uploadOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  // These are the new styled buttons
  actionButton: {
    backgroundColor: colors.mainWhite,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primaryBlue,
    // Add a slight shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    color: colors.primaryBlue,
    fontWeight: '700',
    fontSize: 13,
  },
});

export default ClothingFormModal;