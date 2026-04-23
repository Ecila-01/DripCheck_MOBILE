import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator, Image, Alert, Modal, TextInput, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../styles/ProfileScreenStyles';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../utils/closetHelpers';

const ProfileScreen = ({ user, setUser, API_URL }) => {
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/clothing?userId=${user.id}`);
        const data = await response.json();
        if (response.ok) {
          setItemCount(data.length);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchProfileStats();
  }, [user, API_URL]);

  const handleEditPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Denied', 'Gallery access is needed to change your photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      updateProfile({ profileImage: result.assets[0].uri }, true);
    }
  };

  const updateProfile = async (updateData, isImage = false) => {
    setUpdating(true);
    try {
      let payload = { ...updateData };

      // 1. If it's an image, upload to Cloudinary first
      if (isImage) {
        const cloudUrl = await uploadImageToCloudinary(updateData.profileImage);
        if (!cloudUrl) throw new Error("Cloudinary upload failed");
        payload.profileImage = cloudUrl;
      }

      // 2. Save to Backend
      const response = await fetch(`${API_URL}/api/auth/update/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const updatedUser = await response.json();
      
      if (response.ok) {
        setUser({ ...user, ...updatedUser });
        Alert.alert('Success', 'Profile updated successfully!');
        setEditModalVisible(false);
        setEditForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        throw new Error(updatedUser.message || "Update failed");
      }
    } catch (error) {
      Alert.alert('Update Error', error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveDetails = () => {
    if (!editForm.name.trim()) return Alert.alert('Error', 'Name cannot be empty');
    
    let payload = { name: editForm.name };

    // Only include password if the user actually typed something
    if (editForm.password) {
      if (editForm.password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
      if (editForm.password !== editForm.confirmPassword) return Alert.alert('Error', 'Passwords do not match');
      payload.password = editForm.password;
    }

    updateProfile(payload);
  };

  return (
    <LinearGradient colors={[colors.offWhiteBackground, colors.mainWhite]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.offWhiteBackground} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={handleEditPhoto} disabled={updating}>
              <View style={styles.profilePicture}>
                {updating ? (
                  <ActivityIndicator color={colors.primaryBlue} />
                ) : user.profileImage ? (
                  <Image source={{ uri: user.profileImage }} style={localStyles.fullImage} />
                ) : (
                  <Text style={styles.profileIcon}>👤</Text>
                )}
              </View>
              <Text style={localStyles.changePhotoText}>Tap to change</Text>
            </TouchableOpacity>

            <Text style={styles.handle}>{user.name || 'User'}</Text>
            <Text style={styles.emailSubtext}>{user.email}</Text>

            <TouchableOpacity style={styles.editButton} onPress={() => setEditModalVisible(true)}>
              <Text style={styles.editButtonText}>Edit Details</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              {loading ? <ActivityIndicator size="small" /> : <Text style={styles.statNumber}>{itemCount}</Text>}
              <Text style={styles.statLabel}>Items in Closet</Text>
            </View>
          </View>

          {/* Details Section */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Full Name</Text>
              <Text style={styles.detailValue}>{user.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email Address</Text>
              <Text style={styles.detailValue}>{user.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Member Since</Text>
              <Text style={styles.detailValue}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'April 2026'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={() => console.log("Sign out")}>
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>

      {/* EDIT MODAL */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>Edit Profile</Text>
            
            <Text style={localStyles.label}>Full Name</Text>
            <TextInput 
              style={localStyles.input} 
              value={editForm.name} 
              onChangeText={(t) => setEditForm({...editForm, name: t})}
            />

            <Text style={localStyles.label}>New Password (leave blank to keep current)</Text>
            <TextInput 
              style={localStyles.input} 
              secureTextEntry 
              placeholder="Min 6 characters"
              value={editForm.password}
              onChangeText={(t) => setEditForm({...editForm, password: t})}
            />

            <Text style={localStyles.label}>Confirm New Password</Text>
            <TextInput 
              style={localStyles.input} 
              secureTextEntry 
              value={editForm.confirmPassword}
              onChangeText={(t) => setEditForm({...editForm, confirmPassword: t})}
            />

            <TouchableOpacity style={localStyles.saveBtn} onPress={handleSaveDetails} disabled={updating}>
               {updating ? <ActivityIndicator color="#fff"/> : <Text style={localStyles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={localStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const localStyles = StyleSheet.create({
  fullImage: { width: 100, height: 100, borderRadius: 50 },
  changePhotoText: { fontSize: 12, color: colors.primaryBlue, marginTop: 5, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 15 },
  saveBtn: { backgroundColor: colors.primaryBlue, padding: 15, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  cancelText: { textAlign: 'center', marginTop: 15, color: 'red' }
});

export default ProfileScreen;