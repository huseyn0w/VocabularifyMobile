import { useColorScheme as useRNColorScheme } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { palette } from '../theme/tokens';

/**
 * Resolves the active token palette (light/dark) for the few places that need a
 * concrete color value rather than a `className` — e.g. vector icons, the
 * StatusBar, navigation options, and reanimated worklets.
 *
 * Reads the user's theme preference from ThemeContext and falls back to the
 * system scheme when set to "system", mirroring the same resolution the rest of
 * the app (and NativeWind) uses. This is the single source of truth: values
 * come from `app/theme/tokens.ts`, never hardcoded hex.
 */
export function useThemeColors() {
  const { themeType } = useThemeContext();
  const systemScheme = useRNColorScheme();

  const resolved =
    themeType === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeType;

  return palette[resolved];
}

export default useThemeColors;
