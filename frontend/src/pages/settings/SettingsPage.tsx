import React from 'react';
import { Card } from '../../components/ui/Card';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your account and system preferences.</p>
      </div>
      
      <Card className="p-6">
        <p className="text-gray-500">Settings page - Coming soon in Week 20</p>
      </Card>
    </div>
  );
};

export default SettingsPage; 