import React from 'react';
import { Card } from '../../components/ui/Card';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">View detailed analytics and performance metrics.</p>
      </div>
      
      <Card className="p-6">
        <p className="text-gray-500">Analytics page - Coming soon in Week 18</p>
      </Card>
    </div>
  );
};

export default AnalyticsPage; 