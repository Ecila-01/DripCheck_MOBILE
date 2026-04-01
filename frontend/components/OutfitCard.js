import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import colors from '../constants/colors';

// 1. We create a separate component for the individual items.
// This is the correct way to use state for items rendered in a loop/map.
const ClothingItem = ({ item, label }) => {
  const [imgError, setImgError] = useState(false);

  if (!item) return null;

  return (
    <View style={styles.clothingItemContainer}>
      {item.imageUri && !imgError ? (
        <Image 
          source={{ uri: item.imageUri }} 
          style={styles.clothingImage} 
          onError={() => {
            console.log(`Local image not found for ${item.name}, using fallback.`);
            setImgError(true);
          }}
        />
      ) : (
        <View style={styles.iconPlaceholder}>
          <Text style={styles.emojiIcon}>{item.icon || '👕'}</Text>
        </View>
      )}
      <Text style={styles.clothingName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.clothingLabel}>{label}</Text>
    </View>
  );
};

export default function OutfitCard({ user, weather, onPressMatches, API_URL }) {
  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fallbackMsg, setFallbackMsg] = useState('');

  useEffect(() => {
    if (user && weather) {
      fetchRecommendation();
    }
  }, [user, weather]);

  const fetchRecommendation = async () => {
    setLoading(true);
    setError('');
    setFallbackMsg('');
    
    try {
      const userId = user._id || user.id || 'guest';
      const res = await fetch(`${API_URL}/api/outfits/recommend/${userId}?temp=${weather.tempC}&condition=${weather.main}`);
      const data = await res.json();

      if (res.ok && data.outfit) {
        setOutfit(data.outfit);
        if (data.isFallback) {
          setFallbackMsg(data.fallbackMessage);
        }
      } else {
        setError(data.message || 'Could not load outfit.');
      }
    } catch (err) {
      setError('Network error loading outfit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.title}>Outfit of the Day</Text>

      <View style={styles.outfitBox}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primaryBlue} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : outfit ? (
          <View style={styles.outfitGrid}>
            
            {fallbackMsg ? (
              <View style={styles.fallbackContainer}>
                <Text style={styles.fallbackText}>{fallbackMsg}</Text>
              </View>
            ) : null}

            <View style={styles.row}>
              {/* 2. We now call the component instead of a function */}
              <ClothingItem item={outfit.top} label="Top" />
              <ClothingItem item={outfit.bottom} label="Bottom" />
            </View>
            
            {(outfit.outerwear || outfit.footwear) && (
              <View style={styles.row}>
                <ClothingItem item={outfit.outerwear} label="Outerwear" />
                <ClothingItem item={outfit.footwear} label="Shoes" />
              </View>
            )}
          </View>
        ) : null}
      </View>

      <TouchableOpacity style={styles.button} onPress={onPressMatches}>
        <Text style={styles.buttonText}>Find Affordable Matches</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  outfitBox: {
    backgroundColor: colors.offWhiteBackground,
    borderRadius: 16,
    padding: 16,
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  outfitGrid: {
    width: '100%',
  },
  fallbackContainer: {
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  fallbackText: {
    fontSize: 13,
    color: '#E65100',
    textAlign: 'center',
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  clothingItemContainer: {
    alignItems: 'center',
    width: '45%',
  },
  clothingImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#EAEAEA',
    marginBottom: 8,
  },
  iconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emojiIcon: {
    fontSize: 40,
  },
  clothingName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  clothingLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  errorText: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#8AB4F8',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  }
});