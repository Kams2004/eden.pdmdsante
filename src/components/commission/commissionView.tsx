import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axiosInstance from "../../api/axioConfig";
import {
  Filter,
  RefreshCw,
  Printer,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Activity,
  Search,
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  examination: string;
  commission: string;
  transferDate: string;
  facture: string;
  selected: boolean;
}

interface CommissionData {
  montant_total: number;
  prescription: {
    data_prescription: any[];
    montant_prescription: number;
  };
  realisation: {
    data_realisation: any[];
    montant_realisation: number;
  };
}

interface CommissionViewProps {
  selectedPatients?: string[];
}

const CommissionView: React.FC<CommissionViewProps> = ({
  selectedPatients = [],
}) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [prescriptionPatients, setPrescriptionPatients] = useState<Patient[]>(
    []
  );
  const [realisationPatients, setRealisationPatients] = useState<Patient[]>([]);
  const [filteredPrescriptionPatients, setFilteredPrescriptionPatients] =
    useState<Patient[]>([]);
  const [filteredRealisationPatients, setFilteredRealisationPatients] =
    useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"prescription" | "realisation">(
    "prescription"
  );
  const [commissionData, setCommissionData] = useState<CommissionData | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  const patientsPerPage = 10;

  const fetchPatientsData = async () => {
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        console.error("Aucune donnée utilisateur trouvée dans localStorage");
        return;
      }

      const { doctor_id } = JSON.parse(userData);
      const response = await axiosInstance.get(
        `gnu_doctor/${doctor_id}/commissions/`
      );
      setCommissionData(response.data);
      const formattedPrescriptionPatients =
        response.data.prescription.data_prescription.map(
          (item: any, index: number) => ({
            id: `PR${index + 1}`,
            name: item.Patient,
            examination: item.Examen,
            commission: `${item.Montant} FCFA`,
            transferDate: new Date(item.Date).toLocaleDateString(),
            facture: item.Facturé === "invoiced" ? "Facturé" : "Non facturé",
            selected: selectedPatients.includes(item.Patient),
          })
        );
      const formattedRealisationPatients =
        response.data.realisation.data_realisation.map(
          (item: any, index: number) => ({
            id: `RE${index + 1}`,
            name: item.Patient,
            examination: item.Examen,
            commission: `${item.Montant} FCFA`,
            transferDate: new Date(item.Date).toLocaleDateString(),
            facture: item.Facturé === "invoiced" ? "Facturé" : "Non facturé",
            selected: selectedPatients.includes(item.Patient),
          })
        );
      setPrescriptionPatients(formattedPrescriptionPatients);
      setRealisationPatients(formattedRealisationPatients);
      setFilteredPrescriptionPatients(formattedPrescriptionPatients);
      setFilteredRealisationPatients(formattedRealisationPatients);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données des patients :",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientsData();
  }, []);

  useEffect(() => {
    const filterPatientsByDateAndSearch = () => {
      const filterByDateAndSearch = (patients: Patient[]) => {
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

        return filtered;
      };
      setFilteredPrescriptionPatients(
        filterByDateAndSearch(prescriptionPatients)
      );
      setFilteredRealisationPatients(
        filterByDateAndSearch(realisationPatients)
      );
      setCurrentPage(1);
    };
    filterPatientsByDateAndSearch();
  }, [
    startDate,
    endDate,
    prescriptionPatients,
    realisationPatients,
    searchTerm,
  ]);

  const getCurrentPatients = () => {
    return activeTab === "prescription"
      ? filteredPrescriptionPatients
      : filteredRealisationPatients;
  };

  const setCurrentPatients = (updatedPatients: Patient[]) => {
    if (activeTab === "prescription") {
      setFilteredPrescriptionPatients(updatedPatients);
    } else {
      setFilteredRealisationPatients(updatedPatients);
    }
  };

  const handleFilter = () => {
    console.log("Filtre cliqué avec les dates :", startDate, endDate);
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setSearchTerm("");
    setSelectAll(false);
    setFilteredPrescriptionPatients(
      prescriptionPatients.map((patient) => ({ ...patient, selected: false }))
    );
    setFilteredRealisationPatients(
      realisationPatients.map((patient) => ({ ...patient, selected: false }))
    );
  };

  const handlePrint = () => {
    const currentPatients = getCurrentPatients();
    const selectedPatients = currentPatients.filter(
      (patient) => patient.selected
    );

    if (selectedPatients.length === 0) {
      alert("Veuillez sélectionner au moins un patient pour imprimer");
      return;
    }
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rapport de ${
          activeTab === "prescription" ? "Prescription" : "Réalisation"
        }</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #1a56db; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f8fafc; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          .total { margin-top: 20px; text-align: right; font-weight: bold; font-size: 18px; color: black; }
          .invoiced { color: red; }
          .not-invoiced { color: #4b5563; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">PDMD</div>
          <p>Rapport de ${
            activeTab === "prescription" ? "Prescription" : "Réalisation"
          } - ${new Date().toLocaleDateString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom du Patient</th>
              <th>Examen</th>
              <th>Commission</th>
              <th>Date de Transfert</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            ${selectedPatients
              .map(
                (patient) => `
              <tr>
                <td>${patient.id}</td>
                <td>${patient.name}</td>
                <td>${patient.examination}</td>
                <td>${patient.commission}</td>
                <td>${patient.transferDate}</td>
                <td class="${
                  patient.facture === "Facturé" ? "invoiced" : "not-invoiced"
                }">
                  ${patient.facture}
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div class="total">
          Commission Totale: ${selectedPatients
            .reduce((sum, patient) => {
              const amount = parseFloat(
                patient.commission.replace(/[^\d.]/g, "")
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
    const currentPatients = getCurrentPatients();
    const updatedPatients = currentPatients.map((patient) => ({
      ...patient,
      selected: !selectAll,
    }));
    setCurrentPatients(updatedPatients);
    setSelectAll(!selectAll);
  };

  const handlePatientSelect = (id: string) => {
    const currentPatients = getCurrentPatients();
    const updatedPatients = currentPatients.map((patient) =>
      patient.id === id ? { ...patient, selected: !patient.selected } : patient
    );
    setCurrentPatients(updatedPatients);
  };

  const getFactureColor = (facture: string) => {
    return facture === "Facturé" ? "bg-[#31B749]" : "bg-[#F03940]";
  };

  const currentPatients = getCurrentPatients();
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const paginatedPatients = currentPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );
  const totalPages = Math.ceil(currentPatients.length / patientsPerPage);

  const goToNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Commissions</h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto mt-2 rounded-full"></div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <span className="ml-3 text-slate-600">
            Chargement des données de commission...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {commissionData && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Aperçu des Commissions Totales
            </h2>
            <p className="text-sm opacity-90 mb-4">
              (du 21 Mai au{" "}
              {new Date().toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
              })}
              )
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-sm opacity-90">Total Général</p>
                <p className="text-2xl font-bold">
                  {commissionData.montant_total.toFixed(2)} FCFA
                </p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-sm opacity-90">Total Prescription</p>
                <p className="text-2xl font-bold">
                  {commissionData.prescription.montant_prescription.toFixed(2)}{" "}
                  FCFA
                </p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-sm opacity-90">Total Réalisation</p>
                <p className="text-2xl font-bold">
                  {commissionData.realisation.montant_realisation.toFixed(2)}{" "}
                  FCFA
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-slate-800">
            Détails des Commissions
          </h1>
          <div className="w-12 h-1 bg-blue-400 mt-2 rounded-full"></div>
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
              Filtrage actif pour: "{searchTerm}" - {currentPatients.length}{" "}
              résultat(s) trouvé(s)
            </p>
          )}
        </div>

        {/* Onglets */}
        <div className="border-b border-slate-200">
          <div className="flex">
            <button
              onClick={() => {
                setActiveTab("prescription");
                setCurrentPage(1);
                setSelectAll(false);
              }}
              className={`flex-1 px-6 py-3 text-sm font-medium flex items-center justify-center space-x-2 border-b-2 transition-colors ${
                activeTab === "prescription"
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Prescription ({filteredPrescriptionPatients.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("realisation");
                setCurrentPage(1);
                setSelectAll(false);
              }}
              className={`flex-1 px-6 py-3 text-sm font-medium flex items-center justify-center space-x-2 border-b-2 transition-colors ${
                activeTab === "realisation"
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Réalisation ({filteredRealisationPatients.length})</span>
            </button>
          </div>
        </div>
        {/* Section de Filtre */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-700">
                Filtrer par Plage de Dates
              </h3>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm ml-4"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>

            {showDatePicker && (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm mb-4">
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-800 mb-1">
                    Date de Début
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date: Date | null) => setStartDate(date)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white hover:border-slate-400 transition-colors"
                    placeholderText="Sélectionner la date de début"
                    maxDate={endDate || new Date()}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-800 mb-1">
                    Date de Fin
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date: Date | null) => setEndDate(date)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white hover:border-slate-400 transition-colors"
                    placeholderText="Sélectionner la date de fin"
                    minDate={startDate}
                    maxDate={new Date()}
                  />
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleFilter}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtrer
              </button>
              <button
                onClick={handleReset}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réinitialiser
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Affichage de {indexOfFirstPatient + 1} à{" "}
            {Math.min(indexOfLastPatient, currentPatients.length)} sur{" "}
            {currentPatients.length} enregistrements de{" "}
            {activeTab === "prescription" ? "Prescription" : "Réalisation"}
          </p>
        </div>
        {/* Sélectionner Tout */}
        <div className="px-6 py-4">
          <div className="flex items-center mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-500 border-slate-300 rounded mr-3 focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-sm font-medium text-slate-700">
              Tout Sélectionner (
              {currentPatients.filter((p) => p.selected).length} sélectionné(s))
            </span>
          </div>
          {/* Tableau pour Ordinateur */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Sélection
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Patients
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Examens
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Commissions
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Dates
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Statuts
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={patient.selected}
                        onChange={() => handlePatientSelect(patient.id)}
                        className="w-4 h-4 text-blue-500 border-slate-300 rounded focus:ring-2 focus:ring-blue-400"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                      {patient.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                      {patient.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {patient.examination}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-semibold">
                      {patient.commission}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {patient.transferDate}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`border-[0.4px] border-gray-300 rounded-[10px] p-[5px] text-center text-white ${getFactureColor(
                          patient.facture
                        )}`}
                      >
                        <span className="font-bold text-xs">
                          {patient.facture}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 text-sm text-black font-bold hover:text-black hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Précédent</span>
            </button>
            <span className="px-4 py-2 rounded-lg bg-gray-100">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 text-sm text-black font-bold hover:text-black hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Suivant</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
        {/* Section Totale */}
        <div className="px-6 py-4 border-t-2 border-blue-200 bg-blue-50">
          <div className="text-center md:text-right">
            <span className="text-lg md:text-xl font-semibold text-slate-800">
              {activeTab === "prescription" ? "Prescription" : "Réalisation"}{" "}
              Total:{" "}
              <span className="text-blue-600 font-bold">
                {activeTab === "prescription"
                  ? commissionData?.prescription.montant_prescription.toFixed(2)
                  : commissionData?.realisation.montant_realisation.toFixed(
                      2
                    )}{" "}
                FCFA
              </span>
            </span>
          </div>
        </div>
        {/* Section Note */}
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
                Le calcul se fait en rassemblant tous les patients d'une
                assurance sous une seule facture et en mentionnant le nom du
                réalisateur sur chaque ligne de cette facture.
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
    </div>
  );
};

export default CommissionView;
