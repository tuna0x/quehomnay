import { useState, useEffect, useCallback } from 'react';
import { 
  authApi, 
  getStoredToken, 
  setStoredToken, 
  getStoredUser, 
  setStoredUser, 
  clearStoredAuth 
} from '../api';

export function useAuth() {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Synchronize state with current token / profile on mount
  const refreshProfile = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await authApi.getMe();
      setUser(profile);
      setStoredUser(profile);
      setError(null);
    } catch (err) {
      console.warn('[useAuth] Session expired or invalid:', err.message);
      clearStoredAuth();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Handle successful authentication response
  const handleAuthSuccess = (data) => {
    if (data.token) {
      setStoredToken(data.token);
      setToken(data.token);
    }
    if (data.user) {
      setStoredUser(data.user);
      setUser(data.user);
    }
    setError(null);
    return data;
  };

  // Register with Email & Password
  const register = async ({ email, password, name }) => {
    setError(null);
    try {
      const res = await authApi.register({ email, password, name });
      return handleAuthSuccess(res);
    } catch (err) {
      const msg = err.data?.error || err.message || 'Đăng ký không thành công. Vui lòng thử lại.';
      setError(msg);
      throw err;
    }
  };

  // Log in with Email & Password
  const login = async ({ email, password }) => {
    setError(null);
    try {
      const res = await authApi.login({ email, password });
      return handleAuthSuccess(res);
    } catch (err) {
      const msg = err.data?.error || err.message || 'Đăng nhập không thành công.';
      setError(msg);
      throw err;
    }
  };

  // Log in with Google
  const loginWithGoogle = async ({ credential, userInfo }) => {
    setError(null);
    try {
      const res = await authApi.loginWithGoogle({ credential, userInfo });
      return handleAuthSuccess(res);
    } catch (err) {
      const msg = err.data?.error || err.message || 'Đăng nhập bằng Google không thành công.';
      setError(msg);
      throw err;
    }
  };

  // Log out
  const logout = () => {
    clearStoredAuth();
    setUser(null);
    setToken(null);
    setError(null);
  };

  return {
    user,
    token,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    loading,
    error,
    setError,
    register,
    login,
    loginWithGoogle,
    logout,
    refreshProfile
  };
}
