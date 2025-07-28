import React, { useState, useEffect } from 'react';
import { Wallet, Eye, EyeOff, Users, User } from 'lucide-react';
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
  examinations: string[];
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
    examinations: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataString = localStorage.getItem('userData');
        const userData = userDataString ? JSON.parse(userDataString) : null;
        const doctorId = userData?.doctor_id || '65';
        const response = await axiosInstance.get(`gnu_doctor/${doctorId}/research/`);
        const data = response.data;

        // Use type assertion to tell TypeScript that the keys are strings
        const uniquePatients = [...new Set(
          data.Data.data_patients.map((patientData: { [key: string]: unknown }) =>
            Object.keys(patientData)[0]
          )
        )] as string[];

        const patientsPercentage = (uniquePatients.length / 100) * 100;

        setStats({
          commission: {
            amount: data.Data.commission,
            count: data.number,
          },
          patients: {
            total: uniquePatients.length,
            percentage: patientsPercentage,
          },
          examinations: uniquePatients.slice(0, 3),
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
      currency: 'XAF',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200 rounded-lg p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-20 h-20 bg-gray-100 opacity-30 rounded-full -translate-y-10 -translate-x-10"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-slate-200 opacity-20 rounded-full translate-y-12 translate-x-12"></div>
        <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-gray-200 opacity-40 rounded-full"></div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Commissions</h3>
        <div className="flex items-center justify-between mb-6">
          <Wallet className="w-8 h-8 text-slate-600" />
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
      <div className="bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-16 bg-purple-200 opacity-20 rounded-full -translate-y-8 translate-x-16 rotate-45"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-indigo-200 opacity-15 rounded-full translate-y-10 -translate-x-10"></div>
        <div className="absolute top-3 left-1/3 w-4 h-4 bg-purple-300 opacity-30 rounded-full"></div>
        <div className="absolute bottom-3 right-1/3 w-8 h-8 bg-indigo-300 opacity-20 rounded-full"></div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Registered Patients</h3>
        <CircularProgress
          percentage={stats.patients.percentage}
          icon={Users}
          value={stats.patients.total}
          label="Patients"
        />
      </div>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-1/2 w-16 h-16 bg-blue-100 opacity-25 rounded-full -translate-y-8 -translate-x-8"></div>
        <div className="absolute bottom-0 right-0 w-14 h-14 bg-indigo-100 opacity-30 rounded-full translate-y-7 translate-x-7"></div>
        <div className="absolute top-1/4 left-0 w-10 h-10 bg-blue-200 opacity-20 rounded-full -translate-x-5"></div>
        <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-indigo-200 opacity-25 rounded-full"></div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Names</h3>
        <div>
          {stats.examinations.map((name, index) => (
            <div key={index} className="flex items-center mb-2">
              <User className="w-5 h-5 mr-2 text-blue-500" />
              <span className="text-gray-700">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatCards;
