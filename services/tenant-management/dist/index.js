"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tenant_management_service_1 = require("./tenant-management-service");
const PORT = process.env['TENANT_MANAGEMENT_PORT'] || 3009;
const service = new tenant_management_service_1.TenantManagementService({
    port: parseInt(PORT.toString()),
    name: 'tenant-management',
    version: '1.0.0',
    environment: process.env['NODE_ENV'] || 'development'
});
service.start();
//# sourceMappingURL=index.js.map