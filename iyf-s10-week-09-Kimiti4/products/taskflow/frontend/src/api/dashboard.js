import { get } from './client';

export async function getDashboardStats(orgId) {
  return get(`/dashboard?org_id=${orgId}`);
}

export async function getRecentActivity(orgId) {
  const data = await get(`/dashboard?org_id=${orgId}`);
  return data.recent_activity || [];
}
