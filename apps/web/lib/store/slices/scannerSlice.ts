import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ScanMode = 'issue' | 'return' | 'idle';

interface ScannerState {
  lastScannedTag: string | null;
  scanMode: ScanMode;
}

const initialState: ScannerState = {
  lastScannedTag: null,
  scanMode: 'idle',
};

const scannerSlice = createSlice({
  name: 'scanner',
  initialState,
  reducers: {
    setLastScannedTag(state, action: PayloadAction<string | null>) {
      state.lastScannedTag = action.payload;
    },
    setScanMode(state, action: PayloadAction<ScanMode>) {
      state.scanMode = action.payload;
    },
  },
});

export const { setLastScannedTag, setScanMode } = scannerSlice.actions;
export const scannerReducer = scannerSlice.reducer;
