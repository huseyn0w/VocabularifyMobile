/**
 * Design tokens - single source of truth for the Vocabularify palette.
 *
 * These raw values mirror the CSS variables in `global.css` and the Tailwind
 * theme in `tailwind.config.js`. Use them from non-className code (reanimated
 * worklets, React Navigation options, StatusBar) so the whole app references
 * one palette.
 *
 * The palette is Desktop's, converted from its OKLCH source to sRGB hex once
 * here rather than being re-eyeballed. Desktop keeps the authoritative values
 * in `index.html`; the OKLCH triple sits in a comment beside each colour so a
 * change on either side is a mechanical re-conversion, not a guess.
 *
 *  - Dark is the signature: a cool near-black field with a single brass light
 *    source behind the word.
 *  - Light is a cool paper white, deliberately not a warm cream, so the two
 *    schemes read as the same product.
 *  - The accent is brass, used only for the glow, the progress fill and the
 *    hairline under a word the learner has already met.
 *  - `swipeForward` and `swipeBack` are the only two hues outside Desktop's
 *    palette. Desktop has no drag, so it has nothing to borrow from. They are
 *    built the same way as everything else here: the accent's lightness with
 *    the hue rotated to green and to yellow, so they sit in the same family
 *    rather than reading as system green and system yellow. Light mode's
 *    yellow is darker than its dark-mode twin because a bright yellow on a
 *    near-white field is not a border, it is a smudge.
 *
 * Like `glow` and `tokenLine`, both are read from a reanimated worklet and
 * never from a `className`, which is why they have no entry in `global.css`.
 *
 * React Native has no colour function, so the alpha-over-background values
 * Desktop writes as `oklch(... / 0.09)` are pre-composited here.
 */

export const palette = {
  light: {
    /** Field. oklch(0.975 0.003 264) */
    bg: "#F6F7F9",
    /** Raised surface - the card, the gloss bubble. oklch(0.99 0.002 264) */
    surface: "#FBFCFD",
    card: "#FBFCFD",
    elevated: "#FBFCFD",
    /** Hairline. Desktop: black at 7% over the field. */
    border: "#E5E6E8",
    /** Primary text. oklch(0.20 0.014 264) */
    ink: "#13161D",
    /** Secondary text. oklch(0.50 0.012 264) */
    inkMuted: "#60636A",
    /** Tertiary text (captions, disabled). */
    inkSubtle: "#999BA0",
    /** Brass. oklch(0.55 0.10 70) */
    accent: "#966626",
    accentSoft: "#966626",
    accentForeground: "#F6F7F9",
    /** Progress track. Desktop: black at 9% over the field. */
    track: "#E0E1E3",
    /** No light source in light mode. Desktop sets `--target-glow:
     *  transparent` here and keeps `--glow` at 8%, which on a 460x240 window
     *  is a faint warmth; spread over a phone-sized field the same 8% brass
     *  over a near-white ground reads as a pink stain. The light scheme is a
     *  flat field, which is what Desktop's actually looks like. */
    glow: "rgba(150, 102, 38, 0)",
    /** Halo on the word itself. Desktop: `--target-glow: transparent`. */
    textGlow: "transparent",
    /** Underline on a token whose word the learner has already met. */
    tokenLine: "rgba(150, 102, 38, 0.38)",
    /** Card border while dragging forward. oklch(0.55 0.13 150) */
    swipeForward: "#298646",
    /** Card border while dragging back. oklch(0.62 0.11 88) */
    swipeBack: "#A2822A",
  },
  dark: {
    /** Field. oklch(0.18 0.012 264) */
    bg: "#0F1217",
    /** Raised surface. oklch(0.235 0.014 264) */
    surface: "#1B1E25",
    card: "#1B1E25",
    elevated: "#1B1E25",
    /** Hairline. Desktop: white at 9% over the field. */
    border: "#25272C",
    /** Primary text - warm off-white against the cool field. oklch(0.965 0.014 90) */
    ink: "#F7F3E9",
    /** Secondary text. oklch(0.70 0.012 264) */
    inkMuted: "#9B9EA6",
    /** Tertiary text. */
    inkSubtle: "#666970",
    /** Brass. oklch(0.80 0.085 82) */
    accent: "#D9B97E",
    accentSoft: "#D9B97E",
    accentForeground: "#272117",
    /** Progress track. Desktop: white at 10% over the field. */
    track: "#272A2E",
    glow: "rgba(217, 185, 126, 0.18)",
    /** Desktop: `--target-glow: oklch(0.80 0.085 82 / 0.18)`. */
    textGlow: "rgba(217, 185, 126, 0.18)",
    tokenLine: "rgba(217, 185, 126, 0.32)",
    /** Card border while dragging forward. oklch(0.80 0.13 150) */
    swipeForward: "#7CD591",
    /** Card border while dragging back. oklch(0.86 0.15 100) */
    swipeBack: "#E8D34F",
  },
} as const;

/**
 * Weights, not families. Desktop sets no font of its own - it renders in the
 * system UI face and carries its voice in weight and tracking. React Native
 * does the same when `fontFamily` is left unset, so the app now inherits San
 * Francisco on iOS and Roboto on Android and the two products match.
 */
export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

/** Type scale (px). */
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
  "6xl": 60,
} as const;

/** Spacing scale (px) - 4pt base. */
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
  "2xl": 28,
  full: 9999,
} as const;

/**
 * Tracking. Desktop sets -0.02em on the word and -0.01em on a sentence; at the
 * sizes those render, that is roughly -1px and -0.3px.
 */
export const letterSpacing = {
  display: -1,
  displayTight: -1.6,
  sentence: -0.3,
} as const;

/** Motion durations (ms). Desktop's entrance is 420ms on a 0.22/1/0.36/1 curve. */
export const duration = {
  fast: 150,
  base: 220,
  slow: 320,
  slower: 420,
} as const;

/** Easing curves. `standard` is Desktop's `--ease-out`. */
export const easing = {
  standard: [0.22, 1, 0.36, 1] as const,
  soft: [0.33, 1, 0.68, 1] as const,
} as const;

/**
 * Shadows. Desktop uses none: depth comes from the radial light behind the
 * word and a hairline on raised surfaces. These stay for the list and sheet
 * surfaces, which need an edge on a phone that a 460x240 desktop card does
 * not. `glow` is the brass halo on the card - pair it with the resolved
 * `accentSoft` as `shadowColor`.
 */
export const shadow = {
  sm: {
    native: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
    web: "0 1px 2px rgba(0, 0, 0, 0.06)",
  },
  md: {
    native: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 14,
      elevation: 4,
    },
    web: "0 4px 14px rgba(0, 0, 0, 0.1)",
  },
  lg: {
    native: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.16,
      shadowRadius: 32,
      elevation: 14,
    },
    web: "0 16px 32px rgba(0, 0, 0, 0.16)",
  },
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
  fontWeight,
  fontSize,
  letterSpacing,
  spacing,
  radii,
  duration,
  easing,
  shadow,
} as const;

export default tokens;
