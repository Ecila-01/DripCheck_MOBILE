import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importing all the structural screens
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null); // null means we are still checking

  useEffect(() => {
    // Check if the app has been launched before
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched === null) {
          // First time opening the app! Set the flag for next time.
          await AsyncStorage.setItem('hasLaunched', 'true');
          setIsFirstLaunch(true);
        } else {
          // App has been opened before
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error('Error checking AsyncStorage:', error);
        setIsFirstLaunch(false); // Default to safely skipping if storage fails
      }
    };

    checkFirstLaunch();
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
          initialRouteName={isFirstLaunch ? 'Landing' : 'Login'} 
        >
          <Stack.Screen name="Landing" component={LandingScreen} />
          
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setUser={setUser} />}
          </Stack.Screen>
          
          <Stack.Screen name="SignUp">
            {(props) => <SignUpScreen {...props} setUser={setUser} />}
          </Stack.Screen>

          <Stack.Screen name="Dashboard">
            {(props) => (
              <DashboardScreen 
                {...props} 
                user={user} 
                onLogout={() => {
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