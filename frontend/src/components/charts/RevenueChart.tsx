import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { RevenueAnalytics } from '../../services/analytics';

interface RevenueChartProps {
  data: RevenueAnalytics;
  isLoading?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  const chartData = data.timeline.map(item => ({
    ...item,
    revenue: item.revenue / 1000, // Convert to thousands for better display
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${data.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.growth >= 0 ? '+' : ''}{data.growth}%
          </span>
          <span className="text-sm text-gray-500">vs last period</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => `$${value}k`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [`$${(value * 1000).toLocaleString()}`, 'Revenue']}
            labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        {data.breakdown.map((channel) => (
          <div key={channel.channel} className="text-center">
            <p className="text-sm font-medium text-gray-900">{channel.channel}</p>
            <p className="text-lg font-bold text-indigo-600">${channel.revenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{channel.percentage}% of total</p>
          </div>
        ))}
      </div>
    </div>
  );
}; 