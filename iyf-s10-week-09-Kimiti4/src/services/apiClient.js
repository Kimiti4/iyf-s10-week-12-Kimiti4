/**
 * Shared API Client
 *
 * Single source of truth for HTTP request infrastructure.
 * All domain services should import `request` from here instead of
 * re-implementing fetch, auth headers, and error handling.
 *
 * R5 [P0-7]: the access token lives in module memory (authToken.js), never
 * in persistent storage. The refresh session travels in an HttpOnly cookie,
 * so every request uses `credentials: 'include'`. On 401 the client attempts
 * exactly one silent refresh before reporting session expiry.
 *
 * @module services/apiClient
 */

import { getAccessToken, setAccessToken, clearAccessToken } from '../utils/authToken';

const configuredApiUrl = import.meta.env.VITE_API_URL;
// Do not crash the entire SPA at module import when local/CI configuration is
// absent. Requests fail explicitly below, while mocked E2E requests can still
// render and exercise the frontend. Production deployments must provide
// VITE_API_URL for real API traffic.
const API_URL = (configuredApiUrl || '').replace(/\/+$/, '');

const getAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export { API_URL, getAuthHeaders };

async function tryRefresh() {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data && data.token) {
      setAccessToken(data.token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function failAuth() {
  clearAccessToken();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:expired'));
  }
  throw new Error('Session expired. Please login again.');
}

export const request = async (endpoint, options = {}, _retried = false) => {
  if (!API_URL) {
    throw new Error('Frontend API is not configured. Set VITE_API_URL before making API requests.');
  }
  const url = `${API_URL}${endpoint}`;
  const config = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (response.status === 401 && !_retried) {
    // R5: single silent refresh attempt before reporting expiry.
    // The refresh endpoint itself is excluded to avoid recursion.
    if (!endpoint.startsWith('/auth/refresh') && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register')) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        return request(endpoint, options, true);
      }
    }
    failAuth();
  }

  if (response.status === 401) {
    failAuth();
  }

  if (response.status === 403) {
    throw new Error('You do not have permission to perform this action.');
  }

  if (response.status === 404) {
    throw new Error('Resource not found.');
  }

  // R4: some successful endpoints return 204 with an empty body
  // (e.g. DELETE comment). response.json() would throw on empty input,
  // turning a success into a client-side exception.
  if (response.status === 204) {
    return { success: true };
  }

  const text = await response.text();
  let data = { success: response.ok };
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(response.ok ? 'Server returned an invalid response.' : `Request failed (${response.status}).`);
    }
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
};
