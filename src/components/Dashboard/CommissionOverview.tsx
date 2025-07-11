import React, { useState, useEffect } from 'react';
import { Wallet, Eye, EyeOff, FileText, CheckCircle } from 'lucide-react';
import CircularProgress from '../UI/CircularProgress';
import axiosInstance from "../../api/axioConfig";

interface CommissionOverviewProps {
  showAmount: boolean;
  setShowAmount: (show: boolean) => void;
}

const CommissionOverview: React.FC<CommissionOverviewProps> = ({ showAmount, setShowAmount }) => {
  const [commissionData, setCommissionData] = useState({
    totalAmount: 0,
    invoiced: 0,
    notPaid: 0,
    registeredPatients: 0,
    topExaminations: Array<{ name: string; value: number }>(),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve the doctor's ID from local storage
        const userDataString = localStorage.getItem('userData');
        const userData = userDataString ? JSON.parse(userDataString) : null;
        const doctorId = userData?.doctor_id || '65'; // Use doctor_id from userData

        // Fetch data from the new endpoint
        const response = await axiosInstance.get(`/doctor_com/solde/${doctorId}`);
        const data = response.data;

        // Update state with the new data structure
        setCommissionData({
          totalAmount: data.Solde.commission,
          invoiced: data.Factured,
          notPaid: data.Not_Factured,
          registeredPatients: data.number_of_registered_patients,
          topExaminations: Object.entries(data.Top_3)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([name, value]) => ({ name, value })),
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

  // Define a maximum number of patients for visualization purposes
  const maxPatients = 100; // Example maximum value, adjust as needed

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Solde</h3>
        <div className="flex items-center justify-between mb-6">
          <Wallet className="w-8 h-8 text-blue-600" />
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
      <div className="bg-white rounded-lg shadow-md p-6">
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
          <div className="flex-1 ml-30">
            <h4 className="text-md font-semibold text-gray-700 mb-1">Top 2 Examinations</h4>
            <ul className="mt-1">
              {commissionData.topExaminations.map((exam, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-sm font-bold">{exam.value}</span>
                  <span className="text-sm text-gray-600 ml-6">{exam.name}</span>
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
