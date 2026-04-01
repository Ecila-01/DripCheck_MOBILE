import React, { useEffect, useState, useCallback } from 'react'; // Added useCallback
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Modal,
  Linking,
  ScrollView, // Added ScrollView
  RefreshControl, // Added RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import OutfitCard from '../components/OutfitCard';
import { Platform } from 'react-native';

const OPENWEATHER_API_KEY = 'b2e243eae1e1f558807d9b4ece5696f4';

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

export default function HomeScreen({ user, onLogout, API_URL }) {
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 
  const [weather, setWeather] = useState(null); 
  const [weatherError, setWeatherError] = useState('');
  const [showShops, setShowShops] = useState(false);

  const fetchWeather = async () => {
    setWeatherError('');
    if (!refreshing) setLoadingWeather(true);

    try {
      /*
      setWeather({
        //tempC: 12,           // COLD
        tempC: 26,        // HOT
        main: 'Clouds',        // Rain, Clear, Clouds, Snow, Thunderstorm, Drizzle
        city: 'Baguio',
      });
      setLoadingWeather(false);
      setRefreshing(false);
      return;
      */
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setWeatherError('Location permission denied.');
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

      if (!res.ok) throw new Error(data?.message || 'Failed to fetch weather');

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

  // --- Shopping Links Logic ---
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
              colors={[colors.primaryBlue]} // Android spinner color
              tintColor={colors.primaryBlue} // iOS spinner color
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../image_upload/DripCheckLogo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Weather Widget */}
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
            ) : (
              <>
                <View style={styles.weatherRow}>
                  <Text style={styles.weatherIcon}>{icon}</Text>
                  <Text style={styles.weatherTemp}>{weather.tempC}°C</Text>
                </View>
                <Text style={styles.weatherCondition}>
                  {weather.main}{weather.city ? ` • ${weather.city}` : ''}
                </Text>
                <Text style={styles.weatherMessage}>{message}</Text>
                {!!weather.description && (
                  <Text style={[styles.weatherMessage, { marginTop: 6 }]}>{weather.description}</Text>
                )}
              </>
            )}
          </View>

          {/* Outfit of the Day Card */}
          <OutfitCard 
            user={user} 
            weather={weather} 
            API_URL={API_URL}
            onPressMatches={() => setShowShops(true)} 
          />
        </ScrollView>

        {/* --- STORE LINKS MODAL --- */}
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

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingBottom: 20, // Space at the bottom so content isn't cut off
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingBottom: 10,
  },
  logoWrapper: { flex: 1, alignItems: 'center' },
  logo: { width: 240, height: 120 },
  logoutButton: { position: 'absolute', right: 20, top: 20 },
  logoutText: { color: colors.primaryBlue, fontSize: 16, fontWeight: '600' },

  weatherCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 140,
    justifyContent: 'center',
  },
  weatherRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  weatherIcon: { fontSize: 32, marginRight: 12 },
  weatherTemp: { fontSize: 28, fontWeight: 'bold', color: colors.textPrimary },
  weatherCondition: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  weatherMessage: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },

  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primaryBlue,
  },
  retryText: { color: colors.primaryBlue, fontWeight: '600' },

  /* --- MODAL STYLES --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '85%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  shopLinksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  closeModalText: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  shopButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shopBtn: {
    width: '48%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  }
});