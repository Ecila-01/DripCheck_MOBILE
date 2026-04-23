import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../styles/ProfileScreenStyles';

const ProfileScreen = ({ user, API_URL }) => {
  const [outfitCount, setOutfitCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch the actual number of outfits from your backend
  useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/clothing?userId=${user.id}`);
        const data = await response.json();
        if (response.ok) {
          setOutfitCount(data.length);
        }
      } catch (error) {
        console.error("Error fetching profile stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchProfileStats();
  }, [user, API_URL]);

  return (
    <LinearGradient
      colors={[colors.offWhiteBackground, colors.mainWhite]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.offWhiteBackground} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profilePicture}>
              <Text style={styles.profileIcon}>👤</Text>
            </View>

            <Text style={styles.handle}>{user.name || 'User'}</Text>
            <Text style={styles.emailSubtext}>{user.email}</Text>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => console.log('Edit Profile pressed')}
              activeOpacity={0.8}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Functional Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              {loading ? (
                <ActivityIndicator size="small" color={colors.primaryBlue} />
              ) : (
                <Text style={styles.statNumber}>{outfitCount}</Text>
              )}
              <Text style={styles.statLabel}>Outfits Saved</Text>
            </View>
          </View>

          {/* Profile Details Section */}
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

          {/* Logout Button (Functional) */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => console.log("Logout logic here")}
          >
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ProfileScreen;