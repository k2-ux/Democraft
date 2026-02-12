import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  ToastAndroid,
  Alert,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { clearFavorites } from '../redux/favouriteSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Signup: undefined;
  Home: undefined;
};

type ProfileProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

// Utility to show readable date
export function checkDate(dateString: string): string {
  if (!dateString || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return 'Invalid Date';
  }
  const [day, month, year] = dateString.split('/').map(Number) as [
    number,
    number,
    number,
  ];
  const inputDate = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (inputDate.getTime() === today.getTime()) return 'Today';
  if (inputDate.getTime() === yesterday.getTime()) return 'Yesterday';
  return dateString;
}

// Default avatar component
const DefaultAvatar = () => (
  <View style={styles.defaultAvatar}>
    <Text style={styles.defaultAvatarText}>👤</Text>
  </View>
);

const Profile: React.FC<ProfileProps> = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [lastLogin, setLastLogin] = useState('');
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async user => {
      if (user) {
        setDisplayName(user.displayName || 'No name set');
        setEmail(user.email || 'No email');

        // Check if Google user
        const googleSignStatus = await AsyncStorage.getItem('isGoogleSign');
        setIsGoogleUser(googleSignStatus === 'true');

        // Update last login
        const currentDate = new Date();
        const formattedDate = `${String(currentDate.getDate()).padStart(
          2,
          '0',
        )}/${String(currentDate.getMonth() + 1).padStart(
          2,
          '0',
        )}/${currentDate.getFullYear()}`;
        await AsyncStorage.setItem('lastLogin', formattedDate);
        setLastLogin(formattedDate);
      }
      setLoading(false);
    });

    // Load stored last login
    const loadLastLogin = async () => {
      const storedLastLogin = await AsyncStorage.getItem('lastLogin');
      if (storedLastLogin) setLastLogin(storedLastLogin);
    };
    loadLastLogin();

    return () => unsubscribe();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setDisplayName(displayName === 'No name set' ? '' : displayName);
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      ToastAndroid.show('Name cannot be empty', ToastAndroid.SHORT);
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await currentUser.updateProfile({ displayName: displayName.trim() });
        setDisplayName(displayName.trim());
        ToastAndroid.show('Profile updated successfully!', ToastAndroid.SHORT);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      ToastAndroid.show('Failed to update profile', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original name
    const user = auth().currentUser;
    setDisplayName(user?.displayName || 'No name set');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: performLogout,
        },
      ],
      { cancelable: true },
    );
  };

  const performLogout = async () => {
    setLogoutLoading(true);
    try {
      // Sign out from Google if applicable
      if (isGoogleUser) {
        await GoogleSignin.signOut();
      }

      // Sign out from Firebase
      await auth().signOut();

      // Clear storage and state
      await AsyncStorage.multiRemove(['isGoogleSign', 'lastLogin']);
      dispatch(clearFavorites());

      ToastAndroid.show('Logged out successfully', ToastAndroid.SHORT);
      navigation.replace('Signup');
    } catch (error) {
      console.error('Logout Error:', error);
      ToastAndroid.show('Logout failed. Please try again.', ToastAndroid.SHORT);
    } finally {
      setLogoutLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <DefaultAvatar />
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarBadgeText}>
              {isGoogleUser ? 'G' : 'E'}
            </Text>
          </View>
        </View>

        {/* User Info Section */}
        <View style={styles.infoContainer}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your name"
                placeholderTextColor="#999"
                autoFocus
                maxLength={50}
              />
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancel}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.email}>{email}</Text>

              <TouchableOpacity
                style={styles.editNameButton}
                onPress={handleEdit}
              >
                <Text style={styles.editNameText}>✎ Edit Name</Text>
              </TouchableOpacity>
            </>
          )}

          {lastLogin && (
            <View style={styles.lastLoginContainer}>
              <Text style={styles.lastLoginLabel}>Last Login</Text>
              <Text style={styles.lastLoginValue}>{checkDate(lastLogin)}</Text>
            </View>
          )}
        </View>

        {/* Account Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Type</Text>
            <View style={styles.infoValueContainer}>
              <View
                style={[
                  styles.accountBadge,
                  isGoogleUser ? styles.googleBadge : styles.emailBadge,
                ]}
              >
                <Text style={styles.accountBadgeText}>
                  {isGoogleUser ? 'Google' : 'Email'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID</Text>
            <Text style={styles.infoValue}>{auth().currentUser?.uid}</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            logoutLoading && styles.logoutButtonDisabled,
          ]}
          onPress={handleLogout}
          disabled={logoutLoading}
        >
          {logoutLoading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.logoutIcon}>↪</Text>
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  defaultAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  defaultAvatarText: {
    fontSize: 48,
    color: '#FFF',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#34C759',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F2F2F7',
  },
  avatarBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  editNameButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editNameText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  editContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#C6C6C8',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  lastLoginContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    alignItems: 'center',
  },
  lastLoginLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  lastLoginValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  section: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 10,
    color: '#000',
    fontWeight: '500',
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  googleBadge: {
    backgroundColor: '#4285F4',
  },
  emailBadge: {
    backgroundColor: '#5856D6',
  },
  accountBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutIcon: {
    fontSize: 18,
    color: '#FFF',
    marginRight: 8,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    marginTop: 24,
    fontSize: 14,
    color: '#8E8E93',
  },
});

export default Profile;
