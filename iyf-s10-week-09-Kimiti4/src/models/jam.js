/**
 * JamiiLink Jam Domain Model
 *
 * Defines the core types, constants, and validation rules for the Jam
 * feature. A Jam is a creator-led content primitive that turns an audience
 * from viewers into participants.
 *
 * @module models/jam
 */

// ===== JAM STATUS =====

/**
 * Jam lifecycle states.
 * @typedef {'draft'|'scheduled'|'active'|'ended'|'archived'} JamStatus
 */
export const JAM_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  ENDED: 'ended',
  ARCHIVED: 'archived',
};

/** Valid state transitions for a Jam. */
export const JAM_STATUS_TRANSITIONS = {
  [JAM_STATUS.DRAFT]: [JAM_STATUS.SCHEDULED, JAM_STATUS.ACTIVE],
  [JAM_STATUS.SCHEDULED]: [JAM_STATUS.ACTIVE, JAM_STATUS.DRAFT],
  [JAM_STATUS.ACTIVE]: [JAM_STATUS.ENDED],
  [JAM_STATUS.ENDED]: [JAM_STATUS.ARCHIVED],
  [JAM_STATUS.ARCHIVED]: [],
};

// ===== PARTICIPATION TYPE =====

/**
 * The kind of contribution a Jam accepts.
 * @typedef {'video'|'image'|'post'|'poll'|'location'|'skill'|'gig'} ParticipationType
 */
export const PARTICIPATION_TYPE = {
  VIDEO: 'video',
  IMAGE: 'image',
  POST: 'post',
  POLL: 'poll',
  LOCATION: 'location',
  SKILL: 'skill',
  GIG: 'gig',
};

// ===== CONTRIBUTION STATUS =====

/**
 * State of an individual contribution within a Jam.
 * @typedef {'pending'|'approved'|'rejected'|'featured'} ContributionStatus
 */
export const CONTRIBUTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FEATURED: 'featured',
};

// ===== JAM CATEGORIES =====

/**
 * Predefined Jam categories for discovery and filtering.
 */
export const JAM_CATEGORIES = {
  CREATOR: 'creator',
  MTAAI: 'mtaani',
  SKILLS: 'skills',
  GIGS: 'gigs',
  FARM: 'farm',
  GAMING: 'gaming',
  MUSIC: 'music',
  CHALLENGE: 'challenge',
  COMMUNITY: 'community',
  OTHER: 'other',
};

// ===== SCHEMA CONSTANTS =====

/** Maximum title length for a Jam. */
export const JAM_TITLE_MAX = 120;

/** Maximum description length for a Jam. */
export const JAM_DESCRIPTION_MAX = 2000;

/** Maximum prompt length (the call-to-action). */
export const JAM_PROMPT_MAX = 500;

/** Minimum participants for a Jam to be considered "popular". */
export const JAM_POPULARITY_THRESHOLD = 1000;

/** Maximum number of participation types per Jam. */
export const MAX_PARTICIPATION_TYPES = 3;

// ===== JAM ENTITY =====

/**
 * @typedef {Object} Jam
 * @property {string} id - Unique identifier (UUID).
 * @property {string} creatorId - User ID of the Jam host.
 * @property {string} title - Jam title (max 120 chars).
 * @property {string} [description] - Detailed description (max 2000 chars).
 * @property {string} [coverMediaUrl] - Hero image or video URL.
 * @property {string} [prompt] - Call-to-action text (max 500 chars).
 * @property {JamStatus} status - Current lifecycle state.
 * @property {ParticipationType[]} participationTypes - Accepted contribution types.
 * @property {string} [category] - Jam category for discovery.
 * @property {Object} [location] - { lat, lng, name, county }.
 * @property {string} [deadline] - ISO 8601 timestamp for Jam end.
 * @property {number} participantCount - Denormalized participant count.
 * @property {number} contributionCount - Denormalized contribution count.
 * @property {string[]} tags - Searchable tags.
 * @property {Object} [metadata] - Extensible key-value store.
 * @property {string} createdAt - ISO 8601 timestamp.
 * @property {string} updatedAt - ISO 8601 timestamp.
 */

