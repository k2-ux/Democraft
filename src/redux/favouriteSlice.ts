import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppDispatch } from './store';
interface Product {
  id: number|string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
}


const FAVORITES_STORAGE_KEY = 'favorites';

interface FavoritesState {
  favorites: Product[];
}

const initialState: FavoritesState = {
  favorites: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavorites: (state, action: PayloadAction<Product[]>) => {
      state.favorites = action.payload;
    },
    addFavorite: (state, action: PayloadAction<Product>) => {
      state.favorites.push(action.payload);
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter((item) => item.id !== action.payload);
    },
    clearFavorites: () => {
      return initialState; // Reset the state to its initial value
    },
  },
});

export const { setFavorites, addFavorite, removeFavorite ,clearFavorites} = favoritesSlice.actions;

export default favoritesSlice.reducer;

// AsyncStorage Integration
export const loadFavorites = () => async (dispatch: AppDispatch) => {
  try {
    const favoritesJSON = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
    if (favoritesJSON) {
      const favorites = JSON.parse(favoritesJSON);
      dispatch(setFavorites(favorites));
    }
  } catch (error) {
    console.error('Failed to load favorites:', error);
  }
};

export const saveFavorites = (favorites: Product[]) => async () => {
  try {
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to save favorites:', error);
  }
};
