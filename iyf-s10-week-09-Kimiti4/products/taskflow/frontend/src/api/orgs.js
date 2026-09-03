import { get, post, put, del } from './client';

export async function getOrganizations() {
  return get('/orgs');
}

export async function createOrganization(name, description) {
  return post('/orgs', { name, description });
}

export async function updateOrganization(orgId, data) {
  return put(`/orgs/${orgId}`, data);
}

export async function deleteOrganization(orgId) {
  return del(`/orgs/${orgId}`);
}

export async function getMembers(orgId) {
  return get(`/orgs/${orgId}/members`);
}

export async function inviteMember(orgId, email, role) {
  return post(`/orgs/${orgId}/members`, { email, role });
}

export async function removeMember(orgId, userId) {
  return del(`/orgs/${orgId}/members/${userId}`);
}
