import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Linking,
  Platform,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';

const TrendScreen = ({API_URL }) => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const res = await fetch(`${API_URL}/api/trends/popular`);
      const data = await res.json();
      
      if (res.ok) {
        setTrends(data.trends);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTrends();
    setRefreshing(false);
  }, []);

  const renderTrendCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9}
      onPress={() => Linking.openURL(item.url)} 
    >
      <Image 
        source={{ uri: item.urlToImage }} 
        style={styles.cardImage} 
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.sourceText} numberOfLines={1}>
          {item.source.name.toUpperCase()}
        </Text>
        <Text style={styles.titleText} numberOfLines={3}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trending Now</Text>
        <Text style={styles.headerSubtitle}>Discover global fashion inspiration</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
        </View>
      ) : trends.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No trends found right now.</Text>
        </View>
      ) : (
        <FlatList
          data={trends}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderTrendCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.row} 
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={colors.primaryBlue} 
              colors={[colors.primaryBlue]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhiteBackground, 
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: 20, 
    marginBottom: 18,
    overflow: 'hidden',
    // Soft DripCheck Shadows
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F0F0F0',
  },
  cardContent: {
    padding: 12,
    alignItems: 'center', 
  },
  sourceText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primaryBlue,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default TrendScreen;