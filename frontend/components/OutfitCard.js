import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator} from 'react-native';
import colors from '../constants/colors';
import styles from '../styles/OutfitCardStyles';

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
      const res = await fetch(`${API_URL}/api/clothings/recommend/${userId}?temp=${weather.tempC}&condition=${weather.main}`);
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
              <ClothingItem item={outfit.top} label="Top" />
              <ClothingItem item={outfit.bottom} label="Bottom" />
            </View>
            {(outfit.outerwear || outfit.footwear) ? (
              <View style={styles.row}>
                <ClothingItem item={outfit.outerwear} label="Outerwear" />
                <ClothingItem item={outfit.footwear} label="Shoes" />
              </View>
            ) : null}
            
          </View>
        ) : null}
      </View>

      <TouchableOpacity style={styles.button} onPress={onPressMatches}>
        <Text style={styles.buttonText}>Find Affordable Matches</Text>
      </TouchableOpacity>
    </View>
  );
}