import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, Printer, Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import axiosInstance from "../../../../api/axioConfig";

interface Patient {
  id: string;
  name: string;
  examination: string;
  commission: string;
  transferDate: string;
  selected: boolean;
}

interface MobilePatientsContentProps {
  selectedPatients?: string[];
}

const MobilePatientsContent: React.FC<MobilePatientsContentProps> = ({ selectedPatients = [] }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Nouveaux états pour le filtrage amélioré
  const [invoiceStatus, setInvoiceStatus] = useState<'invoiced' | 'Notinvoiced'>('invoiced');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'prescription' | 'realisation'>('prescription');
  const [showFilters, setShowFilters] = useState(false);
  const [monthlyData, setMonthlyData] = useState<any>(null);

  const patientsPerPage = 6;
  const currentYear = new Date().getFullYear();
  // Mois disponibles (vous pouvez rendre cela dynamique en fonction de la réponse de l'API)
  const availableMonths = [
    'JANVIER', 'FEVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
    'JUILLET', 'AOUT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DECEMBRE'
  ];

  const fetchPatientsData = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('userData');
      if (!userData) {
        console.error('Aucune donnée utilisateur trouvée dans localStorage');
        return;
      }
      const { doctor_id } = JSON.parse(userData);

      // Récupérer les données en fonction du statut de la facture
      const response = await axiosInstance.get(`/doctor_com/invoiced_by_year/${doctor_id}/${currentYear}/${invoiceStatus}`);

      setMonthlyData(response.data);

      // Si aucun mois n'est sélectionné, sélectionnez le premier mois disponible avec des données
      if (!selectedMonth) {
        const monthsWithData = Object.keys(response.data).filter(month =>
          month !== 'Total' &&
          response.data[month]?.elements_prescription?.data_patients?.length > 0 ||
          response.data[month]?.elements_realisation?.data_patients?.length > 0
        );
        if (monthsWithData.length > 0) {
          setSelectedMonth(monthsWithData[0]);
        }
      }

    } catch (error) {
      console.error('Erreur lors de la récupération des données des patients :', error);
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
    console.log('Filtre appliqué avec les sélections actuelles');
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
      alert("Veuillez sélectionner au moins un patient pour imprimer");
      return;
    }
    const printWindow = window.open('', '_blank');
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
            <div class="logo">Centre Médical</div>
            <p>Rapport des Patients - ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="filter-info">
            <p><strong>Statut :</strong> ${invoiceStatus === 'invoiced' ? 'Facturé' : 'Non facturé'} | <strong>Mois :</strong> ${selectedMonth} | <strong>Type :</strong> ${selectedType === 'prescription' ? 'Prescription' : 'Réalisation'}</p>
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
            Commission Totale : ${selectedPatients.reduce((sum, patient) => {
              const amount = parseFloat(patient.commission.replace(/[^\d.-]/g, ''));
              return sum + (isNaN(amount) ? 0 : amount);
            }, 0).toFixed(2)} FCFA
          </div>
          <div class="footer">
            <p>Généré par le Système de Gestion du Centre Médical</p>
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
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-4">
          <h1 className="text-xl font-semibold text-slate-800">Patients Enregistrés</h1>
          <p className="text-slate-500 text-sm mt-1">Au service de votre santé</p>
          <div className="w-12 h-1 bg-blue-400 mt-2 rounded-full"></div>
        </div>
        <div className="px-4 py-8 text-center">
          <div className="flex space-x-1 justify-center">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <p className="mt-4 text-slate-600">Chargement des données des patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-4">
        <h1 className="text-xl font-semibold text-slate-800">Patients Enregistrés</h1>
        {/* <p className="text-slate-500 text-sm mt-1">Au service de votre santé</p> */}
        <div className="w-12 h-1 bg-blue-400 mt-2 rounded-full"></div>
      </div>
      {/* Section de Filtre Améliorée */}
      <div className="px-4 sm:px-6 py-4 bg-slate-50/50 border-b border-slate-200">
        <div className="space-y-4">
          {/* Filtres Principaux */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-700">Options de Filtre</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {/* Sélection du Statut de Facture */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setInvoiceStatus('invoiced')}
              className={`p-3 rounded-lg border transition-colors ${
                invoiceStatus === 'invoiced'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
              }`}
            >
              Facturé
            </button>
            <button
              onClick={() => setInvoiceStatus('Notinvoiced')}
              className={`p-3 rounded-lg border transition-colors ${
                invoiceStatus === 'Notinvoiced'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
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
                  {monthlyData && Object.keys(monthlyData)
                    .filter(month => month !== 'Total')
                    .map(month => (
                      <option key={month} value={month}>
                        {month} ({monthlyData[month]?.elements_prescription?.data_patients?.length || 0} prescriptions, {monthlyData[month]?.elements_realisation?.data_patients?.length || 0} réalisations)
                      </option>
                    ))}
                </select>
              </div>
              {/* Sélection du Type */}
              <div className="grid grid-cols-2 gap-2">
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
                  Réalisation
                  {monthlyData && selectedMonth && (
                    <span className="block text-xs mt-1">
                      ({monthlyData[selectedMonth]?.elements_realisation?.data_patients?.length || 0})
                    </span>
                  )}
                </button>
              </div>
              {/* Filtre par Plage de Dates */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-slate-700">Filtrer par Plage de Dates</h4>
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
              {showDatePicker && (
                <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date de Début
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
                      Date de Fin
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
            </>
          )}
          {/* Boutons d'Action */}
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
        <p className="text-sm text-slate-600 mt-4">
          Affichage de {indexOfFirstPatient + 1} à {Math.min(indexOfLastPatient, filteredPatients.length)} sur {filteredPatients.length} patients
          {selectedMonth && (
            <span className="ml-2 text-blue-600 font-medium">
              | {selectedMonth} - {selectedType === 'prescription' ? 'Prescription' : 'Réalisation'} ({invoiceStatus === 'invoiced' ? 'Facturé' : 'Non facturé'})
            </span>
          )}
        </p>
      </div>
      {/* Liste des Patients */}
      <div className="px-4 py-2">
        {filteredPatients.length > 0 ? (
          <>
            <div className="flex items-center mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-500 border-slate-300 rounded mr-3 focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-sm font-medium text-slate-700">
                Tout Sélectionner ({filteredPatients.filter(p => p.selected).length} sélectionné(s))
              </span>
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
                  </div>
                  <div className="mb-3 relative z-10">
                    <h1 className="text-base font-bold mb-2 text-blue-800">{patient.name}</h1>
                    <p className="text-xs font-medium text-gray-600 bg-white p-2 rounded-lg border border-blue-200">
                      {patient.examination}
                    </p>
                  </div>
                  <div className="flex justify-end items-center pt-3 border-t border-blue-200 relative z-10">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      patient.commission.includes('-')
                        ? 'text-white bg-red-500'
                        : 'text-white bg-green-500'
                    }`}>
                      {patient.commission}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Calendar className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-600 mb-2">Aucun patient trouvé</h3>
            <p className="text-slate-500">
              {selectedMonth ?
                `Aucune donnée de ${selectedType === 'prescription' ? 'prescription' : 'réalisation'} disponible pour ${selectedMonth}` :
                'Veuillez sélectionner un mois pour voir les données des patients'
              }
            </p>
          </div>
        )}
      </div>
      {/* Pagination */}
      {filteredPatients.length > 0 && (
        <div className="px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 text-sm text-black font-bold hover:text-black hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Précédent</span>
            </button>
            <span className="text-sm text-black font-bold">
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
      )}
      {/* Commission Totale */}
      <div className="px-4 sm:px-6 py-4 border-t-2 border-blue-200 bg-blue-50 sticky bottom-0">
        <div className="text-center sm:text-right">
          <span className="text-lg sm:text-xl font-semibold text-slate-800">
            Commission Totale: <span className="text-blue-600 font-bold">
              {getTotalCommission().toFixed(2)} FCFA
            </span>
          </span>
          {selectedMonth && (
            <p className="text-sm text-slate-600 mt-1">
              {selectedMonth} - {selectedType === 'prescription' ? 'Prescription' : 'Réalisation'} ({invoiceStatus === 'invoiced' ? 'Facturé' : 'Non facturé'})
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobilePatientsContent;
