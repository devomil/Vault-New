import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/auth/LoginPage';
import { Layout } from './components/layout/Layout';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductsPage from './pages/products/ProductsPage';
import InventoryPage from './pages/inventory/InventoryPage';
import PricingPage from './pages/pricing/PricingPage';
import MarketplacePage from './pages/marketplace/MarketplacePage';
import VendorsPage from './pages/vendors/VendorsPage';
import OrdersPage from './pages/orders/OrdersPage';
import PerformancePage from './pages/performance';
import SecurityPage from './pages/security';
import IntegrationTestPage from './pages/integrations/IntegrationTestPage';

// Simple test component
function TestPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Loading...
          </h1>
          <p className="text-lg text-gray-600">
            Initializing... 🔄
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$125,000</p>
            </div>
            <div className="p-3 rounded-full bg-green-500">
              <span className="text-white text-lg">$</span>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500">↗</span>
            <span className="ml-2 text-sm font-medium text-green-600">+12.5%</span>
            <span className="ml-2 text-sm text-gray-500">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500">
              <span className="text-white text-lg">📦</span>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-red-500">↘</span>
            <span className="ml-2 text-sm font-medium text-red-600">-2.3%</span>
            <span className="ml-2 text-sm text-gray-500">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-500">
              <span className="text-white text-lg">📊</span>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500">↗</span>
            <span className="ml-2 text-sm font-medium text-green-600">+8.1%</span>
            <span className="ml-2 text-sm text-gray-500">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">342</p>
            </div>
            <div className="p-3 rounded-full bg-purple-500">
              <span className="text-white text-lg">👥</span>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500">↗</span>
            <span className="ml-2 text-sm font-medium text-green-600">+15.7%</span>
            <span className="ml-2 text-sm text-gray-500">from last month</span>
          </div>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <span className="text-gray-400">📈</span>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <div className="text-center">
              <span className="text-4xl mb-2">📊</span>
              <p className="text-gray-500">Chart component will be added here</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full text-blue-600 bg-blue-100">📦</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New order #1234 received</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full text-green-600 bg-green-100">📊</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Product "Widget Pro" updated</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full text-purple-600 bg-purple-100">👥</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New user registered</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="marketplace" element={<MarketplacePage />} />
              <Route path="vendors" element={<VendorsPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="performance" element={<PerformancePage />} />
              <Route path="security" element={<SecurityPage />} />
              <Route path="integration-test" element={<IntegrationTestPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App; 