import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faEyeSlash, 
  faFileAlt, 
  faPrescriptionBottle, 
  faTasks, 
  faWallet, 
  faChartLine,
  faUsers,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from "../../../api/axioConfig";

interface MobileStats {
  montant_total: number;
  montant_prescription: number;
  montant_realisation: number;
  nombre_patient: number;
  totalExamens: number;
  totalResultatsRecus: number;
  patientsEnAttente: number;
  examensTermines: number;
  resultatsEnCours: number;
}

interface MobileStatsCardsProps {
  onViewAnalysis?: () => void;
}

const MobileStatsCards: React.FC<MobileStatsCardsProps> = ({ onViewAnalysis }) => {
  const [showMontantTotal, setShowMontantTotal] = useState<boolean>(false);
  const [showMontantPrescription, setShowMontantPrescription] = useState<boolean>(false);
  const [showMontantRealisation, setShowMontantRealisation] = useState<boolean>(false);
  const [stats, setStats] = useState<MobileStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataString = localStorage.getItem('userData');
        const userData = userDataString ? JSON.parse(userDataString) : null;
        const doctorId = userData?.doctor_id || '65';
            
        const response = await axiosInstance.get(`/doctor_com/actual_solde/${doctorId}`);
        const data = response.data;

        const newStats = {
          montant_total: data.montant_total,
          montant_prescription: data.montant_prescription,
          montant_realisation: data.montant_realisation,
          nombre_patient: data.nombre_patient,
          // Simulated data for commission overview stats
          totalExamens: 234,
          totalResultatsRecus: 189,
          patientsEnAttente: 12,
          examensTermines: 201,
          resultatsEnCours: 33,
        };

        setStats(newStats);
      } catch (error) {
        setStats({
          montant_total: 0,
          montant_prescription: 0,
          montant_realisation: 0,
          nombre_patient: 0,
          totalExamens: 0,
          totalResultatsRecus: 0,
          patientsEnAttente: 0,
          examensTermines: 0,
          resultatsEnCours: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatAmount = (amount: number) => {
    const formattedAmount = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    const parts = formattedAmount.split(' ');
    const numericAmount = parts[0];
    const currency = parts[1] ? parts[1] : 'XAF';
    return { numericAmount, currency };
  };

  const toggleMontantTotalVisibility = () => {
    setShowMontantTotal(prev => !prev);
  };

  const toggleMontantPrescriptionVisibility = () => {
    setShowMontantPrescription(prev => !prev);
  };

  const toggleMontantRealisationVisibility = () => {
    setShowMontantRealisation(prev => !prev);
  };

  const getDateRangeDescription = () => {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
        
    let cycleStartDate: Date;
    let cycleEndDate: Date;
        
    if (currentDay >= 21) {
      cycleStartDate = new Date(currentYear, currentMonth, 21);
      cycleEndDate = new Date(currentYear, currentMonth + 1, 21);
    } else {
      cycleStartDate = new Date(currentYear, currentMonth - 1, 21);
      cycleEndDate = new Date(currentYear, currentMonth, 21);
    }
        
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('fr-FR', {
         day: 'numeric',
         month: 'short',
        year: currentYear !== date.getFullYear() ? 'numeric' : undefined
       });
    };
        
    const formattedStartDate = formatDate(cycleStartDate);
    const formattedCurrentDate = currentDate.toLocaleDateString('fr-FR', {
       day: 'numeric',
       month: 'short'
     });
        
    return `(du ${formattedStartDate} au ${formattedCurrentDate})`;
  };

  // if (loading) {
  //   return (
  //     // <div className="space-y-4">
  //     //   {/* Main Balance Card Loading */}
  //     //   <div className="bg-white rounded-lg p-4 shadow-sm">
  //     //     <div className="flex items-center mb-4">
  //     //       <div className="w-6 h-6 flex items-center justify-center mr-2">
  //     //         <FontAwesomeIcon icon={faWallet} className="text-gray-600" size="lg" />
  //     //       </div>
  //     //       <h3 className="text-gray-900 font-medium text-lg">Solde Principal</h3>
  //     //     </div>
  //     //     <div className="flex justify-center space-x-1 mb-1">
  //     //       {[1, 2, 3].map((i) => (
  //     //         <div
  //     //           key={i}
  //     //           className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
  //     //           style={{ animationDelay: `${i * 0.1}s` }}
  //     //         />
  //     //       ))}
  //     //     </div>
  //     //   </div>

  //     //   {/* Commission Overview Stats Loading */}
  //     //   <div className="grid grid-cols-2 gap-4">
  //     //     <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-3 shadow-sm">
  //     //       <div className="flex items-center mb-2">
  //     //         <FontAwesomeIcon icon={faUsers} className="text-blue-600 mr-2" size="sm" />
  //     //         <div className="text-sm font-bold text-gray-700">Total Patients</div>
  //     //       </div>
  //     //       <div className="flex justify-center space-x-1">
  //     //         {[1, 2, 3].map((i) => (
  //     //           <div
  //     //             key={i}
  //     //             className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
  //     //             style={{ animationDelay: `${i * 0.1}s` }}
  //     //           />
  //     //         ))}
  //     //       </div>
  //     //     </div>

  //     //     <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-100 rounded-lg p-3 shadow-sm">
  //     //       <div className="flex items-center mb-2">
  //     //         <FontAwesomeIcon icon={faFileAlt} className="text-purple-600 mr-2" size="sm" />
  //     //         <div className="text-sm font-bold text-gray-700">Total Examens</div>
  //     //       </div>
  //     //       <div className="flex justify-center space-x-1">
  //     //         {[1, 2, 3].map((i) => (
  //     //           <div
  //     //             key={i}
  //     //             className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
  //     //             style={{ animationDelay: `${i * 0.1}s` }}
  //     //           />
  //     //         ))}
  //     //       </div>
  //     //     </div>

  //     //     <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-100 rounded-lg p-3 shadow-sm">
  //     //       <div className="flex items-center mb-2">
  //     //         <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-600 mr-2" size="sm" />
  //     //         <div className="text-sm font-bold text-gray-700">Résultats Reçus</div>
  //     //       </div>
  //     //       <div className="flex justify-center space-x-1">
  //     //         {[1, 2, 3].map((i) => (
  //     //           <div
  //     //             key={i}
  //     //             className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
  //     //             style={{ animationDelay: `${i * 0.1}s` }}
  //     //           />
  //     //         ))}
  //     //       </div>
  //     //     </div>

  //     //     <div className="bg-gradient-to-br from-yellow-50 to-orange-100 border border-yellow-100 rounded-lg p-3 shadow-sm">
  //     //       <div className="flex items-center mb-2">
  //     //         <FontAwesomeIcon icon={faTasks} className="text-yellow-600 mr-2" size="sm" />
  //     //         <div className="text-sm font-bold text-gray-700">Montant Réalisation</div>
  //     //       </div>
  //     //       <div className="flex justify-center space-x-1">
  //     //         {[1, 2, 3].map((i) => (
  //     //           <div
  //     //             key={i}
  //     //             className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
  //     //             style={{ animationDelay: `${i * 0.1}s` }}
  //     //           />
  //     //         ))}
  //     //       </div>
  //     //     </div>
  //     //   </div>
  //     // </div>
  //   );
  // }

  return (
    <div className="space-y-4">
      {/* Main Balance Card */}
      {/* <div className="bg-white rounded-lg p-4 shadow-sm">
        {/* <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-6 h-6 flex items-center justify-center mr-2">
              <FontAwesomeIcon icon={faWallet} className="text-gray-600" size="lg" />
            </div>
            <div>
              <h3 className="text-gray-900 font-medium text-lg">Solde Principal</h3>
              <p className="text-gray-500 text-xs">{getDateRangeDescription()}</p>
            </div>
          </div>
        </div> */}
        {/* <div className="flex justify-between items-center">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900">
              {showMontantTotal && stats ? formatAmount(stats.montant_total).numericAmount : '*****'}
            </span>
            <span className="text-sm text-gray-600 ml-1">
              {showMontantTotal ? formatAmount(stats.montant_total).currency : ''}
            </span>
          </div>
          <button
            onClick={toggleMontantTotalVisibility}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
            type="button"
          >
            <FontAwesomeIcon
              icon={showMontantTotal ? faEyeSlash : faEye}
              className="text-gray-800"
              size="sm"
            />
          </button>
        </div>
        <div className="flex items-center justify-end text-xs text-gray-600 mt-1">
          <FontAwesomeIcon icon={faFileAlt} className="mr-1" size="sm" />
          <span>{stats?.nombre_patient || 0} patients</span>
        </div>
      </div> */} 

      {/* Commission Overview Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Patients */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-blue-200 opacity-20 rounded-full -translate-y-6 translate-x-6"></div>
          <div className="flex items-center mb-2">
            <FontAwesomeIcon icon={faUsers} className="text-blue-600 mr-2" size="sm" />
            <div>
              <div className="text-sm font-bold text-gray-700">Total Patients</div>
              <p className="text-gray-500 text-[0.6rem]">{getDateRangeDescription()}</p>
            </div>
          </div>
          <div className="flex justify-center items-center mb-2">
            <span className="text-2xl font-bold text-blue-700">
              {stats?.nombre_patient || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
              <span>{stats?.patientsEnAttente || 0} En attente</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Actif</span>
            </div>
          </div>
        </div>

        {/* Total Examens */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-100 rounded-lg p-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-purple-200 opacity-20 rounded-full -translate-y-6 translate-x-6"></div>
          <div className="flex items-center mb-2">
            <FontAwesomeIcon icon={faFileAlt} className="text-purple-600 mr-2" size="sm" />
            <div>
              <div className="text-sm font-bold text-gray-700">Total Examens</div>
              <p className="text-gray-500 text-[0.6rem]">{getDateRangeDescription()}</p>
            </div>
          </div>
          <div className="flex justify-center items-center mb-2">
            <span className="text-2xl font-bold text-purple-700">
              {stats?.totalExamens || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>{stats?.examensTermines || 0} Terminés</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>En cours</span>
            </div>
          </div>
        </div>

        {/* Résultats Reçus */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-100 rounded-lg p-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-200 opacity-20 rounded-full -translate-y-6 translate-x-6"></div>
          <div className="flex items-center mb-2">
            <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-600 mr-2" size="sm" />
            <div>
              <div className="text-sm font-bold text-gray-700">Résultats Reçus</div>
              <p className="text-gray-500 text-[0.6rem]">{getDateRangeDescription()}</p>
            </div>
          </div>
          <div className="flex justify-center items-center mb-2">
            <span className="text-2xl font-bold text-emerald-700">
              {stats?.totalResultatsRecus || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
              <span>{stats?.resultatsEnCours || 0} En cours</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Reçus</span>
            </div>
          </div>
        </div>

        {/* Montant Réalisation */}
        {/* <div className="bg-gradient-to-br from-yellow-50 to-orange-100 border border-yellow-100 rounded-lg p-3 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-6 h-6 flex items-center justify-center mr-2">
                <FontAwesomeIcon icon={faTasks} className="text-yellow-600" size="lg" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-700">Montant Réalisation</div>
                <p className="text-gray-500 text-[0.6rem]">{getDateRangeDescription()}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">
                {showMontantRealisation && stats ? formatAmount(stats.montant_realisation).numericAmount : '*****'}
              </span>
              <span className="text-sm text-gray-600">
                {showMontantRealisation ? formatAmount(stats.montant_realisation).currency : ''}
              </span>
            </div>
            <button
              onClick={toggleMontantRealisationVisibility}
              className="w-8 h-8 flex items-center justify-center hover:bg-yellow-200 rounded-full transition-colors flex-shrink-0"
              type="button"
            >
              <FontAwesomeIcon
                icon={showMontantRealisation ? faEyeSlash : faEye}
                className="text-gray-800"
                size="sm"
              />
            </button>
          </div>
        </div> */}
      </div>

      {/* Monthly Analysis Link Container */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 opacity-30 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <FontAwesomeIcon icon={faChartLine} className="text-green-600" size="sm" />
            </div>
            <div>
              <h4 className="text-gray-900 font-medium text-base">Consulter vos différents montants Mensuels</h4>
            </div>
          </div>
          <button
            onClick={onViewAnalysis}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center"
            type="button"
          >
            <span className="mr-1">Voir</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileStatsCards;