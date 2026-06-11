import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices/authSlice';
import { uiReducer } from './slices/uiSlice';
import { scannerReducer } from './slices/scannerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    scanner: scannerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
