import { apiClient } from './client.js';

export const adminContactApi = {
  listMessages(status = 'all') {
    const query = status && status !== 'all' ? '?status=' + encodeURIComponent(status) : '';
    return apiClient('/admin/contact-messages' + query);
  },

  updateStatus(id, status) {
    return apiClient('/admin/contact-messages/' + id, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};