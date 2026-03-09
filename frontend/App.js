import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from './constants/colors';
import BottomTabBar from './components/BottomTabBar';
import HomeScreen from './screens/HomeScreen';
import ClosetScreen from './screens/ClosetScreen';
import TrendScreen from './screens/TrendScreen';
import ProfileScreen from './screens/ProfileScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

const API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:3000'
    : 'http://192.168.2.114:3000';


// Landing Screen
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
            source={require('./image_upload/DripCheckLogo.png')}
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

// Login Screen
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

        <KeyboardAvoidingView
          behavior="padding"
          style={styles.keyboardAvoid}
        >
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>Log In</Text>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
              {/* Email Input */}
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

              {/* Password Input */}
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

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => {
                console.log('Forgot password pressed');
              }}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>

            {/* Log In Button */}
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

            {/* No account yet? Sign up */}
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

// Sign Up Screen
const SignUpScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
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

        <KeyboardAvoidingView
          behavior="padding"
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {/* Title */}
              <Text style={styles.title}>Sign Up</Text>

              {/* Input Fields */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Name"
                    placeholderTextColor={colors.textLight}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>

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

              {/* Sign Up Button */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={async () => {
                  if (!name || !email || !password) {
                    alert('Please fill in all fields');
                    return;
                  }

                  setLoading(true);
                  try {
                    const res = await fetch(`${API_URL}/api/auth/register`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name, email, password }),
                    });

                    const data = await res.json();

                    if (!res.ok) {
                      alert(data.message || 'Registration failed');
                      return;
                    }

                    alert('Registered successfully!');
                    navigation.replace('Login');
                  } catch (err) {
                    alert('Network error: ' + err.message);
                  } finally {
                    setLoading(false);
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Signing Up...' : 'Sign Up'}
                </Text>
              </TouchableOpacity>

              {/* Already have an account? Login */}
              <View style={styles.alreadyAccountContainer}>
                <Text style={styles.alreadyAccountText}>Already have an Account? </Text>
                <TouchableOpacity
                  onPress={() => navigation.replace('Login')}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                  <Text style={styles.loginLinkText}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

// Dashboard Screen with Tab Navigation
const DashboardScreen = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Home');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen user={user} onLogout={onLogout} />;
      case 'Closet':
        return <ClosetScreen user={user} API_URL ={API_URL} setActiveTab={setActiveTab} />;
      case 'Trend':
        return <TrendScreen />;
      case 'Profile':
        return <ProfileScreen user={user} API_URL ={API_URL} />;
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

// Main App with Navigation
export default function App() {
  const [screen, setScreen] = useState('Landing');
  const [user, setUser] = useState(null);

  const renderScreen = () => {
    switch (screen) {
      case 'Landing':
        return (
          <LandingScreen
            navigation={{
              navigate: (target) => setScreen(target),
              replace: (target) => setScreen(target),
            }}
          />
        );
      case 'Login':
        return (
          <LoginScreen
            setUser={setUser}
            navigation={{
              goBack: () => setScreen('Landing'),
              replace: (target) => setScreen(target),
            }}
          />
        );

      case 'SignUp':
        return (
          <SignUpScreen
            navigation={{
              goBack: () => setScreen('Landing'),
              replace: (target) => setScreen(target),
            }}
          />
        );
      case 'Dashboard':
        return (
          <DashboardScreen
            user={user}
            onLogout={() => {
              setUser(null);
              setScreen('Landing');
            }}
          />
        );

      default:
        return (
          <LandingScreen
            navigation={{
              navigate: (target) => setScreen(target),
              replace: (target) => setScreen(target),
            }}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      {renderScreen()}
    </SafeAreaProvider>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  landingSafeArea: {
    flex: 1,
  },
  landingContent: {
    flex: 1,
  },
  authSafeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    padding: 5,
    marginTop: 20,
  },
  closeText: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  signUpLink: {
    fontSize: 16,
    color: colors.primaryBlue,
    fontWeight: '600',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  titleContainer: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  buttonContainer: {
    flex: 0.6,
    justifyContent: 'flex-end',
    paddingBottom: 50,
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: colors.primaryBlue,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.primaryBlue,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    backgroundColor: colors.transparent,
    borderWidth: 2,
    borderColor: colors.primaryBlue,
    shadowOpacity: 0,
    elevation: 0,
  },
  secondaryButtonText: {
    color: colors.primaryBlue,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  showButton: {
    position: 'absolute',
    right: 16,
  },
  showButtonText: {
    color: colors.primaryBlue,
    fontSize: 14,
    fontWeight: '600',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: colors.primaryBlue,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: colors.primaryBlue,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primaryBlue,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  alreadyAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  alreadyAccountText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.primaryBlue,
    fontWeight: '600',
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: colors.offWhiteBackground,
  },
  tabContent: {
    flex: 1,
  },
});

