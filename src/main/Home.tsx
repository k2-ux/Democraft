import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Listing from './Listing';
import Favourite from './Favourite';
import Profile from './Profile';
import Images from '../helpers/Images';

const Tab = createBottomTabNavigator();



const Home = () => {
  return (
   
    <Tab.Navigator
  screenOptions={({ route }) => ({
    tabBarIcon: ({ focused }) => {
      let iconSource;

   
      if (route.name === 'List') {
        iconSource = focused
          ? Images.list_active
          : Images.list_inactive; 
      } else if (route.name === 'Favourite') {
        iconSource = focused
          ? Images.fav_active
          :Images.fav_inactive
      } else if (route.name === 'Profile') {
        iconSource = focused
          ? Images.user_active
          : Images.user_inactive
      }

      return (
        <Image
          source={iconSource}
          style={{
            width: 25,
            height: 25,
            tintColor: focused ? '#2196F3' : 'gray',
          }}
        />
      );
    },
    tabBarActiveTintColor: '#2196F3', 
    tabBarInactiveTintColor: 'gray',
    // headerShown: false, 
  })}
>
  <Tab.Screen name="List" component={Listing} />
  <Tab.Screen name="Favourite" component={Favourite} />
  <Tab.Screen name="Profile" component={Profile} />
</Tab.Navigator>

  );
};

export default Home;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
