import { apiClient } from './client.js';

export const adminApi = {
  // Get overview stats (traffic, users, draws, live active)
  getOverview: async () => {
    return await apiClient('/admin/overview');
  },

  // Get paginated traffic logs
  getTraffic: async ({ page = 1, limit = 25, path = '' } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (path) params.append('path', path);
    return await apiClient(`/admin/traffic?${params.toString()}`);
  },

  // Get paginated users list
  getUsers: async ({ page = 1, limit = 20, search = '', role = '' } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    return await apiClient(`/admin/users?${params.toString()}`);
  },

  // Update a user's role (admin / user)
  updateUserRole: async (userId, role) => {
    return await apiClient(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  },

  // Get paginated activity stream
  getActivities: async ({ page = 1, limit = 25, actionType = '', search = '' } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (actionType) params.append('actionType', actionType);
    if (search) params.append('search', search);
    return await apiClient(`/admin/activities?${params.toString()}`);
  },

  // Dead Letter Queue (DLQ) & Queue Status
  getDLQJobs: async ({ page = 1, limit = 20, status = '', jobType = '' } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (status && status !== 'all') params.append('status', status);
    if (jobType && jobType !== 'all') params.append('jobType', jobType);
    return await apiClient(`/admin/dlq?${params.toString()}`);
  },

  getDLQStats: async () => {
    return await apiClient('/admin/dlq/stats');
  },

  retryDLQJob: async (jobId) => {
    return await apiClient(`/admin/dlq/${jobId}/retry`, {
      method: 'POST'
    });
  },

  discardDLQJob: async (jobId) => {
    return await apiClient(`/admin/dlq/${jobId}`, {
      method: 'DELETE'
    });
  },

  retryAllDLQ: async () => {
    return await apiClient('/admin/dlq/retry-all', {
      method: 'POST'
    });
  }
};
