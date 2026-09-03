const BASE_URL = import.meta.env.VITE_API_URL || '/api/tf';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('taskflow_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem('taskflow_token');
    window.location.href = '/login';
    throw new ApiError('Unauthorized', 401);
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = (data && data.detail) || (data && data.message) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data;
}

export function get(endpoint) {
  return request(endpoint, { method: 'GET' });
}

export function post(endpoint, body) {
  return request(endpoint, { method: 'POST', body: JSON.stringify(body) });
}

export function put(endpoint, body) {
  return request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
}

export function del(endpoint) {
  return request(endpoint, { method: 'DELETE' });
}

export function patch(endpoint, body) {
  return request(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
}
