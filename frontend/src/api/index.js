import api from './axios';

export const boardAPI = {
  getByProject: (projectId) => api.get(`/boards/project/${projectId}`),
  getById: (id) => api.get(`/boards/${id}`),
  create: (projectId, data) => api.post(`/boards/project/${projectId}`, data),
  update: (id, data) => api.put(`/boards/${id}`, data),
  delete: (id) => api.delete(`/boards/${id}`),
  addColumn: (id, data) => api.post(`/boards/${id}/columns`, data),
  updateColumn: (id, colId, data) => api.put(`/boards/${id}/columns/${colId}`, data),
  deleteColumn: (id, colId) => api.delete(`/boards/${id}/columns/${colId}`),
};

export const taskAPI = {
  getByBoard: (boardId, params) => api.get(`/tasks/board/${boardId}`, { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (boardId, data) => api.post(`/tasks/board/${boardId}`, data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  reorder: (boardId, updates) => api.post(`/tasks/board/${boardId}/reorder`, { updates }),
};

export const commentAPI = {
  getByTask: (taskId) => api.get(`/comments/task/${taskId}`),
  add: (taskId, data) => api.post(`/comments/task/${taskId}`, data),
  update: (id, text) => api.put(`/comments/${id}`, { text }),
  delete: (id) => api.delete(`/comments/${id}`),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  search: (q) => api.get('/users/search', { params: { q } }),
};
