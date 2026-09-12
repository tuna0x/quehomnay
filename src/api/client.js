// HTTP Client wrapper for API calls with automatic client-id attachment and error handling
const API_BASE = '/api';
const USER_ID_KEY = 'qhn_client_user_id';

// Unique persistent client/device ID
export function getOrCreateUserId() {
  try {
    let id = localStorage.getItem(USER_ID_KEY);
    if (!id) {
      id = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(USER_ID_KEY, id);
    }
    return id;
  } catch (e) {
    return 'usr_guest_fallback';
  }
}

// Unified API request helper
export async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    ...options,
    credentials: 'same-origin',
    headers
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(errorBody.error || `HTTP ${response.status}: Request failed`);
    error.status = response.status;
    error.data = errorBody;
    throw error;
  }

  return await response.json();
}
