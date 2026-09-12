import { apiClient } from './client.js';

export const contactApi = {
  sendMessage(payload) {
    return apiClient('/contact', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
