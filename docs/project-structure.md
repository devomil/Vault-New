# Project Structure Documentation

## Overview

The Vault Modernization Platform is organized as a monorepo using npm workspaces, with clear separation between services, shared libraries, and infrastructure components.

## Directory Structure

```
Vault-New/
├── .github/                    # GitHub Actions workflows
│   └── workflows/
│       └── ci-cd.yml          # CI/CD pipeline
├── services/                   # Microservices (planned)
│   ├── api-gateway/           # API Gateway & routing
│   ├── product-intelligence/  # Product analysis
│   ├── marketplace-integration/ # Marketplace connectors
│   ├── vendor-integration/    # Vendor management
│   ├── order-processing/      # Order workflow
│   ├── pricing-engine/        # Dynamic pricing
│   ├── inventory-management/  # Stock management
│   ├── accounting-system/     # Financial tracking
│   └── analytics-engine/      # Business intelligence
├── shared/                    # Shared libraries
│   ├── types/                # TypeScript interfaces
│   ├── utils/                # Utility functions
│   ├── middleware/           # Common middleware
│   ├── database/             # Database utilities and Prisma schema
│   └── config/               # Configuration management
├── infrastructure/           # Infrastructure configs
│   ├── docker/              # Docker configurations
│   ├── kubernetes/          # K8s manifests
│   ├── scripts/             # Deployment scripts
│   └── monitoring/          # Monitoring setup
├── docs/                    # Documentation
├── .cursorrules             # Cursor IDE rules
├── docker-compose.yml       # Full service orchestration
├── docker-compose.dev.yml   # Infrastructure-only setup
├── Dockerfile               # Base service Dockerfile
├── package.json             # Root package.json with workspaces
├── tsconfig.json            # TypeScript configuration
├── jest.config.js           # Jest testing configuration
├── .eslintrc.js             # ESLint configuration
├── .prettierrc              # Prettier configuration
└── README.md                # Project overview
```

## Current Implementation Status

### ✅ Implemented Components

#### Infrastructure
- **Docker Setup**: Complete containerization with multi-stage builds
- **Database**: PostgreSQL 15 with Prisma ORM (v6.11.1)
- **Caching**: Redis 7 for caching and message queues
- **Admin Tools**: Adminer (port 8080) and Redis Commander (port 8081)

#### Database Layer
- **Schema**: 15 tables in `vault` schema with multi-tenant design
- **Migrations**: Prisma migrations with initial setup
- **Seeding**: Demo data with tenant, users, products, marketplaces, vendors
- **Isolation**: Schema isolation to avoid conflicts with local PostgreSQL

#### Development Environment
- **TypeScript**: Configured with strict mode and path aliases
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier for consistent code style
- **Testing**: Jest configuration ready
- **CI/CD**: GitHub Actions pipeline

### 🟡 In Progress

#### Database Security
- Row-level security (RLS) policies
- Tenant context functions
- Data migration scripts from legacy system

### 📋 Planned Components

#### Microservices
Each service will be implemented as a separate Node.js/TypeScript application:

1. **API Gateway** (Port 3000)
   - Request routing and load balancing
   - Authentication and authorization
   - Rate limiting and throttling
   - Request/response transformation

2. **Product Intelligence** (Port 3001)
   - Product analysis and insights
   - Market trend analysis
   - Competitive intelligence
   - Product recommendations

3. **Marketplace Integration** (Port 3002)
   - Amazon, Walmart, eBay connectors
   - Product listing management
   - Order synchronization
   - Inventory updates

4. **Vendor Integration** (Port 3003)
   - Ingram Micro, Tech Data connectors
   - Vendor catalog management
   - Purchase order processing
   - Pricing synchronization

5. **Order Processing** (Port 3004)
   - Order workflow management
   - Fulfillment coordination
   - Status tracking
   - Return processing

6. **Pricing Engine** (Port 3005)
   - Dynamic pricing algorithms
   - Competitive pricing
   - Government pricing compliance
   - Markup calculations

7. **Inventory Management** (Port 3006)
   - Stock level tracking
   - Reorder point management
   - Demand forecasting
   - Warehouse management

8. **Accounting System** (Port 3007)
   - Financial transaction processing
   - Revenue recognition
   - Cost tracking
   - Financial reporting

9. **Analytics Engine** (Port 3008)
   - Business intelligence
   - Performance metrics
   - Custom reporting
   - Data visualization

