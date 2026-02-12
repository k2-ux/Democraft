import { configureStore } from '@reduxjs/toolkit';
import favoritesReducer from './favouriteSlice';

const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
  },
});

store.subscribe(() => {
  const state = store.getState();
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
