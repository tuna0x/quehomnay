import { apiClient, getEffectiveUserId } from './client.js';

export const statsApi = {
  // Fetch real-time global draw counters from PostgreSQL
  getLiveStats: async () => {
    try {
      return await apiClient('/stats');
    } catch (err) {
      console.warn('[StatsAPI] Using baseline stats fallback:', err.message);
      return {
        totalDraws: 128450,
        todayDraws: 3842,
        activeUsers: 218
      };
    }
  },

  // Record client-side page view
  trackPageView: async (path = window.location.pathname + window.location.search) => {
    try {
      return await apiClient('/stats/track', {
        method: 'POST',
        body: JSON.stringify({
          path,
          referrer: document.referrer || '',
          userId: getEffectiveUserId()
        })
      });
    } catch {
      // Ignore background tracking failures
    }
  }
};

