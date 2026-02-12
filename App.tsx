import {
  AppState,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import StackNav from './src/navigators/StackNav';
import auth from '@react-native-firebase/auth';
import { Provider } from 'react-redux';
import store from './src/redux/store';
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <StackNav />
    </Provider>
  );
};

export default App;

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
    textAlign: 'center',
  },
});
