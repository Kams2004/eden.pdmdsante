import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, Printer, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from "../../../../api/axioConfig";

interface Patient {
  id: string;
  name: string;
  examination: string;
  commission: string;
  transferDate: string;
  facture: string;
  selected: boolean;
}

interface MobileCommissionContentProps {
  selectedPatients?: string[];
}

const MobileCommissionContent: React.FC<MobileCommissionContentProps> = ({ selectedPatients = [] }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 5;

  const fetchPatientsData = async () => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        console.error('No user data found in localStorage');
        return;
      }
      const { doctor_id } = JSON.parse(userData);
      const response = await axiosInstance.get(`gnu_doctor/${doctor_id}/commissions/`);
      const formattedPatients = Object.entries(response.data).flatMap(([doctorName, commissionData]) =>
        (commissionData as Array<{
          Date: string;
          Examen: string;
          Facturé: string;
          Montant: string;
          Patient: string;
          Produit: string;
          Validé: boolean | null;
        }>).map((item, index) => ({
          id: `P${index + 1}`,
          name: item.Patient,
          examination: item.Examen,
          commission: `${item.Montant} FCFA`,
          transferDate: new Date(item.Date).toLocaleDateString(),
          facture: item.Facturé ? 'Invoiced' : 'Not Invoiced',
          selected: selectedPatients.includes(item.Patient),
        }))
      );
      setPatients(formattedPatients);
      setFilteredPatients(formattedPatients);
    } catch (error) {
      console.error('Error fetching patients data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientsData();
  }, []);

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
    console.log('Filter clicked with dates:', startDate, endDate);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setSelectAll(false);
    setFilteredPatients(patients.map(patient => ({ ...patient, selected: false })));
  };

  const handlePrint = () => {
    const selectedPatients = filteredPatients.filter(patient => patient.selected);
    if (selectedPatients.length === 0) {
      alert("Please select at least one patient to print");
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Patient Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #1a56db; }
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
              ${selectedPatients.map(patient => `
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
            Total Commission: ${selectedPatients.reduce((sum, patient) => {
              const amount = parseFloat(patient.commission.replace(/[^\d.]/g, ''));
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

  const getFactureColor = (facture: string) => {
    return facture === 'Invoiced' ? 'bg-orange-500' : 'bg-red-500';
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-4">
          <h1 className="text-xl font-semibold text-slate-800">Commissions</h1>
          <p className="text-slate-500 text-sm mt-1">Au service de votre santé</p>
          <div className="w-12 h-1 bg-blue-400 mt-2 rounded-full"></div>
        </div>
        {/* Loading for filter section */}
        <div className="px-4 sm:px-6 py-4 bg-slate-50/50 border-b border-slate-200">
          <div className="space-y-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-10 w-10 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex flex-row space-x-2 w-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 p-2 bg-slate-200 rounded-lg flex items-center justify-center">
                  <div className="flex space-x-1">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${j * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-4 w-48 bg-slate-200 rounded animate-pulse"></div>
        </div>
        {/* Loading for patient cards */}
        <div className="px-4 py-2">
          <div className="flex items-center mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="h-4 w-4 bg-slate-200 rounded mr-3"></div>
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-blue-300 opacity-15 rounded-full translate-y-6 -translate-x-6"></div>
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="h-4 w-4 bg-slate-200 rounded"></div>
                    <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
                <div className="mb-3 relative z-10">
                  <div className="h-6 w-3/4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-10 w-full bg-slate-200 rounded-lg"></div>
                </div>
                <div className="flex justify-end items-center pt-3 border-t border-blue-200 relative z-10">
                  <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Loading for pagination */}
        <div className="px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
            <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
        {/* Loading for total commission */}
        <div className="px-4 sm:px-6 py-4 border-t-2 border-blue-200 bg-blue-50 sticky bottom-0">
          <div className="h-6 w-48 bg-slate-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-4">
        <h1 className="text-xl font-semibold text-slate-800">Commissions</h1>
        <p className="text-slate-500 text-sm mt-1">Au service de votre santé</p>
        <div className="w-12 h-1 bg-blue-400 mt-2 rounded-full"></div>
      </div>
      <div className="px-4 sm:px-6 py-4 bg-slate-50/50 border-b border-slate-200">
        <div className="space-y-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-700">Filter by Date Range</h3>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
          {showDatePicker && (
            <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white hover:border-slate-400 transition-colors"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white hover:border-slate-400 transition-colors"
                />
              </div>
            </div>
          )}
          <div className="flex flex-row space-x-2 w-full">
            <button
              onClick={handleFilter}
              className="flex-1 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center transition-colors shadow-sm"
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="flex-1 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-600">Showing {indexOfFirstPatient + 1} to {Math.min(indexOfLastPatient, filteredPatients.length)} of {filteredPatients.length} patients</p>
      </div>
      <div className="px-4 py-2">
        <div className="flex items-center mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            className="w-4 h-4 text-blue-500 border-slate-300 rounded mr-3 focus:ring-2 focus:ring-blue-400"
          />
          <span className="text-sm font-medium text-slate-700">Select All ({filteredPatients.filter(p => p.selected).length} selected)</span>
        </div>
        <div className="space-y-3">
          {currentPatients.map((patient, index) => (
            <div key={patient.id || index} className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-blue-300 opacity-15 rounded-full translate-y-6 -translate-x-6"></div>
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={patient.selected}
                    onChange={() => handlePatientSelect(patient.id)}
                    className="w-4 h-4 text-blue-500 border-slate-300 rounded focus:ring-2 focus:ring-blue-400"
                  />
                  <span className="text-xs font-medium flex items-center text-black bg-white px-2 py-1 rounded-full">
                    <Calendar className="w-3 h-3 mr-1 text-black" />
                    {patient.transferDate}
                  </span>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded text-white ${getFactureColor(patient.facture)}`}>
                  {patient.facture}
                </span>
              </div>
              <div className="mb-3 relative z-10">
                <h1 className="text-base font-bold mb-2 text-blue-800">{patient.name}</h1>
                <p className="text-xs font-medium text-gray-600 bg-white p-2 rounded-lg border border-blue-200">
                  {patient.examination}
                </p>
              </div>
              <div className="flex justify-end items-center pt-3 border-t border-blue-200 relative z-10">
                <span className="text-sm font-bold text-white bg-green-500 px-3 py-1 rounded-full">{patient.commission}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-2 text-sm text-black font-bold hover:text-black hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Previous</span>
          </button>
          <span className="text-sm text-black font-bold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-2 text-sm text-black font-bold hover:text-black hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
      <div className="px-4 sm:px-6 py-4 border-t-2 border-blue-200 bg-blue-50 sticky bottom-0">
        <div className="text-center sm:text-right">
          <span className="text-lg sm:text-xl font-semibold text-slate-800">
            Total Commission: <span className="text-blue-600 font-bold">
              {filteredPatients.reduce((sum, patient) => {
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

export default MobileCommissionContent;
