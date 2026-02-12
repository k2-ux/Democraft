import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ToastAndroid,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
// 1. Updated Firebase Imports
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
} from '@react-native-firebase/auth';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Images from '../helpers/Images';
// import { Google_WebClient_Id } from '@env';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigationType';
const Google_WebClient_Id =
  '150246811251-7ucgh4rufut99t5qpjub0p07gff89m4j.apps.googleusercontent.com';
type SignupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

interface SignupProps {
  navigation: SignupScreenNavigationProp;
}

// Utility function (maintained)
export function checkDate(dateString: string): string {
  if (!dateString || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return 'Invalid Date';
  }
  const [day, month, year] = dateString.split('/').map(Number);
  if (
    typeof day !== 'number' ||
    typeof month !== 'number' ||
    typeof year !== 'number' ||
    isNaN(day) ||
    isNaN(month) ||
    isNaN(year)
  ) {
    return 'Invalid Date';
  }
  const inputDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (inputDate.getTime() === today.getTime()) return 'Today';
  if (inputDate.getTime() === yesterday.getTime()) return 'Yesterday';
  return dateString;
}

interface AuthParams {
  type: 'email' | 'google';
  email?: string;
  password?: string;
  name?: string;
  navigation: SignupScreenNavigationProp;
  setEmailLoading: (val: boolean) => void;
  setGoogleLoading: (val: boolean) => void;
  setError: (msg: string) => void;
}

// Updated Auth logic
async function handleAuth({
  type,
  email,
  password,
  name,
  navigation,
  setEmailLoading,
  setGoogleLoading,
  setError,
}: AuthParams): Promise<void> {
  const loadingSetter = type === 'email' ? setEmailLoading : setGoogleLoading;
  loadingSetter(true);
  setError('');
  const auth = getAuth();

  try {
    if (type === 'google') {
      await GoogleSignin.hasPlayServices();

      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        throw new Error('Google Sign-In failed');
      }

      const { idToken } = response.data;

      if (!idToken) {
        throw new Error('No ID token found');
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);

      await signInWithCredential(auth, googleCredential);

      // Store last login date only
      const currentDate = new Date();
      const formattedDate = `${String(currentDate.getDate()).padStart(
        2,
        '0',
      )}/${String(currentDate.getMonth() + 1).padStart(
        2,
        '0',
      )}/${currentDate.getFullYear()}`;

      await AsyncStorage.setItem('lastLogin', formattedDate);

      ToastAndroid.show('Google Signup Successful!', ToastAndroid.SHORT);
      navigation.navigate('Home');
    } else {
      if (!name || !email || !password) {
        setError('All fields are required');
        loadingSetter(false);
        return;
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Invalid email format');
        loadingSetter(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await updateProfile(userCredential.user, {
        displayName: name,
      });

      const currentDate = new Date();
      const formattedDate = `${String(currentDate.getDate()).padStart(
        2,
        '0',
      )}/${String(currentDate.getMonth() + 1).padStart(
        2,
        '0',
      )}/${currentDate.getFullYear()}`;

      await AsyncStorage.setItem('lastLogin', formattedDate);

      ToastAndroid.show(`Welcome, ${name}!`, ToastAndroid.SHORT);
      navigation.navigate('Home');
    }
  } catch (error: any) {
    console.log('GOOGLE ERROR:', error);

    let errorMessage =
      type === 'google' ? 'Google Signup Failed' : 'Signup Failed';

    if (type === 'google' && isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          errorMessage = 'Sign-in already in progress';
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          errorMessage = 'Play Services not available';
          break;
        default:
          errorMessage = error.message || 'Google Sign-In error';
      }
    } else if (type === 'email') {
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password too weak';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      }
    }

    ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
  } finally {
    loadingSetter(false);
  }
}

const Signup: React.FC<SignupProps> = ({ navigation }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [emailLoading, setEmailLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Google_WebClient_Id,
    });
  }, []);
  const handleNavigateToLogin = () => {
    navigation.navigate('Login');
  };

  const isAnyLoading = emailLoading || googleLoading;

  return (
    <LinearGradient colors={['#6B7280', '#1F2937']} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
          editable={!isAnyLoading}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isAnyLoading}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isAnyLoading}
        />

        <TouchableOpacity
          style={[styles.signupButton, emailLoading && styles.buttonDisabled]}
          onPress={() =>
            handleAuth({
              type: 'email',
              email,
              password,
              name,
              navigation,
              setEmailLoading,
              setGoogleLoading,
              setError,
            })
          }
          disabled={emailLoading || googleLoading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.buttonGradient}
          >
            {emailLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.signupButtonText}>Sign Up</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNavigateToLogin}
          style={styles.loginLink}
          disabled={isAnyLoading}
        >
          <Text style={styles.loginText}>Already have an account? Log in</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>Or</Text>

        <TouchableOpacity
          style={[
            styles.googleButton,
            googleLoading && styles.buttonDisabled,
            Platform.OS === 'android'
              ? styles.googleButtonAndroid
              : styles.googleButtonIOS,
          ]}
          onPress={() =>
            handleAuth({
              type: 'google',
              navigation,
              setEmailLoading,
              setGoogleLoading,
              setError,
            })
          }
          disabled={emailLoading || googleLoading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#ffffff', '#f1f1f1']}
            style={styles.googleButtonGradient}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Image source={Images.google} style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>Sign up with Google</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffffcc',
    borderRadius: 20,
    padding: 25,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    width: '100%',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 10,
    fontSize: 16,
    color: '#000',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  signupButton: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    marginTop: 20,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  googleButton: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
  },
  googleButtonAndroid: {
    elevation: 3,
  },
  googleButtonIOS: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  googleButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  googleIcon: {
    height: 24,
    width: 24,
  },
});
