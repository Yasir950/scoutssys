import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'ur';

interface UIState {
  sidebarOpen: boolean;
  theme: Theme;
  language: Language;
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'system',
  language: 'en',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setTheme, setLanguage } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
