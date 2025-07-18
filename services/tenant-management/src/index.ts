import { TenantManagementService } from './tenant-management-service';

const PORT = process.env['TENANT_MANAGEMENT_PORT'] || 3009;

const service = new TenantManagementService({
  port: parseInt(PORT.toString()),
  name: 'tenant-management',
  version: '1.0.0',
  environment: process.env['NODE_ENV'] || 'development'
});

service.start(); 