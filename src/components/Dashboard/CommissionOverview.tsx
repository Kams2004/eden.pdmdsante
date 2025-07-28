import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, FileText, CheckCircle } from 'lucide-react';
import CircularProgress from '../UI/CircularProgress';
import axiosInstance from "../../api/axioConfig";

interface CommissionData {
  totalAmount: number;
  invoiced: number;
  notPaid: number;
  registeredPatients: number;
  topExaminations: { name: string; value: number }[];
}

interface CommissionOverviewProps {
  showAmount: boolean;
  setShowAmount: (show: boolean) => void;
}

const CommissionOverview: React.FC<CommissionOverviewProps> = ({ showAmount, setShowAmount }) => {
  const [commissionData, setCommissionData] = useState<CommissionData>({
    totalAmount: 0,
    invoiced: 0,
    notPaid: 0,
    registeredPatients: 0,
    topExaminations: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataString = localStorage.getItem('userData');
        const userData = userDataString ? JSON.parse(userDataString) : null;
        const doctorId = userData?.doctor_id || '65';
        const response = await axiosInstance.get(`/doctor_com/solde/${doctorId}`);
        const data = response.data;

        // Use type assertion to tell TypeScript that the values are numbers
        const topExaminations = Object.entries(data.Top_3)
          .sort((a, b) => (b[1] as number) - (a[1] as number))
          .slice(0, 2)
          .map(([name, value]) => ({ name, value: value as number }));

        setCommissionData({
          totalAmount: data.Solde.commission,
          invoiced: data.Factured,
          notPaid: data.Not_Factured,
          registeredPatients: data.number_of_registered_patients,
          topExaminations,
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

  const maxPatients = 100;

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-blue-300 opacity-15 rounded-full translate-y-6 -translate-x-6"></div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Solde</h3>
        <div className="flex items-center justify-between mb-6">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {showAmount ? formatAmount(commissionData.totalAmount) : '******'}
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
            <FileText className="w-5 h-5" />
            <span>{commissionData.invoiced} Invoiced</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>{commissionData.notPaid} Not Paid</span>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-yellow-50 to-orange-100 border border-yellow-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-200 opacity-25 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-orange-200 opacity-20 rounded-full translate-y-6 -translate-x-6"></div>
        <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-yellow-300 opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Registered Patients</h3>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CircularProgress
              percentage={(commissionData.registeredPatients / maxPatients) * 100}
              icon={CheckCircle}
              value={commissionData.registeredPatients}
              label="Registered"
            />
          </div>
          <div className="flex-1 ml-4">
            <h4 className="text-md font-semibold text-gray-700 mb-1">Top 2 Examinations</h4>
            <ul className="mt-1">
              {commissionData.topExaminations.map((exam, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-sm font-bold">{exam.value}</span>
                  <span className="text-sm text-gray-600 ml-2">{exam.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionOverview;
