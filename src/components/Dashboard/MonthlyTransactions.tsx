import { useState, useEffect } from 'react';
import { DollarSign, Users, FileText } from 'lucide-react';
import axiosInstance from "../../api/axioConfig";

interface DoctorData {
  commission: number;
  number_of_registered_patients: number;
  Nombre_Commissions: number;
}

const MonthlyTransactions: React.FC = () => {
  const [doctorData, setDoctorData] = useState<DoctorData>({
    commission: 0,
    number_of_registered_patients: 0,
    Nombre_Commissions: 0,
  });

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const userData = localStorage.getItem('userData');
        if (!userData) {

          return;
        }

        const { doctor_id } = JSON.parse(userData);
        const response = await axiosInstance.get(`/doctor_com/general/${doctor_id}`);
        const data = response.data;

        setDoctorData({
          commission: data.Solde.commission,
          number_of_registered_patients: data.number_of_registered_patients,
          Nombre_Commissions: data.Nombre_Commissions,
        });
      } catch (error) {

      }
    };

    fetchDoctorData();
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">General Information</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          <div>
            <p className="text-sm text-gray-500">Number of Registered Patients</p>
            <p className="text-xl font-bold">{doctorData.number_of_registered_patients}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-xl font-bold">{formatAmount(doctorData.commission)}</p>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-500">Total Commissions</p>
              <p className="text-xl font-bold text-right">{doctorData.Nombre_Commissions}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTransactions;
