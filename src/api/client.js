// HTTP Client wrapper for API calls with automatic client-id attachment, JWT auth, and error handling
const API_BASE = '/api';
const GUEST_ID_KEY = 'qhn_client_user_id';
const AUTH_TOKEN_KEY = 'qhn_auth_token';
const AUTH_USER_KEY = 'qhn_auth_user';

// Unique persistent client/device guest ID
export function getOrCreateUserId() {
  try {
    let id = localStorage.getItem(GUEST_ID_KEY);
    if (!id) {
      id = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(GUEST_ID_KEY, id);
    }
    return id;
  } catch (e) {
    return 'usr_guest_fallback';
  }
}

// Get JWT Token from storage
export function getStoredToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

// Store JWT Token
export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch (e) {}
}

// Get Authenticated User from storage
export function getStoredUser() {
  try {
    const data = localStorage.getItem(AUTH_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

// Store Authenticated User
export function setStoredUser(user) {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (e) {}
}

// Clear all auth credentials
export function clearStoredAuth() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch (e) {}
}

// Get effective user ID: authenticated user ID takes precedence over anonymous guest ID
export function getEffectiveUserId() {
  const user = getStoredUser();
  if (user && user.id) {
    return user.id;
  }
  return getOrCreateUserId();
}

// Unified API request helper with auto Bearer token injection
export async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const token = getStoredToken();
  const effectiveUserId = getEffectiveUserId();

  const headers = {
    'Content-Type': 'application/json',
    ...(effectiveUserId ? { 'x-user-id': effectiveUserId } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(errorBody.error || `HTTP ${response.status}: Yêu cầu không thành công`);
    error.status = response.status;
    error.data = errorBody;
    throw error;
  }

  return await response.json();
}
