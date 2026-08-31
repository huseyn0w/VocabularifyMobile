/**
 * Jest module resolver.
 *
 * react-native-worklets (pulled in by Reanimated 4) resolves to a `.native`
 * implementation that reaches for the real native module, which does not exist
 * under jest. The library ships a resolver that drops the `.native` extensions
 * so the stub is picked up instead, but pointing jest at it would replace React
 * Native's own resolver, which deletes the `exports` map from the react-native
 * package so subpaths stay mockable. This applies the worklets filter and then
 * hands the request to React Native's resolver.
 */
const reactNativeResolver = require('@react-native/jest-preset/jest/resolver');

module.exports = (request, options) => {
  if (
    options.basedir.includes('react-native-worklets') ||
    request.includes('react-native-worklets')
  ) {
    options = {
      ...options,
      extensions: options.extensions?.filter((ext) => !ext.includes('native')),
    };
  }

  return reactNativeResolver(request, options);
};
