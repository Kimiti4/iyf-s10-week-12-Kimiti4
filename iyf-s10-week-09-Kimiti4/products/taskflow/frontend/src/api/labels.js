import { get, post, del } from './client';

export async function getLabels(orgId) {
  return get(`/labels?org_id=${orgId}`);
}

export async function createLabel(orgId, name, color) {
  return post('/labels', { org_id: orgId, name, color });
}

export async function deleteLabel(labelId) {
  return del(`/labels/${labelId}`);
}

export async function addLabelToTask(taskId, labelId) {
  return post(`/labels/tasks/${taskId}/labels`, { label_id: labelId });
}

export async function removeLabelFromTask(taskId, labelId) {
  return del(`/labels/tasks/${taskId}/labels/${labelId}`);
}
