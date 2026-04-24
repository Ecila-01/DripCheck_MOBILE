import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import styles from '../styles/LoginScreenStyles';
const API_URL = process.env.EXPO_PUBLIC_API_URL;


const LoginScreen = ({ navigation, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const canGoBack = navigation.canGoBack();
  const [loading, setLoading] = useState(false);
  return (
    <LinearGradient
      colors={[colors.mainWhite, colors.offWhiteBackground]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.mainWhite} />
      <SafeAreaView style={styles.authSafeArea}>
        {/* Header */}
        <View style={styles.header}>
          {canGoBack ? (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.closeButton} /> 
          )}
        </View>

        <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoid}>
          <View style={styles.content}>
            <Text style={styles.title}>Log In</Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={colors.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={colors.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.showButton}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                  <Text style={styles.showButtonText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')} // ⬅️ UPDATED THIS LINE
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={async () => {
                if (!email || !password) {
                  alert('Please enter email and password');
                  return;
                }

                setLoading(true); // Always good to show a spinner!

                try {
                  const res = await fetch(`${API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                  });

                  const data = await res.json();

                  if (!res.ok) {
                    alert(data.message || 'Login failed');
                    return;
                  }

                  // ✅ 1. Define the session data first!
                  const sessionData = {
                    user: data.user,
                    loginTime: Date.now(),
                    expiresAt: Date.now() + (6 * 60 * 60 * 1000), // 6 hours from now
                  };
                  // ✅ 3. Update global state and navigate
                  // Note: If you use a 'setUser' function from Context, call it here
                  if (setUser) setUser(data.user); 
                  
                  navigation.replace('Dashboard');
                } catch (err) {
                  alert('Network error: ' + err.message);
                } finally {
                  setLoading(false);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>

            <View style={styles.alreadyAccountContainer}>
              <Text style={styles.alreadyAccountText}>No account yet? </Text>
              <TouchableOpacity
                onPress={() => navigation.replace('SignUp')}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <Text style={styles.loginLinkText}>Sign up</Text>
              </TouchableOpacity>
            </View>

            {/* --- OFFLINE MODE BUTTON --- */}
            <TouchableOpacity
              style={{ marginTop: 40, alignItems: 'center' }}
              onPress={() => navigation.navigate('OfflineScreen')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ 
                color: colors.primaryBlue, 
                fontSize: 16, 
                fontWeight: '600',
                textDecorationLine: 'underline' 
              }}>
                ☁️ Use Offline Mode
              </Text>
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;