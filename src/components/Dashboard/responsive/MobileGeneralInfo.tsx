import React, { useState, useEffect } from 'react';
import axiosInstance from "../../../api/axioConfig";

interface GeneralInfoData {
  patients: number;
  revenue: number;
  commissions: number;
}

interface MobileGeneralInfoProps {
  onMenuClick: (view: 'commissionAnalysis') => void;
}

const MobileGeneralInfo: React.FC<MobileGeneralInfoProps> = ({ onMenuClick }) => {
  const [generalInfoData, setGeneralInfoData] = useState<GeneralInfoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGeneralInfoData = async () => {
      try {
        const userData = localStorage.getItem('userData');
        if (!userData) {
          console.error('No user data found in localStorage');
          return;
        }
        const { doctor_id } = JSON.parse(userData);
        const response = await axiosInstance.get(`/doctor_com/general/${doctor_id}`);
        const data = response.data;
        setGeneralInfoData({
          patients: data.number_of_registered_patients,
          revenue: data.Solde.commission,
          commissions: data.Nombre_Commissions,
        });
      } catch (error) {
        console.error('Error fetching general info data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGeneralInfoData();
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-gray-900 font-medium mb-4 text-lg">General Information</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          {/* Patients Loading */}
          <div>
            <div className="flex justify-center space-x-1 mb-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <div className="text-xs text-gray-600">Patients</div>
          </div>
          {/* Revenue Loading */}
          <div>
            <div className="flex justify-center space-x-1 mb-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <div className="text-xs text-gray-600">Revenue</div>
          </div>
          {/* Commissions Loading */}
          <div>
            <div className="flex justify-center space-x-1 mb-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <div className="text-xs text-gray-600">Commissions</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-900 font-medium text-lg">General Information</h3>
        <span
          className="text-blue-500 text-sm cursor-pointer"
          onClick={() => onMenuClick('commissionAnalysis')}
        >
          See more
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-base font-bold text-gray-900">{generalInfoData?.patients || 0}</div>
          <div className="text-xs text-gray-600">Patients</div>
        </div>
        <div>
          <div className="text-base font-bold text-green-600">{formatAmount(generalInfoData?.revenue || 0)}</div>
          <div className="text-xs text-gray-600">Revenue</div>
        </div>
        <div>
          <div className="text-base font-bold text-purple-600">{generalInfoData?.commissions || 0}</div>
          <div className="text-xs text-gray-600">Commissions</div>
        </div>
      </div>
    </div>
  );
};

export default MobileGeneralInfo;
