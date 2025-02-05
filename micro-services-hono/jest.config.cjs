module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/src/.*)\\.js$': '$1.ts'
  },
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  testMatch: ['**/tests/**/*.test.ts'],
};