import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';

const API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:3000'
    : 'http://192.168.100.9:3000';

const LoginScreen = ({ navigation, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
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
              onPress={() => console.log('Forgot password pressed')}
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
                  setUser(data.user);
                  navigation.replace('Dashboard');
                } catch (err) {
                  alert('Network error: ' + err.message);
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
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  authSafeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  closeButton: { padding: 5, marginTop: 20 },
  closeText: { fontSize: 20, color: colors.textPrimary },
  keyboardAvoid: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: colors.textPrimary, letterSpacing: 2, marginBottom: 40 },
  inputContainer: { marginBottom: 16 },
  inputWrapper: { backgroundColor: colors.inputBackground, borderRadius: 12, borderWidth: 1, borderColor: colors.inputBorder, marginBottom: 16, paddingHorizontal: 16, height: 56, justifyContent: 'center' },
  input: { flex: 1, fontSize: 16, color: colors.textPrimary },
  showButton: { position: 'absolute', right: 16 },
  showButtonText: { color: colors.primaryBlue, fontSize: 14, fontWeight: '600' },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPasswordText: { color: colors.primaryBlue, fontSize: 14, fontWeight: '600' },
  loginButton: { backgroundColor: colors.primaryBlue, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: colors.primaryBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  loginButtonText: { color: colors.white, fontSize: 18, fontWeight: '600', letterSpacing: 0.5 },
  alreadyAccountContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  alreadyAccountText: { fontSize: 14, color: colors.textSecondary },
  loginLinkText: { fontSize: 14, color: colors.primaryBlue, fontWeight: '600' },
});

export default LoginScreen;