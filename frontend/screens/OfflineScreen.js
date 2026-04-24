import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';

const weatherOptions = ['hot', 'warm', 'cold', 'rainy'];

// 💡 ADDED: Passed navigation prop here
const OfflineScreen = ({ navigation }) => {
  const [closet, setCloset] = useState([]);
  const [selectedWeather, setSelectedWeather] = useState('hot');
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    const loadCloset = async () => {
      try {
        const savedCloset = await AsyncStorage.getItem('offline_closet');
        if (savedCloset) {
          const parsedCloset = JSON.parse(savedCloset);
          setCloset(parsedCloset);
          // Generate initial recommendation
          const result = generateOfflineRecommendation(parsedCloset, 'hot');
          setRecommendation(result);
        }
      } catch (error) {
        console.error("Failed to load offline closet:", error);
      }
    };
    loadCloset();
  }, []);

  // 🧠 THE PORTED BACKEND LOGIC
  const generateOfflineRecommendation = (items, targetTag) => {
    // Helper to replace MongoDB $match and $sample
    const getRandomItem = (category, tag) => {
      const filtered = items.filter(item => 
        item.category === category && 
        item.weatherTags && 
        item.weatherTags.includes(tag)
      );
      return filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : null;
    };

    const top = getRandomItem('Tops', targetTag);
    const bottom = getRandomItem('Bottoms', targetTag);
    const footwear = getRandomItem('Footwear', targetTag);
    const outerwear = (targetTag === 'cold' || targetTag === 'rainy') 
      ? getRandomItem('Outerwear', targetTag) 
      : null;

    // Fallback Logic
    if (!top || !bottom) {
      let genericTop = { name: "Comfortable Top", icon: "👕", id: "gen_top" };
      let genericBottom = { name: "Everyday Pants", icon: "👖", id: "gen_bot" };
      let genericOuter = null;

      if (targetTag === 'hot') {
        genericTop = { name: "Light T-Shirt", icon: "🎽", id: "gen_top" };
        genericBottom = { name: "Shorts", icon: "🩳", id: "gen_bot" };
      } else if (targetTag === 'cold') {
        genericOuter = { name: "Heavy Coat", icon: "🧥", id: "gen_out" };
      }

      return {
        outfit: {
          top: top || genericTop,
          bottom: bottom || genericBottom,
          outerwear: outerwear || genericOuter,
          footwear: footwear || { name: "Shoes", icon: "👟", id: "gen_shoe" }
        },
        isFallback: true,
        fallbackMessage: "Not enough matching clothes found in cache! Here is a generic suggestion:"
      };
    }

    return {
      outfit: { top, bottom, outerwear, footwear },
      isFallback: false
    };
  };

  const handleWeatherChange = (weather) => {
    setSelectedWeather(weather);
    const result = generateOfflineRecommendation(closet, weather);
    setRecommendation(result);
  };

  // 🎨 HELPER TO RENDER EACH OUTFIT PIECE
  const renderOutfitPiece = (item, label) => {
    if (!item) return null;

    return (
      <View style={styles.pieceContainer} key={item.id || label}>
        <Text style={styles.pieceLabel}>{label}</Text>
        <View style={styles.imageBox}>
          {item.imageUri ? (
            <Image 
              source={{ uri: item.imageUri }} 
              style={styles.pieceImage} 
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.fallbackIcon}>{item.icon || '👕'}</Text>
          )}
        </View>
        <Text style={styles.pieceName} numberOfLines={1}>{item.name}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* 💡 ADDED: Back Button Header pinned to the top */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerContainer}>
          <Text style={styles.offlineIcon}>📵</Text>
          <Text style={styles.header}>Offline Mode</Text>
          <Text style={styles.subtitle}>Viewing locally saved closet</Text>
        </View>

        {/* WEATHER SELECTOR */}
        <View style={styles.weatherRow}>
          {weatherOptions.map(option => (
            <TouchableOpacity 
              key={option} 
              onPress={() => handleWeatherChange(option)}
              style={[styles.chip, selectedWeather === option && styles.activeChip]}
            >
              <Text style={[styles.chipText, selectedWeather === option && styles.activeChipText]}>
                {option.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* RECOMMENDATION OUTFIT GRID */}
        {recommendation && (
          <View style={styles.outfitCard}>
            <Text style={styles.cardTitle}>Today's Look</Text>
            
            {recommendation.isFallback && (
              <Text style={styles.fallbackText}>{recommendation.fallbackMessage}</Text>
            )}

            <View style={styles.outfitGrid}>
              {/* Top Row: Top & Outerwear */}
              <View style={styles.gridRow}>
                {renderOutfitPiece(recommendation.outfit.top, 'Top')}
                {recommendation.outfit.outerwear && renderOutfitPiece(recommendation.outfit.outerwear, 'Outer')}
              </View>

              {/* Bottom Row: Bottom & Footwear */}
              <View style={styles.gridRow}>
                {renderOutfitPiece(recommendation.outfit.bottom, 'Bottom')}
                {renderOutfitPiece(recommendation.outfit.footwear, 'Shoes')}
              </View>
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // 💡 ADDED: Styles for the new top bar
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryBlue,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 0, // Adjusted to balance the new top bar
    marginBottom: 30,
  },
  offlineIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primaryBlue,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
    width: '100%',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#E9ECEF',
    margin: 6,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  activeChip: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#495057',
  },
  activeChipText: {
    color: '#FFF',
  },
  outfitCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryBlue,
    textAlign: 'center',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fallbackText: {
    color: '#E07A5F',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  outfitGrid: {
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 15,
  },
  pieceContainer: {
    alignItems: 'center',
    width: '45%',
  },
  pieceLabel: {
    fontSize: 11,
    color: '#ADB5BD',
    textTransform: 'uppercase',
    fontWeight: '800',
    marginBottom: 6,
  },
  imageBox: {
    width: 110,
    height: 110,
    borderRadius: 16,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  pieceImage: {
    width: '100%',
    height: '100%',
  },
  fallbackIcon: {
    fontSize: 50,
  },
  pieceName: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#343A40',
    textAlign: 'center',
  }
});

export default OfflineScreen;