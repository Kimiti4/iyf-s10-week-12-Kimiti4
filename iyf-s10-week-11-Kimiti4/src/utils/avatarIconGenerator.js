/**
 * 🔹 Avatar Icon Generator - Unique Fun Icons for Blank Profiles
 * Generates consistent, memorable icons based on user characteristics
 */

// ===== Icon Categories =====
const ICON_CATEGORIES = {
  animals: ['🦁', '🐘', '🦒', '🦓', '🐃', '🦏', '🐆', '🐪', '🦛', '🦍', '🐅', '🦌'],
  nature: ['🌍', '🌟', '🔥', '💎', '🚀', '⚡', '🌈', '🌊', '🌋', '🌙', '☀️', '⭐'],
  creative: ['🎨', '🎭', '🎪', '🎬', '🎸', '🎺', '🎻', '🎲', '🎯', '🎮', '🎹', '🎤'],
  achievement: ['👑', '🛡️', '⚔️', '🏆', '🎖️', '🏅', '🥇', '🎗️', '💪', '🌟', '✨', '💫'],
  plants: ['🌺', '🌸', '🍀', '🌻', '🌹', '🌷', '🌼', '🌵', '🌲', '🌳', '🍃', '🌿'],
  food: ['🍕', '🍔', '🌮', '🍜', '🍣', '🍰', '🍩', '☕', '🍵', '🧁', '🍦', '🥐']
};

const ALL_ICONS = Object.values(ICON_CATEGORIES).flat();

/**
 * Generate a deterministic icon based on user ID or username
 * Same user always gets the same icon
 */
function getIconForUser(userId, username) {
  // Create a hash from userId or username
  const seed = userId || username || 'default';
  const hash = simpleHash(seed);
  
  // Use hash to select icon deterministically
  const index = Math.abs(hash) % ALL_ICONS.length;
  return ALL_ICONS[index];
}

/**
 * Get icon based on user's first post category (personalized)
 */
function getIconByInterest(category) {
  const categoryIcons = {
    mtaani: ['🏘️', '🏠', '👥', '🤝', '🌆', '🏙️'],
    skill: ['💼', '🛠️', '💻', '📚', '🎓', '✏️'],
    farm: ['🌾', '🚜', '🌱', '🥕', '🌽', '🍅'],
    gig: ['💰', '💵', '📋', '✅', '🎯', '⚡'],
    alert: ['🚨', '⚠️', '📢', '🔔', '📣', '🆘']
  };
  
  const icons = categoryIcons[category] || ICON_CATEGORIES.animals;
  const randomIndex = Math.floor(Math.random() * icons.length);
  return icons[randomIndex];
}

/**
 * Get icon based on organization type
 */
function getIconForOrg(orgType) {
  const orgIcons = {
    school: ['🏫', '📚', '✏️', '🎓', '📖', '👨‍🏫'],
    university: ['🎓', '🏛️', '📚', '🔬', '🧪', '📐'],
    estate: ['🏘️', '🏠', '🏡', '🌳', '🌺', '👨‍👩‍👧‍👦'],
    church: ['⛪', '🙏', '✝️', '🕊️', '💒', '📿'],
    ngo: ['🤝', '❤️', '🌍', '👥', '🌟', '💪'],
    sme: ['💼', '🏪', '📈', '💰', '🎯', '🚀'],
    coworking: ['🏢', '💻', '☕', '🤝', '💡', '🌐'],
    community: ['👥', '🤝', '🌟', '❤️', '🎉', '🎊'],
    youth_group: ['🌟', '🎯', '💪', '🚀', '🎨', '🎭'],
    professional: ['💼', '👔', '📊', '🎯', '💡', '🏆']
  };
  
  const icons = orgIcons[orgType] || ICON_CATEGORIES.achievement;
  const randomIndex = Math.floor(Math.random() * icons.length);
  return icons[randomIndex];
}

/**
 * Generate a random fun icon (for new users without history)
 */
function getRandomIcon() {
  const randomCategory = Object.keys(ICON_CATEGORIES)[
    Math.floor(Math.random() * Object.keys(ICON_CATEGORIES).length)
  ];
  const icons = ICON_CATEGORIES[randomCategory];
  return icons[Math.floor(Math.random() * icons.length)];
}

/**
 * Get themed icon set for a group/community
 */
function getThemedIconSet(theme, count = 5) {
  const themes = {
    safari: ICON_CATEGORIES.animals,
    tech: ['💻', '🚀', '⚡', '💡', '🔧', '🛠️', '📱', '🌐'],
    nature: ICON_CATEGORIES.nature,
    arts: ICON_CATEGORIES.creative,
    business: ICON_CATEGORIES.achievement,
    wellness: ICON_CATEGORIES.plants,
    food: ICON_CATEGORIES.food
  };
  
  const icons = themes[theme] || ALL_ICONS;
  const shuffled = [...icons].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Simple hash function for deterministic icon selection
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

/**
 * Get icon with background color suggestion
 */
function getIconWithStyle(icon) {
  const colorMap = {
    // Animals - Earth tones
    '🦁': '#FFA500', '🐘': '#808080', '🦒': '#FFD700',
    // Nature - Vibrant
    '🌍': '#4169E1', '🌟': '#FFD700', '🔥': '#FF4500',
    // Creative - Artistic
    '🎨': '#FF69B4', '🎭': '#9370DB', '🎸': '#8B4513',
    // Achievement - Gold/Silver
    '👑': '#FFD700', '🏆': '#FFD700', '💎': '#00CED1',
    // Plants - Green
    '🌺': '#FF69B4', '🌸': '#FFB6C1', '🍀': '#228B22'
  };
  
  return {
    icon,
    backgroundColor: colorMap[icon] || '#6B7280', // Default gray
    textColor: '#FFFFFF'
  };
}

module.exports = {
  getIconForUser,
  getIconByInterest,
  getIconForOrg,
  getRandomIcon,
  getThemedIconSet,
  getIconWithStyle,
  ALL_ICONS,
  ICON_CATEGORIES
};
