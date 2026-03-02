import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import OutfitModal from './OutfitModal';
import React, { useState } from 'react';
// Reusable Outfit Card Component
const OutfitCard = ({weatherMain }) => {
  const [modalVisible, setModalVisible] = useState(false);
  function getOutfitIcon(weatherMain) {
    switch (weatherMain) {
      case 'Rain':
      case 'Drizzle':
        return '🧥'; // jacket
      case 'Clear':
        return '👕'; // t-shirt
      case 'Clouds':
        return '🧢'; // casual
      case 'Snow':
        return '🧣'; // winter
      case 'Thunderstorm':
        return '🥾'; // boots
      default:
        return '👔'; // fallback
    }
  }
  function getOutfitLabel(weatherMain) {
  switch (weatherMain) {
    case 'Rain':
    case 'Drizzle':
      return 'Rainy Outfit';
    case 'Clear':
      return 'Casual Fit';
    case 'Clouds':
      return 'Comfy Casual';
    case 'Snow':
      return 'Winter Wear';
    case 'Thunderstorm':
      return 'Rugged Fit';
    default:
      return 'Classic Style';
  }
}
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Outfit of the Day</Text>
      <View style={styles.placeholder}>
        <Text style={styles.icon}>
          {getOutfitIcon(weatherMain)}
        </Text>
        <Text style={styles.outfitLabel}>
          {getOutfitLabel(weatherMain)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Find Affordable Matches</Text>
      </TouchableOpacity>
      <OutfitModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        weatherMain={weatherMain}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    flex: 1,
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  placeholder: {
    width: '100%',
    height: 250,
    backgroundColor: colors.offWhiteBackground,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 80,
  },
  button: {
    backgroundColor: colors.primaryBlue,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: colors.primaryBlue,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  outfitLabel: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  label: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

export default OutfitCard;

