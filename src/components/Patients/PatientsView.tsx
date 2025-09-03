import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Printer,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
} from "lucide-react";
import { startActivityTracking, stopActivityTracking } from "../utils/activityTracker";

interface Patient {
  id: string;
  name: string;
  examination: string;
  realizationDate: string;
  state: "draft" | "validated";
  resultAvailable: boolean;
  selected: boolean;
}

interface PatientsViewProps {
  selectedPatients?: string[];
}

const PatientsView: React.FC<PatientsViewProps> = ({
  selectedPatients = [],
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const patientsPerPage = 6;

  useEffect(() => {
    const handleIdle = () => {
      // You can add logic here to log out or show a warning
    };

    startActivityTracking(handleIdle);

    return () => {
      stopActivityTracking();
    };
  }, []);

  // Mock data for demonstration - replace with your actual data source
  useEffect(() => {
    const mockPatients: Patient[] = [
      {
        id: "P001",
        name: "Jean Dupont",
        examination: "Radiographie Thoracique",
        realizationDate: "2024-01-15",
        state: "validated",
        resultAvailable: true,
        selected: false,
      },
      {
        id: "P002",
        name: "Marie Martin",
        examination: "Échographie Abdominale",
        realizationDate: "2024-01-16",
        state: "draft",
        resultAvailable: false,
        selected: false,
      },
      {
        id: "P003",
        name: "Pierre Dubois",
        examination: "IRM Cérébrale",
        realizationDate: "2024-01-17",
        state: "validated",
        resultAvailable: true,
        selected: false,
      },
      {
        id: "P004",
        name: "Sophie Legrand",
        examination: "Scanner Abdominal",
        realizationDate: "2024-01-18",
        state: "draft",
        resultAvailable: false,
        selected: false,
      },
      {
        id: "P005",
        name: "Michel Bernard",
        examination: "Radiographie Genou",
        realizationDate: "2024-01-19",
        state: "validated",
        resultAvailable: true,
        selected: false,
      },
    ];

    setPatients(mockPatients);
    setFilteredPatients(mockPatients);
  }, []);

  useEffect(() => {
    const filterPatientsByDateAndSearch = () => {
      let filtered = [...patients];

      // Filter by search term (patient name)
      if (searchTerm.trim() !== "") {
        filtered = filtered.filter((patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
        );
      }

      // Filter by date range
      if (startDate) {
        const start = new Date(startDate);
        filtered = filtered.filter(
          (patient) => new Date(patient.realizationDate) >= start
        );
      }
      if (endDate) {
        const end = new Date(endDate);
        filtered = filtered.filter(
          (patient) => new Date(patient.realizationDate) <= end
        );
      }

      setFilteredPatients(filtered);
      setCurrentPage(1);
    };
    filterPatientsByDateAndSearch();
  }, [startDate, endDate, patients, searchTerm]);

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setSelectAll(false);
    setFilteredPatients(
      patients.map((patient) => ({ ...patient, selected: false }))
    );
  };

  const handlePrint = () => {
    const selectedPatientsData = filteredPatients.filter(
      (patient) => patient.selected
    );
    if (selectedPatientsData.length === 0) {
      alert("Veuillez sélectionner au moins un patient à imprimer");
      return;
    }
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rapport des Patients - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #1a56db; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8fafc; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            .state-validated { color: #059669; font-weight: bold; }
            .state-draft { color: #d97706; font-weight: bold; }
            .result-available { color: #059669; }
            .result-unavailable { color: #dc2626; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">PDMD</div>
            <p>Rapport des Patients - ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom du Patient</th>
                <th>Examen</th>
                <th>Date de Réalisation</th>
                <th>État</th>
                <th>Résultat Disponible</th>
              </tr>
            </thead>
            <tbody>
              ${selectedPatientsData
                .map(
                  (patient) => `
                <tr>
                  <td>${patient.id}</td>
                  <td>${patient.name}</td>
                  <td>${patient.examination}</td>
                  <td>${new Date(patient.realizationDate).toLocaleDateString()}</td>
                  <td class="state-${patient.state}">${
                    patient.state === "validated" ? "Validé" : "Brouillon"
                  }</td>
                  <td class="${patient.resultAvailable ? 'result-available' : 'result-unavailable'}">${
                    patient.resultAvailable ? "Disponible" : "Non Disponible"
                  }</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="footer">
            <p>Généré par le Système de Gestion de la PDMD</p>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSelectAll = () => {
    const updatedPatients = filteredPatients.map((patient) => ({
      ...patient,
      selected: !selectAll,
    }));
    setFilteredPatients(updatedPatients);
    setSelectAll(!selectAll);
  };

  const handlePatientSelect = (id: string) => {
    const updatedPatients = filteredPatients.map((patient) =>
      patient.id === id ? { ...patient, selected: !patient.selected } : patient
    );
    setFilteredPatients(updatedPatients);
  };

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const goToNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const getStateIcon = (state: "draft" | "validated") => {
    return state === "validated" ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <Clock className="w-4 h-4 text-orange-500" />
    );
  };

  const getResultIcon = (available: boolean) => {
    return available ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <h2 className="text-2xl font-bold text-slate-800">
          Patients Enregistrés
        </h2>
        <div className="w-24 h-1 bg-blue-500 mt-2 rounded-full"></div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 bg-white border-b border-slate-200">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:border-gray-400 transition-colors"
            placeholder="Rechercher un patient par nom..."
          />
        </div>
        {searchTerm && (
          <p className="text-sm text-blue-600 mt-2">
            Filtrage actif pour: "{searchTerm}" - {filteredPatients.length}{" "}
            résultat(s) trouvé(s)
          </p>
        )}
      </div>

      {/* Date Filter Section */}
      <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-700">
            Filtrer par Date de Réalisation
          </h3>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>

        {showDatePicker && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date de Début
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
                Date de Fin
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réinitialiser
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </button>
        </div>

        <p className="text-sm text-slate-600 mt-4">
          Affichage de {indexOfFirstPatient + 1} à{" "}
          {Math.min(indexOfLastPatient, filteredPatients.length)} sur{" "}
          {filteredPatients.length} patients
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
                  Tout Sélectionner (
                  {filteredPatients.filter((p) => p.selected).length}{" "}
                  sélectionné(s))
                </span>
              </div>
            </div>
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Sélectionner
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Nom du Patient
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Examen
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Date de Réalisation
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    État
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Résultat Disponible
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.map((patient, index) => (
                  <tr
                    key={patient.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-[#F7F8FA]" : "bg-white"
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
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {patient.id}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-800 font-medium">
                      {patient.name}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {patient.examination}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {new Date(patient.realizationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {getStateIcon(patient.state)}
                        <span
                          className={`font-medium ${
                            patient.state === "validated"
                              ? "text-green-600"
                              : "text-orange-500"
                          }`}
                        >
                          {patient.state === "validated" ? "Validé" : "Brouillon"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {getResultIcon(patient.resultAvailable)}
                        <span
                          className={`font-medium ${
                            patient.resultAvailable
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {patient.resultAvailable ? "Disponible" : "Non Disponible"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <FileText className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-600 mb-2">
              Aucun patient trouvé
            </h3>
            <p className="text-slate-500">
              Aucune donnée de patient disponible ou aucun résultat ne correspond à vos critères de recherche.
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
              Précédent
            </button>
            <span className="px-4 py-2 rounded-lg bg-gray-100 text-sm font-bold">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center px-4 py-2 text-sm text-black font-bold hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsView;