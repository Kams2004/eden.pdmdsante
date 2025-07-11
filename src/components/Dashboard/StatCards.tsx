import React, { useState, useEffect } from 'react';
import { Wallet, Eye, EyeOff, Users, ClipboardCheck } from 'lucide-react';
import CircularProgress from '../UI/CircularProgress';
import axiosInstance from "../../api/axioConfig";

interface StatCardsProps {
  showAmount: boolean;
  setShowAmount: (show: boolean) => void;
}

interface Stats {
  commission: {
    amount: number;
    count: number;
  };
  patients: {
    total: number;
    percentage: number;
  };
  examinations: {
    total: number;
    percentage: number;
  };
}

const StatCards: React.FC<StatCardsProps> = ({ showAmount, setShowAmount }) => {
  const [stats, setStats] = useState<Stats>({
    commission: {
      amount: 0,
      count: 0,
    },
    patients: {
      total: 0,
      percentage: 0,
    },
    examinations: {
      total: 0,
      percentage: 0,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataString = localStorage.getItem('userData');
        const userData = userDataString ? JSON.parse(userDataString) : null;
        const doctorId = userData?.doctor_id || '65';

        const response = await axiosInstance.get(`gnu_doctor/${doctorId}/research/`);
        const data = response.data;

        const commissionAmount = data.Data.commission;
        const commissionCount = data.number;

        // Calculate unique patients
        const uniquePatients = new Set(data.Data.data_patients.map((patientData: { [key: string]: any }) => Object.keys(patientData)[0])).size;
        const patientsPercentage = (uniquePatients / data.Data.data_patients.length) * 100;

        // Mock data for examinations, since it's not provided in the new endpoint
        const mockExaminationsTotal = 5; // Example value, replace with actual logic if available
        const mockExaminationsPercentage = 75; // Example value, replace with actual logic if available

        setStats({
          commission: {
            amount: commissionAmount,
            count: commissionCount,
          },
          patients: {
            total: uniquePatients,
            percentage: patientsPercentage,
          },
          examinations: {
            total: mockExaminationsTotal,
            percentage: mockExaminationsPercentage,
          },
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Commissions</h3>
        <div className="flex items-center justify-between mb-6">
          <Wallet className="w-8 h-8 text-blue-600" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {showAmount ? formatAmount(stats.commission.amount) : '******'}
            </span>
            <button
              onClick={() => setShowAmount(!showAmount)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showAmount ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>{stats.commission.count} commissions</span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Registered Patients</h3>
        <CircularProgress
          percentage={stats.patients.percentage}
          icon={Users}
          value={stats.patients.total}
          label="Patients"
        />
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Examinations In Process</h3>
        <CircularProgress
          percentage={stats.examinations.percentage}
          icon={ClipboardCheck}
          value={stats.examinations.total}
          label="Examinations"
        />
      </div>
    </div>
  );
};

export default StatCards;
