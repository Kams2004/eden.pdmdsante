import React from 'react';
import { DollarSign, ArrowLeftRight } from 'lucide-react';

interface MonthlyTransactionsProps {
  data: {
    count: number;
    amount: number;
    total: number;
  };
}

const MonthlyTransactions: React.FC<MonthlyTransactionsProps> = ({ data }) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Transactions</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-6 h-6 text-blue-600" />
          <div>
            <p className="text-sm text-gray-500">Number of Transactions per Monthly</p>
            <p className="text-xl font-bold">{data.count}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-xl font-bold">{formatAmount(data.amount)}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-xl font-bold text-right">{data.total}</p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTransactions;