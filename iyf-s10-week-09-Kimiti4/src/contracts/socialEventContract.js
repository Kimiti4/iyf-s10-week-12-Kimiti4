/**
 * Social Event Contract
 *
 * Defines the vocabulary of social events that can be tracked.
 * These events feed into J-014's recommendation engine and J-012's
 * notification system.
 *
 * @module contracts/socialEventContract
 */

// ===== EVENT TYPES =====

export const SOCIAL_EVENTS = {
  // Content events
  CONTENT_VIEWED: 'content_viewed',
  CONTENT_LIKED: 'content_liked',
  CONTENT_UNLIKED: 'content_unliked',
  CONTENT_COMMENTED: 'content_commented',
  CONTENT_SHARED: 'content_shared',
  CONTENT_REPOSTED: 'content_reposted',
  CONTENT_SAVED: 'content_saved',
  CONTENT_UNSAVED: 'content_unsaved',

  // User events
  USER_FOLLOWED: 'user_followed',
  USER_UNFOLLOWED: 'user_unfollowed',
  USER_PROFILE_VIEWED: 'user_profile_viewed',

  // Jam events (extend J-001 events)
  JAM_VIEWED: 'jam_viewed',
  JAM_JOINED: 'jam_joined',
  JAM_CONTRIBUTED: 'jam_contributed',
  JAM_COMPLETED: 'jam_completed',

  // Reel events (for J-010)
  REEL_VIEWED: 'reel_viewed',
  REEL_COMPLETED: 'reel_completed',
  REEL_SHARED: 'reel_shared',
};

// ===== EVENT STRUCTURE =====

/**
 * @typedef {Object} SocialEvent
 * @property {string} type - One of SOCIAL_EVENTS values
 * @property {string} actorId - User performing the action
 * @property {string} targetType - 'post'|'comment'|'user'|'jam'|'reel'
 * @property {string} targetId - ID of the target object
 * @property {string} [parentTargetId] - ID of parent (e.g., post ID for a comment)
 * @property {Object} [metadata] - Additional context
 * @property {string} timestamp - ISO 8601
 */

// ===== EVENT ABSTRACTION =====

const eventQueue = [];
let flushTimer = null;
let flushCallback = null;

/**
 * Initialize the event system with a flush callback.
 * The callback receives an array of events to send to the backend.
 */
export function initEventSystem(callback) {
  flushCallback = callback;
}

/**
 * Track a social event. Events are batched and flushed periodically.
 */
export function trackEvent(event) {
  const enriched = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  eventQueue.push(enriched);

  // Flush immediately for critical events
  if (
    event.type === SOCIAL_EVENTS.USER_FOLLOWED ||
    event.type === SOCIAL_EVENTS.USER_UNFOLLOWED
  ) {
    flushEvents();
    return;
  }

  // Batch other events
  if (!flushTimer) {
    flushTimer = setTimeout(flushEvents, 5000);
  }
}

/**
 * Flush all pending events immediately.
 */
export function flushEvents() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (eventQueue.length === 0) return;

  const events = [...eventQueue];
  eventQueue.length = 0;

  if (flushCallback) {
    try {
      flushCallback(events);
    } catch {
      // Silent - events are best-effort
    }
  }
}

// ===== CONVENIENCE TRACKERS =====

export function trackView(targetType, targetId, metadata) {
  trackEvent({
    type: SOCIAL_EVENTS.CONTENT_VIEWED,
    actorId: null, // filled by backend
    targetType,
    targetId,
    metadata,
  });
}

export function trackLike(targetType, targetId) {
  trackEvent({
    type: SOCIAL_EVENTS.CONTENT_LIKED,
    targetType,
    targetId,
  });
}

export function trackUnlike(targetType, targetId) {
  trackEvent({
    type: SOCIAL_EVENTS.CONTENT_UNLIKED,
    targetType,
    targetId,
  });
}

export function trackComment(targetId, parentTargetId) {
  trackEvent({
    type: SOCIAL_EVENTS.CONTENT_COMMENTED,
    targetType: 'comment',
    targetId,
    parentTargetId,
  });
}

export function trackShare(targetType, targetId) {
  trackEvent({
    type: SOCIAL_EVENTS.CONTENT_SHARED,
    targetType,
    targetId,
  });
}

export function trackRepost(targetId) {
  trackEvent({
    type: SOCIAL_EVENTS.CONTENT_REPOSTED,
    targetType: 'post',
    targetId,
  });
}

export function trackSave(targetType, targetId) {
  trackEvent({
    type: SOCIAL_EVENTS.CONTENT_SAVED,
    targetType,
    targetId,
  });
}

export function trackUnsave(targetType, targetId) {
  trackEvent({
    type: SOCIAL_EVENTS.CONTENT_UNSAVED,
    targetType,
    targetId,
  });
}

export function trackFollow(targetId) {
  trackEvent({
    type: SOCIAL_EVENTS.USER_FOLLOWED,
    targetType: 'user',
    targetId,
  });
}

export function trackUnfollow(targetId) {
  trackEvent({
    type: SOCIAL_EVENTS.USER_UNFOLLOWED,
    targetType: 'user',
    targetId,
  });
}
