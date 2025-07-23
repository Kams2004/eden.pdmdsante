import React, { useState } from 'react';
import { Filter, RefreshCw, Printer, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const MobilePatientsContent = ({ selectedPatients = [] }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  const defaultPatients = [
    { id: 'P1', name: 'AHMADI ATEF AWAD', examination: 'CONSULTATION CARDIOLOGIQUE', commission: '9345.00 FCFA', transferDate: 'Feb 25, 2025', selected: false },
    { id: 'P2', name: 'BIKIM BISSE PAUL EMMANUEL', examination: 'CONSULTATION NEUROLOGIQUE', commission: '9345.00 FCFA', transferDate: 'Feb 25, 2025', selected: false },
    { id: 'P3', name: 'BIKIM BISSE PAUL EMMANUEL', examination: 'CONSULTATION NEUROLOGIQUE', commission: '9345.00 FCFA', transferDate: 'Feb 25, 2025', selected: false },
    { id: 'P4', name: 'KAMELU MONIQUE', examination: 'HEMOGLOBINE GLYQUEE', commission: '1922.40 FCFA', transferDate: 'Feb 25, 2025', selected: false },
    { id: 'P5', name: 'SALIHU ESUKUKU PETER', examination: 'EPREUVE D\'EFFORT', commission: '13320.00 FCFA', transferDate: 'Feb 25, 2025', selected: false },
    { id: 'P6', name: 'SALIHU ESUKUKU PETER', examination: 'EPREUVE D\'EFFORT', commission: '20790.00 FCFA', transferDate: 'Feb 25, 2025', selected: false },
  ];

  const [patients, setPatients] = useState(selectedPatients.length > 0 ? selectedPatients.map(p => ({ ...p, selected: false })) : defaultPatients);

  const handleFilter = () => {
    console.log('Filter clicked with dates:', startDate, endDate);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    console.log('Reset clicked');
  };

  const handlePrint = () => {
    console.log('Print clicked');
  };

  const handleSelectAll = () => {
    const updatedPatients = patients.map(patient => ({
      ...patient,
      selected: !selectAll
    }));
    setPatients(updatedPatients);
    setSelectAll(!selectAll);
  };

  const handlePatientSelect = (id) => {
    const updatedPatients = patients.map(patient =>
      patient.id === id ? { ...patient, selected: !patient.selected } : patient
    );
    setPatients(updatedPatients);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 sm:px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Registered Patients</h1>
        <div className="w-12 h-1 bg-blue-500 mt-2"></div>
      </div>

      {/* Filters - Mobile Optimized */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div className="space-y-4 mb-4">
          {/* Date inputs in a single column on mobile for better space management */}
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    /* Mobile date picker optimization */
                    appearance-none
                    /* Ensure the picker stays within viewport */
                    [&::-webkit-calendar-picker-indicator]:absolute
                    [&::-webkit-calendar-picker-indicator]:right-2
                    [&::-webkit-calendar-picker-indicator]:top-1/2
                    [&::-webkit-calendar-picker-indicator]:-translate-y-1/2
                    [&::-webkit-calendar-picker-indicator]:cursor-pointer
                    [&::-webkit-calendar-picker-indicator]:opacity-70
                    [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                  style={{
                    /* Additional styles to ensure mobile compatibility */
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield',
                  }}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    /* Mobile date picker optimization */
                    appearance-none
                    /* Ensure the picker stays within viewport */
                    [&::-webkit-calendar-picker-indicator]:absolute
                    [&::-webkit-calendar-picker-indicator]:right-2
                    [&::-webkit-calendar-picker-indicator]:top-1/2
                    [&::-webkit-calendar-picker-indicator]:-translate-y-1/2
                    [&::-webkit-calendar-picker-indicator]:cursor-pointer
                    [&::-webkit-calendar-picker-indicator]:opacity-70
                    [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                  style={{
                    /* Additional styles to ensure mobile compatibility */
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield',
                  }}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          {/* Action Buttons - Stack on mobile */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <button
              onClick={handleFilter}
              className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 flex items-center justify-center space-x-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">Showing 1 to {patients.length} of {patients.length} patients</p>
      </div>

      {/* Mobile Card View */}
      <div className="px-4 py-2">
        <div className="flex items-center mb-4 p-2 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded mr-2 focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-900">Select All ({patients.filter(p => p.selected).length} selected)</span>
        </div>
        
        <div className="space-y-3">
          {patients.map((patient, index) => (
            <div key={patient.id || index} className="bg-gray border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={patient.selected}
                    onChange={() => handlePatientSelect(patient.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">{patient.id}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {patient.transferDate}
                  </span>
                </div>
              </div>
              
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{patient.name}</h3>
                <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">{patient.examination}</p>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500 font-medium">Commission</span>
                <span className="text-sm font-bold text-green-600">{patient.commission}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <button className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Previous</span>
          </button>
          <span className="text-sm text-gray-700 font-medium">Page 1 of 1</span>
          <button className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <span>Next</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Total Commission - Sticky on mobile */}
      <div className="px-4 sm:px-6 py-4 border-t-2 border-blue-200 bg-blue-50 sticky bottom-0">
        <div className="text-center sm:text-right">
          <span className="text-lg sm:text-xl font-bold text-gray-900">
            Total Commission: <span className="text-blue-600">
              {patients.reduce((sum, patient) => {
                const amount = parseFloat(patient.commission.replace(/[^\d.]/g, ''));
                return sum + (isNaN(amount) ? 0 : amount);
              }, 0).toFixed(2)} FCFA
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default MobilePatientsContent;