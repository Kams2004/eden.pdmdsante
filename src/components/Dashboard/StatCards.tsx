import React from 'react';
import { Wallet, DollarSign, ArrowLeftRight, Eye, EyeOff, UserCheck, ClipboardCheck } from 'lucide-react';
import CircularProgress from '../UI/CircularProgress';

interface StatCardsProps {
  stats: {
    commission: {
      amount: number;
      count: number;
      transactions: number;
    };
    patients: {
      total: number;
      percentage: number;
    };
    examinations: {
      total: number;
      percentage: number;
    };
  };
  showAmount: boolean;
  setShowAmount: (show: boolean) => void;
}

const StatCards: React.FC<StatCardsProps> = ({ stats, showAmount, setShowAmount }) => {
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
            <DollarSign className="w-5 h-5" />
            <span>{stats.commission.count} commissions</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" />
            <span>{stats.commission.transactions} transactions</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Registered Patients</h3>
        <CircularProgress 
          percentage={stats.patients.percentage}
          icon={UserCheck}
          value={stats.patients.total}
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Examinations In Process</h3>
        <CircularProgress 
          percentage={stats.examinations.percentage}
          icon={ClipboardCheck}
          value={stats.examinations.total}
        />
      </div>
    </div>
  );
};

export default StatCards;
