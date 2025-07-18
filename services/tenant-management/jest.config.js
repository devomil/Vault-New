module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  moduleNameMapper: {
    '^@vault/shared-middleware$': '<rootDir>/../../shared/middleware/src',
    '^@vault/shared-database$': '<rootDir>/../../shared/database/src',
    '^@vault/shared-types$': '<rootDir>/../../shared/types/src'
  }
}; 