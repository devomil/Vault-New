# Database Package

This package contains the Prisma schema, migrations, and database utilities for the Vault modernization project.

## Setup

### Prerequisites
- PostgreSQL database (local or Docker)
- Node.js 18+
- Docker Desktop (for containerized setup)

### Environment Variables
Create a `.env` file in the `shared/database` directory:

```env
DATABASE_URL="postgresql://vault:vaultpass@localhost:5433/vault?schema=vault"
```

**Note**: The database runs on port 5433 (not 5432) to avoid conflicts with local PostgreSQL installations.

### Installation
```bash
npm install
```

## Database Operations

### Generate Prisma Client
```bash
npm run db:generate
```

### Run Migrations
```bash
# Create and apply a new migration
npm run db:migrate

# Deploy migrations to production
npm run db:migrate:deploy

# Check migration status
npm run db:status

# Reset database (development only)
npm run db:reset
```

### Seed Database
```bash
npm run db:seed
```

### Open Prisma Studio
```bash
npm run db:studio
```

## Schema Overview

The database schema includes 15 tables in the `vault` schema:

### Core Tables
- **tenants** - Multi-tenant organization data
- **users** - User accounts with tenant isolation
- **products** - Product catalog with variants
- **product_variants** - Product variations and attributes

### Integration Tables
- **marketplaces** - Marketplace configurations (Amazon, Walmart, etc.)
- **marketplace_listings** - Product listings on marketplaces
- **marketplace_orders** - Orders from marketplaces
- **vendors** - Vendor configurations (Ingram, Tech Data, etc.)
- **vendor_products** - Vendor product catalog
- **vendor_orders** - Purchase orders to vendors

### Business Logic Tables
- **orders** - Order management with line items
- **order_items** - Order line items
- **pricing_rules** - Pricing rules and logic
- **inventory** - Stock levels and inventory management

## Multi-Tenant Design

All tables include `tenantId` for data isolation. The schema supports:
- Row-level security through tenant context (planned)
- Tenant-specific configurations stored in JSON fields
- Isolated data access patterns
- Tenant status and lifecycle management

## Current Demo Data

The database is seeded with:
- **1 Demo Tenant**: "Demo Tenant" with comprehensive configuration
- **1 Admin User**: admin@demo-tenant.com with admin role
- **2 Sample Products**: DEMO-001 and DEMO-002 with variants
- **1 Marketplace**: Amazon Demo with US configuration
- **1 Vendor**: Ingram Micro Demo with warehouse settings
- **Inventory Records**: Stock levels for all products

## Usage in Services

```typescript
import { prisma, databaseService } from '@vault/shared-database';

// Basic query with tenant isolation
const products = await prisma.product.findMany({
  where: { tenantId: 'tenant-uuid' }
});

// Health check
const isHealthy = await databaseService.healthCheck();

// Get database stats
const stats = await databaseService.getStats();
```

## Multi-Service Support

The database schema supports all 12 microservices with comprehensive functionality:

### Core Services (Phase 2)
- **Tenant Management Service** (port 3009): Complete lifecycle management with 25 tests passing
- **Product Intelligence Service** (port 3001): Product analysis and recommendations with 7 tests passing
- **Marketplace Integration Service** (port 3002): Multi-marketplace connectors with 21 tests passing
- **Vendor Integration Service** (port 3003): Vendor management with 27 tests passing
- **Order Processing Service** (port 3004): Order lifecycle with 25 tests passing
- **Pricing Engine Service** (port 3005): Dynamic pricing with 17 tests passing

### Advanced Services (Phase 3)
- **Analytics Engine Service** (port 3008): Business intelligence with 15 tests passing
- **Notification Service** (port 3010): Multi-channel notifications with 12 tests passing
- **Performance Optimization Service** (port 3011): Caching and monitoring with 34 tests passing
- **Security & Compliance Service** (port 3012): Auth and compliance with 42 tests passing

