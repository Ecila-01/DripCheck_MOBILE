import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, KeyboardAvoidingView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import styles from '../styles/LoginScreenStyles';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ForgotPasswordScreen = ({ navigation }) => {
  // Step Management (1 = Email, 2 = OTP + New Password)
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 💡 State is here

  // 🚀 Step 1: Request OTP from Backend
  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');
      
      Alert.alert('Check Your Email', 'We have sent a verification code to your email.');
      setStep(2); // Move to OTP entry screen
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Step 2: Submit OTP and New Password
  const handleResetPassword = async () => {
    if (!otp.trim()) return Alert.alert('Error', 'Please enter the OTP.');
    if (newPassword.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return Alert.alert('Error', 'Passwords do not match.');

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to reset password.');
      
      Alert.alert('Success!', 'Your password has been reset successfully.', [
        { text: 'Back to Login', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.mainWhite, colors.offWhiteBackground]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.mainWhite} />
      <SafeAreaView style={styles.authSafeArea}>
        
        {/* Dynamic Header Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => step === 2 ? setStep(1) : navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoid}>
          <View style={styles.content}>
            <Text style={styles.title}>
              {step === 1 ? 'Reset Password' : 'Enter Verification Code'}
            </Text>
            
            <Text style={{ color: colors.textSecondary, marginBottom: 30, textAlign: 'center' }}>
              {step === 1 
                ? "Enter your email address and we'll send you an OTP to reset your password."
                : `Enter the code sent to ${email} along with your new password.`}
            </Text>

            {/* --- STEP 1 UI: EMAIL ONLY --- */}
            {step === 1 && (
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor={colors.textLight}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            )}

            {/* --- STEP 2 UI: OTP & NEW PASSWORD --- */}
            {step === 2 && (
              <View style={styles.inputContainer}>
                {/* OTP Input */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="6-Digit OTP Code"
                    placeholderTextColor={colors.textLight}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                {/* New Password Input */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor={colors.textLight}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.showButton}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                  >
                    {/* 💡 Safe wrapping: */}
                    <Text style={styles.showButtonText}>
                      {showPassword === true ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm New Password"
                    placeholderTextColor={colors.textLight}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.showButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                  >
                    {/* 💡 Safe wrapping: */}
                    <Text style={styles.showButtonText}>
                      {showConfirmPassword === true ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Dynamic Submit Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && { opacity: 0.7 }]}
              onPress={step === 1 ? handleSendOTP : handleResetPassword}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>
                  {step === 1 ? 'Send OTP' : 'Reset Password'}
                </Text>
              )}
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ForgotPasswordScreen;