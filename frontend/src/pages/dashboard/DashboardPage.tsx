import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  BarChart3,
  Activity,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { RevenueChart } from '../../components/charts/RevenueChart';
import { ProductChart } from '../../components/charts/ProductChart';
import { 
  useDashboardData, 
  useRevenueAnalytics, 
  useProductAnalytics,
  mockDashboardData,
  mockRevenueAnalytics,
  type DashboardData,
  type RevenueAnalytics,
  type ProductAnalytics
} from '../../services/analytics';

const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }: {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  color?: string;
}) => {
  const isPositive = change >= 0;
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
        <span className={`ml-2 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{change}%
        </span>
        <span className="ml-2 text-sm text-gray-500">from last month</span>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity }: { activity: any }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return ShoppingCart;
      case 'product': return Package;
      case 'user': return Users;
      default: return Activity;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'order': return 'text-blue-600 bg-blue-100';
      case 'product': return 'text-green-600 bg-green-100';
      case 'user': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const Icon = getIcon(activity.type);

  return (
    <div className="flex items-center space-x-3 py-3">
      <div className={`p-2 rounded-full ${getColor(activity.type)}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
        <p className="text-xs text-gray-500">{activity.timestamp}</p>
      </div>
    </div>
  );
};

const PeriodSelector = ({ period, onPeriodChange }: { 
  period: string; 
  onPeriodChange: (period: string) => void;
}) => {
  const periods = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
  ];

  return (
    <div className="flex items-center space-x-2">
      <Calendar className="h-4 w-4 text-gray-400" />
      <select
        value={period}
        onChange={(e) => onPeriodChange(e.target.value)}
        className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {periods.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default function DashboardPage() {
  const [period, setPeriod] = useState('30d');
  const [useMockData, setUseMockData] = useState(true); // Fallback to mock data

  // Real-time data queries with error handling
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError 
  } = useDashboardData(period);

  const { 
    data: revenueData, 
    isLoading: revenueLoading, 
    error: revenueError 
  } = useRevenueAnalytics(period);

  const { 
    data: productData, 
    isLoading: productLoading, 
    error: productError 
  } = useProductAnalytics(period);

  // Use mock data if API is not available
  const finalDashboardData: DashboardData = dashboardError || useMockData ? mockDashboardData : dashboardData!;
  const finalRevenueData: RevenueAnalytics = revenueError || useMockData ? mockRevenueAnalytics : revenueData!;
  const finalProductData: ProductAnalytics = productError || useMockData ? {
    total: 89,
    growth: 8.1,
    categories: [
      { name: 'Electronics', count: 25, revenue: 45000 },
      { name: 'Tools', count: 20, revenue: 35000 },
      { name: 'Accessories', count: 30, revenue: 25000 },
      { name: 'Software', count: 14, revenue: 20000 },
    ],
    performance: [
      { id: '1', name: 'Widget Pro', revenue: 25000, orders: 150, growth: 8.5 },
      { id: '2', name: 'Gadget Plus', revenue: 18000, orders: 120, growth: 12.3 },
      { id: '3', name: 'Tool Master', revenue: 15000, orders: 95, growth: -1.2 },
      { id: '4', name: 'Smart Device', revenue: 12000, orders: 80, growth: 5.7 },
      { id: '5', name: 'Power Tool', revenue: 10000, orders: 65, growth: 3.2 },
    ]
  } : productData!;

  const isLoading = dashboardLoading || revenueLoading || productLoading;

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="flex items-center space-x-4">
          <PeriodSelector period={period} onPeriodChange={setPeriod} />
          <button
            onClick={() => window.location.reload()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${finalDashboardData.summary.totalRevenue.toLocaleString()}`}
          change={finalDashboardData.trends.revenueGrowth}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={finalDashboardData.summary.totalOrders.toLocaleString()}
          change={finalDashboardData.trends.orderGrowth}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Total Products"
          value={finalDashboardData.summary.totalProducts}
          change={finalDashboardData.trends.customerGrowth}
          icon={Package}
          color="yellow"
        />
        <StatCard
          title="Active Users"
          value={finalDashboardData.summary.activeCustomers}
          change={finalDashboardData.trends.customerGrowth}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <RevenueChart data={finalRevenueData} isLoading={revenueLoading} />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-1">
            {finalDashboardData.recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>

      {/* Product Performance Chart */}
      <ProductChart data={finalProductData} isLoading={productLoading} />

      {/* Top Products Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {finalDashboardData.topProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.growth >= 0 ? '+' : ''}{product.growth}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Status Indicator */}
      {(dashboardError || revenueError || productError) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Using mock data. Analytics service may be unavailable.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 