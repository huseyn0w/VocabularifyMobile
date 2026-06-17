/**
 * Jest setup, registered via `setupFilesAfterEnv`.
 *
 * Wires up the native-module mocks the app depends on so components and hooks
 * can render under the jsdom/jest-expo environment without touching real
 * native code: AsyncStorage, gesture-handler, reanimated, NativeWind and
 * expo-font.
 */

/* eslint-disable @typescript-eslint/no-var-requires */

// --- AsyncStorage ----------------------------------------------------------
// Official jest mock shipped by the library.
jest.mock(
  '@react-native-async-storage/async-storage',
  () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// --- gesture-handler -------------------------------------------------------
// Registers the documented jest setup (no-op gesture components, etc).
import 'react-native-gesture-handler/jestSetup';

// --- reanimated ------------------------------------------------------------
// Reanimated 3 ships a jest mock. Calling its setup installs no-op worklets,
// shared values and timing helpers so animated components render statically.
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  // The mock doesn't provide `useReducedMotion`; the app calls it everywhere.
  Reanimated.useReducedMotion = () => false;
  return Reanimated;
});

// Reanimated's mock leaves `call` referencing the (now stubbed) native module;
// silence the warning it logs on setup.
// eslint-disable-next-line no-undef
(global as any).__reanimatedWorkletInit = () => {};

// --- expo-font -------------------------------------------------------------
// Screens gate rendering on fonts being loaded; pretend they always are.
jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
  isLoaded: () => true,
  loadAsync: () => Promise.resolve(),
}));

// --- console noise ---------------------------------------------------------
// Keep test output readable: swallow the expected reanimated/NativeWind warns.
const originalWarn = console.warn;
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    const msg = String(args[0] ?? '');
    if (
      msg.includes('useNativeDriver') ||
      msg.includes('Reanimated') ||
      msg.includes('not supported')
    ) {
      return;
    }
    originalWarn(...(args as []));
  });
});

afterEach(() => {
  jest.clearAllMocks();
});
