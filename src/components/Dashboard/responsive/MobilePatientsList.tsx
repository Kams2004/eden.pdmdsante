// MobilePatientsList.tsx
import React, { useState } from 'react';

interface Patient {
  id: number;
  name: string;
  checked: boolean;
}

const MobilePatientsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage] = useState<number>(1);

  const patients: Patient[] = [
    { id: 1, name: 'AHMADI ATEF AWAD', checked: false },
    { id: 2, name: 'BIKIMI RISEE PAUL EMMANUEL', checked: false },
    { id: 3, name: 'KAMEALU MONIQUE', checked: false },
    { id: 4, name: 'SALIHI SOUMALI PETER', checked: false },
    { id: 5, name: 'TIAVA SAPHIREE LIVIA', checked: false },
    { id: 6, name: 'MAKEMENSIE MARIE MADELEINE', checked: false },
    { id: 7, name: 'BAKIA GABRIEL STEVE ARMAND', checked: false },
    { id: 8, name: 'NKONO JOSE SANDJIO Cynthia', checked: false },
    { id: 9, name: 'MADJOUKA CHANTALE', checked: false },
  ];

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-gray-900 font-medium mb-4">Patients List</h3>

      <div className="flex flex-col gap-2 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center">
            <i className="ri-search-line text-gray-400"></i>
          </div>
        </div>
        <button className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors">
          Details
        </button>
      </div>

      <div className="space-y-3">
        {patients.map((patient) => (
          <div key={patient.id} className="flex items-center space-x-3">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{patient.name}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600"></i>
          </div>
        </button>

        <span className="text-sm text-gray-600">Page {currentPage} of 5</span>

        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-arrow-right-line text-gray-600"></i>
          </div>
        </button>
      </div>
    </div>
  );
}

export default MobilePatientsList;
