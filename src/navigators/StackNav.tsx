import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Listing from '../main/Listing';
import Favourite from '../main/Favourite';
import Profile from '../main/Profile';
import Splash from '../main/Splash';
import Login from '../main/Login';
import Signup from '../main/Signup';
import Home from '../main/Home';

// Define the stack parameters
type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  Listing: undefined;
  Favourite: undefined;
  Profile:undefined;
  Home:undefined;
};

// Create the stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNav: React.FC = () => {
  const Screens: Record<keyof RootStackParamList, React.ComponentType<any>> = {
    Splash: Splash,
    Login: Login,
    Signup: Signup,
    Listing: Listing,
    Favourite:Favourite,
    Profile:Profile,
    Home:Home
    };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {Object.entries(Screens).map(([name, component]) => (
          <Stack.Screen
            name={name as keyof RootStackParamList}
            component={component}
            key={name}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNav;
