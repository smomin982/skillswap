import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import skillReducer from './slices/skillSlice';
import exchangeReducer from './slices/exchangeSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    skills: skillReducer,
    exchanges: exchangeReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
