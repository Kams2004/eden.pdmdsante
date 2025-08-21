import React, { useState, useEffect } from "react";
import {
  Filter,
  RefreshCw,
  Printer,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
} from "lucide-react";
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

const PatientsView: React.FC<PatientsViewProps> = ({
  selectedPatients = [],
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  // États de filtrage améliorés
  const [invoiceStatus, setInvoiceStatus] = useState<
    "invoiced" | "Notinvoiced"
  >("invoiced");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedType, setSelectedType] = useState<
    "prescription" | "realisation"
  >("prescription");
  const [showFilters, setShowFilters] = useState(false);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const patientsPerPage = 6;
  const currentYear = new Date().getFullYear();

  const fetchPatientsData = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem("userData");
      if (!userData) {
        console.error("Aucune donnée utilisateur trouvée dans localStorage");
        return;
      }
      const { doctor_id } = JSON.parse(userData);
      // Récupérer les données en fonction du statut de la facture
      const response = await axiosInstance.get(
        `/doctor_com/invoiced_by_year/${doctor_id}/${currentYear}/${invoiceStatus}`
      );
      setMonthlyData(response.data);
      // Si aucun mois n'est sélectionné, sélectionnez le premier mois disponible avec des données
      if (!selectedMonth) {
        const monthsWithData = Object.keys(response.data).filter(
          (month) =>
            month !== "Total" &&
            (response.data[month]?.elements_prescription?.data_patients
              ?.length > 0 ||
              response.data[month]?.elements_realisation?.data_patients
                ?.length > 0)
        );
        if (monthsWithData.length > 0) {
          setSelectedMonth(monthsWithData[0]);
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données des patients:",
        error
      );
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
    const typeData =
      selectedType === "prescription"
        ? monthData.elements_prescription
        : monthData.elements_realisation;
    if (!typeData?.data_patients) {
      setPatients([]);
      setFilteredPatients([]);
      return;
    }
    const formattedPatients = typeData.data_patients.map(
      (patientData: any, index: number) => {
        const patientName = Object.keys(patientData)[0];
        const [examination, patientCommission, transferDate] =
          patientData[patientName];
        return {
          id: `P${index + 1}`,
          name: patientName,
          examination,
          commission: `${patientCommission} FCFA`,
          transferDate: new Date(transferDate).toLocaleDateString(),
          selected: selectedPatients.includes(patientName),
        };
      }
    );
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
    const filterPatientsByDateAndSearch = () => {
      let filtered = [...patients];

      // Filter by date range
      if (startDate) {
        const start = new Date(startDate);
        filtered = filtered.filter(
          (patient) => new Date(patient.transferDate) >= start
        );
      }
      if (endDate) {
        const end = new Date(endDate);
        filtered = filtered.filter(
          (patient) => new Date(patient.transferDate) <= end
        );
      }

      // Filter by search term (patient name)
      if (searchTerm.trim() !== "") {
        filtered = filtered.filter((patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
        );
      }

      setFilteredPatients(filtered);
      setCurrentPage(1);
    };
    filterPatientsByDateAndSearch();
  }, [startDate, endDate, patients, searchTerm]);

  const handleFilter = () => {
    console.log("Filtre appliqué avec les sélections actuelles");
  };

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
          <title>Rapport des Patients - ${invoiceStatus} - ${selectedMonth} - ${selectedType}</title>
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
            <div class="logo">PDMD</div>
            <p>Rapport des Patients - ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="filter-info">
            <p><strong>Statut:</strong> ${
              invoiceStatus === "invoiced" ? "Facturé" : "Non Facturé"
            } | <strong>Mois:</strong> ${selectedMonth} | <strong>Type:</strong> ${
      selectedType === "prescription" ? "Prescription" : "Réalisation"
    }</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom du Patient</th>
                <th>Examen</th>
                <th>Commission</th>
                <th>Date de Transfert</th>
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
                  <td>${patient.commission}</td>
                  <td>${patient.transferDate}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="total">
            Commission Totale: ${selectedPatientsData
              .reduce((sum, patient) => {
                const amount = parseFloat(
                  patient.commission.replace(/[^\d.-]/g, "")
                );
                return sum + (isNaN(amount) ? 0 : amount);
              }, 0)
              .toFixed(2)} FCFA
          </div>
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

  const getTotalCommission = () => {
    if (!monthlyData || !selectedMonth || !monthlyData[selectedMonth]) return 0;
    const monthData = monthlyData[selectedMonth];
    const typeData =
      selectedType === "prescription"
        ? monthData.elements_prescription
        : monthData.elements_realisation;
    return typeData?.commission || 0;
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Patients Enregistrés
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            À votre service pour votre santé
          </p>
          <div className="w-24 h-1 bg-blue-500 mx-auto mt-2 rounded-full"></div>
        </div>
        <div className="text-center py-8">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-gray-600">
              Chargement des données des patients...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <h2 className="text-2xl font-bold text-slate-800">
          Patients Enregistrés
        </h2>
        <div className="w-24 h-1 bg-blue-500 mt-2 rounded-full"></div>
      </div>

      {/* Search Bar - Prominent Position */}
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

      {/* Section de Filtre Améliorée */}
      <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200">
        <div className="space-y-4">
          {/* Contrôles Principaux de Filtre */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-700">
              Options de Filtre
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
          {/* Sélection du Statut de la Facture */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setInvoiceStatus("invoiced")}
              className={`p-3 rounded-lg border transition-colors ${
                invoiceStatus === "invoiced"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-slate-700 border-slate-300 hover:border-blue-400"
              }`}
            >
              Facturé
            </button>
            <button
              onClick={() => setInvoiceStatus("Notinvoiced")}
              className={`p-3 rounded-lg border transition-colors ${
                invoiceStatus === "Notinvoiced"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-slate-700 border-slate-300 hover:border-blue-400"
              }`}
            >
              Non Facturé
            </button>
          </div>
          {showFilters && (
            <>
              {/* Sélection du Mois */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sélectionner le Mois
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                >
                  <option value="">Sélectionner un mois</option>
                  {monthlyData &&
                    Object.keys(monthlyData)
                      .filter((month) => month !== "Total")
                      .map((month) => (
                        <option key={month} value={month}>
                          {month} (
                          {monthlyData[month]?.elements_prescription
                            ?.data_patients?.length || 0}{" "}
                          prescriptions,{" "}
                          {monthlyData[month]?.elements_realisation
                            ?.data_patients?.length || 0}{" "}
                          réalisations)
                        </option>
                      ))}
                </select>
              </div>
              {/* Sélection du Type */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedType("prescription")}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedType === "prescription"
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-slate-700 border-slate-300 hover:border-green-400"
                  }`}
                >
                  Prescriptions
                  {monthlyData && selectedMonth && (
                    <span className="block text-xs mt-1">
                      (
                      {monthlyData[selectedMonth]?.elements_prescription
                        ?.data_patients?.length || 0}
                      )
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setSelectedType("realisation")}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedType === "realisation"
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-slate-700 border-slate-300 hover:border-green-400"
                  }`}
                >
                  Réalisation
                  {monthlyData && selectedMonth && (
                    <span className="block text-xs mt-1">
                      (
                      {monthlyData[selectedMonth]?.elements_realisation
                        ?.data_patients?.length || 0}
                      )
                    </span>
                  )}
                </button>
              </div>
              {/* Filtre par Plage de Dates */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-slate-700">
                  Filtrer par Plage de Dates
                </h4>
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
            </>
          )}
          {/* Boutons d'Action */}
          <div className="flex gap-2">
            <button
              onClick={handleFilter}
              className="flex-1 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center transition-colors shadow-sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtrer
            </button>
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
        </div>
        <p className="text-sm text-slate-600 mt-4">
          Affichage de {indexOfFirstPatient + 1} à{" "}
          {Math.min(indexOfLastPatient, filteredPatients.length)} sur{" "}
          {filteredPatients.length} patients
          {selectedMonth && (
            <span className="ml-2 text-blue-600 font-medium">
              | {selectedMonth} -{" "}
              {selectedType === "prescription" ? "Prescription" : "Réalisation"}{" "}
              ({invoiceStatus === "invoiced" ? "Facturé" : "Non Facturé"})
            </span>
          )}
        </p>
      </div>
      {/* Tableau des Patients */}
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
                    Patients
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Examens
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Commissions
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Date de Transfert
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
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`font-bold px-2 py-1 rounded-full text-xs ${
                          patient.commission.includes("-")
                            ? "text-white bg-red-500"
                            : "text-white bg-green-500"
                        }`}
                      >
                        {patient.commission}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {patient.transferDate}
                    </td>
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
            <h3 className="text-lg font-medium text-slate-600 mb-2">
              Aucun patient trouvé
            </h3>
            <p className="text-slate-500">
              {selectedMonth
                ? `Aucune donnée de ${
                    selectedType === "prescription"
                      ? "prescription"
                      : "réalisation"
                  } disponible pour ${selectedMonth}`
                : "Veuillez sélectionner un mois pour voir les données des patients"}
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
      {/* Commission Totale */}
      <div className="px-6 py-4 border-t-2 border-blue-200 bg-blue-50">
        <div className="text-center">
          <span className="text-xl font-semibold text-slate-800">
            Commission Totale:{" "}
            <span className="text-blue-600 font-bold">
              {getTotalCommission().toFixed(2)} FCFA
            </span>
          </span>
          {selectedMonth && (
            <p className="text-sm text-slate-600 mt-1">
              {selectedMonth} -{" "}
              {selectedType === "prescription" ? "Prescription" : "Réalisation"}{" "}
              ({invoiceStatus === "invoiced" ? "Facturé" : "Non Facturé"})
            </p>
          )}
        </div>
      </div>
      <div className="px-6 py-4 border-t-2 border-gray-200 bg-gray-50">
        <div className="text-center md:text-left">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Note:</h3>
          <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
            <li>
              Les noms de patients avec pour préfixe ou suffixe le mot{" "}
              <span className="font-bold">PATIENT</span> sont des commissions
              réalisateurs calculées après obtention de la liste des
              réalisations.
            </li>
            <li>
              Le calcul se fait en rassemblant tous les patients d'une assurance
              sous une seule facture et en mentionnant le nom du réalisateur sur
              chaque ligne de cette facture.
            </li>
            <li>
              Les montants en brillance rouge qui sont des montants négatifs
              sont les résultants des crédits et/ou remboursements de factures
              aux noms des patients mentionnés.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PatientsView;
