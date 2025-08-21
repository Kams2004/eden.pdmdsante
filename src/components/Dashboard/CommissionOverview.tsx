import { useState, useEffect } from 'react';
import { Eye, EyeOff, FileText, Wallet } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrescriptionBottle, faTasks } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from "../../api/axioConfig";

interface CommissionData {
  totalAmount: number;
  invoiced: number;
  notPaid: number;
  registeredPatients: number;
  montantPrescription: number;
  montantRealisation: number;
}

interface CommissionOverviewProps {
  showAmount: boolean;
  setShowAmount: (show: boolean) => void;
}

const CommissionOverview: React.FC<CommissionOverviewProps> = ({ showAmount, setShowAmount }) => {
  const [showMontantPrescription, setShowMontantPrescription] = useState<boolean>(false);
  const [showMontantRealisation, setShowMontantRealisation] = useState<boolean>(false);
  const [commissionData, setCommissionData] = useState<CommissionData>({
    totalAmount: 0,
    invoiced: 0,
    notPaid: 0,
    registeredPatients: 0,
    montantPrescription: 0,
    montantRealisation: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataString = localStorage.getItem('userData');
        const userData = userDataString ? JSON.parse(userDataString) : null;
        const doctorId = userData?.doctor_id || '65';

        // Fetch main commission data
        const response = await axiosInstance.get(`/doctor_com/solde/${doctorId}`);
        const data = response.data;

        // Fetch additional stats for prescription and realisation amounts
        const statsResponse = await axiosInstance.get(`/doctor_com/actual_solde/${doctorId}`);
        const statsData = statsResponse.data;

        setCommissionData({
          totalAmount: data.Solde.commission,
          invoiced: data.Factured,
          notPaid: data.Not_Factured,
          registeredPatients: data.number_of_registered_patients,
          montantPrescription: statsData.montant_prescription,
          montantRealisation: statsData.montant_realisation,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
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

  const getDateRangeDescription = () => {
    const currentDate = new Date();
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 21);
    const formattedPreviousMonth = previousMonth.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const formattedCurrentDate = currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    return `(du ${formattedPreviousMonth} au ${formattedCurrentDate})`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Solde Principal</h3>
          <div className="flex justify-center space-x-1 mb-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-100 border border-yellow-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Détails des commissions</h3>
          <div className="flex justify-center space-x-1 mb-4">
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
    <div className="grid grid-cols-2 gap-4 mb-4">
      {/* Solde Principal Container */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-blue-300 opacity-15 rounded-full translate-y-6 -translate-x-6"></div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Wallet className="w-6 h-6 text-blue-600 mr-2" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Solde Principal</h3>
              <p className="text-gray-500 text-xs">{getDateRangeDescription()}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900">
              {showAmount ? formatAmount(commissionData.totalAmount).numericAmount : '*****'}
            </span>
            <span className="text-sm text-gray-600 ml-1">
              {showAmount ? formatAmount(commissionData.totalAmount).currency : ''}
            </span>
          </div>
          <button
            onClick={() => setShowAmount(!showAmount)}
            className="w-8 h-8 flex items-center justify-center hover:bg-blue-200 rounded-full transition-colors"
          >
            {showAmount ? <EyeOff className="w-5 h-5 text-gray-800" /> : <Eye className="w-5 h-5 text-gray-800" />}
          </button>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <span className="text-sm">{commissionData.invoiced} Invoiced</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">{commissionData.registeredPatients} patients</span>
          </div>
        </div>
      </div>

      {/* Combined Prescription and Realisation Container */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-100 border border-yellow-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-200 opacity-25 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-orange-200 opacity-20 rounded-full translate-y-6 -translate-x-6"></div>
        <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-yellow-300 opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Détails des commissions</h3>
        <p className="text-gray-500 text-xs mb-4">{getDateRangeDescription()}</p>
        <div className="flex">
          {/* Montant Prescription */}
          <div className="flex-1 pr-4">
            <div className="flex items-center mb-2">
              <FontAwesomeIcon icon={faPrescriptionBottle} className="text-blue-600 mr-2" size="lg" />
              <div className="text-sm font-bold text-gray-700">Montant Prescription</div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">
                  {showMontantPrescription ? formatAmount(commissionData.montantPrescription).numericAmount : '*****'}
                </span>
                <span className="text-sm text-gray-600">
                  {showMontantPrescription ? formatAmount(commissionData.montantPrescription).currency : ''}
                </span>
              </div>
              <button
                onClick={() => setShowMontantPrescription(!showMontantPrescription)}
                className="w-6 h-6 flex items-center justify-center hover:bg-yellow-200 rounded-full transition-colors flex-shrink-0"
              >
                {showMontantPrescription ? <EyeOff className="w-4 h-4 text-gray-800" /> : <Eye className="w-4 h-4 text-gray-800" />}
              </button>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="w-px bg-gray-300 mx-2"></div>

          {/* Montant Réalisation */}
          <div className="flex-1 pl-4">
            <div className="flex items-center mb-2">
              <FontAwesomeIcon icon={faTasks} className="text-orange-600 mr-2" size="lg" />
              <div className="text-sm font-bold text-gray-700">Montant Réalisation</div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">
                  {showMontantRealisation ? formatAmount(commissionData.montantRealisation).numericAmount : '*****'}
                </span>
                <span className="text-sm text-gray-600">
                  {showMontantRealisation ? formatAmount(commissionData.montantRealisation).currency : ''}
                </span>
              </div>
              <button
                onClick={() => setShowMontantRealisation(!showMontantRealisation)}
                className="w-6 h-6 flex items-center justify-center hover:bg-orange-200 rounded-full transition-colors flex-shrink-0"
              >
                {showMontantRealisation ? <EyeOff className="w-4 h-4 text-gray-800" /> : <Eye className="w-4 h-4 text-gray-800" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionOverview;
