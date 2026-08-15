/**
 * Profile Service
 * Helpers for managing profile-related data and preferences
 */

/**
 * Generate initials from a profile name
 * @param {string} name
 * @returns {string}
 */
export const getProfileInitials = (name = '') => {
  return name.trim().slice(0, 1).toUpperCase() || 'U';
};

/**
 * Get a deterministic color for a profile
 * @param {string} name
 * @returns {string} hex color
 */
const PROFILE_COLOR_PALETTE = [
  '#e50914', '#0071eb', '#e5b012', '#2db836', '#8a2be2',
  '#ff6b35', '#00bcd4', '#ff4081', '#795548', '#607d8b',
];

export const getProfileColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PROFILE_COLOR_PALETTE[Math.abs(hash) % PROFILE_COLOR_PALETTE.length];
};

/**
 * Validate a profile name
 * @param {string} name
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateProfileName = (name = '') => {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, error: 'Name cannot be empty.' };
  if (trimmed.length < 1) return { valid: false, error: 'Name is too short.' };
  if (trimmed.length > 50) return { valid: false, error: 'Name must be 50 characters or less.' };
  return { valid: true };
};

/**
 * Sort My List items by date added (most recent first)
 * @param {Array} list
 * @returns {Array}
 */
export const sortMyList = (list = []) => {
  return [...list].reverse(); // Most recently added first
};

/**
 * Check maturity level for kids profiles
 * @param {object} profile
 * @param {number} contentRating
 * @returns {boolean}
 */
export const isContentAllowed = (profile, contentRating = 0) => {
  if (!profile?.isKids) return true;
  return contentRating <= 7; // Kids level threshold
};
