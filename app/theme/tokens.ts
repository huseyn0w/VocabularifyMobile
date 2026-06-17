/**
 * Design tokens — single source of truth for the Vocabularify "midnight gallery" system.
 *
 * These raw values mirror the CSS variables defined in `global.css` and the
 * Tailwind theme in `tailwind.config.js`. Use these constants from non-className
 * code (reanimated worklets, React Navigation options, StatusBar, etc.) so the
 * whole app references one palette.
 *
 * Palette rationale:
 *  - Dark is the signature: a near-black "gallery at night" surface that reads
 *    expensive and lets the typography and one jewel accent carry the identity.
 *  - The accent is a brushed brass (deep bronze in light mode) — a single,
 *    metallic jewel tone used sparingly (primary actions, active tab, the
 *    flashcard's progress + glow). Never a fill across large areas.
 *  - Light mode is a true-neutral gallery white (deliberately NOT a warm cream),
 *    so the system stays distinctive in both schemes.
 */

export const palette = {
  light: {
    /** Gallery white — true neutral, no warm tint. */
    bg: '#FAFAF9',
    /** Slightly raised surface (sheets, grouped sections). */
    surface: '#FFFFFF',
    /** Cards / elevated surfaces. */
    card: '#FFFFFF',
    /** Higher elevation (popovers, pressed cards). */
    elevated: '#FFFFFF',
    /** Hairline borders / dividers. */
    border: '#E7E6E3',
    /** Primary text — near-black. */
    ink: '#16151A',
    /** Secondary / muted text. */
    inkMuted: '#5E5C66',
    /** Tertiary text (captions, disabled). */
    inkSubtle: '#8E8C95',
    /** Single jewel accent — deep bronze (the brass, darkened for light surfaces). */
    accent: '#8A6D28',
    /** Soft accent for glows / tints (low-opacity brass). */
    accentSoft: '#C9A24B',
    /** Text/icon color that sits on top of the accent. */
    accentForeground: '#FAFAF9',
  },
  dark: {
    /** Midnight-gallery background — near-black. */
    bg: '#0B0B0D',
    /** Raised surface. */
    surface: '#141417',
    /** Cards / elevated surfaces (lighter than bg for elevation in the dark). */
    card: '#17171B',
    /** Higher elevation. */
    elevated: '#1F1F24',
    /** Hairline borders / dividers. */
    border: '#2D2D34',
    /** Primary text — warm off-white. */
    ink: '#F2EFE8',
    /** Secondary / muted text. */
    inkMuted: '#9F9A91',
    /** Tertiary text. */
    inkSubtle: '#706C64',
    /** Accent — brushed brass. */
    accent: '#C9A24B',
    /** Soft accent for glows / tints. */
    accentSoft: '#C9A24B',
    accentForeground: '#1A1505',
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

/**
 * Letter-spacing for display type (px). Fraunces wants a slight negative track
 * at large sizes to feel set, not loose.
 */
export const letterSpacing = {
  display: -0.5,
  displayTight: -1,
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
 * the Tailwind boxShadow utilities for parity. Shadows read in light mode; in
 * the dark "gallery" scheme depth comes mainly from the lighter card surface +
 * hairline border, with the `glow` token adding a faint brass halo on the hero.
 */
export const shadow = {
  sm: {
    native: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
    web: '0 1px 2px rgba(0, 0, 0, 0.06)',
  },
  md: {
    native: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 14,
      elevation: 4,
    },
    web: '0 4px 14px rgba(0, 0, 0, 0.1)',
  },
  lg: {
    native: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.16,
      shadowRadius: 32,
      elevation: 14,
    },
    web: '0 16px 32px rgba(0, 0, 0, 0.16)',
  },
  /**
   * Brass halo for the flashcard hero. Uses the soft-accent color so it reads as
   * a refined glow in dark and a subtle warm lift in light. Pair with the
   * resolved `accentSoft` as shadowColor at call sites that switch by scheme.
   */
  glow: {
    native: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 36,
      elevation: 16,
    },
  },
} as const;

export const tokens = {
  palette,
  fontFamily,
  fontSize,
  letterSpacing,
  spacing,
  radii,
  duration,
  easing,
  shadow,
} as const;

export default tokens;
