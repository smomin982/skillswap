import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as exchangeService from '../../services/exchangeService';

const initialState = {
  exchanges: [],
  currentExchange: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
};

// Async thunks
export const fetchExchanges = createAsyncThunk(
  'exchanges/fetchExchanges',
  async (params, { rejectWithValue }) => {
    try {
      const data = await exchangeService.getExchanges(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch exchanges');
    }
  }
);

export const createExchange = createAsyncThunk(
  'exchanges/createExchange',
  async (exchangeData, { rejectWithValue }) => {
    try {
      const data = await exchangeService.createExchange(exchangeData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create exchange');
    }
  }
);

export const updateExchangeStatus = createAsyncThunk(
  'exchanges/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const data = await exchangeService.updateExchangeStatus(id, status);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update exchange');
    }
  }
);

const exchangeSlice = createSlice({
  name: 'exchanges',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentExchange: (state, action) => {
      state.currentExchange = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch exchanges
      .addCase(fetchExchanges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExchanges.fulfilled, (state, action) => {
        state.loading = false;
        state.exchanges = action.payload.exchanges;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
      })
      .addCase(fetchExchanges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create exchange
      .addCase(createExchange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExchange.fulfilled, (state, action) => {
        state.loading = false;
        state.exchanges.unshift(action.payload);
      })
      .addCase(createExchange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update exchange status
      .addCase(updateExchangeStatus.fulfilled, (state, action) => {
        const index = state.exchanges.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.exchanges[index] = action.payload;
        }
        if (state.currentExchange?._id === action.payload._id) {
          state.currentExchange = action.payload;
        }
      });
  },
});

export const { clearError, setCurrentExchange } = exchangeSlice.actions;
export default exchangeSlice.reducer;
