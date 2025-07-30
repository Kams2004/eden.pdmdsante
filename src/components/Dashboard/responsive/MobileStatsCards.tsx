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

        console.log('Fetching data for doctor ID:', doctorId);

        const response = await axiosInstance.get(`/doctor_com/actual_solde/${doctorId}`);
        const data = response.data;

        console.log('API Response:', data);

        const newStats = {
          montant_total: data.montant_total,
          montant_prescription: data.montant_prescription,
          montant_realisation: data.montant_realisation,
          nombre_patient: data.nombre_patient,
        };

        console.log('Processed stats:', newStats);
        setStats(newStats);
      } catch (error) {
        console.error('Error fetching data:', error);
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

    // Split the formatted amount into the numeric part and the currency symbol
    const parts = formattedAmount.split(' ');
    const numericAmount = parts[0];
    const currency = parts[1] ? parts[1] : 'XAF'; // Fallback to 'XAF' if currency symbol is missing

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

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Montant Principal Container Loading */}
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
        {/* Grid for Montant Prescripteur and Montant Realisateur Loading */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-3 shadow-sm flex flex-col items-center relative overflow-hidden">
            <div className="flex items-center mb-1">
              <div className="w-6 h-6 flex items-center justify-center mr-2">
                <FontAwesomeIcon icon={faPrescriptionBottle} className="text-blue-600" size="lg" />
              </div>
              <div className="text-sm font-bold text-gray-700">Montant Prescripteur</div>
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
              <div className="text-sm font-bold text-gray-700">Montant Realisateur</div>
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
      {/* Montant Principal Container */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 flex items-center justify-center mr-2">
            <FontAwesomeIcon icon={faWallet} className="text-gray-600" size="lg" />
          </div>
          <h3 className="text-gray-900 font-medium text-lg">Solde Principal</h3>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-baseline">
            <span className="text-lg font-bold text-gray-900">
              {showMontantTotal && stats ? formatAmount(stats.montant_total).numericAmount : '*****'}
            </span>
            <span className="text-sm text-gray-600 ml-1">
              {showMontantTotal ? formatAmount(stats.montant_total).currency : ''}
            </span>
          </div>
          <button
            onClick={toggleMontantTotalVisibility}
            className="w-8 h-8 flex items-center justify-center hover:bg-blue-200 rounded transition-colors flex-shrink-0"
            type="button"
          >
            <FontAwesomeIcon
              icon={showMontantTotal ? faEyeSlash : faEye}
              className="text-gray-600"
              size="sm"
            />
          </button>
        </div>
        <div className="flex items-center text-xs text-gray-600 mt-1">
          <FontAwesomeIcon icon={faFileAlt} className="mr-1" size="sm" />
          <span>{stats?.nombre_patient || 0} patients</span>
        </div>
      </div>

      {/* Grid for Montant Prescripteur and Montant Realisateur */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-3 shadow-sm flex flex-col relative overflow-hidden">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 flex items-center justify-center mr-2">
              <FontAwesomeIcon icon={faPrescriptionBottle} className="text-blue-600" size="lg" />
            </div>
            <div className="text-sm font-bold text-gray-700">Montant Prescripteur</div>
          </div>
          <div className="flex justify-between items-start">
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
              className="w-8 h-8 flex items-center justify-center hover:bg-blue-200 rounded transition-colors flex-shrink-0"
              type="button"
            >
              <FontAwesomeIcon
                icon={showMontantPrescription ? faEyeSlash : faEye}
                className="text-gray-600"
                size="sm"
              />
            </button>
          </div>

        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-100 border border-yellow-100 rounded-lg p-3 shadow-sm flex flex-col relative overflow-hidden">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 flex items-center justify-center mr-2">
              <FontAwesomeIcon icon={faTasks} className="text-yellow-600" size="lg" />
            </div>
            <div className="text-sm font-bold text-gray-700">Montant Realisateur</div>
          </div>
          <div className="flex justify-between items-start">
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
              className="w-8 h-8 flex items-center justify-center hover:bg-yellow-200 rounded transition-colors flex-shrink-0"
              type="button"
            >
              <FontAwesomeIcon
                icon={showMontantRealisation ? faEyeSlash : faEye}
                className="text-gray-600"
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
