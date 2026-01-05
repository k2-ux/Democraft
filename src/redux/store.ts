import { configureStore } from '@reduxjs/toolkit';
import favoritesReducer, { saveFavorites } from './favouriteSlice';

const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
  },
});

store.subscribe(() => {
  const state = store.getState();
  saveFavorites(state.favorites.favorites)();
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
