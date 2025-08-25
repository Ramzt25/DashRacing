import React from 'react';

const SystemPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System</h1>
        <p className="text-gray-600">System health, logs, and configuration</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">System Management</h3>
        <p className="text-gray-600">System monitoring interface coming soon...</p>
      </div>
    </div>
  );
};

export default SystemPage;