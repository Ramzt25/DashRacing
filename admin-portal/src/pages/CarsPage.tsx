import React from 'react';

const CarsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cars</h1>
        <p className="text-gray-600">Manage car registrations and specifications</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Cars Management</h3>
        <p className="text-gray-600">Car management interface coming soon...</p>
      </div>
    </div>
  );
};

export default CarsPage;