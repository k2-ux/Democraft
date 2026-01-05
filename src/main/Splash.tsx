import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import auth, { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import Images from '../helpers/Images';

const Splash = (props: any) => {
useEffect(() => {
    // 2. Initialize auth instance
    const auth = getAuth();

    // 3. Use modular function call
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const timer = setTimeout(() => {
        if (user) {
          props.navigation.replace('Home');
        } else {
          props.navigation.replace('Signup');
        }
      }, 3000);

      return () => clearTimeout(timer);
    });

    return () => unsubscribe();
  }, [props.navigation])

  return (
    <ImageBackground
      source={Images.splash}
      style={styles.imageBackground}
      resizeMode="cover"
    >
      <View style={styles.textContainer}>
        <Text style={styles.text}>Welcome</Text>
      </View>
    </ImageBackground>
  );
};

export default Splash;

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
