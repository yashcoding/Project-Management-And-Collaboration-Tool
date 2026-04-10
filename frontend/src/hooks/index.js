import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { authAPI } from '../api/auth.api';

export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, loading } = useSelector(s => s.auth);

  const handleLogout = async () => {
    const refreshToken = JSON.parse(localStorage.getItem('auth') || '{}')?.refreshToken;
    try { await authAPI.logout(refreshToken); } catch {}
    dispatch(logout());
  };

  return { user, token, loading, logout: handleLogout, isAuthenticated: !!token };
};
