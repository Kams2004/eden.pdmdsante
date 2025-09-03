import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  exam: string;
  date: string;
}

interface PatientsListProps {
  onSeeMoreClick: () => void;
}

const PatientsList: React.FC<PatientsListProps> = ({ onSeeMoreClick }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const patientsPerPage = 9;

  // Données simulées
  const mockPatients: Patient[] = [
    { id: 1, name: 'Jean Dupont', exam: 'Consultation générale', date: '12/09/2025' },
    { id: 2, name: 'Marie Martin', exam: 'Analyse sanguine', date: '10/09/2025' },
    { id: 3, name: 'Pierre Lefèvre', exam: 'Radiographie', date: '08/09/2025' },
    { id: 4, name: 'Sophie Bernard', exam: 'Vaccination', date: '05/09/2025' },
    // { id: 5, name: 'Lucie Moreau', exam: 'Bilan cardiaque', date: '03/09/2025' },
    // { id: 6, name: 'Thomas Petit', exam: 'Dentaire', date: '01/09/2025' },
    // { id: 7, name: 'Camille Dubois', exam: 'Consultation pédiatrique', date: '28/08/2025' },
    // { id: 8, name: 'Antoine Leroy', exam: 'IRM', date: '25/08/2025' },
    // { id: 9, name: 'Élodie Simon', exam: 'Suivi grossesse', date: '20/08/2025' },
    // { id: 10, name: 'Hugo Lambert', exam: 'Allergologie', date: '15/08/2025' },
  ];

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200 rounded-lg p-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-20 h-20 bg-gray-100 opacity-30 rounded-full -translate-y-10 -translate-x-10"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-slate-200 opacity-20 rounded-full translate-y-12 translate-x-12"></div>
      <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-gray-200 opacity-40 rounded-full"></div>

      <h3 className="text-gray-900 font-medium mb-4 relative z-10">Patient récent</h3>

      <div className="flex items-center mb-4 relative z-10">
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Rechercher des patients..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <button
          onClick={onSeeMoreClick}
          className="ml-auto px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        >
          Voir plus
        </button>
      </div>

      <div className="relative z-10">
        {currentPatients.length > 0 ? (
          <div className="space-y-2">
            {currentPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between py-2 px-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{patient.name}</p>
                  <p className="text-sm text-gray-500">{patient.exam}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{patient.date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500">Aucun patient trouvé.</p>
          </div>
        )}
      </div>

      <div className="flex justify-center items-center mt-4 relative z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 border rounded disabled:opacity-50 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 border rounded disabled:opacity-50 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {filteredPatients.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600 relative z-10">
          Nombre total de patients uniques: {filteredPatients.length}
        </div>
      )}
    </div>
  );
};

export default PatientsList;
