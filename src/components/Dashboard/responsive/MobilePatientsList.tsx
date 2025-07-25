import React, { useState, useEffect } from 'react';
import axiosInstance from "../../../api/axioConfig";
import { List, Eye } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  checked: boolean;
}

interface MobilePatientsListProps {
  onDetailsClick: (selectedPatients: string[]) => void;
}

const MobilePatientsList: React.FC<MobilePatientsListProps> = ({ onDetailsClick }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const patientsPerPage = 9;

  useEffect(() => {
    const fetchPatientsData = async () => {
      try {
        const userData = localStorage.getItem('userData');
        if (!userData) {
          console.error('No user data found in localStorage');
          return;
        }

        const { doctor_id } = JSON.parse(userData);
        const response = await axiosInstance.get(`gnu_doctor/${doctor_id}/exams-patients`);
        const { data_patients } = response.data;

        const uniquePatientNames = Array.from(new Set(data_patients.map((patientData: any) => Object.keys(patientData)[0]))) as string[];
        const uniquePatients = uniquePatientNames.map((name, index) => ({
          id: index + 1,
          name,
          checked: false
        }));

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
      patient.id === id ? { ...patient, checked: !patient.checked } : patient
    ));
  };

  const handleDetailsClick = () => {
    const selectedPatients = patients.filter(patient => patient.checked).map(patient => patient.name);
    if (selectedPatients.length === 0) {
      alert('Please select at least one patient to view details');
      return;
    }
    onDetailsClick(selectedPatients);
  };

  const selectedCount = patients.filter(patient => patient.checked).length;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-20 h-20 bg-gray-100 opacity-30 rounded-full -translate-y-10 -translate-x-10"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-slate-200 opacity-20 rounded-full translate-y-12 translate-x-12"></div>
      <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-gray-200 opacity-40 rounded-full"></div>

      <h3 className="text-gray-900 font-medium mb-4 relative z-10">Patients List</h3>
      
      <div className="flex flex-row gap-2 mb-4 relative z-10 items-center">
        <div className="flex-1 relative max-w-xs">
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

        <button 
          onClick={handleDetailsClick}
          className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors relative"
          title={`View details for ${selectedCount} selected patient(s)`}
        >
          <Eye size={18} />
          {selectedCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {selectedCount}
            </span>
          )}
        </button>

        <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <List size={18} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {currentPatients.map((patient) => (
            <div key={patient.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors">
              <input
                type="checkbox"
                checked={patient.checked}
                onChange={() => handleSelectPatient(patient.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 flex-1">{patient.name}</span>
              {patient.checked && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 relative z-10">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <i className="ri-arrow-left-line text-gray-600"></i>
        </button>

        <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <i className="ri-arrow-right-line text-gray-600"></i>
        </button>
      </div>

      {selectedCount > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg relative z-10">
          <p className="text-sm text-blue-700 font-medium">
            {selectedCount} patient{selectedCount > 1 ? 's' : ''} selected
          </p>
          <p className="text-xs text-blue-600">
            Click the eye icon to view details
          </p>
        </div>
      )}
    </div>
  );
};

export default MobilePatientsList;