import React, { useState } from 'react';
import { faFilter, faSyncAlt, faPrint, faCalendarAlt, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const MobilePatientsContent = ({ selectedPatients = [] }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const defaultPatients = [
    { id: 'P1', name: 'AHMADI ATEF AWAD', examination: 'CONSULTATION CARDIOLOGIQUE', commission: '9345.00 FCFA', transferDate: 'Feb 25, 2025' },
    { id: 'P2', name: 'BIKIM BISSE PAUL EMMANUEL', examination: 'CONSULTATION NEUROLOGIQUE', commission: '9345.00 FCFA', transferDate: 'Feb 25, 2025' },
    { id: 'P3', name: 'BIKIM BISSE PAUL EMMANUEL', examination: 'CONSULTATION NEUROLOGIQUE', commission: '9345.00 FCFA', transferDate: 'Feb 25, 2025' },
    { id: 'P4', name: 'KAMELU MONIQUE', examination: 'HEMOGLOBINE GLYQUEE', commission: '1922.40 FCFA', transferDate: 'Feb 25, 2025' },
    { id: 'P5', name: 'SALIHU ESUKUKU PETER', examination: 'EPREUVE D\'EFFORT', commission: '13320.00 FCFA', transferDate: 'Feb 25, 2025' },
    { id: 'P6', name: 'SALIHU ESUKUKU PETER', examination: 'EPREUVE D\'EFFORT', commission: '20790.00 FCFA', transferDate: 'Feb 25, 2025' },
  ];

  const patients = selectedPatients.length > 0 ? selectedPatients : defaultPatients;

  const handleFilter = () => {
    console.log('Filter clicked with dates:', startDate, endDate);
    // Add your filter logic here
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    console.log('Reset clicked');
  };

  const handlePrint = () => {
    console.log('Print clicked');
    // Add your print logic here
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Registered Patients</h1>
        <div className="w-12 h-1 bg-blue-500 mt-2"></div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col gap-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">

                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">

                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleFilter}
              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faFilter} />
              <span>Filter</span>
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faSyncAlt} />
              <span>Reset</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faPrint} />
              <span>Print</span>
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">Showing 1 to {patients.length} of {patients.length} patients</p>
      </div>

      {/* Mobile Card View */}
      <div className="px-4 py-2">
        {patients.map((patient, index) => (
          <div key={patient.id || index} className="bg-white border border-gray-200 rounded-lg mb-3 p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-900">{patient.id}</span>
              </div>
              <span className="text-xs text-gray-500">{patient.transferDate}</span>
            </div>
            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-900 mb-1">{patient.name}</h3>
              <p className="text-sm text-blue-600">{patient.examination}</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-900">{patient.commission}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <button className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
            <FontAwesomeIcon icon={faChevronLeft} className="mr-1" />
            <span>Previous</span>
          </button>
          <span className="text-sm text-gray-700">Page 1 of 1</span>
          <button className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
            <span>Next</span>
            <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Total Commission */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="text-right">
          <span className="text-sm font-medium text-gray-900">
            Total Commission: {patients.reduce((sum, patient) => {
              const amount = parseFloat(patient.commission.replace(/[^\d.]/g, ''));
              return sum + (isNaN(amount) ? 0 : amount);
            }, 0).toFixed(2)} FCFA
          </span>
        </div>
      </div>
    </div>
  );
};

export default MobilePatientsContent;
