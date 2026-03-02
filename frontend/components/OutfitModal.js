import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  FlatList,
  Alert,
} from 'react-native';
import colors from '../constants/colors';

const openUrl = async (url) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Cannot open link', url);
      return;
    }
    await Linking.openURL(url);
  } catch (e) {
    Alert.alert('Error', 'Failed to open link.');
  }
};

function getOutfitItems(weatherMain) {
  switch (weatherMain) {
    case 'Rain':
    case 'Drizzle':
        return [
        {
            id: 'rain-1',
            title: 'Light Rain Jacket',
            image: 'https://images.unsplash.com/photo-1520975922284-9e0ce82759d5?w=800&q=80',
            url: 'https://shopee.ph/search?keyword=rain%20jacket',
        },
        {
            id: 'rain-2',
            title: 'Waterproof Shoes',
            image: 'https://images.unsplash.com/photo-1528701800489-20be3c38c36b?w=800&q=80',
            url: 'https://www.lazada.com.ph/catalog/?q=waterproof%20shoes',
        },
        {
            id: 'rain-3',
            title: 'Umbrella + Cap',
            image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
            url: 'https://www.shein.com/pdsearch/umbrella%20cap/',
        },
        {
            id: 'rain-4',
            title: 'Quick-dry Pants',
            image: 'https://images.unsplash.com/photo-1520974735194-6c8f45a7b3d1?w=800&q=80',
            url: 'https://shopee.ph/search?keyword=quick%20dry%20pants',
        },
        ];

    case 'Clear':
        return [
        {
            id: 'clear-1',
            title: 'Breathable Tee',
            image: 'https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?w=800&q=80',
            url: 'https://www.lazada.com.ph/catalog/?q=breathable%20tshirt',
        },
        {
            id: 'clear-2',
            title: 'Shorts / Skirt',
            image: 'https://images.unsplash.com/photo-1520974735194-6c8f45a7b3d1?w=800&q=80',
            url: 'https://www.shein.com/pdsearch/summer%20shorts/',
        },
        {
            id: 'clear-3',
            title: 'Cap + Sunnies',
            image: 'https://images.unsplash.com/photo-1521332152074-c0d3f6f0b7c5?w=800&q=80',
            url: 'https://shopee.ph/search?keyword=cap%20sunglasses',
        },
        {
            id: 'clear-4',
            title: 'Light Sneakers',
            image: 'https://images.unsplash.com/photo-1528701800489-20be3c38c36b?w=800&q=80',
            url: 'https://www.lazada.com.ph/catalog/?q=lightweight%20sneakers',
        },
        ];

    case 'Clouds':
        return [
        {
            id: 'clouds-1',
            title: 'Light Hoodie',
            image: 'https://img.sonofatailor.com/images/customizer/product/hoodie-2/LightGrey.jpg',
            url: 'https://shopee.ph/search?keyword=light%20hoodie',
        },
        {
            id: 'clouds-2',
            title: 'Comfy Jeans',
            image: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/477863/sub/goods_477863_sub14_3x4.jpg?width=494',
            url: 'https://www.lazada.com.ph/catalog/?q=jeans',
        },
        {
            id: 'clouds-3',
            title: 'Layered Fit',
            image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80',
            url: 'https://www.shein.com/pdsearch/layering%20shirt/',
        },
        {
            id: 'clouds-4',
            title: 'Casual Sneakers',
            image: 'https://huckberry.imgix.net/pages/081325-fallsneakershopupdate-1-jpg-f63bd0282c.jpg?auto=format%2C%20compress&crop=top&fit=clip&cs=tinysrgb&ixlib=react-9.8.1',
            url: 'https://shopee.ph/search?keyword=casual%20sneakers',
        },
        ];

    case 'Snow':
        return [
        {
            id: 'snow-1',
            title: 'Warm Coat',
            image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80',
            url: 'https://www.lazada.com.ph/catalog/?q=winter%20coat',
        },
        {
            id: 'snow-2',
            title: 'Thermal Top',
            image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
            url: 'https://www.shein.com/pdsearch/thermal%20shirt/',
        },
        {
            id: 'snow-3',
            title: 'Gloves + Beanie',
            image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
            url: 'https://shopee.ph/search?keyword=gloves%20beanie',
        },
        {
            id: 'snow-4',
            title: 'Boots',
            image: 'https://images.unsplash.com/photo-1528701800489-20be3c38c36b?w=800&q=80',
            url: 'https://www.lazada.com.ph/catalog/?q=winter%20boots',
        },
        ];

    default:
        return [
        {
            id: 'default-1',
            title: 'Everyday Casual',
            image: 'https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?w=800&q=80',
            url: 'https://shopee.ph/search?keyword=casual%20outfit',
        },
        ];
    }
}

const OutfitCard = ({ item }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => openUrl(item.url)}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />

      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
};

const OutfitModal = ({ visible, onClose, weatherMain }) => {
  const data = useMemo(() => getOutfitItems(weatherMain), [weatherMain]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Affordable Matches</Text>
              <Text style={styles.subtitle}>
                Weather: <Text style={styles.badge}>{weatherMain || 'Today'}</Text>
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.xBtn}>
              <Text style={styles.xText}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={data}
            keyExtractor={(it) => it.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrap}
            contentContainerStyle={styles.gridContent}
            renderItem={({ item }) => <OutfitCard item={item} />}
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '90%',
        maxHeight: '85%',
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // center title block
        marginBottom: 10,
        position: 'relative',      // allows absolute X button
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.textPrimary,
        textAlign: 'center', // <-- center
    },
    subtitle: {
        marginTop: 4,
        color: colors.textSecondary ?? '#666',
        fontWeight: '600',
        textAlign: 'center', // <-- center
    },
    badge: {
        color: colors.primaryBlue,
        fontWeight: '800',
    },
    xBtn: {
        position: 'absolute',
        right: 0,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#F2F4F7',
        },
    xText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#333',
    },
    gridContent: {
        paddingBottom: 8,
    },
    columnWrap: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    card: {
        width: '48%',
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEF1F4',
    },
    cardImage: {
        width: '100%',
        height: 120,
    },
    cardTitle: {
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 10, 
        fontWeight: '800',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    linksRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 12,
    },
    link: {
        color: colors.primaryBlue,
        fontWeight: '800',
        fontSize: 12,
    },
    closeBtn: {
        marginTop: 8,
        alignSelf: 'center',
        backgroundColor: colors.primaryBlue,
        paddingHorizontal: 26,
        paddingVertical: 10,
    borderRadius: 20,
    },
    closeText: {
        color: colors.white,
        fontWeight: '700',
    },
});

export default OutfitModal;