### Supporting Services
- **Inventory Management Service** (port 3006): Stock management with 7 tests passing
- **Accounting System Service** (port 3007): Financial tracking with 4 tests passing

All services include comprehensive CRUD operations, tenant isolation, and integration testing.

## Docker Development

When using Docker Compose:

1. Start the infrastructure services:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. Run migrations:
   ```bash
   cd shared/database
   npm run db:migrate
   ```

3. Seed the database:
   ```bash
   npm run db:seed
   ```

4. Access database admin:
   - **Adminer**: http://localhost:8080
   - **Prisma Studio**: `npm run db:studio`

## Migration Workflow

1. **Development**: Use `npm run db:migrate` to create and apply migrations
2. **Staging**: Use `npm run db:migrate:deploy` to apply existing migrations
3. **Production**: Use `npm run db:migrate:deploy` with proper backup procedures

## Current Migration

- **Initial Migration**: `20250707181404_init`
  - Creates all 15 tables in the `vault` schema
  - Sets up proper relationships and constraints
  - Configures tenant isolation patterns

## Prisma Configuration

- **Version**: 6.11.1 (latest stable)
- **Schema**: `vault` (isolated from public schema)
- **Database**: PostgreSQL 15
- **Connection**: Port 5433 with schema isolation
- **Client Generation**: Compatible with all microservices
- **Version Sync**: All services use matching Prisma versions

## Troubleshooting

### Connection Issues
- Verify DATABASE_URL is correct (port 5433)
- Ensure PostgreSQL Docker container is running
- Check that the `vault` schema exists
- Verify firewall/network settings

### Migration Issues
- Reset database: `npm run db:reset`
- Check migration status: `npm run db:status`
- Review migration files in `prisma/migrations/`
- Ensure Prisma Client is generated: `npm run db:generate`

### Schema Issues
- The database uses the `vault` schema, not `public`
- All tables are prefixed with the schema name
- Connection string must include `?schema=vault`

## Performance Considerations

- **Connection Pooling**: Configured for optimal performance
- **Indexes**: Proper indexing on tenant and foreign keys
- **JSON Fields**: Used for flexible configuration storage
- **Relationships**: Optimized for multi-tenant queries 

## Product Intelligence Service Test Setup

- Jest/Supertest integration tests require tenant context (set via middleware or x-tenant-id header)
- Ensure `.env` in `services/product-intelligence` uses port 5433
- All test requests must include tenant context or will receive 401 Unauthorized
- Workspace/test script issues resolved by adding minimal test scripts to shared workspaces 

## Testing and Development

### Test Data Seeding
The database includes comprehensive test data seeding for development and testing:

#### Tenant Seeding
```typescript
// Example: Creating test tenant for service testing
await prisma.tenant.upsert({
  where: { id: 'test-tenant-123' },
  update: {},
  create: {
    id: 'test-tenant-123',
    name: 'Test Tenant',
    slug: 'test-tenant',
    status: 'active'
  }
});
```

#### Service-Specific Test Data
- **Product Intelligence**: Demo products with variants and analytics
- **Marketplace Integration**: Demo marketplaces with listings and orders
- **Vendor Integration**: Demo vendors with products and orders
- **Order Processing**: Demo orders with items and status history
- **Pricing Engine**: Demo pricing rules with conditions and actions

### Validation Best Practices
When implementing new services, follow these validation patterns:

#### Input Validation
```typescript
// Example: Pricing rule validation
if (!name || typeof name !== 'string' || name.trim() === '') {
  res.status(400).json({ error: 'Invalid or missing name' });
  return;
}
```

#### Tenant Context Validation
```typescript
// Always validate tenant context
if (!req.tenantContext) {
  res.status(401).json({ error: 'Tenant context required' });
  return;
}
```

#### Database Operations
```typescript
// Use tenant isolation in all queries
const data = await prisma.table.findMany({
  where: { tenantId: req.tenantContext.tenantId }
});
``` 