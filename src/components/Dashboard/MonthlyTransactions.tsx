import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowLeftRight } from 'lucide-react';
import axiosInstance from "../../api/axioConfig";

const MonthlyTransactions: React.FC = () => {
  const [monthlyData, setMonthlyData] = useState({
    count: 0,
    amount: 0,
    totalCommissions: 0,
  });

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const userData = localStorage.getItem('userData');
        if (!userData) {
          console.error('No user data found in localStorage');
          return;
        }

        const { doctor_id } = JSON.parse(userData);
        const startDateStr = '2025-03-21 00:00:00.000';
        const endDateStr = new Date().toISOString().split('T')[0] + ' 00:00:00.000';

        const response = await axiosInstance.get(`gnu_doctor/${doctor_id}/commissions/${startDateStr}/${endDateStr}`);
        const data = Object.values(response.data).flat();

        // Filter data for the specified date range
        const filteredData = data.filter((item: any) => {
          const itemDate = new Date(item.Date);
          const startDate = new Date(startDateStr);
          const endDate = new Date(endDateStr);
          return itemDate >= startDate && itemDate <= endDate;
        });

        // Calculate the total number of transactions where Facturé is "paid"
        const totalTransactions = filteredData.filter((item: any) => item.Facturé === "paid").length;

        // Calculate the total amount for transactions where Facturé is "invoiced"
        const totalAmount = filteredData
          .filter((item: any) => item.Facturé === "invoiced")
          .reduce((sum: number, item: any) => sum + parseFloat(item.Montant), 0);

        setMonthlyData({
          count: totalTransactions,
          amount: totalAmount,
          totalCommissions: filteredData.filter((item: any) => item.Facturé === "invoiced").length,
        });
      } catch (error) {
        console.error('Error fetching monthly transactions data:', error);
      }
    };

    fetchMonthlyData();
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">General informations</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-6 h-6 text-blue-600" />
          <div>
            <p className="text-sm text-gray-500">Number of Transactions</p>
            <p className="text-xl font-bold">{monthlyData.count}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-xl font-bold">{formatAmount(monthlyData.amount)}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Commissions</p>
          <p className="text-xl font-bold text-right">{monthlyData.totalCommissions}</p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTransactions;
