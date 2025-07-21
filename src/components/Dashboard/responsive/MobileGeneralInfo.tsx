import React from 'react';

const MobileGeneralInfo: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-gray-900 font-medium mb-4 text-lg">General Information</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-base font-bold text-gray-900">91</div>
          <div className="text-xs text-gray-600">Patients</div>
        </div>
        <div>
          <div className="text-base font-bold text-green-600">540 243 FCFA</div>
          <div className="text-xs text-gray-600">Revenue</div>
        </div>
        <div>
          <div className="text-base font-bold text-purple-600">76</div>
          <div className="text-xs text-gray-600">Commissions</div>
        </div>
      </div>
    </div>
  );
};

export default MobileGeneralInfo;
