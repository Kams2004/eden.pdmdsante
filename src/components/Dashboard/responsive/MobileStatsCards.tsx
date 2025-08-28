import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faFileAlt, faPrescriptionBottle, faTasks, faWallet } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from "../../../api/axioConfig";

interface MobileStats {
  montant_total: number;
  montant_prescription: number;
  montant_realisation: number;
  nombre_patient: number;
}

const MobileStatsCards: React.FC = () => {
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
        console.log('Récupération des données pour l\'ID du médecin :', doctorId);
        const response = await axiosInstance.get(`/doctor_com/actual_solde/${doctorId}`);
        const data = response.data;
        console.log('Réponse de l\'API :', data);
        const newStats = {
          montant_total: data.montant_total,
          montant_prescription: data.montant_prescription,
          montant_realisation: data.montant_realisation,
          nombre_patient: data.nombre_patient,
        };
        console.log('Statistiques traitées :', newStats);
        setStats(newStats);
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        setStats({
          montant_total: 0,
          montant_prescription: 0,
          montant_realisation: 0,
          nombre_patient: 0,
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
      // We are in the cycle that started on the 21st of this month
      cycleStartDate = new Date(currentYear, currentMonth, 21);
      cycleEndDate = new Date(currentYear, currentMonth + 1, 21);
    } else {
      // We are in the cycle that started on the 21st of the previous month
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 flex items-center justify-center mr-2">
              <FontAwesomeIcon icon={faWallet} className="text-gray-600" size="lg" />
            </div>
            <h3 className="text-gray-900 font-medium text-lg">Solde Principal</h3>
          </div>
          <div className="flex justify-center space-x-1 mb-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-3 shadow-sm flex flex-col items-center relative overflow-hidden">
            <div className="flex items-center mb-1">
              <div className="w-6 h-6 flex items-center justify-center mr-2">
                <FontAwesomeIcon icon={faPrescriptionBottle} className="text-blue-600" size="lg" />
              </div>
              <div className="text-sm font-bold text-gray-700">Montant Prescription</div>
            </div>
            <div className="flex space-x-1 my-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-100 border border-yellow-100 rounded-lg p-3 shadow-sm flex flex-col items-center relative overflow-hidden">
            <div className="flex items-center mb-1">
              <div className="w-6 h-6 flex items-center justify-center mr-2">
                <FontAwesomeIcon icon={faTasks} className="text-yellow-600" size="lg" />
              </div>
              <div className="text-sm font-bold text-gray-700">Montant Réalisation</div>
            </div>
            <div className="flex space-x-1 my-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-6 h-6 flex items-center justify-center mr-2">
              <FontAwesomeIcon icon={faWallet} className="text-gray-600" size="lg" />
            </div>
            <div>
              <h3 className="text-gray-900 font-medium text-lg">Solde Principal</h3>
              <p className="text-gray-500 text-xs">{getDateRangeDescription()}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-3 shadow-sm flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-6 h-6 flex items-center justify-center mr-2">
                <FontAwesomeIcon icon={faPrescriptionBottle} className="text-blue-600" size="lg" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-700">Montant Prescription</div>
                <p className="text-gray-500 text-[0.6rem]">{getDateRangeDescription()}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">
                {showMontantPrescription && stats ? formatAmount(stats.montant_prescription).numericAmount : '*****'}
              </span>
              <span className="text-sm text-gray-600">
                {showMontantPrescription ? formatAmount(stats.montant_prescription).currency : ''}
              </span>
            </div>
            <button
              onClick={toggleMontantPrescriptionVisibility}
              className="w-8 h-8 flex items-center justify-center hover:bg-blue-200 rounded-full transition-colors flex-shrink-0"
              type="button"
            >
              <FontAwesomeIcon
                icon={showMontantPrescription ? faEyeSlash : faEye}
                className="text-gray-800"
                size="sm"
              />
            </button>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-100 border border-yellow-100 rounded-lg p-3 shadow-sm flex flex-col relative overflow-hidden">
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
        </div>
      </div>
    </div>
  );
};

export default MobileStatsCards;