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
// 1. Updated Firebase Auth imports
import {
  getAuth,
  signInWithEmailAndPassword,
} from '@react-native-firebase/auth';
import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Images from '../helpers/Images';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigationType';
// import { Google_WebClient_Id } from '@env';
import {
  GoogleAuthProvider,
  signInWithCredential,
} from '@react-native-firebase/auth';
const Google_WebClient_Id =
  '150246811251-7ucgh4rufut99t5qpjub0p07gff89m4j.apps.googleusercontent.com';
type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

// Utility function (Maintained)
export function checkDate(dateString: string): string {
  if (!dateString || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return 'Invalid Date';
  }
  const [dayStr, monthStr, yearStr] = dateString.split('/');
  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = Number(yearStr);

  if (
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
  else if (inputDate.getTime() === yesterday.getTime()) return 'Yesterday';
  else return dateString;
}

const Login: React.FC<Props> = ({ navigation }) => {
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

  const storeLoginDate = async (): Promise<void> => {
    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getDate()).padStart(
      2,
      '0',
    )}/${String(currentDate.getMonth() + 1).padStart(
      2,
      '0',
    )}/${currentDate.getFullYear()}`;
    await AsyncStorage.setItem('lastLogin', formattedDate);
  };

  const handleGoogle = async (): Promise<void> => {
    setGoogleLoading(true);
    setError('');

    try {
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

      const auth = getAuth();
      await signInWithCredential(auth, googleCredential);
      await storeLoginDate();

      ToastAndroid.show('Google Login Successful!', ToastAndroid.SHORT);
      navigation.navigate('Home');
    } catch (error: any) {
      let errorMessage = 'Google Login Failed';

      if (error.code) {
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
      }

      ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      setError('Both fields are required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      return;
    }

    setError('');
    setEmailLoading(true);
    const auth = getAuth();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      await storeLoginDate();
      ToastAndroid.show('Login Successful!', ToastAndroid.SHORT);
      navigation.navigate('Home');
    } catch (error: any) {
      let errorMessage = 'Login failed';
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid credentials';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      }
      ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleNavigateToSignup = (): void => {
    navigation.navigate('Signup');
  };

  const isAnyLoading = emailLoading || googleLoading;

  return (
    <LinearGradient colors={['#6B7280', '#1F2937']} style={styles.container}>
      <Text style={styles.title}>Log In</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
        style={[styles.button, emailLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isAnyLoading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.buttonGradient}
        >
          {emailLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleNavigateToSignup}
        style={styles.signupLink}
        disabled={isAnyLoading}
      >
        <Text style={styles.signupText}>Don't have an account? Sign up</Text>
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
        onPress={handleGoogle}
        disabled={isAnyLoading}
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
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default Login;

// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 30,
    color: '#fff',
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
  button: {
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
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 15,
    fontSize: 14,
  },
  signupLink: {
    marginTop: 20,
  },
  signupText: {
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
