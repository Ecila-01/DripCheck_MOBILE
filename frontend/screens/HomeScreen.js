import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar, ActivityIndicator, Modal, Linking, ScrollView, RefreshControl, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import OutfitCard from '../components/OutfitCard';
import styles from '../styles/HomeScreenStyles';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { scheduleDailyOutfitNotification, testInstantNotification } from '../utils/notificationHelper'; // Import the helper
const OPENWEATHER_API_KEY = 'b2e243eae1e1f558807d9b4ece5696f4';
import { Alert } from 'react-native'; // Make sure Alert is imported


function getWeatherEmoji(main) {
  switch (main) {
    case 'Thunderstorm': return '⛈️';
    case 'Drizzle': return '🌦️';
    case 'Rain': return '🌧️';
    case 'Snow': return '❄️';
    case 'Clear': return '☀️';
    case 'Clouds': return '☁️';
    default: return '🌤️';
  }
}

function getWeatherMessage(main) {
  switch (main) {
    case 'Rain':
    case 'Drizzle': return "It's raining today! Bring an umbrella ☂️";
    case 'Clear': return "It's sunny today! Light outfit recommended 😎";
    case 'Clouds': return "Cloudy day — comfy layers work well ☁️";
    case 'Snow': return "Cold day — wear thick layers 🧥";
    case 'Thunderstorm': return "Stormy weather — stay safe ⚡";
    default: return "Weather update ready ✅";
  }
}