// ===== PARTICIPATION ENTITY =====

/**
 * A user's intent to participate in a Jam.
 * @typedef {Object} Participation
 * @property {string} id - Unique identifier (UUID).
 * @property {string} jamId - Jam being participated in.
 * @property {string} userId - Participant user ID.
 * @property {string} joinedAt - ISO 8601 timestamp.
 * @property {boolean} isHost - Whether this user is the Jam creator.
 */

// ===== CONTRIBUTION ENTITY =====

/**
 * An actual submission within a Jam.
 * @typedef {Object} Contribution
 * @property {string} id - Unique identifier (UUID).
 * @property {string} jamId - Jam this belongs to.
 * @property {string} participationId - Link to the participation record.
 * @property {string} userId - Contributor user ID.
 * @property {ParticipationType} type - Type of contribution.
 * @property {string} contentUrl - URL to the contributed media/post.
 * @property {string} [textContent] - Text accompanying the contribution.
 * @property {Object} [location] - { lat, lng, name } if location-type.
 * @property {ContributionStatus} status - Review status.
 * @property {number} voteCount - Denormalized vote count.
 * @property {string} createdAt - ISO 8601 timestamp.
 */

// ===== REACTION ENTITY =====

/**
 * A vote or reaction on a contribution.
 * @typedef {Object} Reaction
 * @property {string} id - Unique identifier (UUID).
 * @property {string} contributionId - Contribution being reacted to.
 * @property {string} userId - User who reacted.
 * @property {'upvote'|'downvote'|'fire'|'clap'|'love'} type - Reaction type.
 * @property {string} createdAt - ISO 8601 timestamp.
 */

// ===== LEADERBOARD ENTRY =====

/**
 * Computed leaderboard position for a Jam participant.
 * @typedef {Object} LeaderboardEntry
 * @property {string} userId - Participant user ID.
 * @property {string} username - Display name.
 * @property {string} avatarUrl - Profile picture URL.
 * @property {number} contributionCount - Total contributions.
 * @property {number} voteCount - Total votes received.
 * @property {number} rank - Position on the leaderboard.
 */

// ===== HELPER FUNCTIONS =====

/**
 * Check whether a Jam can transition to a new status.
 * @param {JamStatus} current - Current status.
 * @param {JamStatus} next - Desired next status.
 * @returns {boolean}
 */
export function canTransition(current, next) {
  return JAM_STATUS_TRANSITIONS[current]?.includes(next) ?? false;
}

/**
 * Check whether a Jam is accepting contributions.
 * @param {Jam} jam
 * @returns {boolean}
 */
export function isJamOpen(jam) {
  if (jam.status !== JAM_STATUS.ACTIVE) return false;
  if (jam.deadline && new Date(jam.deadline) < new Date()) return false;
  return true;
}

/**
 * Check whether a Jam has ended (explicitly or by deadline).
 * @param {Jam} jam
 * @returns {boolean}
 */
export function isJamEnded(jam) {
  if (jam.status === JAM_STATUS.ENDED || jam.status === JAM_STATUS.ARCHIVED) {
    return true;
  }
  if (jam.deadline && new Date(jam.deadline) < new Date()) {
    return true;
  }
  return false;
}

/**
 * Compute remaining time for an active Jam.
 * @param {Jam} jam
 * @returns {{ hours: number, minutes: number, expired: boolean } | null}
 */
export function getRemainingTime(jam) {
  if (!jam.deadline) return null;
  const now = Date.now();
  const end = new Date(jam.deadline).getTime();
  const diff = end - now;
  if (diff <= 0) return { hours: 0, minutes: 0, expired: true };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes, expired: false };
}
