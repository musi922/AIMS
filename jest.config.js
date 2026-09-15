/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/unit/**/*.test.ts'],
  moduleNameMapper: {
    '^#cds-models/(.*)$': '<rootDir>/@cds-models/$1',
  },
  collectCoverage: true,
  collectCoverageFrom: ['srv/**/*.{js,ts}'],
  coveragePathIgnorePatterns: ['/node_modules/', '/gen/', '/dist/', '/srv/external/'],
  coverageReporters: ['text', 'lcov', 'html']
};