import { get, post, put, del } from './client';

export async function getTasks(projectId, params = {}) {
  const query = new URLSearchParams(params).toString();
  return get(`/projects/${projectId}/tasks${query ? '?' + query : ''}`);
}

export async function getTask(taskId) {
  return get(`/tasks/${taskId}`);
}

export async function createTask(projectId, data) {
  return post(`/projects/${projectId}/tasks`, data);
}

export async function updateTask(taskId, data) {
  return put(`/tasks/${taskId}`, data);
}

export async function deleteTask(taskId) {
  return del(`/tasks/${taskId}`);
}

export async function moveTask(taskId, status, position = 0) {
  return put(`/tasks/${taskId}/move`, { status, position });
}

export async function assignTask(taskId, userId) {
  return put(`/tasks/${taskId}`, { assignee_id: userId });
}
