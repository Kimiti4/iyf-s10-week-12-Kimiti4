import { get } from './client';

export async function search(query, orgId) {
  return get(`/search?q=${encodeURIComponent(query)}&org_id=${orgId}`);
}
