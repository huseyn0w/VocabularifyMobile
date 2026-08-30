import React, { useMemo } from "react";
import {
  View,
  ViewStyle,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";

/**
 * The field the flashcard sits on, ported from Desktop.
 *
 * Desktop paints two things behind the word: a soft vignette where light pools
 * at the top of the window and settles into the field, and one brass glow
 * breathing behind the word itself - the single light source the whole design
 * is built around.
 *
 * React Native has no radial gradient and the app carries no gradient library,
 * so each one is drawn as a stack of concentric circles at a low constant
 * opacity. Overlapping them gives a roughly linear ramp toward the centre.
 * Banding is invisible here because both gradients run between colours a few
 * per cent apart: the vignette is #0F1217 to #1B1E25, and the glow is brass at
 * 18% at its strongest.
 */

interface RadialProps {
  color: string;
  /** Diameter of the outermost circle. */
  size: number;
  /** Centre, in pixels from the top-left of the parent. Omit both to render
   *  a zero-size box instead, which a flex parent can centre for you. */
  x?: number;
  y?: number;
  /** Opacity the centre should reach. Each layer gets the fraction that
   *  composites to this once all of them are stacked. */
  peak: number;
  layers?: number;
  /** Squashes the circle vertically. 1 is round. */
  flatten?: number;
}

const Radial: React.FC<RadialProps> = ({
  color,
  size,
  x,
  y,
  peak,
  layers = 18,
  flatten = 1,
}) => {
  // Stacking n layers at alpha a composites to 1 - (1 - a)^n, so invert that
  // to hit `peak` at the centre rather than guessing per-layer values.
  const opacity = 1 - Math.pow(1 - peak, 1 / layers);

  const rings = useMemo(
    () =>
      peak <= 0
        ? []
        : Array.from({ length: layers }, (_, i) => {
            // Squaring the step packs the rings tightly at the rim, where the
            // eye catches an edge, and spreads them at the centre. Evenly
            // spaced rings read as visible bands.
            const d = size * (1 - i / layers) ** 2;
            return { key: i, d, offset: -d / 2 };
          }),
    [layers, size, peak],
  );

  if (rings.length === 0) return null;

  // Circles inside a vertically scaled wrapper. Squashing each ring by giving
  // it a smaller height instead would not work: React Native clamps
  // borderRadius to half the shortest side, so a flattened "circle" comes out
  // a stadium with straight sides, and stacking those shows every edge.
  const placement: ViewStyle =
    x === undefined || y === undefined
      ? { width: 0, height: 0 }
      : { position: "absolute", left: x, top: y };

  return (
    <View
      pointerEvents="none"
      style={[placement, { transform: [{ scaleY: flatten }] }]}
    >
      {rings.map((ring) => (
        <View
          key={ring.key}
          style={{
            position: "absolute",
            left: ring.offset,
            top: ring.offset,
            width: ring.d,
            height: ring.d,
            borderRadius: ring.d / 2,
            backgroundColor: color,
            opacity,
          }}
        />
      ))}
    </View>
  );
};

/** Reads the alpha Desktop states on `--glow`, so the strength lives in the
 *  palette rather than being restated here. */
const glowStrength = (glow: string): number => {
  const match = /rgba\([^)]*,\s*([\d.]+)\s*\)/.exec(glow);
  return match ? Number(match[1]) : 0;
};

/**
 * The one brass light source, centred on whatever it is placed behind. Drop it
 * into a flex container as an absolute overlay: anchoring it to the text means
 * it stays behind the text on any screen height, which a fraction-of-the-screen
 * position does not.
 */
export const WordGlow: React.FC = () => {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      className="items-center justify-center"
    >
      <Radial
        color={colors.accent}
        size={width * 1.05}
        peak={glowStrength(colors.glow)}
        layers={40}
        flatten={0.42}
      />
    </View>
  );
};

/** The field: the base colour plus Desktop's top vignette, where light pools
 *  above the window and settles into the ground. */
const AmbientBackground: React.FC = () => {
  const colors = useThemeColors();
  const { width, height } = useWindowDimensions();

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]}
    >
      <Radial
        color={colors.surface}
        size={width * 2.2}
        x={width / 2}
        y={-height * 0.1}
        peak={0.85}
        layers={24}
        flatten={0.62}
      />
    </View>
  );
};

export default AmbientBackground;
