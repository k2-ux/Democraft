import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { RootState } from '../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import {addFavorite,removeFavorite} from '../redux/favouriteSlice'
import Images from '../helpers/Images';
interface Product {
  id:string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
}

const Listing = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const favoriteStore = useSelector((state: RootState) => state.favorites.favorites);

  const dispatch = useDispatch();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://dummyjson.com/products');
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  const [favorites, setFavorites] = useState<Product[]>([]); // Track favorites using an array of product IDs
console.log(favoriteStore)
  // const toggleFavourite = (productId: number) => {
  //   setFavorites((prevFavorites) => {
  //     if (prevFavorites.includes(productId)) {
  //       // Remove from favorites if it's already there
  //       dispatch(removeFavorite(productId));
  //       return prevFavorites.filter((id) => id !== productId);
  //     } else {
  //       // Add to favorites if it's not there yet
  //       dispatch(addFavorite(productId));
  //       return [...prevFavorites, productId];
  //     }
  //   });
  // };
  const toggleFavourite = (product: Product) => {
    const isFavorite = favoriteStore.some((item) => item.id === product.id);

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
            favoriteStore.find((fav) => fav.id === item.id)
              ? Images.favorite
              : Images.unfavorite
          }
    style={{ height: 28, width: 28 }}
  />
      </TouchableOpacity>
    </View>
  );    

  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Listing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  list: {
    paddingBottom: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginVertical: 8,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    // justifyContent:'space-evenly'
  },
  image: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  infoContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
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
  heartIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});
