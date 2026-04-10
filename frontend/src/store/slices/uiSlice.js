import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    modals: { createProject: false, createBoard: false, createTask: false, inviteMember: false },
    sidebarOpen: true,
  },
  reducers: {
    openModal(state, action) { state.modals[action.payload] = true; },
    closeModal(state, action) { state.modals[action.payload] = false; },
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen; },
  },
});

export const { openModal, closeModal, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
