import axios from 'axios';

// Create axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 60000, // Increase timeout to 60 seconds for SP-API calls
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add tenant ID if available
    const tenantId = localStorage.getItem('current_tenant');
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshResponse = await api.post('/api/auth/refresh');
        const { token } = refreshResponse.data;

        // Update token
        localStorage.setItem('auth_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_tenant');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string; tenantId?: string }) =>
    api.post('/api/auth/login', credentials),
  
  logout: () => api.post('/api/auth/logout'),
  
  refresh: () => api.post('/api/auth/refresh'),
  
  me: () => api.get('/api/auth/me'),
  
  switchTenant: (tenantId: string) =>
    api.post('/api/auth/switch-tenant', { tenantId }),
};

export const dashboardAPI = {
  getOverview: () => api.get('/api/dashboard/overview'),
  
  getMetrics: (period: string) => api.get(`/api/dashboard/metrics?period=${period}`),
  
  getRecentActivity: () => api.get('/api/dashboard/recent-activity'),
};

export const productsAPI = {
  getProducts: (params?: any) => api.get('/api/products', { params }),
  
  getProduct: (id: string) => api.get(`/api/products/${id}`),
  
  createProduct: (data: any) => api.post('/api/products', data),
  
  updateProduct: (id: string, data: any) => api.put(`/api/products/${id}`, data),
  
  deleteProduct: (id: string) => api.delete(`/api/products/${id}`),
  
  getProductAnalytics: (id: string) => api.get(`/api/products/${id}/analytics`),
};

export const ordersAPI = {
  getOrders: (params?: any) => api.get('/api/orders', { params }),
  
  getOrder: (id: string) => api.get(`/api/orders/${id}`),
  
  createOrder: (data: any) => api.post('/api/orders', data),
  
  updateOrder: (id: string, data: any) => api.put(`/api/orders/${id}`, data),
  
  deleteOrder: (id: string) => api.delete(`/api/orders/${id}`),
  
  getOrderAnalytics: () => api.get('/api/orders/analytics'),
};

export const inventoryAPI = {
  getInventory: (params?: any) => api.get('/api/inventory', { params }),
  
  getInventoryItem: (id: string) => api.get(`/api/inventory/${id}`),
  
  updateInventory: (id: string, data: any) => api.put(`/api/inventory/${id}`, data),
  
  getInventoryAlerts: () => api.get('/api/inventory/alerts'),
  
  getInventoryAnalytics: () => api.get('/api/inventory/analytics'),
};

export const pricingAPI = {
  getPricingStrategies: () => api.get('/api/pricing/strategies'),
  
  calculatePrice: (data: any) => api.post('/api/pricing/calculate', data),
  
  updatePricingStrategy: (id: string, data: any) => api.put(`/api/pricing/strategies/${id}`, data),
  
  getCompetitorPrices: (productId: string) => api.get(`/api/pricing/competitors/${productId}`),
};

export const analyticsAPI = {
  getSalesAnalytics: (params?: any) => api.get('/api/analytics/sales', { params }),
  
  getInventoryAnalytics: (params?: any) => api.get('/api/analytics/inventory', { params }),
  
  getCustomerAnalytics: (params?: any) => api.get('/api/analytics/customers', { params }),
  
  getPerformanceMetrics: () => api.get('/api/analytics/performance'),
};

export const marketplaceAPI = {
  getMarketplaces: () => api.get('/api/marketplace'),
  
  getListings: (marketplaceId: string, params?: any) =>
    api.get(`/api/marketplace/${marketplaceId}/listings`, { params }),
  
  createListing: (marketplaceId: string, data: any) =>
    api.post(`/api/marketplace/${marketplaceId}/listings`, data),
  
  updateListing: (marketplaceId: string, listingId: string, data: any) =>
    api.put(`/api/marketplace/${marketplaceId}/listings/${listingId}`, data),
  
  syncInventory: (marketplaceId: string) =>
    api.post(`/api/marketplace/${marketplaceId}/sync`),
};

export const vendorsAPI = {
  getVendors: () => api.get('/api/vendors'),
  
  getVendorProducts: (vendorId: string, params?: any) =>
    api.get(`/api/vendors/${vendorId}/products`, { params }),
  
  createOrder: (vendorId: string, data: any) =>
    api.post(`/api/vendors/${vendorId}/orders`, data),
  
  getOrderStatus: (vendorId: string, orderId: string) =>
    api.get(`/api/vendors/${vendorId}/orders/${orderId}`),
  
  syncCatalog: (vendorId: string) =>
    api.post(`/api/vendors/${vendorId}/sync`),
};

export const tenantsAPI = {
  getTenants: () => api.get('/api/tenants'),
  
  getTenant: (id: string) => api.get(`/api/tenants/${id}`),
  
  updateTenant: (id: string, data: any) => api.put(`/api/tenants/${id}`, data),
  
  getTenantUsers: (id: string) => api.get(`/api/tenants/${id}/users`),
};

export const notificationsAPI = {
  getNotifications: (params?: any) => api.get('/api/notifications', { params }),
  
  markAsRead: (id: string) => api.put(`/api/notifications/${id}/read`),
  
  markAllAsRead: () => api.put('/api/notifications/read-all'),
  
  updatePreferences: (data: any) => api.put('/api/notifications/preferences', data),
};

export const performanceAPI = {
  getMetrics: () => api.get('/api/performance/metrics'),
  
  getOptimizations: () => api.get('/api/performance/optimizations'),
  
  applyOptimization: (id: string) => api.post(`/api/performance/optimizations/${id}/apply`),
};

export const securityAPI = {
  getAuditLogs: (params?: any) => api.get('/api/security/audit-logs', { params }),
  
  getComplianceStatus: () => api.get('/api/security/compliance'),
  
  getSecurityAlerts: () => api.get('/api/security/alerts'),
  
  updateSecuritySettings: (data: any) => api.put('/api/security/settings', data),
};

export const integrationAPI = {
  testMarketplaceConnection: (marketplaceId: string) =>
    api.post(`/api/v1/marketplaces/${marketplaceId}/test`),
  
  testSPAPIConnection: (credentials: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    marketplaceId: string;
    sellerId: string;
    region?: string;
    environment?: 'sandbox' | 'production';
  }) => api.post('/api/v1/marketplaces/test-sp-api', credentials),
  
  testVendorConnection: (credentials: any) =>
    api.post('/api/v1/vendors/test-connection', credentials),
  
  getSupportedMarketplaces: () => api.get('/api/v1/marketplaces/supported'),
}; 