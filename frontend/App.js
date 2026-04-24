import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
// Importing all the structural screens
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen';
import OfflineScreen from './screens/OfflineScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';




const Stack = createNativeStackNavigator();
const usePermissionsWarmup = () => {
  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') return;

      // 1. Photo & Camera Permissions
      const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();

      // 2. Notification Permissions (Crucial for Android 13+)
      const notifStatus = await Notifications.requestPermissionsAsync();

      // Debugging logs for your build process
      console.log('Permissions Status:', {
        gallery: libraryStatus.status,
        camera: cameraStatus.status,
        notifications: notifStatus.status
      });

      if (libraryStatus.status !== 'granted' || notifStatus.status !== 'granted') {
        console.warn('Some permissions were not granted. App features may be limited.');
      }
    })();
  }, []);
};


export default function App() {
  const [user, setUser] = useState(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null); // null means we are still checking
  usePermissionsWarmup();
  useEffect(() => {
      const checkInitialState = async () => {
        try {
          // 1. Only check if it's the first time launch
          const hasLaunched = await AsyncStorage.getItem('hasLaunched');
          
          // 2. We skip searching for 'user_session' entirely
          // Every time the app opens, 'user' state will start as null

          if (hasLaunched === null) {
            await AsyncStorage.setItem('hasLaunched', 'true');
            setIsFirstLaunch(true);
          } else {
            setIsFirstLaunch(false);
          }
        } catch (error) {
          console.error('Initial Load Error:', error);
          setIsFirstLaunch(false);
        }
      };
      checkInitialState();
    }, []);

  // Show a blank screen or loading spinner while we check local storage
  if (isFirstLaunch === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{ headerShown: false }}
          // Dynamically set the first screen based on our storage check!
          initialRouteName={user ? 'Dashboard' : (isFirstLaunch ? 'Landing' : 'Login')}
        >
          <Stack.Screen name="Landing" component={LandingScreen} />
          
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setUser={setUser} />}
          </Stack.Screen>
          <Stack.Screen name="OfflineScreen">
            {(props) => <OfflineScreen {...props} />}
          </Stack.Screen>
          <Stack.Screen name="SignUp">
            {(props) => <SignUpScreen {...props} setUser={setUser} />}
          </Stack.Screen>
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Dashboard">
            {(props) => (
              <DashboardScreen 
                {...props} 
                user={user} 
                setUser={setUser}
                onLogout={async () => {
                  setUser(null); // Clear the user data
                  props.navigation.replace('Login'); // Kick them back to the login screen
                }} 
              />
            )}
          </Stack.Screen>
            
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}