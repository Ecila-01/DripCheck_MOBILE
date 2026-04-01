import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import colors from '../constants/colors';

// Import your custom components and sub-screens
import BottomTabBar from '../components/BottomTabBar';
import HomeScreen from './HomeScreen';
import ClosetScreen from './ClosetScreen';
import TrendScreen from './TrendScreen';
import ProfileScreen from './ProfileScreen';

const API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:3000'
    : 'http://192.168.100.9:3000'; //palitan dito ang ip

const DashboardScreen = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Home');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen user={user} onLogout={onLogout} API_URL={API_URL} />;
      case 'Closet':
        return <ClosetScreen user={user} API_URL={API_URL} setActiveTab={setActiveTab} />;
      case 'Trend':
        return <TrendScreen API_URL={API_URL} />;
      case 'Profile':
        return <ProfileScreen user={user} API_URL={API_URL} />;
      default:
        return <HomeScreen onLogout={onLogout} />;
    }
  };

  return (
    <View style={styles.dashboardContainer}>
      <View style={styles.tabContent}>{renderTabContent()}</View>
      <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  dashboardContainer: {
    flex: 1,
    backgroundColor: colors.offWhiteBackground,
  },
  tabContent: {
    flex: 1,
  },
});

export default DashboardScreen;