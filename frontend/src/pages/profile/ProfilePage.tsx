import React from 'react';
import { Card } from '../../components/ui/Card';

const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your user profile and preferences.</p>
      </div>
      
      <Card className="p-6">
        <p className="text-gray-500">Profile page - Coming soon in Week 20</p>
      </Card>
    </div>
  );
};

export default ProfilePage; 