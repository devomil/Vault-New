const { defaults } = require('jest-config');

module.exports = {
  ...defaults,
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/?(*.)+(spec|test).ts',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/../../jest.setup.js'],
  moduleNameMapper: {
    '^@vault/shared-types$': '<rootDir>/../../shared/types/src',
    '^@vault/shared-middleware$': '<rootDir>/../../shared/middleware/src',
    '^@vault/shared-database$': '<rootDir>/../../shared/database/src',
    '^@vault/shared-config$': '<rootDir>/../../shared/config/src',
  },
  testTimeout: 20000,
}; 