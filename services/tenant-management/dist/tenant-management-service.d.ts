import { ServiceTemplate, ServiceConfig } from '@vault/shared-middleware';
export declare class TenantManagementService extends ServiceTemplate {
    constructor(config: ServiceConfig);
    protected setupServiceRoutes(): void;
    protected getServiceDescription(): string;
    protected getServiceEndpoints(): string[];
    private createTenant;
    private getTenants;
    private getTenant;
    private updateTenant;
    private deleteTenant;
    private activateTenant;
    private suspendTenant;
    private createUser;
    private getUsers;
    private getUser;
    private updateUser;
    private deleteUser;
    private login;
    private register;
    private refreshToken;
    private logout;
    private getTenantConfig;
    private updateTenantConfig;
    private getTenantUsage;
    private generateTenantSlug;
    private generateJwtToken;
}
//# sourceMappingURL=tenant-management-service.d.ts.map