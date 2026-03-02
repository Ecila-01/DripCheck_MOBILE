import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';

import colors from '../constants/colors';
import OutfitCard from '../components/OutfitCard';

const OPENWEATHER_API_KEY = 'b2e243eae1e1f558807d9b4ece5696f4'; 

function getWeatherEmoji(main) {
  switch (main) {
    case 'Thunderstorm':
      return '⛈️';
    case 'Drizzle':
      return '🌦️';
    case 'Rain':
      return '🌧️';
    case 'Snow':
      return '❄️';
    case 'Clear':
      return '☀️';
    case 'Clouds':
      return '☁️';
    default:
      return '🌤️';
  }
}

function getWeatherMessage(main) {
  switch (main) {
    case 'Rain':
    case 'Drizzle':
      return "It's raining today! Bring an umbrella ☂️";
    case 'Clear':
      return "It's sunny today! Light outfit recommended 😎";
    case 'Clouds':
      return "Cloudy day — comfy layers work well ☁️";
    case 'Snow':
      return "Cold day — wear thick layers 🧥";
    case 'Thunderstorm':
      return "Stormy weather — stay safe ⚡";
    default:
      return "Weather update ready ✅";
  }
}

export default function HomeScreen({ user, onLogout }) {
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weather, setWeather] = useState(null); // { tempC, main, description, city }
  const [weatherError, setWeatherError] = useState('');

  const fetchWeather = async () => {
    setWeatherError('');
    setLoadingWeather(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setWeatherError('Location permission denied.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      const url =
        `https://api.openweathermap.org/data/2.5/weather` +
        `?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;

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
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

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
        {/* Header with Logout */}
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
          {loadingWeather ? (
            <View style={{ alignItems: 'center' }}>
              <ActivityIndicator />
              <Text style={{ marginTop: 10, color: colors.textSecondary }}>
                Getting weather...
              </Text>
            </View>
          ) : weatherError ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: 'crimson', textAlign: 'center' }}>
                {weatherError}
              </Text>
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

              <Text style={styles.weatherMessage}>
                {message}
              </Text>

              {/* Optional: show description */}
              {!!weather.description && (
                <Text style={[styles.weatherMessage, { marginTop: 6 }]}>
                  {weather.description}
                </Text>
              )}
            </>
          )}
        </View>

        {/* Outfit of the Day Card */}
        <OutfitCard onPress={() => console.log('Find Affordable Matches')} weatherMain={weather?.main}/>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  logoWrapper: { flex: 1, alignItems: 'center' },
  logo: { width: 180, height: 60 },
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
});
