/**
 * Notification Types
 *
 * @module domain/notifications/notificationTypes
 */

export const NOTIFICATION_TYPE = {
  LIKE: 'like',
  COMMENT: 'comment',
  REPLY: 'reply',
  FOLLOW: 'follow',
  MENTION: 'mention',
  JAM_INVITE: 'jam_invite',
  JAM_JOIN: 'jam_join',
  JAM_CONTRIBUTION: 'jam_contribution',
  JAM_CONTRIBUTION_REACTION: 'jam_contribution_reaction',
  JAM_COMPLETED: 'jam_completed',
  SYSTEM: 'system',
  REPOST: 'repost',
  SAVE: 'save',
};

export const NOTIFICATION_STATUS = {
  UNREAD: 'unread',
  READ: 'read',
};

/**
 * @typedef {Object} NormalizedNotification
 * @property {string} id
 * @property {string} type
 * @property {string} status - 'unread'|'read'
 * @property {Object} actor - { id, username, avatar }
 * @property {string} targetType - 'post'|'reel'|'jam'|'comment'|'user'
 * @property {string} targetId
 * @property {string} [targetTitle]
 * @property {string} [message]
 * @property {string} createdAt
 * @property {string} deepLink - Route to navigate to
 * @property {Object} [metadata]
 */

export const NOTIFICATION_DEEP_LINKS = {
  [NOTIFICATION_TYPE.LIKE]: (n) => `/posts/${n.targetId}`,
  [NOTIFICATION_TYPE.COMMENT]: (n) => `/posts/${n.targetId}`,
  [NOTIFICATION_TYPE.REPLY]: (n) => `/posts/${n.targetId}`,
  [NOTIFICATION_TYPE.FOLLOW]: (n) => `/profile/${n.targetId}`,
  [NOTIFICATION_TYPE.MENTION]: (n) => `/posts/${n.targetId}`,
  [NOTIFICATION_TYPE.JAM_INVITE]: (n) => `/jams/${n.targetId}`,
  [NOTIFICATION_TYPE.JAM_JOIN]: (n) => `/jams/${n.targetId}`,
  [NOTIFICATION_TYPE.JAM_CONTRIBUTION]: (n) => `/jams/${n.targetId}`,
  [NOTIFICATION_TYPE.JAM_CONTRIBUTION_REACTION]: (n) => `/jams/${n.targetId}`,
  [NOTIFICATION_TYPE.JAM_COMPLETED]: (n) => `/jams/${n.targetId}`,
  [NOTIFICATION_TYPE.REPOST]: (n) => `/posts/${n.targetId}`,
  [NOTIFICATION_TYPE.SAVE]: (n) => `/posts/${n.targetId}`,
  [NOTIFICATION_TYPE.SYSTEM]: () => '/notifications',
};
