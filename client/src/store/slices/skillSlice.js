import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as skillService from '../../services/skillService';

const initialState = {
  skills: [],
  popularSkills: [],
  currentSkill: null,
  users: [],
  matches: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
};

// Async thunks
export const fetchSkills = createAsyncThunk(
  'skills/fetchSkills',
  async (params, { rejectWithValue }) => {
    try {
      const data = await skillService.getSkills(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch skills');
    }
  }
);

export const fetchPopularSkills = createAsyncThunk(
  'skills/fetchPopularSkills',
  async (limit, { rejectWithValue }) => {
    try {
      const data = await skillService.getPopularSkills(limit);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch popular skills');
    }
  }
);

export const searchUsers = createAsyncThunk(
  'skills/searchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const data = await skillService.searchUsers(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search users');
    }
  }
);

export const fetchMatches = createAsyncThunk(
  'skills/fetchMatches',
  async (params, { rejectWithValue }) => {
    try {
      const data = await skillService.getMatches(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch matches');
    }
  }
);

const skillSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUsers: (state) => {
      state.users = [];
    },
    clearMatches: (state) => {
      state.matches = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch skills
      .addCase(fetchSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.loading = false;
        state.skills = action.payload.skills;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch popular skills
      .addCase(fetchPopularSkills.fulfilled, (state, action) => {
        state.popularSkills = action.payload;
      })
      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch matches
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearUsers, clearMatches } = skillSlice.actions;
export default skillSlice.reducer;
