import { apiClient, getOrCreateUserId } from './client.js';

export const authApi = {
  // Register with Email & Password
  register: async ({ email, password, name }) => {
    const guestUserId = getOrCreateUserId();
    return await apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, guestUserId })
    });
  },

  // Log in with Email & Password
  login: async ({ email, password }) => {
    const guestUserId = getOrCreateUserId();
    return await apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, guestUserId })
    });
  },

  // Log in or Register via Google OAuth Credential / Profile
  loginWithGoogle: async ({ credential, userInfo }) => {
    const guestUserId = getOrCreateUserId();
    return await apiClient('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential, userInfo, guestUserId })
    });
  },

  // Get current logged-in user profile
  getMe: async () => {
    return await apiClient('/auth/me');
  }
};
