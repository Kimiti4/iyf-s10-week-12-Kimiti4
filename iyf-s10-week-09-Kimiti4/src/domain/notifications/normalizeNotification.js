/**
 * Notification Normalizer
 *
 * @module domain/notifications/normalizeNotification
 */

import { NOTIFICATION_TYPE, NOTIFICATION_DEEP_LINKS } from './notificationTypes';

const MESSAGE_TEMPLATES = {
  [NOTIFICATION_TYPE.LIKE]: (n) => `${n.actor?.username || 'Someone'} liked your post`,
  [NOTIFICATION_TYPE.COMMENT]: (n) => `${n.actor?.username || 'Someone'} commented on your post`,
  [NOTIFICATION_TYPE.REPLY]: (n) => `${n.actor?.username || 'Someone'} replied to your comment`,
  [NOTIFICATION_TYPE.FOLLOW]: (n) => `${n.actor?.username || 'Someone'} started following you`,
  [NOTIFICATION_TYPE.MENTION]: (n) => `${n.actor?.username || 'Someone'} mentioned you`,
  [NOTIFICATION_TYPE.JAM_INVITE]: (n) => `${n.actor?.username || 'Someone'} invited you to a Jam`,
  [NOTIFICATION_TYPE.JAM_JOIN]: (n) => `${n.actor?.username || 'Someone'} joined your Jam`,
  [NOTIFICATION_TYPE.JAM_CONTRIBUTION]: (n) => `${n.actor?.username || 'Someone'} contributed to your Jam`,
  [NOTIFICATION_TYPE.JAM_CONTRIBUTION_REACTION]: (n) => `${n.actor?.username || 'Someone'} reacted to a contribution`,
  [NOTIFICATION_TYPE.JAM_COMPLETED]: () => `Your Jam has ended`,
  [NOTIFICATION_TYPE.REPOST]: (n) => `${n.actor?.username || 'Someone'} reposted your post`,
  [NOTIFICATION_TYPE.SAVE]: (n) => `${n.actor?.username || 'Someone'} saved your post`,
  [NOTIFICATION_TYPE.SYSTEM]: (n) => n.message || 'System notification',
};

export function normalizeNotification(raw) {
  if (!raw) return null;

  const actor = raw.actor || raw.user || {};
  const type = raw.type || NOTIFICATION_TYPE.SYSTEM;

  const notification = {
    id: raw.id || raw._id || '',
    type,
    status: raw.read ? 'read' : 'unread',
    actor: {
      id: actor._id || actor.id || '',
      username: actor.username || 'Someone',
      avatar: actor.profile?.avatar || actor.avatar || null,
    },
    targetType: raw.targetType || raw.entityType || 'post',
    targetId: raw.targetId || raw.entityId || '',
    targetTitle: raw.targetTitle || raw.entityTitle || '',
    message: '',
    createdAt: raw.createdAt || new Date().toISOString(),
    deepLink: '',
    metadata: raw.metadata || {},
  };

  // Generate message
  const template = MESSAGE_TEMPLATES[type];
  notification.message = template ? template(notification) : 'New activity';

  // Generate deep link
  const linkFn = NOTIFICATION_DEEP_LINKS[type];
  notification.deepLink = linkFn ? linkFn(notification) : '/notifications';

  return notification;
}

export function normalizeNotifications(rawArray) {
  if (!rawArray || !Array.isArray(rawArray)) return [];
  return rawArray.map(normalizeNotification).filter(Boolean);
}
