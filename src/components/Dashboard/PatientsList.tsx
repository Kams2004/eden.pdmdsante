import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, List, Search } from 'lucide-react';
import axiosInstance from "../../api/axioConfig";

interface PatientsListProps {
  onDetailsClick: (selectedPatients: string[]) => void;
}

const PatientsList: React.FC<PatientsListProps> = ({ onDetailsClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [patients, setPatients] = useState<{ id: number; name: string; selected: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const patientsPerPage = 9; // Increase the number to ensure enough patients per page

  useEffect(() => {
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

        const uniquePatients = Array.from(new Set(data_patients.map((patientData: any) => Object.keys(patientData)[0])))
          .map((name, index) => ({ id: index + 1, name, selected: false }));

        setPatients(uniquePatients);
      } catch (error) {
        console.error('Error fetching patients data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientsData();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const handleSelectPatient = (id: number) => {
    setPatients(patients.map(patient =>
      patient.id === id ? { ...patient, selected: !patient.selected } : patient
    ));
  };

  const handleDetailsClick = () => {
    const selectedPatients = patients.filter(patient => patient.selected).map(patient => patient.name);
    onDetailsClick(selectedPatients);
  };

  // Function to distribute patients into columns ensuring at least 3 entries per column
  const distributePatients = (patients) => {
    const columns = [[], [], []]; // Three columns
    patients.forEach((patient, index) => {
      columns[index % 3].push(patient);
    });
    return columns;
  };

  const patientColumns = distributePatients(currentPatients);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-2 relative">
      {loading && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span className="text-sm">Loading patients data...</span>
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-800 mb-4">Patients List</h3>
      <div className="flex items-center mb-4">
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Search patients..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <button
          onClick={handleDetailsClick}
          className="flex items-center ml-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          <List className="w-4 h-4 mr-2" />
          Details
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="flex justify-between">
          {patientColumns.map((column, columnIndex) => (
            <div key={columnIndex} className="flex-1 px-4">
              {column.map((patient) => (
                <div key={patient.id} className="flex items-center py-2 border-b border-gray-200">
                  <input
                    type="checkbox"
                    checked={patient.selected}
                    onChange={() => handleSelectPatient(patient.id)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-800">{patient.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center items-center mt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 border rounded disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 border rounded disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientsList;
