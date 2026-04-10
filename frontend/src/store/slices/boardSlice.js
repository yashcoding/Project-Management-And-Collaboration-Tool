import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { boardAPI } from '../../api/index.js';

export const fetchBoards = createAsyncThunk('boards/fetchAll', async (projectId, { rejectWithValue }) => {
  try {
    const { data } = await boardAPI.getByProject(projectId);
    return data.data.boards;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const fetchBoard = createAsyncThunk('boards/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await boardAPI.getById(id);
    return data.data.board;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const createBoard = createAsyncThunk('boards/create', async ({ projectId, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await boardAPI.create(projectId, payload);
    return data.data.board;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const updateBoard = createAsyncThunk('boards/update', async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await boardAPI.update(id, payload);
    return data.data.board;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const deleteBoard = createAsyncThunk('boards/delete', async (id, { rejectWithValue }) => {
  try {
    await boardAPI.delete(id);
    return id;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const boardSlice = createSlice({
  name: 'boards',
  initialState: { list: [], current: null, loading: false, error: null },
  reducers: {
    clearCurrentBoard(state) { state.current = null; },
    updateBoardLocal(state, action) {
      if (state.current?._id === action.payload._id) state.current = action.payload;
    },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchBoards.pending, s => { s.loading = true; })
      .addCase(fetchBoards.fulfilled, (s, a) => { s.list = a.payload; s.loading = false; })
      .addCase(fetchBoards.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchBoard.pending, s => { s.loading = true; })
      .addCase(fetchBoard.fulfilled, (s, a) => { s.current = a.payload; s.loading = false; })
      .addCase(fetchBoard.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createBoard.fulfilled, (s, a) => { s.list.push(a.payload); })
      .addCase(updateBoard.fulfilled, (s, a) => {
        s.current = a.payload;
        const idx = s.list.findIndex(b => b._id === a.payload._id);
        if (idx !== -1) s.list[idx] = a.payload;
      })
      .addCase(deleteBoard.fulfilled, (s, a) => {
        s.list = s.list.filter(b => b._id !== a.payload);
        if (s.current?._id === a.payload) s.current = null;
      });
  },
});

export const { clearCurrentBoard, updateBoardLocal } = boardSlice.actions;
export default boardSlice.reducer;
