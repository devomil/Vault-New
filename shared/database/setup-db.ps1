# Database Setup Script for Vault Modernization
# This script helps set up the database with proper environment variables

Write-Host "🚀 Setting up Vault Database..." -ForegroundColor Green

# Set environment variables
$env:DATABASE_URL = "postgresql://vault:vaultpass@localhost:5433/vault"

Write-Host "📋 Environment variables set:" -ForegroundColor Yellow
Write-Host "DATABASE_URL: $env:DATABASE_URL" -ForegroundColor Cyan

# Check if we can connect to the database
Write-Host "🔍 Checking database connection..." -ForegroundColor Yellow

try {
    # Try to run a simple Prisma command to test connection
    npx prisma db pull --force
    Write-Host "✅ Database connection successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Database connection failed. Please ensure:" -ForegroundColor Red
    Write-Host "   - PostgreSQL is running on localhost:5433" -ForegroundColor Red
    Write-Host "   - Database 'vault' exists" -ForegroundColor Red
    Write-Host "   - User 'vault' with password 'vaultpass' exists" -ForegroundColor Red
    Write-Host "   - Or start Docker with: docker compose up -d db" -ForegroundColor Red
    exit 1
}

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

# Run migrations
Write-Host "📦 Running database migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name init

# Seed the database
Write-Host "🌱 Seeding database with sample data..." -ForegroundColor Yellow
npm run db:seed

# Set up test data for development
Write-Host "🧪 Setting up test data for development..." -ForegroundColor Yellow
Write-Host "   - Test tenant: test-tenant-123" -ForegroundColor Cyan
Write-Host "   - Test data seeding available for all 12 services" -ForegroundColor Cyan
Write-Host "   - Use test tenant ID in service tests" -ForegroundColor Cyan
Write-Host "   - All services: Product Intelligence, Marketplace Integration, Vendor Integration" -ForegroundColor Cyan
Write-Host "   - Order Processing, Pricing Engine, Inventory Management, Accounting System" -ForegroundColor Cyan
Write-Host "   - Analytics Engine, Notification Service, Performance Optimization, Security & Compliance" -ForegroundColor Cyan

Write-Host "🎉 Database setup completed successfully!" -ForegroundColor Green
Write-Host "📊 You can now:" -ForegroundColor Cyan
Write-Host "   - View data with: npm run db:studio" -ForegroundColor Cyan
Write-Host "   - Reset database with: npm run db:reset" -ForegroundColor Cyan
Write-Host "   - Check status with: npm run db:status" -ForegroundColor Cyan
Write-Host "   - Run tests with: npm test" -ForegroundColor Cyan 