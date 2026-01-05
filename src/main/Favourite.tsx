import React from 'react';
import { FlatList, View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {addFavorite,removeFavorite} from '../redux/favouriteSlice'
import Images from '../helpers/Images';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
}

const Favourite: React.FC = () => {
  // Retrieve favorite products from Redux store
  const favorites = useSelector((state: RootState) => state.favorites.favorites);
  const dispatch = useDispatch();

  const toggleFavourite = (product: Product) => {
    const isFavorite = favorites.some((item) => item.id === product.id);

    if (isFavorite) {
      dispatch(removeFavorite(product.id));
    } else {
      dispatch(addFavorite(product));
    }
  };
  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.thumbnail }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>
        <TouchableOpacity onPress={() => toggleFavourite(item)} style={{justifyContent:'center',
              alignItems:'center',
              flex:1
              }}>
               <Image
                source={
                  favorites.find((fav) => fav.id === item.id)
                  ? Images.favorite
                  : Images.unfavorite
                }
          style={{ height: 28, width: 28 }}
        />
            </TouchableOpacity>
    </View>
  );

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No favorites added yet!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favorites}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'black'
  },
  price: {
    fontSize: 14,
    color: 'green',
  },
  listContainer: {
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#aaa',
  },
});

export default Favourite;