## Shared Libraries

### Types (`shared/types/`)
Common TypeScript interfaces and type definitions:
- Tenant and user types
- Product and inventory types
- Marketplace and vendor types
- Order and pricing types
- API request/response types

### Utils (`shared/utils/`)
Reusable utility functions:
- Date and time utilities
- String manipulation
- Validation helpers
- Encryption utilities
- Logging utilities

### Middleware (`shared/middleware/`)
Common Express.js middleware:
- Authentication middleware
- Tenant context middleware
- Error handling middleware
- Request logging middleware
- Rate limiting middleware

### Database (`shared/database/`)
Database utilities and Prisma integration:
- Prisma schema and migrations
- Database service utilities
- Health check functions
- Connection management
- Query builders

### Config (`shared/config/`)
Configuration management:
- Environment-specific configs
- Feature flags
- Service discovery
- External API configurations

## Infrastructure Components

### Docker (`infrastructure/docker/`)
- Service-specific Dockerfiles
- Multi-stage build configurations
- Development and production setups
- Health check configurations

### Kubernetes (`infrastructure/kubernetes/`)
- Service deployments
- Ingress configurations
- Service mesh setup
- Monitoring and logging

### Scripts (`infrastructure/scripts/`)
- Deployment scripts
- Database migration scripts
- Backup and restore scripts
- Environment setup scripts

### Monitoring (`infrastructure/monitoring/`)
- Prometheus configurations
- Grafana dashboards
- Alerting rules
- Log aggregation setup

## Development Workflow

### Local Development
1. Start infrastructure services: `npm run dev:docker`
2. Run database migrations: `npm run db:migrate`
3. Seed database: `npm run db:seed`
4. Start individual services (when implemented)

### Testing
- Unit tests: `npm test`
- Integration tests: `npm run test:integration`
- E2E tests: `npm run test:e2e`
- Coverage: `npm run test:coverage`

### Code Quality
- Linting: `npm run lint`
- Formatting: `npm run format`
- Type checking: `npm run type-check`

### Database Operations
- Migrations: `npm run db:migrate`
- Seeding: `npm run db:seed`
- Studio: `npm run db:studio`
- Reset: `npm run db:reset`

## Configuration Files

### Root Configuration
- `package.json`: Workspace definitions and scripts
- `tsconfig.json`: TypeScript compiler options
- `jest.config.js`: Testing framework configuration
- `.eslintrc.js`: Code linting rules
- `.prettierrc`: Code formatting rules

### Docker Configuration
- `Dockerfile`: Base service container
- `docker-compose.yml`: Full service orchestration
- `docker-compose.dev.yml`: Infrastructure-only setup
- `.dockerignore`: Docker build exclusions

### Environment Configuration
- `.env.example`: Environment variable template
- `shared/database/.env`: Database connection string
- Service-specific `.env` files (when implemented)

## Security Considerations

### Multi-Tenant Isolation
- Row-level security (RLS) policies
- Tenant context validation
- Data access controls
- API rate limiting per tenant

### Authentication & Authorization
- JWT token validation
- Role-based access control (RBAC)
- API key management
- OAuth integration

### Data Protection
- Encryption at rest and in transit
- Audit logging
- Data backup and recovery
- Compliance monitoring

## Performance Optimization

### Database
- Connection pooling
- Query optimization
- Indexing strategies
- Read replicas

### Caching
- Redis for session storage
- Application-level caching
- CDN integration
- Cache invalidation strategies

### Monitoring
- Application performance monitoring
- Database performance metrics
- Infrastructure monitoring
- Error tracking and alerting

## Deployment Strategy

### Environments
- **Development**: Local Docker setup
- **Staging**: Automated deployment from main branch
- **Production**: Manual deployment with approval process

### CI/CD Pipeline
- Automated testing on every commit
- Security scanning and vulnerability detection
- Docker image building and pushing
- Automated deployment to staging
- Manual deployment to production

### Infrastructure as Code
- Kubernetes manifests
- Terraform configurations
- Helm charts
- Monitoring and logging setup 

## Phase 2 Progress
- Product Intelligence Service: CRUD, analysis, and recommendations endpoints implemented
- Jest/Supertest integration tests passing (with tenant context)
- Workspace/test script issues resolved for all shared packages
- Tenant context required for all product endpoints (set via middleware in tests) 