import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskAPI } from '../../api/index.js';

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async ({ boardId, params }, { rejectWithValue }) => {
  try {
    const { data } = await taskAPI.getByBoard(boardId, params);
    return data.data.tasks;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const fetchTask = createAsyncThunk('tasks/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await taskAPI.getById(id);
    return data.data.task;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const createTask = createAsyncThunk('tasks/create', async ({ boardId, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await taskAPI.create(boardId, payload);
    return data.data.task;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await taskAPI.update(id, payload);
    return data.data.task;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try {
    await taskAPI.delete(id);
    return id;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const reorderTasks = createAsyncThunk('tasks/reorder', async ({ boardId, updates }, { rejectWithValue }) => {
  try {
    await taskAPI.reorder(boardId, updates);
    return updates;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState: { list: [], current: null, loading: false, error: null },
  reducers: {
    setTasksLocal(state, action) { state.list = action.payload; },
    addTaskFromSocket(state, action) {
      if (!state.list.find(t => t._id === action.payload._id)) state.list.push(action.payload);
    },
    updateTaskFromSocket(state, action) {
      const idx = state.list.findIndex(t => t._id === action.payload._id);
      if (idx !== -1) state.list[idx] = action.payload;
      if (state.current?._id === action.payload._id) state.current = action.payload;
    },
    removeTaskFromSocket(state, action) {
      state.list = state.list.filter(t => t._id !== action.payload._id);
    },
    clearTasks(state) { state.list = []; state.current = null; },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchTasks.pending, s => { s.loading = true; })
      .addCase(fetchTasks.fulfilled, (s, a) => { s.list = a.payload; s.loading = false; })
      .addCase(fetchTasks.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchTask.fulfilled, (s, a) => { s.current = a.payload; })
      .addCase(createTask.fulfilled, (s, a) => {
        if (!s.list.find(t => t._id === a.payload._id)) s.list.push(a.payload);
      })
      .addCase(updateTask.fulfilled, (s, a) => {
        const idx = s.list.findIndex(t => t._id === a.payload._id);
        if (idx !== -1) s.list[idx] = a.payload;
        if (s.current?._id === a.payload._id) s.current = a.payload;
      })
      .addCase(deleteTask.fulfilled, (s, a) => {
        s.list = s.list.filter(t => t._id !== a.payload);
      })
      .addCase(reorderTasks.fulfilled, (s, a) => {
        a.payload.forEach(({ _id, order, columnId, status }) => {
          const t = s.list.find(t => t._id === _id);
          if (t) { t.order = order; if (columnId !== undefined) t.columnId = columnId; if (status) t.status = status; }
        });
      });
  },
});

export const { setTasksLocal, addTaskFromSocket, updateTaskFromSocket, removeTaskFromSocket, clearTasks } = taskSlice.actions;
export default taskSlice.reducer;
