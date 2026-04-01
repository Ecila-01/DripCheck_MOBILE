import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';

const LandingScreen = ({ navigation }) => (
  <LinearGradient
    colors={[colors.mainWhite, colors.offWhiteBackground]}
    style={styles.container}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
  >
    <SafeAreaView style={styles.landingSafeArea}>
      <View style={styles.landingContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../image_upload/DripCheckLogo.png')} // Fixed relative path
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>HELLO I'M</Text>
          <Text style={styles.subtitle}>Your personal style assistant</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('SignUp')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  landingSafeArea: { flex: 1 },
  landingContent: { flex: 1 },
  logoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  logo: { width: 150, height: 150 }, // Added explicit dimensions so it renders properly
  titleContainer: { flex: 0.5, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: colors.textPrimary, letterSpacing: 2, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary },
  buttonContainer: { flex: 0.6, justifyContent: 'flex-end', paddingBottom: 50, paddingHorizontal: 24 },
  button: { backgroundColor: colors.primaryBlue, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: colors.primaryBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  buttonText: { color: colors.white, fontSize: 18, fontWeight: '600' },
});

export default LandingScreen;