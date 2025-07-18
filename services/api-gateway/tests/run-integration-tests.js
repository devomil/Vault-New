#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting API Gateway Integration Tests...\n');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

// Run the integration tests
const testProcess = spawn('node', ['node_modules/.bin/jest', 'tests/integration/gateway.integration.test.ts', '--verbose'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  env: { ...process.env }
});

testProcess.on('close', (code) => {
  console.log(`\n✨ Integration tests completed with exit code: ${code}`);
  process.exit(code);
});

testProcess.on('error', (error) => {
  console.error('❌ Failed to run integration tests:', error);
  process.exit(1);
}); 