import { StyleSheet } from "react-native";
import colors from "../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
  },
  profilePicture: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.offWhiteBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primaryBlue,
    marginBottom: 20,
    shadowColor: colors.primaryBlue,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  profileIcon: {
    fontSize: 60,
  },
  handle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.primaryBlue,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: colors.transparent,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: colors.primaryBlue,
  },
  editButtonText: {
    color: colors.primaryBlue,
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  // ... existing styles ...
  emailSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  detailsSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  logoutButton: {
    marginTop: 40,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#FFF1F1', // Light red background
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutButtonText: {
    color: '#FF4D4D', // Red text
    fontWeight: '700',
    fontSize: 16,
  },
    fullImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee' },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  changePhotoText: { fontSize: 12, color: colors.primaryBlue, marginTop: 8, textAlign: 'center', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: colors.textPrimary },
  label: { fontSize: 13, color: '#666', marginBottom: 5, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 15, color: colors.textPrimary },
  saveBtn: { backgroundColor: colors.primaryBlue, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelText: { textAlign: 'center', marginTop: 20, color: 'red', fontWeight: '600' },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Match your usual input background
    borderWidth: 1,
    borderColor: '#E0E0E0',     // Match your usual input border
    borderRadius: 8,            // Match your usual input radius
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,                    // Takes up all space leaving room for the icon
    padding: 12,                // Match your styles.input padding
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;