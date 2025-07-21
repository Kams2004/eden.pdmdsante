import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faFileAlt, faTachometerAlt, faUser } from '@fortawesome/free-solid-svg-icons';

const MobileStatsCards: React.FC = () => {
  const [showSolde, setShowSolde] = useState<boolean>(false);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Solde Container */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-3 shadow-sm flex flex-col items-center relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-blue-300 opacity-15 rounded-full translate-y-6 -translate-x-6"></div>
        
        <div className="w-6 h-6 flex items-center justify-center mb-1 relative z-10">
          <FontAwesomeIcon icon={faTachometerAlt} className="text-blue-600" size="lg" />
        </div>
        <div className="text-sm font-bold text-gray-700 mb-1 relative z-10">Solde principal</div>
        <div className="w-full flex justify-between items-center relative z-10">
          <span className="text-lg font-bold text-gray-900">
            {showSolde ? '53 560 FCFA' : '*****'}
          </span>
          <button onClick={() => setShowSolde(!showSolde)} className="w-5 h-5 flex items-center justify-center hover:bg-blue-200 rounded transition-colors">
            <FontAwesomeIcon icon={showSolde ? faEye : faEyeSlash} className="text-gray-600" size="sm" />
          </button>
        </div>
        <div className="flex items-center text-xs text-gray-600 mt-1 relative z-10">
          <FontAwesomeIcon icon={faFileAlt} className="mr-1" size="sm" />
          <span>9 invoiced</span>
        </div>
      </div>

      {/* Registered Patients Container */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-100 border border-yellow-100 rounded-lg p-3 shadow-sm flex flex-col items-center relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-200 opacity-25 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-orange-200 opacity-20 rounded-full translate-y-6 -translate-x-6"></div>
        <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-yellow-300 opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="w-6 h-6 flex items-center justify-center mb-1 relative z-10">
          <FontAwesomeIcon icon={faUser} className="text-yellow-600" size="lg" />
        </div>
        <div className="text-sm font-bold text-gray-700 mb-1 relative z-10">Registered Patients</div>
        <div className="text-lg font-bold text-gray-900 relative z-10">17</div>
        <div className="text-xs text-gray-600 mt-1 relative z-10">Registered</div>
      </div>
    </div>
  );
};

export default MobileStatsCards;