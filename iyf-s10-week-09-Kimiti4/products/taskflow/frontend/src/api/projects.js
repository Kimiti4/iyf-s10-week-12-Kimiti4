import { get, post, put, del } from './client';

export async function getProjects(orgId) {
  return get(`/projects?org_id=${orgId}`);
}

export async function getProject(projectId) {
  return get(`/projects/${projectId}`);
}

export async function createProject(orgId, data) {
  return post('/projects', { org_id: orgId, ...data });
}

export async function updateProject(projectId, data) {
  return put(`/projects/${projectId}`, data);
}

export async function deleteProject(projectId) {
  return del(`/projects/${projectId}`);
}

export async function archiveProject(projectId) {
  return put(`/projects/${projectId}`, { status: 'archived' });
}
