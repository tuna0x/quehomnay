import { apiClient, getOrCreateUserId } from './client.js';

export const userApi = {
  // Get today's draw quota & status for current user
  getStatus: async () => {
    const userId = getOrCreateUserId();
    return await apiClient(`/user/status?userId=${encodeURIComponent(userId)}`);
  },

  // Grant +1 bonus draw upon inviting a friend
  claimInviteBonus: async () => {
    const userId = getOrCreateUserId();
    return await apiClient('/user/invite', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  },

  // Record referral click when a partner visits with ?ref=userId
  recordReferralClick: async (referrerId) => {
    const visitorId = getOrCreateUserId();
    return await apiClient('/user/referral/click', {
      method: 'POST',
      body: JSON.stringify({ referrerId, visitorId })
    });
  },

  // Reset daily limit (Dev/Test mode)
  resetLimit: async () => {
    const userId = getOrCreateUserId();
    return await apiClient('/user/reset', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  },

  // Record custom user actions into activity logs (e.g. sharing fortune)
  recordAction: async (actionType, details = {}, userName = '') => {
    try {
      return await apiClient('/user/action', {
        method: 'POST',
        body: JSON.stringify({ actionType, details, userName })
      });
    } catch {
      // Ignore background tracking failures
    }
  }
};
