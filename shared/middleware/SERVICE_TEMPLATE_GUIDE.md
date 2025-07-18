# Service Template Guide
## Vault Microservices Development Pattern

This guide explains how to use the `ServiceTemplate` to create new microservices in the Vault modernization project.

---

## 🏗️ **Service Template Overview**

The `ServiceTemplate` provides a standardized foundation for all microservices with:
- **Multi-tenant support** with RLS integration
- **Health checks** and service discovery
- **Comprehensive logging** and error handling
- **Database integration** with Prisma
- **Graceful shutdown** handling

---

## 📁 **Service Structure**

```
services/[service-name]/
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── src/
│   ├── index.ts             # Service entry point
│   ├── [service-name]-service.ts  # Main service class
│   └── [other-files].ts     # Additional service logic
└── tests/                   # Test files
```

---

## 🚀 **Quick Start: Creating a New Service**

### 1. **Create Service Directory**
```bash
mkdir services/[service-name]
cd services/[service-name]
```

### 2. **Create package.json**
```json
{
  "name": "@vault/[service-name]",
  "version": "1.0.0",
  "description": "[Service Description]",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "@prisma/client": "^6.11.1",
    "@vault/shared-middleware": "*",
    "@vault/shared-database": "*",
    "express": "^4.18.2",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.0"
  }
}
```

### 3. **Create tsconfig.json**
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": false,
    "declaration": true,
    "declarationMap": true,
    "strict": false,
    "noImplicitAny": false,
    "exactOptionalPropertyTypes": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### 4. **Create Service Class**
```typescript
import { Request, Response } from 'express';
import { ServiceTemplate, ServiceConfig } from '@vault/shared-middleware';

export class [ServiceName]Service extends ServiceTemplate {
  constructor(config: ServiceConfig) {
    super(config);
  }

  protected setupServiceRoutes(): void {
    // Define your service-specific routes here
    this.app.get('/api/v1/[resource]', (req, res) => this.get[Resource](req, res));
    this.app.post('/api/v1/[resource]', (req, res) => this.create[Resource](req, res));
    // ... more routes
  }

  protected getServiceDescription(): string {
    return '[Your service description]';
  }

  protected getServiceEndpoints(): string[] {
    return [
      'GET /api/v1/[resource]',
      'POST /api/v1/[resource]',
      // ... list all your endpoints
    ];
  }

  // Implement your service methods
  private get[Resource] = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate tenant context
      if (!req.tenantContext) {
        res.status(401).json({ error: 'Tenant context required' });
        return;
      }

      // Your business logic here
      const data = await this.prisma.[table].findMany({
        where: { tenantId: req.tenantContext.tenantId }
      });

      res.json({ data, tenantId: req.tenantContext.tenantId });
    } catch (error) {
      this.logger.error('Error getting [resource]', { error });
      res.status(500).json({ error: 'Failed to get [resource]' });
    }
  };

  // ... more methods
}
```

### 5. **Create Entry Point**
```typescript
import { [ServiceName]Service } from './[service-name]-service';

const config = {
  name: '[Service Name]',
  port: parseInt(process.env['PORT'] || '300[X]'),
  version: process.env['VERSION'] || '1.0.0',
  environment: process.env['NODE_ENV'] || 'development'
};

async function main() {
  const service = new [ServiceName]Service(config);
  
  try {
    await service.start();
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      await service.shutdown();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      await service.shutdown();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start service:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
```

---

## 🔑 **Key Features**

### **Multi-Tenant Support**
- All endpoints automatically validate tenant context
- Database queries are filtered by tenant via RLS
- Tenant context available as `req.tenantContext`

### **Health Checks**
- Automatic `/health` endpoint with database connectivity check
- Service info at `/info` endpoint
- Built-in uptime and environment information

### **Logging**
- Structured logging with Winston
- Automatic tenant context in log entries
- Error tracking with stack traces

### **Error Handling**
- Comprehensive error middleware
- Proper HTTP status codes
- Error logging with context

---

## 🧪 **Testing Your Service**

### **Start the Service**
```bash
cd services/[service-name]
npm install
npm run dev
```

### **Test Health Check**
```bash
curl http://localhost:300[X]/health
```

### **Test with Tenant Context**
```bash
curl -H "x-tenant-id: your-tenant-id" http://localhost:300[X]/api/v1/[resource]
```

---

## 📋 **Service Ports**

Assign unique ports to each service:
- Product Intelligence: 3001
- Marketplace Integration: 3002
- Vendor Integration: 3003
- Order Processing: 3004
- Pricing Engine: 3005
- Inventory Management: 3006
- Accounting System: 3007
- Analytics Engine: 3008
- API Gateway: 3000

---

## 🔧 **Best Practices**

1. **Always validate tenant context** in your endpoints
2. **Use proper error handling** with try-catch blocks
3. **Log important operations** with tenant context
4. **Keep endpoints RESTful** and consistent
5. **Use TypeScript** for type safety
6. **Test thoroughly** before deploying

---

## 🚀 **Next Steps**

1. **Implement business logic** in your service methods
2. **Add input validation** using Zod or similar
3. **Implement caching** for frequently accessed data
4. **Add rate limiting** per tenant
5. **Set up monitoring** and metrics
6. **Create comprehensive tests**

---

## 📚 **References**

- [ServiceTemplate Source](../src/service-template.ts)
- [Product Intelligence Example](../../services/product-intelligence/src/product-intelligence-service.ts)
- [Database Schema](../../../shared/database/prisma/schema.prisma)
- [RLS Documentation](../../../shared/database/README.md) 