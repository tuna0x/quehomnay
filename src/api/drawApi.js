import { apiClient, getOrCreateUserId } from './client.js';

export const drawApi = {
  // Record a completed fortune draw to PostgreSQL database
  recordDraw: async ({ fortune, name = '', birthYear = '', question = '', topic = '' }) => {
    const userId = getOrCreateUserId();
    return await apiClient('/draw', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        name,
        birthYear: birthYear || fortune.birthYear || '',
        question,
        topic: topic || fortune.topic || '',
        fortune
      })
    });
  },

  // Get user draw history
  getHistory: async (limit = 50) => {
    const userId = getOrCreateUserId();
    const data = await apiClient(`/history?userId=${encodeURIComponent(userId)}&limit=${limit}`);
    return data.history || [];
  },

  // Clear user draw history
  clearHistory: async () => {
    const userId = getOrCreateUserId();
    return await apiClient(`/history?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE'
    });
  },

  // Get fortune by ID for sharing
  getById: async (id) => {
    const data = await apiClient(`/fortune/${encodeURIComponent(id)}`);
    return data.fortune;
  }
};
