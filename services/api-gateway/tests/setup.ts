// Test setup for API Gateway

// Set test environment
process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-secret-key';

// Global test timeout
jest.setTimeout(30000); 