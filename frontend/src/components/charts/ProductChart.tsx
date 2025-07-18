import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ProductAnalytics } from '../../services/analytics';

interface ProductChartProps {
  data: ProductAnalytics;
  isLoading?: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const ProductChart: React.FC<ProductChartProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  const topProducts = data.performance.slice(0, 5).map(product => ({
    ...product,
    revenue: product.revenue / 1000, // Convert to thousands
  }));

  const categoryData = data.categories.map((category, index) => ({
    ...category,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Product Performance</h3>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${data.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.growth >= 0 ? '+' : ''}{data.growth}%
          </span>
          <span className="text-sm text-gray-500">vs last period</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Bar Chart */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">Top Products by Revenue</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topProducts} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                type="number"
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => `$${value}k`}
              />
              <YAxis 
                type="category"
                dataKey="name"
                stroke="#6B7280"
                fontSize={11}
                width={80}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number) => [`$${(value * 1000).toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution Pie Chart */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">Revenue by Category</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="revenue"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {categoryData.map((category, index) => (
              <div key={category.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.fill }}
                />
                <span className="text-xs text-gray-600 truncate">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 