import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../api/auth.api';

const stored = JSON.parse(localStorage.getItem('auth') || 'null');

export const fetchCurrentUser = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.getMe();
    return data.data.user;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message);
  }
});

export const loginUser = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.login(creds);
    return data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.register(creds);
    return data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Registration failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: stored?.user || null,
    token: stored?.token || null,
    refreshToken: stored?.refreshToken || null,
    loading: !!stored?.token,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      localStorage.removeItem('auth');
    },
    setTokens(state, action) {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      const stored = JSON.parse(localStorage.getItem('auth') || '{}');
      localStorage.setItem('auth', JSON.stringify({ ...stored, ...action.payload }));
    },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchCurrentUser.pending, (s) => { s.loading = true; })
      .addCase(fetchCurrentUser.fulfilled, (s, a) => { s.user = a.payload; s.loading = false; })
      .addCase(fetchCurrentUser.rejected, (s) => { s.loading = false; s.token = null; localStorage.removeItem('auth'); })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.user = a.payload.user;
        s.token = a.payload.accessToken;
        s.refreshToken = a.payload.refreshToken;
        s.error = null;
        localStorage.setItem('auth', JSON.stringify({ user: a.payload.user, token: a.payload.accessToken, refreshToken: a.payload.refreshToken }));
      })
      .addCase(loginUser.rejected, (s, a) => { s.error = a.payload; })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.user = a.payload.user;
        s.token = a.payload.accessToken;
        s.refreshToken = a.payload.refreshToken;
        localStorage.setItem('auth', JSON.stringify({ user: a.payload.user, token: a.payload.accessToken, refreshToken: a.payload.refreshToken }));
      })
      .addCase(registerUser.rejected, (s, a) => { s.error = a.payload; });
  },
});

export const { logout, setTokens } = authSlice.actions;
export default authSlice.reducer;
