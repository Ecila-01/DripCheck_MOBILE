import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView, 
  ActivityIndicator, 
  Image, 
  Alert, 
  Modal, 
  TextInput, 
  StyleSheet,
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../styles/ProfileScreenStyles';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../utils/closetHelpers';
import { Ionicons } from '@expo/vector-icons';
// NEW IMPORTS FOR NOTIFICATIONS
import DateTimePicker from '@react-native-community/datetimepicker';
import { scheduleDailyOutfitNotification } from '../utils/notificationHelper';

const ProfileScreen = ({ user, setUser, API_URL, onLogout }) => {
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [localImage, setLocalImage] = useState(null); 
  const [timeChanged, setTimeChanged] = useState(false);
  // Notification States
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempNotifTime, setTempNotifTime] = useState(new Date());
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    password: '',
    confirmPassword: ''
  });

  // --- NEW STATE FOR DELETION ---
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);


  // Sync form name and notification time if user object updates
  useEffect(() => {
    if (user?.name) setEditForm(prev => ({ ...prev, name: user.name }));
    
    // Initialize the time picker with the user's saved preference
    if (user?.notificationTime) {
      const d = new Date();
      d.setHours(user.notificationTime.hours || 8);
      d.setMinutes(user.notificationTime.minutes || 0);
      setTempNotifTime(d);
    }
  }, [user]);

  useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/clothing?userId=${user._id}`);
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

  const handlePickPhoto = async () => {
  // This is the correct line!
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert(
      'Permission Denied', 
      'We need access to your gallery to update your profile picture. Please enable it in settings.'
    );
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images, // Explicitly set to Images
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  });

  if (!result.canceled) {
    setLocalImage(result.assets[0].uri);
    setEditModalVisible(true); 
  }
};

  const handleSaveAllDetails = async () => {
    if (!editForm.name.trim()) return Alert.alert('Error', 'Name cannot be empty');
    
    setUpdating(true);
    try {
      // Add notification time to payload
      let payload = { 
        name: editForm.name,
        notificationTime: {
          hours: tempNotifTime.getHours(),
          minutes: tempNotifTime.getMinutes()
        }
      };

      // 1. Upload image only if changed
      if (localImage) {
        const cloudUrl = await uploadImageToCloudinary(localImage);
        if (!cloudUrl) throw new Error("Cloudinary upload failed");
        payload.profileImage = cloudUrl;
      }

      // 2. Password validation
      if (editForm.password) {
        if (editForm.password.length < 6) throw new Error("Password must be at least 6 characters");
        if (editForm.password !== editForm.confirmPassword) throw new Error("Passwords do not match");
        payload.password = editForm.password;
      }

      // 3. Send to Backend
      const response = await fetch(`${API_URL}/api/auth/update/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const updatedUser = await response.json();
      
      if (response.ok) {
        // Crucial: Update global state
        if (setUser) {
          setUser({ ...user, ...updatedUser });
        }
        
        if (timeChanged) {
          await scheduleDailyOutfitNotification(tempNotifTime.getHours(), tempNotifTime.getMinutes());
          setTimeChanged(false); // Reset the flag after saving
          console.log("Time was changed, alarm rescheduled!");
        }
        
        Alert.alert('Success', 'Profile updated successfully!');
        setLocalImage(null);
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
  const handleRequestDeleteOtp = async () => {
    setIsDeleting(true);
    try {
      const uid = user._id || user.id;
      // Assuming you have a route to trigger the email
      const response = await fetch(`${API_URL}/api/auth/request-delete-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, userId: uid }),
      });

      if (response.ok) {
        setOtpSent(true);
        Alert.alert("Check your email", "We've sent a code to confirm deletion.");
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to send OTP.");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteOtp.trim() || deleteOtp.length !== 6) {
      return Alert.alert('Error', 'Please enter the 6-digit OTP');
    }
    executeDeletion();
  };

  const executeDeletion = async () => {
    setIsDeleting(true);
    try {
      const uid = user._id || user.id;
      const response = await fetch(`${API_URL}/api/auth/delete-account/${uid}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: deleteOtp }),
      });

      if (response.ok) {
        Alert.alert("Account Deleted", "We're sorry to see you go.");
        setDeleteModalVisible(false);
        if (onLogout) onLogout(); // Use your existing logout function to clear state/navigate
      } else {
        const data = await response.json();
        throw new Error(data.message || "Deletion failed.");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <LinearGradient colors={[colors.offWhiteBackground, colors.mainWhite]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.offWhiteBackground} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(true)} activeOpacity={0.8}>
              <View style={styles.profilePicture}>
                {user.profileImage ? (
                  <Image source={{ uri: user.profileImage }} style={styles.fullImage} />
                ) : (
                  <Text style={styles.profileIcon}>👤</Text>
                )}
              </View>
              <Text style={styles.changePhotoText}>Tap to Edit Profile</Text>
            </TouchableOpacity>

            <Text style={styles.handle}>{user.name || 'User'}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              {loading ? <ActivityIndicator size="small" /> : <Text style={styles.statNumber}>{itemCount}</Text>}
              <Text style={styles.statLabel}>Items in Closet</Text>
            </View>
          </View>

          {/* Details Section (Read Only View) */}
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
            
            {/* NEW: Daily Reminder Read-Only View */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Daily Reminder</Text>
              <Text style={styles.detailValue}>
                {user?.notificationTime 
                  ? `${user.notificationTime.hours}:${user.notificationTime.minutes < 10 ? '0' : ''}${user.notificationTime.minutes}`
                  : 'Not Set'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Member Since</Text>
              <Text style={styles.detailValue}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'April 2026'}
              </Text>
            </View>
          </View>

          {/* SIGN OUT BUTTON (Keep this prominent) */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={onLogout || (() => console.log("Logout"))}
          >
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>

          {/* DELETE ACCOUNT (Make this subtle) */}
          <TouchableOpacity 
            style={{ marginTop: 25, paddingVertical: 10, alignItems: 'center' }} 
            onPress={() => setDeleteModalVisible(true)}
          >
            <Text style={{ color: '#FF6B6B', fontSize: 14, fontWeight: '600' }}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {  /* UNIFIED EDIT MODAL */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}} showsVerticalScrollIndicator={false}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              
              {/* TAPPABLE PREVIEW IMAGE */}
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <TouchableOpacity onPress={handlePickPhoto}>
                  <Image 
                    source={{ uri: localImage || user.profileImage || 'https://via.placeholder.com/100' }} 
                    style={styles.fullImage} 
                  />
                  <View style={styles.cameraBadge}>
                     <Text style={{fontSize: 12}}>📸</Text>
                  </View>
                </TouchableOpacity>
                <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 12 }}>
                  Tap photo to change
                </Text>
              </View>

              <Text style={styles.label}>Full Name</Text>
              <TextInput 
                style={styles.input} 
                value={editForm.name} 
                onChangeText={(t) => setEditForm({...editForm, name: t})}
              />

              {/* NEW: Daily Reminder Edit View */}
              <Text style={styles.label}>Daily Reminder</Text>
              <TouchableOpacity 
                style={styles.input} 
                onPress={() => setShowTimePicker(!showTimePicker)} 
                activeOpacity={0.7}
              >
                <Text style={{ color: colors.textPrimary, paddingVertical: Platform.OS === 'ios' ? 4 : 0 }}>
                  {tempNotifTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>

              {/* FIXED PICKER WRAPPER */}
              {showTimePicker && (
                <View style={{ height: 200, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                  <DateTimePicker
                    value={tempNotifTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    textColor="black" 
                    style={{ width: '100%', height: 200 }} 
                    onChange={(event, date) => {
                      if (Platform.OS === 'android') {
                        setShowTimePicker(false);
                      }
                      if (date) {setTempNotifTime(date); setTimeChanged(true);}
                    }}
                  />
                </View>
              )}

              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput 
                  style={styles.passwordInput} 
                  secureTextEntry={!showNewPassword} 
                  placeholder="Leave blank to keep current"
                  value={editForm.password}
                  onChangeText={(t) => setEditForm({...editForm, password: t})}
                />
                <TouchableOpacity 
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={22} 
                    color="#888" 
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput 
                  style={styles.passwordInput} 
                  secureTextEntry={!showConfirmPassword} 
                  value={editForm.confirmPassword}
                  onChangeText={(t) => setEditForm({...editForm, confirmPassword: t})}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={22} 
                    color="#888" 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.saveBtn, updating && { opacity: 0.7 }]} 
                onPress={handleSaveAllDetails} 
                disabled={updating}
              >
                 {updating ? <ActivityIndicator color="#fff"/> : <Text style={styles.saveBtnText}>Save All Changes</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { 
                  setEditModalVisible(false); 
                  setLocalImage(null); 
                  setShowTimePicker(false); 
              }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              
            </View>
          </ScrollView> 
        </View>
      </Modal>
      {/* NEW DELETE ACCOUNT MODAL */}
      <Modal visible={deleteModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}> {/* Removed the hardcoded padding: 30 */}
            
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ backgroundColor: '#FFF0F0', padding: 15, borderRadius: 50, marginBottom: 15 }}>
                <Ionicons name="warning-outline" size={32} color="#FF6B6B" />
              </View>
              <Text style={[styles.modalTitle, { marginBottom: 5 }]}>Delete Account</Text>
            </View>
            
            {!otpSent ? (
              <>
                <Text style={{ textAlign: 'center', color: colors.textSecondary, marginBottom: 25, lineHeight: 22 }}>
                  Are you sure you want to delete your account? This will permanently remove your closet data.
                </Text>
                
                <TouchableOpacity 
                  style={[styles.saveBtn, { backgroundColor: '#FF6B6B' }]} 
                  onPress={handleRequestDeleteOtp}
                  disabled={isDeleting}
                >
                  {isDeleting ? <ActivityIndicator color="#fff"/> : <Text style={styles.saveBtnText}>Send OTP to Confirm</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ textAlign: 'center', color: colors.textSecondary, marginBottom: 15, lineHeight: 22 }}>
                  Please enter the 6-digit code sent to{"\n"}
                  <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{user.email}</Text>
                </Text>
                
                <TextInput 
                  style={[styles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 8, paddingVertical: 15 }]}
                  value={deleteOtp}
                  onChangeText={setDeleteOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="••••••"
                  placeholderTextColor={colors.textLight}
                />
                
                <TouchableOpacity 
                  style={[styles.saveBtn, { backgroundColor: '#FF6B6B', marginTop: 15 }]} 
                  onPress={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? <ActivityIndicator color="#fff"/> : <Text style={styles.saveBtnText}>Permanently Delete</Text>}
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity 
              style={{ marginTop: 20, alignItems: 'center', padding: 10 }}
              onPress={() => {
                setDeleteModalVisible(false);
                setOtpSent(false);
                setDeleteOtp('');
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default ProfileScreen;