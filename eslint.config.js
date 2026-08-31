// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', 'coverage/*'],
  },
  {
    // Build and tooling scripts run under Node, not Metro.
    files: ['scripts/**/*.js', '*.config.js', 'jest.resolver.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        module: 'writable',
        process: 'readonly',
        require: 'readonly',
      },
    },
  },
  {
    rules: {
      // eslint-config-expo 57 turned on the React Compiler rules. Three of them
      // fire on code that is correct here, so they stay visible as warnings
      // rather than failing the build.
      //
      // immutability: Reanimated's whole API is assigning to `sharedValue.value`.
      // The rule reads that as mutating a value returned by a hook.
      'react-hooks/immutability': 'off',
      // set-state-in-effect: the effects that trip this load persisted state or
      // run a timed reveal, which is what effects are for.
      'react-hooks/set-state-in-effect': 'warn',
      // refs: `totalRef.current = total` during render keeps the timer callback
      // off a stale count. Worth revisiting, not worth rewriting before a release.
      'react-hooks/refs': 'warn',
    },
  },
];