export default function HomeScreen({ user, onLogout, API_URL, setUser }) {
  // 1. DECLARE MISSING STATE
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 
  const [weather, setWeather] = useState(null); 
  const [weatherError, setWeatherError] = useState('');
  const [showShops, setShowShops] = useState(false);
  
  // Notification States
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifTime, setNotifTime] = useState(new Date());

  // 2. MOVE HANDLER INSIDE THE COMPONENT
  const handleConfirmNotifPreference = async () => {
    const hours = notifTime.getHours();
    const minutes = notifTime.getMinutes();

    try {
      // 1. Schedule locally
      await scheduleDailyOutfitNotification(hours, minutes);

      // 2. Save to Backend
      const response = await fetch(`${API_URL}/api/auth/update/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hasSetPreferences: true,
          notificationTime: { hours, minutes } 
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // --- CRITICAL CHANGE ---
        setShowNotifModal(false); // Close UI FIRST
        
        // Small delay to let the modal slide away before global state update
        setTimeout(() => {
          if(setUser) setUser(updatedUser); 
          Alert.alert("All set!", `We'll remind you at ${hours}:${minutes < 10 ? '0' + minutes : minutes} every day.`);
        }, 300);
      }
    } catch (error) {
      console.error("Notif Error:", error);
      Alert.alert("Error", "Could not save notification preferences.");
    }
  };

  // Trigger modal if user hasn't set preferences yet
  useEffect(() => {
    console.log(user)
    // Only open if we definitely have a user AND their preference is explicitly false
    // Also check if the modal is already being hidden to prevent loops
    if (user && user.hasSetPreferences === false) {
      setShowNotifModal(true);
    } else {
      setShowNotifModal(false);
    }
  }, [user?.hasSetPreferences]); // Only watch the specific boolean, not the whole object

  
  const fetchWeather = async () => {
    // --- TESTING OVERRIDE: Uncomment one and it will skip all API/GPS logic ---
    /*
    const testWeather = { tempC: 32, main: 'Clear', description: 'Sunny day', city: 'Test Hot' };
    // const testWeather = { tempC: 5, main: 'Snow', description: 'Freezing', city: 'Test Cold' };
    // const testWeather = { tempC: 18, main: 'Rain', description: 'Heavy rain', city: 'Test Rainy' };

    if (testWeather) {
      setWeather(testWeather);
      setLoadingWeather(false);
      setRefreshing(false);
      return; // Stops the function here
    }
    */
    // --- END TESTING OVERRIDE ---

    setWeatherError('');
    if (!refreshing) {
      setLoadingWeather(true);
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setWeatherError('Location permission denied.');
        setLoadingWeather(false);
        setRefreshing(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });
      const { latitude, longitude } = loc.coords;

      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to fetch weather');
      }

      setWeather({
        tempC: Math.round(data.main.temp),
        main: data.weather?.[0]?.main || 'Unknown',
        description: data.weather?.[0]?.description || '',
        city: data.name || '',
      });
    } catch (err) {
      setWeatherError(err.message);
    } finally {
      setLoadingWeather(false);
      setRefreshing(false); 
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWeather();
  }, []);

  useEffect(() => {
    fetchWeather();
  }, []);

  const openShop = (platform) => {
    let searchTerm = 'stylish casual outfit';
    if (weather?.tempC >= 25) searchTerm = 'hot weather summer outfit';
    else if (weather?.tempC <= 15) searchTerm = 'cold weather thick clothing';
    else if (weather?.main === 'Rain' || weather?.main === 'Drizzle') searchTerm = 'rainy weather outfit water resistant';

    const query = encodeURIComponent(searchTerm);
    let url = '';

    switch (platform) {
      case 'Shopee': url = `https://shopee.ph/search?keyword=${query}`; break;
      case 'Lazada': url = `https://www.lazada.com.ph/catalog/?q=${query}`; break;
      case 'Shein': url = `https://ph.shein.com/pdsearch/${query}`; break;
      case 'Zalora': url = `https://www.zalora.com.ph/catalog/?q=${query}`; break;
    }

    Linking.openURL(url);
    setShowShops(false); 
  };

  const icon = weather ? getWeatherEmoji(weather.main) : '🌤️';
  const message = weather ? getWeatherMessage(weather.main) : '';

  return (
    <LinearGradient
      colors={[colors.offWhiteBackground, colors.mainWhite]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.offWhiteBackground} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primaryBlue]}
              tintColor={colors.primaryBlue}
            />
          }
        >
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../image_upload/DripCheckLogo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weatherCard}>
            {loadingWeather && !refreshing ? (
              <View style={{ alignItems: 'center' }}>
                <ActivityIndicator />
                <Text style={{ marginTop: 10, color: colors.textSecondary }}>Getting weather...</Text>
              </View>
            ) : weatherError ? (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: 'crimson', textAlign: 'center' }}>{weatherError}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={fetchWeather}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : weather ? (
              <>
                <View style={styles.weatherRow}>
                  <Text style={styles.weatherIcon}>{icon}</Text>
                  <Text style={styles.weatherTemp}>{weather.tempC}°C</Text>
                </View>
                <Text style={styles.weatherCondition}>
                  {weather.main}{weather.city ? ` • ${weather.city}` : ''}
                </Text>
                <Text style={styles.weatherMessage}>{message}</Text>
                {weather.description ? (
                  <Text style={[styles.weatherMessage, { marginTop: 6 }]}>{weather.description}</Text>
                ) : null}
              </>
            ) : null}
          </View>

          <OutfitCard 
            user={user} 
            weather={weather} 
            API_URL={API_URL}
            onPressMatches={() => setShowShops(true)} 
          />
        </ScrollView>

        <Modal
          animationType="fade"
          transparent={true}
          visible={showShops}
          onRequestClose={() => setShowShops(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.shopLinksTitle}>
                  Search {weather?.tempC >= 25 ? 'Hot' : 'Cold'} Weather Outfits On:
                </Text>
                <TouchableOpacity onPress={() => setShowShops(false)}>
                  <Text style={styles.closeModalText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.shopButtonsRow}>
                <TouchableOpacity style={[styles.shopBtn, { backgroundColor: '#EE4D2D' }]} onPress={() => openShop('Shopee')}>
                  <Text style={styles.shopBtnText}>Shopee</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.shopBtn, { backgroundColor: '#0F136D' }]} onPress={() => openShop('Lazada')}>
                  <Text style={styles.shopBtnText}>Lazada</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.shopButtonsRow}>
                <TouchableOpacity style={[styles.shopBtn, { backgroundColor: '#222222' }]} onPress={() => openShop('Shein')}>
                  <Text style={styles.shopBtnText}>Shein</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.shopBtn, { backgroundColor: '#000000' }]} onPress={() => openShop('Zalora')}>
                  <Text style={styles.shopBtnText}>Zalora</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* DAILY NOTIFICATION PREFERENCE MODAL */}
        <Modal visible={showNotifModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.premiumModal}>
              {/* Icon/Emoji Header */}
              <View style={styles.iconCircle}>
                <Text style={{ fontSize: 30 }}>🔔</Text>
              </View>

              <Text style={styles.notifTitle}>Daily Style Reminder</Text>
              <Text style={styles.notifSubtitle}>
                What time should we send your daily outfit recommendation?
              </Text>

              <View style={styles.pickerWrapper}>
              <DateTimePicker
                value={notifTime}
                mode="time"
                is24Hour={false}
                display="spinner" // Best for iOS modals
                textColor="black" // Ensures visibility on white background
                onChange={(event, selectedDate) => {
                  if (selectedDate) setNotifTime(selectedDate);
                }}
                style={styles.iosPicker} 
              />
            </View>

              <TouchableOpacity 
                style={styles.primaryBtn} 
                onPress={handleConfirmNotifPreference}
              >
                <Text style={styles.primaryBtnText}>Set Daily Reminder</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryBtn} 
                onPress={async () => {
                  setShowNotifModal(false); // Close immediately for good UX
                  
                  try {
                    // Silently tell the backend to stop asking them
                    const response = await fetch(`${API_URL}/api/auth/update/${user._id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        hasSetPreferences: true 
                        // We intentionally leave notificationTime blank here
                      }),
                    });
                    
                    if (response.ok) {
                      const updatedUser = await response.json();
                      if(setUser) setUser(updatedUser);
                    }
                  } catch (e) {
                    console.log("Failed to dismiss preference", e);
                  }
                }}
              >
                <Text style={styles.secondaryBtnText}>Maybe later</Text>
              </TouchableOpacity>

              <Text style={styles.footerNote}>
                You can always change this later in your Profile settings.
              </Text>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
  
}
