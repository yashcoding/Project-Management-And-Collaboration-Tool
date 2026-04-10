import api from './axios';

export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  invite: (id, data) => api.post(`/projects/${id}/invite`, data),
  removeMember: (id, memberId) => api.delete(`/projects/${id}/members/${memberId}`),
};
