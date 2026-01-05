import React, {useEffect, useState} from 'react';
import {
  View,
  Image,
  Text,
  Button,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
// 1. Updated Firebase Auth imports
import { 
  getAuth, 
  onAuthStateChanged, 
  updateProfile, 
  signOut 
} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {clearFavorites} from '../redux/favouriteSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

const API_URL = 'https://randomuser.me/api/';
const avatars = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/women/1.jpg',
  'https://randomuser.me/api/portraits/men/2.jpg',
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/women/3.jpg',
];

type RootStackParamList = {
  Signup: undefined;
  Home: undefined;
};

type ProfileProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

// Utility to show readable date (Maintained)
export function checkDate(dateString: string): string {
  if (!dateString || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return 'Invalid Date';
  }
  const [day, month, year] = dateString.split('/').map(Number);
  const inputDate = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (inputDate.getTime() === today.getTime()) return 'Today';
  if (inputDate.getTime() === yesterday.getTime()) return 'Yesterday';
  return dateString;
}

const Profile: React.FC<ProfileProps> = ({navigation}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [email, setEmail] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [lastLogin, setLastLogin] = useState('');
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const auth = getAuth(); // 2. Initialize Auth instance

    const initializeUser = async () => {
      try {
        const storedLastLogin = await AsyncStorage.getItem('lastLogin');
        if (storedLastLogin) setLastLogin(storedLastLogin);

        const response = await fetch(API_URL);
        const data = await response.json();
        const randomUser = data.results[0];
        setNewAvatar(randomUser.picture.large);

        const isGoogleSign = await AsyncStorage.getItem('isGoogleSign');
        if (isGoogleSign) {
          console.log('Is Google Sign-In:', JSON.parse(isGoogleSign));
        }

        // 3. Modular onAuthStateChanged
        const unsubscribe = onAuthStateChanged(auth, user => {
          if (user) {
            setNewName(user.displayName || '');
            setEmail(user.email || '');

            const currentDate = new Date();
            const formattedDate = `${String(currentDate.getDate()).padStart(
              2,
              '0',
            )}/${String(currentDate.getMonth() + 1).padStart(
              2,
              '0',
            )}/${currentDate.getFullYear()}`;
            AsyncStorage.setItem('lastLogin', formattedDate);
            setLastLogin(formattedDate);
          } else {
            console.log('No user is signed in.');
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const handleFetchUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const randomUser = data.results[0];
      setNewAvatar(randomUser.picture.large);
    } catch (error) {
      console.error('Error fetching user data:', error);
      ToastAndroid.show('Failed to fetch avatar', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    const auth = getAuth();
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // 4. Modular updateProfile
        await updateProfile(currentUser, {displayName: newName});
        ToastAndroid.show('Profile updated!', ToastAndroid.SHORT);
        setIsEditing(false);
      } else {
        ToastAndroid.show('No user signed in', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      ToastAndroid.show('Failed to update profile', ToastAndroid.SHORT);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    const auth = getAuth();
    try {
      const isGoogleSign = await AsyncStorage.getItem('isGoogleSign');
      const isGoogleUser = JSON.parse(isGoogleSign || 'false');

      if (isGoogleUser) {
        await GoogleSignin.signOut();
        console.log('Google Sign-Out successful');
      }

      if (auth.currentUser) {
        // 5. Modular signOut
        await signOut(auth);
        console.log('Firebase Sign-Out successful');
      } else {
        console.log('No Firebase user signed in');
      }

      await AsyncStorage.clear();
      console.log('AsyncStorage cleared');

      dispatch(clearFavorites());
      console.log('Redux favorites cleared');

      ToastAndroid.show('Logged out successfully', ToastAndroid.SHORT);
      navigation.replace('Signup');
    } catch (error) {
      console.error('Logout Error:', error);
      ToastAndroid.show('Logout failed. Please try again.', ToastAndroid.SHORT);
    } finally {
      setLogoutLoading(false);
    }
  };

  const shuffleAvatar = () => {
    const nextIndex = (avatars.indexOf(newAvatar) + 1) % avatars.length;
    setNewAvatar(avatars[nextIndex]);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {newAvatar && (
            <Image source={{uri: newAvatar}} style={styles.avatar} />
          )}
          <Text style={styles.name}>{newName || 'Unknown'}</Text>
          <Text style={styles.email}>{email || 'No email'}</Text>
          {lastLogin && (
            <Text style={styles.lastLogin}>
              Last Login: {checkDate(lastLogin)}
            </Text>
          )}

          {isEditing ? (
            <View style={styles.buttonRow}>
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="Enter new name"
                placeholderTextColor="#888"
              />
              <Button title="Save" onPress={handleSave} disabled={loading} />
              <Button
                title="Cancel"
                onPress={() => setIsEditing(false)}
                disabled={loading}
              />
            </View>
          ) : (
            <TouchableOpacity onPress={handleEdit}>
              <Text style={styles.editText}>Edit Name</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={shuffleAvatar}>
            <Text style={styles.editText}>Shuffle Avatar</Text>
          </TouchableOpacity>

          <Button
            title="Fetch New Avatar"
            onPress={handleFetchUser}
            disabled={loading}
          />

          <View style={styles.logoutButton}>
            <Button
              title={logoutLoading ? 'Logging Out...' : 'Logout'}
              onPress={handleLogout}
              disabled={logoutLoading}
              color="#ff4444"
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    backgroundColor: '#ccc',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  email: {
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
  },
  lastLogin: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  editText: {
    color: 'blue',
    marginBottom: 10,
    textDecorationLine: 'underline',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
    color: 'black',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  logoutButton: {
    marginTop: 20,
    width: '80%',
  },
});

export default Profile;