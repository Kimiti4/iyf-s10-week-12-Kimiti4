/**
 * 🎨 JamiiLink Design System & Icon Library
 * Whimsical, Fun, and Unique UI Components
 * All SVG-based icons (no emojis!)
 */

// ============================================
// COLOR PALETTE - Warm, Inclusive, Energetic
// ============================================
export const colors = {
  // Primary - Kenyan inspired (emerald green + burnt orange)
  primary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Main green (hope, growth)
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  // Secondary - Accent (burnt orange - energy, community)
  accent: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // Main orange
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  // Status colors
  success: '#22C55E',
  warning: '#FBBF24',
  danger: '#EF4444',
  info: '#3B82F6',

  // Neutral
  neutral: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
  },

  // Community colors (for different communities/reputation levels)
  community: {
    local: '#10B981',      // Local helper (turquoise)
    skilled: '#8B5CF6',    // Skilled trader (purple)
    verified: '#F59E0B',   // Verified user (amber)
    official: '#3B82F6',   // Official source (blue)
  },
};

// ============================================
// TYPOGRAPHY - Clear, Friendly, Professional
// ============================================
export const typography = {
  // Fonts
  fontFamily: {
    display: "'Inter var', sans-serif", // Headlines
    body: "'Inter var', sans-serif",    // Body text
    mono: "'Fira Code', monospace",     // Code/prices
  },

  // Sizes (in px)
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },

  // Font weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line heights (for readability)
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// ============================================
// SPACING - Consistent & Predictable
// ============================================
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

// ============================================
// BORDER RADIUS - Friendly & Modern
// ============================================
export const borderRadius = {
  none: '0px',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
};

// ============================================
// SHADOWS - Depth & Hierarchy
// ============================================
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

// ============================================
// TRANSITIONS - Smooth & Delightful
// ============================================
export const transitions = {
  fast: 'all 0.15s ease-in-out',
  base: 'all 0.2s ease-in-out',
  slow: 'all 0.3s ease-in-out',
};

export const themes = {
  light: {
    bg: colors.neutral[50],
    bgSecondary: colors.neutral[100],
    text: colors.neutral[900],
    textSecondary: colors.neutral[600],
    border: colors.neutral[200],
  },
  dark: {
    bg: colors.neutral[900],
    bgSecondary: colors.neutral[800],
    text: colors.neutral[50],
    textSecondary: colors.neutral[300],
    border: colors.neutral[700],
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  themes,
};
