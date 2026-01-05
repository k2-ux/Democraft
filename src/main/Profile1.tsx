import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Button, ToastAndroid } from 'react-native';
import auth from '@react-native-firebase/auth';
interface User {
  name: string;
  email: string;
  avatar: string;
}

const Profile = ({ navigation }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('https://randomuser.me/api/');
        const data = await response.json();
        const randomUser = data.results[0];

        setUser({
          name: `${randomUser.name.first} ${randomUser.name.last}`,
          email: randomUser.email,
          avatar: randomUser.picture.large,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    
    auth()
  .signOut()
  .then(() => {console.log('User signed out!')

    ToastAndroid.show('Logging out', ToastAndroid.SHORT);
    navigation.replace('Signup')
  });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user && (
        <>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </>
      )}
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    padding: 20, // Add padding for overall spacing
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20, // Space below the avatar
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10, // Space below the name
    color:'black'
  },
  email: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 30, // Space below the email
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});
