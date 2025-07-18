import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = 'http://localhost:3000'; // Analytics engine service

export interface DashboardData {
  period: string;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    activeCustomers: number;
  };
  trends: {
    revenueGrowth: number;
    orderGrowth: number;
    customerGrowth: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    growth: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    data?: any;
  }>;
}

export interface RevenueAnalytics {
  total: number;
  growth: number;
  breakdown: Array<{
    channel: string;
    revenue: number;
    percentage: number;
  }>;
  timeline: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface ProductAnalytics {
  total: number;
  growth: number;
  categories: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  performance: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    growth: number;
  }>;
}

// API functions
const fetchDashboardData = async (period: string = '30d'): Promise<DashboardData> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/dashboard?period=${period}`, {
    headers: {
      'Content-Type': 'application/json',
      // Add authentication headers here when implemented
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  
  const result = await response.json();
  return result.data;
};

const fetchRevenueAnalytics = async (period: string = '30d'): Promise<RevenueAnalytics> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/revenue?period=${period}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch revenue analytics');
  }
  
  const result = await response.json();
  return result.data;
};

const fetchProductAnalytics = async (period: string = '30d'): Promise<ProductAnalytics> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/products?period=${period}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch product analytics');
  }
  
  const result = await response.json();
  return result.data;
};

// React Query hooks
export const useDashboardData = (period: string = '30d') => {
  return useQuery({
    queryKey: ['dashboard-data', period],
    queryFn: () => fetchDashboardData(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
};

export const useRevenueAnalytics = (period: string = '30d') => {
  return useQuery({
    queryKey: ['revenue-analytics', period],
    queryFn: () => fetchRevenueAnalytics(period),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useProductAnalytics = (period: string = '30d') => {
  return useQuery({
    queryKey: ['product-analytics', period],
    queryFn: () => fetchProductAnalytics(period),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });
};

// Mock data for development (fallback when API is not available)
export const mockDashboardData: DashboardData = {
  period: '30d',
  summary: {
    totalRevenue: 125000,
    totalOrders: 1247,
    totalProducts: 89,
    activeCustomers: 342,
  },
  trends: {
    revenueGrowth: 12.5,
    orderGrowth: -2.3,
    customerGrowth: 15.7,
  },
  topProducts: [
    { id: '1', name: 'Widget Pro', revenue: 25000, orders: 150, growth: 8.5 },
    { id: '2', name: 'Gadget Plus', revenue: 18000, orders: 120, growth: 12.3 },
    { id: '3', name: 'Tool Master', revenue: 15000, orders: 95, growth: -1.2 },
  ],
  recentActivity: [
    { id: '1', type: 'order', message: 'New order #1234 received', timestamp: '2 minutes ago' },
    { id: '2', type: 'product', message: 'Product "Widget Pro" updated', timestamp: '15 minutes ago' },
    { id: '3', type: 'user', message: 'New user registered', timestamp: '1 hour ago' },
  ],
};

export const mockRevenueAnalytics: RevenueAnalytics = {
  total: 125000,
  growth: 12.5,
  breakdown: [
    { channel: 'Amazon', revenue: 75000, percentage: 60 },
    { channel: 'eBay', revenue: 35000, percentage: 28 },
    { channel: 'Walmart', revenue: 15000, percentage: 12 },
  ],
  timeline: [
    { date: '2024-01-01', revenue: 120000, orders: 1200 },
    { date: '2024-01-02', revenue: 125000, orders: 1247 },
    { date: '2024-01-03', revenue: 130000, orders: 1290 },
    { date: '2024-01-04', revenue: 128000, orders: 1275 },
    { date: '2024-01-05', revenue: 132000, orders: 1310 },
  ],
}; 