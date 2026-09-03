import { post, get } from './client';

export async function login(email, password) {
  const data = await post('/auth/login', { email, password });
  if (data.token) {
    localStorage.setItem('taskflow_token', data.token);
  }
  return data;
}

export async function register(name, email, password) {
  const data = await post('/auth/register', { name, email, password });
  if (data.token) {
    localStorage.setItem('taskflow_token', data.token);
  }
  return data;
}

export async function getMe() {
  return get('/auth/me');
}

export function logout() {
  localStorage.removeItem('taskflow_token');
}
