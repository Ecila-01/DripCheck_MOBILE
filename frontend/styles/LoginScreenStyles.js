import colors from "../constants/colors";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: { flex: 1 },
  authSafeArea: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16 
  },
  closeButton: { padding: 5, marginTop: 20 },
  closeText: { fontSize: 20, color: colors.textPrimary },
  keyboardAvoid: { flex: 1 },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    paddingHorizontal: 24, 
    paddingVertical: 40 
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: colors.textPrimary, 
    letterSpacing: 2, 
    marginBottom: 40 
  },
  inputContainer: { marginBottom: 16 },
  
  // 💡 ADDED SHADOW TO THE INPUT BOXES
  inputWrapper: { 
    backgroundColor: colors.inputBackground, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: colors.inputBorder, 
    marginBottom: 16, 
    paddingHorizontal: 16, 
    height: 56, 
    justifyContent: 'center',
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    // Android Shadow
    elevation: 2, 
  },
  
  input: { flex: 1, fontSize: 16, color: colors.textPrimary },
  showButton: { position: 'absolute', right: 16 },
  showButtonText: { color: colors.primaryBlue, fontSize: 14, fontWeight: '600' },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPasswordText: { color: colors.primaryBlue, fontSize: 14, fontWeight: '600' },
  
  // 💡 BOOSTED THE EXISTING SHADOW FOR THE BUTTON
  loginButton: { 
    backgroundColor: colors.primaryBlue, 
    height: 56, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center', 
    // iOS Shadow
    shadowColor: colors.primaryBlue, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.4, // Slightly increased opacity
    shadowRadius: 8, 
    // Android Shadow
    elevation: 8, // Increased from 6 to 8 to make it pop more
  },
  
  loginButtonText: { color: colors.white, fontSize: 18, fontWeight: '600', letterSpacing: 0.5 },
  alreadyAccountContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  alreadyAccountText: { fontSize: 14, color: colors.textSecondary },
  loginLinkText: { fontSize: 14, color: colors.primaryBlue, fontWeight: '600' },
});

export default styles;