/**
 * JamiiLink Design System — JS compatibility layer
 *
 * Single source of truth is `tokens.css` (CSS custom properties).
 * This module re-exports values that match those tokens so existing
 * JS imports (e.g. HomePage) continue to work without a dual palette.
 *
 * Prefer CSS variables in new code:
 *   color: var(--brand-500);
 *   background: var(--surface);
 *
 * @module styles/designSystem
 */

export const colors = {
  primary: {
    50: '#f3f0ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },

  accent: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },

  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#0ea5e9',

  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  community: {
    local: '#14b8a6',
    skilled: '#8b5cf6',
    verified: '#f59e0b',
    official: '#0ea5e9',
  },
};

export const typography = {
  fontFamily: {
    display: "'Inter', ui-sans-serif, system-ui, sans-serif",
    body: "'Inter', ui-sans-serif, system-ui, sans-serif",
    mono: "'Fira Code', ui-monospace, monospace",
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

export const borderRadius = {
  none: '0px',
  sm: '8px',
  base: '12px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  full: '9999px',
};

export const shadows = {
  none: 'none',
  sm: '0 2px 6px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.25)',
  base: '0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.25)',
  md: '0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.25)',
  lg: '0 10px 30px rgba(0, 0, 0, 0.5), 0 4px 10px rgba(0, 0, 0, 0.3)',
  xl: '0 20px 50px rgba(0, 0, 0, 0.6), 0 8px 20px rgba(0, 0, 0, 0.35)',
  '2xl': '0 32px 64px rgba(0, 0, 0, 0.7)',
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '220ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '350ms cubic-bezier(0, 0, 0.2, 1)',
};

export const themes = {
  light: {
    bg: '#f8fafc',
    bgSecondary: '#f1f5f9',
    text: '#0f172a',
    textSecondary: '#475569',
    border: '#e2e8f0',
  },
  dark: {
    bg: '#080d1a',
    bgSecondary: '#111b30',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    border: 'rgba(139, 92, 246, 0.15)',
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
