import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faFileAlt, faTachometerAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from "../../../api/axioConfig";

interface MobileStats {
  solde: {
    amount: number;
    count: number;
  };
  patients: {
    total: number;
  };
}

const MobileStatsCards: React.FC = () => {
  const [showSolde, setShowSolde] = useState<boolean>(false);
  const [stats, setStats] = useState<MobileStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataString = localStorage.getItem('userData');
        const userData = userDataString ? JSON.parse(userDataString) : null;
        const doctorId = userData?.doctor_id || '65';
        
        console.log('Fetching data for doctor ID:', doctorId); // Debug log
        
        const response = await axiosInstance.get(`gnu_doctor/${doctorId}/research/`);
        const data = response.data;
        
        console.log('API Response:', data); // Debug log
        const newStats = {
          solde: {
            amount: data.Data.commission,
            count: data.number,
          },
          patients: {
            total: data.Data.data_patients.length,
          },
        };
        
        console.log('Processed stats:', newStats); // Debug log
        setStats(newStats);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set fallback data for testing
        setStats({
          solde: {
            amount: 0,
            count: 0,
          },
          patients: {
            total: 0,
          },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const toggleSoldeVisibility = () => {
    console.log('Toggle clicked, current showSolde:', showSolde); // Debug log
    console.log('Current stats:', stats); // Debug log
    setShowSolde(prev => !prev);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {/* Solde Container Loading */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-3 shadow-sm flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-blue-300 opacity-15 rounded-full translate-y-6 -translate-x-6"></div>
          <div className="w-6 h-6 flex items-center justify-center mb-1 relative z-10">
            <FontAwesomeIcon icon={faTachometerAlt} className="text-blue-600" size="lg" />
          </div>
          <div className="text-sm font-bold text-gray-700 mb-1 relative z-10">Solde principal</div>
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

        {/* Patients Container Loading */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-100 border border-yellow-100 rounded-lg p-3 shadow-sm flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-200 opacity-25 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-orange-200 opacity-20 rounded-full translate-y-6 -translate-x-6"></div>
          <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-yellow-300 opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="w-6 h-6 flex items-center justify-center mb-1 relative z-10">
            <FontAwesomeIcon icon={faUser} className="text-yellow-600" size="lg" />
          </div>
          <div className="text-sm font-bold text-gray-700 mb-1 relative z-10">Registered Patients</div>
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
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Solde Container */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-3 shadow-sm flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-blue-300 opacity-15 rounded-full translate-y-6 -translate-x-6"></div>
        <div className="w-6 h-6 flex items-center justify-center mb-1 relative z-10">
          <FontAwesomeIcon icon={faTachometerAlt} className="text-blue-600" size="lg" />
        </div>
        <div className="text-sm font-bold text-gray-700 mb-1 relative z-10">Solde principal</div>
        <div className="w-full flex justify-between items-center relative z-10">
          <span className="text-lg font-bold text-gray-900 flex-1 text-center">
            {showSolde && stats ? formatAmount(stats.solde.amount) : '*****'}
          </span>
          <button 
            onClick={toggleSoldeVisibility} 
            className="w-8 h-8 flex items-center justify-center hover:bg-blue-200 rounded transition-colors ml-2 flex-shrink-0"
            type="button"
          >
            <FontAwesomeIcon 
              icon={showSolde ? faEyeSlash : faEye} 
              className="text-gray-600" 
              size="sm" 
            />
          </button>
        </div>
        <div className="flex items-center text-xs text-gray-600 mt-1 relative z-10">
          <FontAwesomeIcon icon={faFileAlt} className="mr-1" size="sm" />
          <span>{stats?.solde.count || 0} invoiced</span>
        </div>
      </div>

      {/* Registered Patients Container */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-100 border border-yellow-100 rounded-lg p-3 shadow-sm flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-200 opacity-25 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-orange-200 opacity-20 rounded-full translate-y-6 -translate-x-6"></div>
        <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-yellow-300 opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="w-6 h-6 flex items-center justify-center mb-1 relative z-10">
          <FontAwesomeIcon icon={faUser} className="text-yellow-600" size="lg" />
        </div>
        <div className="text-sm font-bold text-gray-700 mb-1 relative z-10">Registered Patients</div>
        <div className="text-lg font-bold text-gray-900 relative z-10">{stats?.patients.total || 0}</div>
        <div className="text-xs text-gray-600 mt-1 relative z-10">Registered</div>
      </div>
    </div>
  );
};

export default MobileStatsCards;