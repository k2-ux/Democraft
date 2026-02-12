import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types/product';

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
      // Replace entire list (used when syncing from Firestore)
      state.favorites = action.payload;
    },

    addFavorite: (state, action: PayloadAction<Product>) => {
      const exists = state.favorites.some(
        item => item.id === action.payload.id,
      );

      if (!exists) {
        state.favorites.push(action.payload);
      }
    },

    removeFavorite: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(
        item => item.id !== action.payload,
      );
    },

    clearFavorites: state => {
      state.favorites = [];
    },
  },
});

export const { setFavorites, addFavorite, removeFavorite, clearFavorites } =
  favoritesSlice.actions;

export default favoritesSlice.reducer;
