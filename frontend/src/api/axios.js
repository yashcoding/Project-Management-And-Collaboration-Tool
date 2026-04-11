import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Attach token
api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem('auth') || 'null');

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) =>
    error ? p.reject(error) : p.resolve(token)
  );
  failedQueue = [];
};

// ✅ Response interceptor (refresh logic)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      const auth = JSON.parse(localStorage.getItem('auth') || 'null');

      if (!auth?.refreshToken) {
        localStorage.removeItem('auth');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post('/api/auth/refresh', {
          refreshToken: auth.refreshToken,
        });

        const { accessToken, refreshToken: newRefresh } = data.data;

        // ✅ update localStorage instead of store
        const updatedAuth = {
          ...auth,
          token: accessToken,
          refreshToken: newRefresh,
        };
        localStorage.setItem('auth', JSON.stringify(updatedAuth));

        processQueue(null, accessToken);

        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('auth');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;