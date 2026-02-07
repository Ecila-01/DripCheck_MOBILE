import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';
import OutfitCard from '../components/OutfitCard';

const HomeScreen = ({ user, onLogout }) => {
  return (
    <LinearGradient
      colors={[colors.offWhiteBackground, colors.mainWhite]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.offWhiteBackground} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Logout */}
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../image_upload/DripCheckLogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Weather Widget */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherRow}>
            <Text style={styles.weatherIcon}>🌧️</Text>
            <Text style={styles.weatherTemp}>15°C</Text>
          </View>
          <Text style={styles.weatherCondition}>Showers</Text>
          <Text style={styles.weatherMessage}>It's raining today!</Text>
        </View>

        {/* Outfit of the Day Card */}
        <OutfitCard onPress={() => console.log('Find Affordable Matches')} />
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  logoWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 60,
  },
  logoutButton: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  logoutText: {
    color: colors.primaryBlue,
    fontSize: 16,
    fontWeight: '600',
  },
  weatherCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  weatherTemp: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  weatherCondition: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  weatherMessage: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default HomeScreen;

