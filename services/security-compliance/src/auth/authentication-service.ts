import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface User {
  id: string;
  username: string;
  email: string;
  tenantId: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
}

export interface LoginResult {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: User;
  error?: string;
}

export interface TokenValidationResult {
  valid: boolean;
  user?: User;
  error?: string;
}

export class AuthenticationService {
  private users: Map<string, User> = new Map();
  private refreshTokens: Map<string, { userId: string; tenantId: string; expiresAt: number }> = new Map();
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env['JWT_SECRET'] || 'your-super-secret-jwt-key';
    this.initializeMockUsers();
  }

  private initializeMockUsers(): void {
    // Mock users for testing
    const mockUsers: User[] = [
      {
        id: 'user-001',
        username: 'admin',
        email: 'admin@example.com',
        tenantId: 'tenant-001',
        role: 'admin',
        isActive: true
      },
      {
        id: 'user-002',
        username: 'user1',
        email: 'user1@example.com',
        tenantId: 'tenant-001',
        role: 'user',
        isActive: true
      },
      {
        id: 'user-003',
        username: 'manager',
        email: 'manager@example.com',
        tenantId: 'tenant-002',
        role: 'manager',
        isActive: true
      }
    ];

    mockUsers.forEach(user => {
      this.users.set(user.id, user);
    });
  }

  async login(username: string, password: string, tenantId: string): Promise<LoginResult> {
    try {
      // Find user by username and tenant
      const user = Array.from(this.users.values()).find(
        u => u.username === username && u.tenantId === tenantId && u.isActive
      );

      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // In a real implementation, you would verify the password hash
      // For mock purposes, we'll accept any password for demo users
      const isValidPassword = await this.verifyPassword(password, 'hashedPassword');
      
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // Generate tokens
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Store refresh token
      this.refreshTokens.set(refreshToken, {
        userId: user.id,
        tenantId: user.tenantId,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      });

      // Update last login
      user.lastLogin = new Date().toISOString();
      this.users.set(user.id, user);

      logger.info(`User ${username} logged in successfully`, { userId: user.id, tenantId });

      return {
        success: true,
        token,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          tenantId: user.tenantId,
          role: user.role,
          isActive: user.isActive,
          ...(user.lastLogin && { lastLogin: user.lastLogin })
        }
      };
    } catch (error) {
      logger.error('Login error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  async logout(_token: string, tenantId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, you would blacklist the token
      // For mock purposes, we'll just return success
      logger.info('User logged out', { tenantId });
      return { success: true };
    } catch (error) {
      logger.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  }

  async refreshToken(refreshToken: string, tenantId: string): Promise<LoginResult> {
    try {
      const tokenData = this.refreshTokens.get(refreshToken);
      
      if (!tokenData || tokenData.tenantId !== tenantId || tokenData.expiresAt < Date.now()) {
        return {
          success: false,
          error: 'Invalid or expired refresh token'
        };
      }

      const user = this.users.get(tokenData.userId);
      if (!user || !user.isActive) {
        return {
          success: false,
          error: 'User not found or inactive'
        };
      }

      // Generate new tokens
      const newToken = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Remove old refresh token and store new one
      this.refreshTokens.delete(refreshToken);
      this.refreshTokens.set(newRefreshToken, {
        userId: user.id,
        tenantId: user.tenantId,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      });

      return {
        success: true,
        token: newToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          tenantId: user.tenantId,
          role: user.role,
          isActive: user.isActive,
          ...(user.lastLogin && { lastLogin: user.lastLogin })
        }
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      return {
        success: false,
        error: 'Token refresh failed'
      };
    }
  }

  async validateToken(token: string, tenantId: string): Promise<TokenValidationResult> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
      if (!decoded || decoded.tenantId !== tenantId) {
        return {
          valid: false,
          error: 'Invalid token'
        };
      }

      const user = this.users.get(decoded.userId);
      if (!user || !user.isActive || user.tenantId !== tenantId) {
        return {
          valid: false,
          error: 'User not found or inactive'
        };
      }

              return {
          valid: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            tenantId: user.tenantId,
            role: user.role,
            isActive: user.isActive,
            ...(user.lastLogin && { lastLogin: user.lastLogin })
          }
        };
    } catch (error) {
      logger.error('Token validation error:', error);
      return {
        valid: false,
        error: 'Token validation failed'
      };
    }
  }

  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: '1h' });
  }

  private generateRefreshToken(_user: User): string {
    return uuidv4();
  }

  private async verifyPassword(_password: string, _hashedPassword: string): Promise<boolean> {
    // In a real implementation, you would compare with the actual hash
    // For mock purposes, we'll accept any password
    return true;
  }

  async createUser(userData: Omit<User, 'id'>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const userId = uuidv4();
      const user: User = {
        id: userId,
        ...userData
      };

      this.users.set(userId, user);
      
      logger.info('User created successfully', { userId, username: user.username, tenantId: user.tenantId });

      return {
        success: true,
        user
      };
    } catch (error) {
      logger.error('Create user error:', error);
      return {
        success: false,
        error: 'Failed to create user'
      };
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = this.users.get(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const updatedUser = { ...user, ...updates };
      this.users.set(userId, updatedUser);

      logger.info('User updated successfully', { userId, tenantId: user.tenantId });

      return {
        success: true,
        user: updatedUser
      };
    } catch (error) {
      logger.error('Update user error:', error);
      return {
        success: false,
        error: 'Failed to update user'
      };
    }
  }

  async deactivateUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = this.users.get(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      user.isActive = false;
      this.users.set(userId, user);

      logger.info('User deactivated successfully', { userId, tenantId: user.tenantId });

      return { success: true };
    } catch (error) {
      logger.error('Deactivate user error:', error);
      return {
        success: false,
        error: 'Failed to deactivate user'
      };
    }
  }
} 