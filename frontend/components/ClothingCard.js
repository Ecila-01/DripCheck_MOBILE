import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import colors from '../constants/colors';

const ClothingCard = ({ icon, name, color, favorite, imageUrl, onPress, onToggleFavorite, onDelete }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.itemImage} />
        ) : (
          <Text style={styles.itemIcon}>{icon}</Text>
        )}
        
        <Text style={styles.itemName} numberOfLines={1}>{name}</Text>
        {color ? <Text style={styles.itemColor} numberOfLines={1}>{color}</Text> : null}
        
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={onToggleFavorite} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.favoriteIcon, favorite && styles.favoriteActive]}>
              {favorite ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 4,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 8,
    alignItems: 'center',
  },
  itemIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  itemColor: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 4,
  },
  favoriteIcon: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  favoriteActive: {
    color: '#FFD700',
  },
  deleteIcon: {
    fontSize: 14,
    color: colors.error || '#FF3B30',
  },
});

export default ClothingCard;