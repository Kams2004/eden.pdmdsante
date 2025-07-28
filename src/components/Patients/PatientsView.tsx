import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Filter, RefreshCcw, ChevronLeft, ChevronRight, Printer } from "lucide-react";
import axiosInstance from "../../api/axioConfig";

interface Patient {
  id: string;
  name: string;
  examination: string;
  commission: number;
  transferDate: Date;
  selected?: boolean;
}

interface PatientsViewProps {
  selectedPatients: string[];
}

const PatientsView: React.FC<PatientsViewProps> = ({ selectedPatients }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [originalPatients, setOriginalPatients] = useState<Patient[]>([]);
  const [isReset, setIsReset] = useState<boolean>(false);
  const itemsPerPage = 6; // Set to 6 elements per page

  const fetchPatientsData = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('userData');
      if (!userData) {
        console.error('No user data found in localStorage');
        return;
      }
      const { doctor_id } = JSON.parse(userData);
      const response = await axiosInstance.get(`gnu_doctor/${doctor_id}/exams-patients`);
      const { data_patients } = response.data;
      const formattedPatients = data_patients.map((patientData: any, index: number) => {
        const patientName = Object.keys(patientData)[0];
        const [examination, patientCommission, transferDate] = patientData[patientName];
        return {
          id: `P${index + 1}`,
          name: patientName,
          examination,
          commission: parseFloat(patientCommission),
          transferDate: new Date(transferDate),
          selected: isReset ? false : selectedPatients.includes(patientName),
        };
      });
      setOriginalPatients(formattedPatients);
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
  }, [selectedPatients, isReset]);

  useEffect(() => {
    let filtered = [...patients];
    if (startDate) {
      filtered = filtered.filter(patient => patient.transferDate >= startDate!);
    }
    if (endDate) {
      filtered = filtered.filter(patient => patient.transferDate <= endDate!);
    }
    if (!isReset && selectedPatients.length > 0) {
      filtered = filtered.filter(patient => selectedPatients.includes(patient.name));
    }
    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [startDate, endDate, patients, isReset, selectedPatients]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2) + " FCFA";
  };

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setIsReset(true);
    setSelectAll(false);
    const resetPatients = originalPatients.map(patient => ({ ...patient, selected: false }));
    setPatients(resetPatients);
    setFilteredPatients(resetPatients);
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setFilteredPatients(filteredPatients.map(patient => ({ ...patient, selected: !selectAll })));
  };

  const handleSelectPatient = (id: string) => {
    setFilteredPatients(filteredPatients.map(patient =>
      patient.id === id ? { ...patient, selected: !patient.selected } : patient
    ));
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
                  <td>${formatCurrency(patient.commission)}</td>
                  <td>${formatDate(patient.transferDate)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            Total Commission: ${formatCurrency(selectedPatients.reduce((sum, patient) => sum + patient.commission, 0))}
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

  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalCommissions = paginatedPatients.reduce((sum, patient) => sum + patient.commission, 0);

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 relative">
      {loading && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span className="text-sm">Loading patients data...</span>
          </div>
        </div>
      )}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Registered Patients</h2>
        <div className="w-24 h-1 bg-blue-500 mx-auto mt-2 rounded-full"></div>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-bold text-gray-800 mb-1">
              Start Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select start date"
              maxDate={endDate || new Date()}
              disabled={loading}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-bold text-gray-800 mb-1">
              End Date
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select end date"
              minDate={startDate}
              maxDate={new Date()}
              disabled={loading}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button
            onClick={handleReset}
            className="flex items-center px-4 py-2 border-2 border-black text-black rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reset
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Selected
          </button>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredPatients.length} of {patients.length} Patients
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Patient Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Examination
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Commission
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Transfer Date
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                    Loading patients...
                  </div>
                </td>
              </tr>
            ) : paginatedPatients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No patients found
                </td>
              </tr>
            ) : (
              paginatedPatients.map((patient, index) => (
                <tr
                  key={patient.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-[#F7F8FA]' : 'bg-white'}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={patient.selected || false}
                      onChange={() => handleSelectPatient(patient.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{patient.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                    {patient.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {patient.examination}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatCurrency(patient.commission)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(patient.transferDate)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-6">
        <div className="flex justify-end mb-2">
          <p className="text-lg font-bold text-black">
            Total Commission: {formatCurrency(totalCommissions)}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="p-2 border-2 border-black rounded-full text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 py-2 rounded-lg bg-gray-100">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
            className="p-2 border-2 border-black rounded-full text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientsView;
