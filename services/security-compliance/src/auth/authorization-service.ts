import { logger } from '../utils/logger';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  tenantId: string;
  permissions: Permission[];
  description: string;
  isActive: boolean;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason: string;
}

export class AuthorizationService {
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Mock permissions
    const mockPermissions: Permission[] = [
      { id: 'perm-001', name: 'Read Products', resource: 'products', action: 'read', description: 'Can read product information' },
      { id: 'perm-002', name: 'Write Products', resource: 'products', action: 'write', description: 'Can create and update products' },
      { id: 'perm-003', name: 'Delete Products', resource: 'products', action: 'delete', description: 'Can delete products' },
      { id: 'perm-004', name: 'Read Orders', resource: 'orders', action: 'read', description: 'Can read order information' },
      { id: 'perm-005', name: 'Write Orders', resource: 'orders', action: 'write', description: 'Can create and update orders' },
      { id: 'perm-006', name: 'Read Users', resource: 'users', action: 'read', description: 'Can read user information' },
      { id: 'perm-007', name: 'Write Users', resource: 'users', action: 'write', description: 'Can create and update users' },
      { id: 'perm-008', name: 'Admin Access', resource: '*', action: '*', description: 'Full administrative access' }
    ];

    mockPermissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });

    // Mock roles
    const mockRoles: Role[] = [
      {
        id: 'role-001',
        name: 'admin',
        tenantId: 'tenant-001',
        permissions: [mockPermissions[7]].filter(Boolean) as Permission[], // Admin Access
        description: 'Full administrative access',
        isActive: true
      },
      {
        id: 'role-002',
        name: 'manager',
        tenantId: 'tenant-001',
        permissions: [
          mockPermissions[0], // Read Products
          mockPermissions[1], // Write Products
          mockPermissions[3], // Read Orders
          mockPermissions[4], // Write Orders
          mockPermissions[5]  // Read Users
        ].filter(Boolean) as Permission[],
        description: 'Manager with product and order management access',
        isActive: true
      },
      {
        id: 'role-003',
        name: 'user',
        tenantId: 'tenant-001',
        permissions: [
          mockPermissions[0], // Read Products
          mockPermissions[3]  // Read Orders
        ].filter(Boolean) as Permission[],
        description: 'Standard user with read-only access',
        isActive: true
      }
    ];

    mockRoles.forEach(role => {
      this.roles.set(role.id, role);
    });
  }

  async checkPermission(token: string, resource: string, action: string, tenantId: string): Promise<PermissionCheckResult> {
    try {
      // In a real implementation, you would decode the JWT token to get user info
      // For mock purposes, we'll simulate token validation
      const userInfo = this.extractUserFromToken(token);
      
      if (!userInfo || userInfo.tenantId !== tenantId) {
        return {
          allowed: false,
          reason: 'Invalid token or tenant mismatch'
        };
      }

      // Get user's role
      const userRole = Array.from(this.roles.values()).find(
        role => role.name === userInfo.role && role.tenantId === tenantId && role.isActive
      );

      if (!userRole) {
        return {
          allowed: false,
          reason: 'User role not found or inactive'
        };
      }

      // Check if role has the required permission
      const hasPermission = userRole.permissions.some(permission => {
        // Check for wildcard permissions
        if (permission.resource === '*' && permission.action === '*') {
          return true;
        }
        
        // Check for resource wildcard
        if (permission.resource === '*' && permission.action === action) {
          return true;
        }
        
        // Check for action wildcard
        if (permission.resource === resource && permission.action === '*') {
          return true;
        }
        
        // Check exact match
        return permission.resource === resource && permission.action === action;
      });

      logger.info('Permission check', {
        userId: userInfo.userId,
        role: userInfo.role,
        resource,
        action,
        tenantId,
        allowed: hasPermission
      });

      return {
        allowed: hasPermission,
        reason: hasPermission ? '' : 'Insufficient permissions'
      };
    } catch (error) {
      logger.error('Permission check error:', error);
      return {
        allowed: false,
        reason: 'Permission check failed'
      };
    }
  }

  async getRoles(tenantId: string): Promise<Role[]> {
    try {
      const roles = Array.from(this.roles.values()).filter(
        role => role.tenantId === tenantId && role.isActive
      );

      logger.info('Retrieved roles', { tenantId, count: roles.length });

      return roles;
    } catch (error) {
      logger.error('Get roles error:', error);
      throw new Error('Failed to get roles');
    }
  }

  async createRole(name: string, permissions: string[], tenantId: string): Promise<{ success: boolean; role?: Role; error?: string }> {
    try {
      // Check if role already exists
      const existingRole = Array.from(this.roles.values()).find(
        role => role.name === name && role.tenantId === tenantId
      );

      if (existingRole) {
        return {
          success: false,
          error: 'Role already exists'
        };
      }

      // Get permission objects
      const permissionObjects = permissions
        .map(permId => this.permissions.get(permId))
        .filter(perm => perm !== undefined) as Permission[];

      const role: Role = {
        id: `role-${Date.now()}`,
        name,
        tenantId,
        permissions: permissionObjects,
        description: `Role: ${name}`,
        isActive: true
      };

      this.roles.set(role.id, role);

      logger.info('Role created successfully', { roleId: role.id, name, tenantId });

      return {
        success: true,
        role
      };
    } catch (error) {
      logger.error('Create role error:', error);
      return {
        success: false,
        error: 'Failed to create role'
      };
    }
  }

  async updateRole(roleId: string, updates: Partial<Role>): Promise<{ success: boolean; role?: Role; error?: string }> {
    try {
      const role = this.roles.get(roleId);
      if (!role) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      const updatedRole = { ...role, ...updates };
      this.roles.set(roleId, updatedRole);

      logger.info('Role updated successfully', { roleId, tenantId: role.tenantId });

      return {
        success: true,
        role: updatedRole
      };
    } catch (error) {
      logger.error('Update role error:', error);
      return {
        success: false,
        error: 'Failed to update role'
      };
    }
  }

  async deleteRole(roleId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const role = this.roles.get(roleId);
      if (!role) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      // Check if role is in use (in a real implementation)
      // For now, we'll just deactivate it
      role.isActive = false;
      this.roles.set(roleId, role);

      logger.info('Role deactivated successfully', { roleId, tenantId: role.tenantId });

      return { success: true };
    } catch (error) {
      logger.error('Delete role error:', error);
      return {
        success: false,
        error: 'Failed to delete role'
      };
    }
  }

  async getPermissions(): Promise<Permission[]> {
    try {
      return Array.from(this.permissions.values());
    } catch (error) {
      logger.error('Get permissions error:', error);
      throw new Error('Failed to get permissions');
    }
  }

  private extractUserFromToken(token: string): { userId: string; role: string; tenantId: string } | null {
    // In a real implementation, you would decode the JWT token
    // For mock purposes, we'll return a mock user based on the token
    if (token.includes('admin')) {
      return { userId: 'user-001', role: 'admin', tenantId: 'tenant-001' };
    } else if (token.includes('manager')) {
      return { userId: 'user-003', role: 'manager', tenantId: 'tenant-002' };
    } else {
      return { userId: 'user-002', role: 'user', tenantId: 'tenant-001' };
    }
  }
} 