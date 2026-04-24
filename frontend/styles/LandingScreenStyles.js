import colors from '../constants/colors';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1 },
  landingSafeArea: { flex: 1 },
  landingContent: { flex: 1 },
  logoContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingTop: 60 
  },
  logo: { width: 150, height: 150 }, 
  titleContainer: { 
    flex: 0.5, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: colors.textPrimary, 
    letterSpacing: 2, 
    marginBottom: 8 
  },
  subtitle: { fontSize: 16, color: colors.textSecondary },
  buttonContainer: { 
    flex: 0.6, 
    justifyContent: 'flex-end', 
    paddingBottom: 50, 
    paddingHorizontal: 24 
  },
  
  // 💡 MAXIMUM POP APPLIED HERE
  button: { 
    backgroundColor: colors.primaryBlue, 
    height: 56, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12, 
    // iOS Shadow - Deep colored glow effect
    shadowColor: colors.primaryBlue, 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.6, 
    shadowRadius: 15, 
    // Android Shadow - Extreme elevation
    elevation: 20, 
  },
  
  buttonText: { color: colors.white, fontSize: 18, fontWeight: '600' },
});

export default styles;