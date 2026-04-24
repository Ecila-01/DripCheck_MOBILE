import colors from "../constants/colors";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offWhiteBackground, },
  authSafeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'transparent',},
  closeButton: { padding: 5, marginTop: 20 },
  closeText: { fontSize: 20, color: colors.textPrimary },
  keyboardAvoid: { flex: 1 },
  scrollContent: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: colors.textPrimary, letterSpacing: 2, marginBottom: 40 },
  inputContainer: { marginBottom: 16 },
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
  loginButton: { 
    backgroundColor: colors.primaryBlue, 
    height: 56, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center', 
    // iOS Shadow
    shadowColor: colors.primaryBlue, 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.6, 
    shadowRadius: 15, 
    // Android Shadow
    elevation: 20, 
  },
  loginButtonText: { color: colors.white, fontSize: 18, fontWeight: '600', letterSpacing: 0.5 },
  alreadyAccountContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  alreadyAccountText: { fontSize: 14, color: colors.textSecondary },
  loginLinkText: { fontSize: 14, color: colors.primaryBlue, fontWeight: '600' },
});

export default styles;