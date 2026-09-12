import { useCallback, useEffect, useState } from 'react';
import { authApi } from '../api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const result = await authApi.getMe();
      setUser(result.user || null);
    } catch (error) {
      if (error.status !== 401) {
        console.debug('[useAuth] Could not restore session:', error.message);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const register = useCallback(async (credentials) => {
    const result = await authApi.register(credentials);
    setUser(result.user || null);
    return result;
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await authApi.login(credentials);
    setUser(result.user || null);
    return result;
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    const result = await authApi.loginWithGoogle(credential);
    setUser(result.user || null);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
    register,
    login,
    loginWithGoogle,
    logout,
    refreshProfile
  };
}