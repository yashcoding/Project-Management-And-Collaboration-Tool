import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectAPI } from '../../api/project.api';

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await projectAPI.getAll(params);
    return data;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const fetchProject = createAsyncThunk('projects/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await projectAPI.getById(id);
    return data.data.project;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const createProject = createAsyncThunk('projects/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await projectAPI.create(payload);
    return data.data.project;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await projectAPI.update(id, payload);
    return data.data.project;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
  try {
    await projectAPI.delete(id);
    return id;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const inviteMember = createAsyncThunk('projects/invite', async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await projectAPI.invite(id, payload);
    return data.data.project;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: { list: [], current: null, pagination: null, loading: false, error: null },
  reducers: {
    clearCurrentProject(state) { state.current = null; },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchProjects.pending, s => { s.loading = true; s.error = null; })
      .addCase(fetchProjects.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload.data.projects;
        s.pagination = a.payload.pagination;
      })
      .addCase(fetchProjects.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchProject.pending, s => { s.loading = true; })
      .addCase(fetchProject.fulfilled, (s, a) => { s.current = a.payload; s.loading = false; })
      .addCase(fetchProject.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createProject.fulfilled, (s, a) => { s.list.unshift(a.payload); })
      .addCase(updateProject.fulfilled, (s, a) => {
        s.current = a.payload;
        const idx = s.list.findIndex(p => p._id === a.payload._id);
        if (idx !== -1) s.list[idx] = a.payload;
      })
      .addCase(deleteProject.fulfilled, (s, a) => {
        s.list = s.list.filter(p => p._id !== a.payload);
        if (s.current?._id === a.payload) s.current = null;
      })
      .addCase(inviteMember.fulfilled, (s, a) => { s.current = a.payload; });
  },
});

export const { clearCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;
