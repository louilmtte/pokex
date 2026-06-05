/**
 * Tests ciblés sur la logique métier pure (`src/domain`). On utilise le
 * preset jest-expo pour la transpilation TS/Babel, et on limite le scope aux
 * tests du domaine — la couche UI relève des tests d'intégration/E2E.
 */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/domain/**/__tests__/**/*.test.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@shopify/react-native-skia|react-native-reanimated))',
  ],
};
