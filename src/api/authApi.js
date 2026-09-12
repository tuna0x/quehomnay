import { apiClient, getOrCreateUserId } from './client.js';

export const authApi = {
  register: ({ email, password, name }) => apiClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, guestUserId: getOrCreateUserId() })
  }),

  login: ({ email, password }) => apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, guestUserId: getOrCreateUserId() })
  }),

  loginWithGoogle: (credential) => apiClient('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential, guestUserId: getOrCreateUserId() })
  }),

  getMe: () => apiClient('/auth/me'),

  logout: () => apiClient('/auth/logout', { method: 'POST' })
};