import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'manager';
  tenantId: string;
  tenantName: string;
  permissions: string[];
}

interface Tenant {
  id: string;
  name: string;
  domain: string;
  settings: {
    theme: 'light' | 'dark';
    timezone: string;
    currency: string;
  };
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, tenantId?: string) => Promise<void>;
  logout: () => void;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshToken: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const tenantId = localStorage.getItem('current_tenant');

      if (token) {
        try {
          // For now, just set a mock user if token exists
          const mockUser: User = {
            id: '1',
            email: 'admin@demo.com',
            name: 'Demo Admin',
            role: 'admin',
            tenantId: tenantId || 'demo-tenant',
            tenantName: 'Demo Company',
            permissions: ['read', 'write', 'admin']
          };

          const mockTenant: Tenant = {
            id: tenantId || 'demo-tenant',
            name: 'Demo Company',
            domain: 'demo-company.com',
            settings: {
              theme: 'light',
              timezone: 'UTC',
              currency: 'USD'
            }
          };

          setUser(mockUser);
          setTenant(mockTenant);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('current_tenant');
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string, tenantId?: string) => {
    try {
      setIsLoading(true);

      // Mock login - in real app this would call API
      const mockUser: User = {
        id: '1',
        email: email,
        name: email.split('@')[0],
        role: 'admin',
        tenantId: tenantId || 'demo-tenant',
        tenantName: 'Demo Company',
        permissions: ['read', 'write', 'admin']
      };

      const mockTenant: Tenant = {
        id: tenantId || 'demo-tenant',
        name: 'Demo Company',
        domain: 'demo-company.com',
        settings: {
          theme: 'light',
          timezone: 'UTC',
          currency: 'USD'
        }
      };

      // Store mock token
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('current_tenant', mockTenant.id);

      // Update state
      setUser(mockUser);
      setTenant(mockTenant);

      console.log(`Welcome back, ${mockUser.name}!`);
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_tenant');

    // Clear state
    setUser(null);
    setTenant(null);

    console.log('Logged out successfully');
    navigate('/login');
  };

  // Switch tenant function
  const switchTenant = async (tenantId: string) => {
    try {
      setIsLoading(true);

      // Mock tenant switch
      const mockTenant: Tenant = {
        id: tenantId,
        name: 'New Company',
        domain: 'new-company.com',
        settings: {
          theme: 'light',
          timezone: 'UTC',
          currency: 'USD'
        }
      };

      // Update token
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('current_tenant', tenantId);

      // Update state
      setTenant(mockTenant);

      console.log(`Switched to ${mockTenant.name}`);
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Tenant switch failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      // Mock token refresh
      localStorage.setItem('auth_token', 'mock-token-refreshed');
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    tenant,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    switchTenant,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 