#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Vault Modernization development environment...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully');
  } else {
    console.log('❌ env.example not found. Please create .env manually.');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

// Check if Docker is running
try {
  execSync('docker --version', { stdio: 'pipe' });
  console.log('✅ Docker is available');
} catch (error) {
  console.log('❌ Docker is not available. Please install Docker Desktop.');
  process.exit(1);
}

// Check if docker-compose is available
try {
  execSync('docker-compose --version', { stdio: 'pipe' });
  console.log('✅ Docker Compose is available');
} catch (error) {
  console.log('❌ Docker Compose is not available. Please install Docker Compose.');
  process.exit(1);
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.log('❌ Failed to install dependencies');
  process.exit(1);
}

// Install shared database dependencies
console.log('\n🗄️ Setting up database dependencies...');
try {
  execSync('cd shared/database && npm install', { stdio: 'inherit' });
  console.log('✅ Database dependencies installed');
} catch (error) {
  console.log('❌ Failed to install database dependencies');
  process.exit(1);
}

// Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('cd shared/database && npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.log('❌ Failed to generate Prisma client');
  process.exit(1);
}

console.log('\n🎉 Development environment setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Start the development environment: npm run dev:docker');
console.log('2. Run database migrations: npm run db:migrate');
console.log('3. Seed the database: npm run db:seed');
console.log('4. Access development tools:');
console.log('   - API Gateway: http://localhost:3000');
console.log('   - Database Admin: http://localhost:8080');
console.log('   - Redis Commander: http://localhost:8081');
console.log('\n📚 For more information, see README.md'); 