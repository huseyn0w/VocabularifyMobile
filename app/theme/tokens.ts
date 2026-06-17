/**
 * Design tokens — single source of truth for the Vocabularify "quiet luxury" system.
 *
 * These raw values mirror the CSS variables defined in `global.css` and the
 * Tailwind theme in `tailwind.config.js`. Use these constants from non-className
 * code (reanimated worklets, React Navigation options, StatusBar, etc.) so the
 * whole app references one palette.
 *
 * Palette rationale:
 *  - Warm, paper-like neutrals instead of clinical greys.
 *  - A single restrained accent: a warm terracotta "clay". It reads premium and
 *    editorial against the warm-paper surfaces, and deliberately avoids the
 *    generic AI indigo/violet. Used sparingly (primary actions, the active tab,
 *    focus accents) — never as a fill across large areas.
 */

export const palette = {
  light: {
    /** Warm near-white app background ("paper"). */
    bg: '#F7F5F1',
    /** Slightly raised surface (sheets, grouped sections). */
    surface: '#FFFFFF',
    /** Cards / elevated surfaces. */
    card: '#FFFFFF',
    /** Higher elevation (popovers, pressed cards). */
    elevated: '#FFFFFF',
    /** Hairline borders / dividers. */
    border: '#E6E2DA',
    /** Primary text — near-black, warm. */
    ink: '#1A1916',
    /** Secondary / muted text. */
    inkMuted: '#736E64',
    /** Tertiary text (captions, disabled). */
    inkSubtle: '#A7A195',
    /** Single restrained accent — warm terracotta clay. */
    accent: '#B65C3F',
    /** Text/icon color that sits on top of the accent. */
    accentForeground: '#FBF7F3',
  },
  dark: {
    /** True-deep, slightly warm background. */
    bg: '#0E0E10',
    /** Raised surface. */
    surface: '#161618',
    /** Cards / elevated surfaces. */
    card: '#1A1A1D',
    /** Higher elevation. */
    elevated: '#222226',
    /** Hairline borders / dividers. */
    border: '#2C2C30',
    /** Primary text — warm off-white. */
    ink: '#F4F2EE',
    /** Secondary / muted text. */
    inkMuted: '#A09B92',
    /** Tertiary text. */
    inkSubtle: '#6E6A63',
    /** Accent — slightly lifted for contrast on dark surfaces. */
    accent: '#D6764F',
    accentForeground: '#1A1209',
  },
} as const;

export const fontFamily = {
  /** Refined geometric grotesk for all UI text. */
  sans: 'PlusJakartaSans_400Regular',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansSemibold: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
  /** Old-style soft-serif display, used for the flashcard word. */
  display: 'Fraunces_500Medium',
  displaySemibold: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
} as const;

/** Type scale (px). */
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
} as const;

/** Spacing scale (px) — 4pt base. */
export const spacing = {
  px: 1,
  0.5: 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/** Corner radii (px). */
export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 9999,
} as const;

/** Motion durations (ms). */
export const duration = {
  fast: 150,
  base: 220,
  slow: 320,
  slower: 480,
} as const;

/** Easing curves for reanimated / Animated. */
export const easing = {
  /** Standard "ease-out-quint"-ish curve for entrances. */
  standard: [0.2, 0.8, 0.2, 1] as const,
  /** Gentle settle. */
  soft: [0.33, 1, 0.68, 1] as const,
} as const;

/**
 * Shadow tokens. RN consumes the `native` variants; the `web` string mirrors
 * the Tailwind boxShadow utilities for parity.
 */
export const shadow = {
  sm: {
    native: {
      shadowColor: '#1A1916',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
    web: '0 1px 2px rgba(26, 25, 22, 0.06)',
  },
  md: {
    native: {
      shadowColor: '#1A1916',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    web: '0 4px 12px rgba(26, 25, 22, 0.08)',
  },
  lg: {
    native: {
      shadowColor: '#1A1916',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 28,
      elevation: 12,
    },
    web: '0 12px 28px rgba(26, 25, 22, 0.12)',
  },
} as const;

export const tokens = {
  palette,
  fontFamily,
  fontSize,
  spacing,
  radii,
  duration,
  easing,
  shadow,
} as const;

export default tokens;
