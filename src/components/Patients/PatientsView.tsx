import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, Printer, Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import axiosInstance from "../../api/axioConfig";

interface Patient {
  id: string;
  name: string;
  examination: string;
  commission: string;
  transferDate: string;
  selected: boolean;
}

interface PatientsViewProps {
  selectedPatients?: string[];
}

const PatientsView: React.FC<PatientsViewProps> = ({ selectedPatients = [] }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Enhanced filtering states
  const [invoiceStatus, setInvoiceStatus] = useState<'invoiced' | 'Notinvoiced'>('invoiced');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'prescription' | 'realisation'>('prescription');
  const [showFilters, setShowFilters] = useState(false);
  const [monthlyData, setMonthlyData] = useState<any>(null);

  const patientsPerPage = 6;
  const currentYear = new Date().getFullYear();

  const fetchPatientsData = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('userData');
      if (!userData) {
        console.error('No user data found in localStorage');
        return;
      }

      const { doctor_id } = JSON.parse(userData);

      // Fetch data based on invoice status
      const response = await axiosInstance.get(`/doctor_com/invoiced_by_year/${doctor_id}/${currentYear}/${invoiceStatus}`);
      setMonthlyData(response.data);

      // If no month is selected, select the first available month with data
      if (!selectedMonth) {
        const monthsWithData = Object.keys(response.data).filter(month =>
          month !== 'Total' &&
          (response.data[month]?.elements_prescription?.data_patients?.length > 0 ||
           response.data[month]?.elements_realisation?.data_patients?.length > 0)
        );
        if (monthsWithData.length > 0) {
          setSelectedMonth(monthsWithData[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching patients data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processPatientData = () => {
    if (!monthlyData || !selectedMonth || !monthlyData[selectedMonth]) {
      setPatients([]);
      setFilteredPatients([]);
      return;
    }

    const monthData = monthlyData[selectedMonth];
    const typeData = selectedType === 'prescription' ?
      monthData.elements_prescription :
      monthData.elements_realisation;

    if (!typeData?.data_patients) {
      setPatients([]);
      setFilteredPatients([]);
      return;
    }

    const formattedPatients = typeData.data_patients.map((patientData: any, index: number) => {
      const patientName = Object.keys(patientData)[0];
      const [examination, patientCommission, transferDate] = patientData[patientName];

      return {
        id: `P${index + 1}`,
        name: patientName,
        examination,
        commission: `${patientCommission} FCFA`,
        transferDate: new Date(transferDate).toLocaleDateString(),
        selected: selectedPatients.includes(patientName),
      };
    });

    setPatients(formattedPatients);
    setFilteredPatients(formattedPatients);
  };

  useEffect(() => {
    fetchPatientsData();
  }, [invoiceStatus]);

  useEffect(() => {
    processPatientData();
  }, [monthlyData, selectedMonth, selectedType]);

  useEffect(() => {
    const filterPatientsByDate = () => {
      let filtered = [...patients];

      if (startDate) {
        const start = new Date(startDate);
        filtered = filtered.filter(patient => new Date(patient.transferDate) >= start);
      }

      if (endDate) {
        const end = new Date(endDate);
        filtered = filtered.filter(patient => new Date(patient.transferDate) <= end);
      }

      setFilteredPatients(filtered);
      setCurrentPage(1);
    };

    filterPatientsByDate();
  }, [startDate, endDate, patients]);

  const handleFilter = () => {
    console.log('Filter applied with current selections');
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setSelectAll(false);
    setFilteredPatients(patients.map(patient => ({ ...patient, selected: false })));
  };

  const handlePrint = () => {
    const selectedPatientsData = filteredPatients.filter(patient => patient.selected);

    if (selectedPatientsData.length === 0) {
      alert("Please select at least one patient to print");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Patient Report - ${invoiceStatus} - ${selectedMonth} - ${selectedType}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #1a56db; }
            .filter-info { text-align: center; margin-bottom: 20px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8fafc; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            .total { margin-top: 20px; text-align: right; font-weight: bold; font-size: 18px; color: black; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Medical Center</div>
            <p>Patient Report - ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="filter-info">
            <p><strong>Status:</strong> ${invoiceStatus === 'invoiced' ? 'Invoiced' : 'Not Invoiced'} | <strong>Month:</strong> ${selectedMonth} | <strong>Type:</strong> ${selectedType === 'prescription' ? 'Prescription' : 'Realization'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient Name</th>
                <th>Examination</th>
                <th>Commission</th>
                <th>Transfer Date</th>
              </tr>
            </thead>
            <tbody>
              ${selectedPatientsData.map(patient => `
                <tr>
                  <td>${patient.id}</td>
                  <td>${patient.name}</td>
                  <td>${patient.examination}</td>
                  <td>${patient.commission}</td>
                  <td>${patient.transferDate}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            Total Commission: ${selectedPatientsData.reduce((sum, patient) => {
              const amount = parseFloat(patient.commission.replace(/[^\d.-]/g, ''));
              return sum + (isNaN(amount) ? 0 : amount);
            }, 0).toFixed(2)} FCFA
          </div>
          <div class="footer">
            <p>Generated by Medical Center Management System</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSelectAll = () => {
    const updatedPatients = filteredPatients.map(patient => ({
      ...patient,
      selected: !selectAll
    }));
    setFilteredPatients(updatedPatients);
    setSelectAll(!selectAll);
  };

  const handlePatientSelect = (id: string) => {
    const updatedPatients = filteredPatients.map(patient =>
      patient.id === id ? { ...patient, selected: !patient.selected } : patient
    );
    setFilteredPatients(updatedPatients);
  };

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const goToNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const getTotalCommission = () => {
    if (!monthlyData || !selectedMonth || !monthlyData[selectedMonth]) return 0;

    const monthData = monthlyData[selectedMonth];
    const typeData = selectedType === 'prescription' ?
      monthData.elements_prescription :
      monthData.elements_realisation;

    return typeData?.commission || 0;
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Registered Patients</h2>
          <p className="text-gray-500 text-sm mt-1">At the service of your health</p>
          <div className="w-24 h-1 bg-blue-500 mx-auto mt-2 rounded-full"></div>
        </div>
        <div className="text-center py-8">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-gray-600">Loading patients data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <h2 className="text-2xl font-bold text-slate-800">Registered Patients</h2>
        <div className="w-24 h-1 bg-blue-500 mt-2 rounded-full"></div>
      </div>

      {/* Enhanced Filter Section */}
      <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200">
        <div className="space-y-4">
          {/* Main Filter Controls */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-700">Filter Options</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Invoice Status Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setInvoiceStatus('invoiced')}
              className={`p-3 rounded-lg border transition-colors ${
                invoiceStatus === 'invoiced'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
              }`}
            >
              Invoiced
            </button>
            <button
              onClick={() => setInvoiceStatus('Notinvoiced')}
              className={`p-3 rounded-lg border transition-colors ${
                invoiceStatus === 'Notinvoiced'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
              }`}
            >
              Not Invoiced
            </button>
          </div>

          {showFilters && (
            <>
              {/* Month Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                >
                  <option value="">Select a month</option>
                  {monthlyData && Object.keys(monthlyData)
                    .filter(month => month !== 'Total')
                    .map(month => (
                      <option key={month} value={month}>
                        {month} ({monthlyData[month]?.elements_prescription?.data_patients?.length || 0} prescriptions, {monthlyData[month]?.elements_realisation?.data_patients?.length || 0} realizations)
                      </option>
                    ))}
                </select>
              </div>

              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedType('prescription')}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedType === 'prescription'
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-green-400'
                  }`}
                >
                  Prescriptions
                  {monthlyData && selectedMonth && (
                    <span className="block text-xs mt-1">
                      ({monthlyData[selectedMonth]?.elements_prescription?.data_patients?.length || 0})
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setSelectedType('realisation')}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedType === 'realisation'
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-green-400'
                  }`}
                >
                  Realization
                  {monthlyData && selectedMonth && (
                    <span className="block text-xs mt-1">
                      ({monthlyData[selectedMonth]?.elements_realisation?.data_patients?.length || 0})
                    </span>
                  )}
                </button>
              </div>

              {/* Date Range Filter */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-slate-700">Filter by Date Range</h4>
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>

              {showDatePicker && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleFilter}
              className="flex-1 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center transition-colors shadow-sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
            <button
              onClick={handleReset}
              className="flex-1 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-600 mt-4">
          Showing {indexOfFirstPatient + 1} to {Math.min(indexOfLastPatient, filteredPatients.length)} of {filteredPatients.length} patients
          {selectedMonth && (
            <span className="ml-2 text-blue-600 font-medium">
              | {selectedMonth} - {selectedType === 'prescription' ? 'Prescription' : 'Realization'} ({invoiceStatus === 'invoiced' ? 'Invoiced' : 'Not Invoiced'})
            </span>
          )}
        </p>
      </div>

      {/* Patients Table */}
      <div className="overflow-x-auto">
        {filteredPatients.length > 0 ? (
          <>
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-500 border-slate-300 rounded mr-3 focus:ring-2 focus:ring-blue-400"
                />
                <span className="text-sm font-medium text-slate-700">
                  Select All ({filteredPatients.filter(p => p.selected).length} selected)
                </span>
              </div>
            </div>

            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Select</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Patient Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Examination</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Commission</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Transfer Date</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.map((patient, index) => (
                  <tr
                    key={patient.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      index % 2 === 0 ? 'bg-[#F7F8FA]' : 'bg-white'
                    }`}
                  >
                    <td className="px-6 py-3">
                      <input
                        type="checkbox"
                        checked={patient.selected}
                        onChange={() => handlePatientSelect(patient.id)}
                        className="w-4 h-4 text-blue-500 border-slate-300 rounded focus:ring-2 focus:ring-blue-400"
                      />
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{patient.id}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 font-medium">{patient.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{patient.examination}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`font-bold px-2 py-1 rounded-full text-xs ${
                        patient.commission.includes('-')
                          ? 'text-white bg-red-500'
                          : 'text-white bg-green-500'
                      }`}>
                        {patient.commission}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{patient.transferDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Calendar className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-600 mb-2">No patients found</h3>
            <p className="text-slate-500">
              {selectedMonth
                ? `No ${selectedType === 'prescription' ? 'prescription' : 'realization'} data available for ${selectedMonth}`
                : 'Please select a month to view patient data'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredPatients.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="flex items-center px-4 py-2 text-sm text-black font-bold hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            <span className="px-4 py-2 rounded-lg bg-gray-100 text-sm font-bold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center px-4 py-2 text-sm text-black font-bold hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Total Commission */}
      <div className="px-6 py-4 border-t-2 border-blue-200 bg-blue-50">
        <div className="text-center">
          <span className="text-xl font-semibold text-slate-800">
            Total Commission: <span className="text-blue-600 font-bold">
              {getTotalCommission().toFixed(2)} FCFA
            </span>
          </span>
          {selectedMonth && (
            <p className="text-sm text-slate-600 mt-1">
              {selectedMonth} - {selectedType === 'prescription' ? 'Prescription' : 'Realization'} ({invoiceStatus === 'invoiced' ? 'Invoiced' : 'Not Invoiced'})
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientsView;