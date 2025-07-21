import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axiosInstance from '../../api/axioConfig';
import { Printer, Filter, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface Commission {
  Date: string;
  Examen: string;
  Facturé: string;
  Montant: string;
  Patient: string;
  Produit: string;
  Validé: boolean | null;
  selected?: boolean;
}

interface CommissionData {
  doctorName: string;
  commissionData: Commission[];
}

const CommissionView: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [filteredCommissions, setFilteredCommissions] = useState<CommissionData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const itemsPerPage = 10;

  const fetchCommissionsData = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('userData');
      if (!userData) {
        console.error('No user data found in localStorage');
        return;
      }
      const { doctor_id } = JSON.parse(userData);
      const response = await axiosInstance.get(`gnu_doctor/${doctor_id}/commissions/`);
      const formattedCommissions = Object.entries(response.data).map(([doctorName, commissionData]) => ({
        doctorName,
        commissionData: (commissionData as Array<{
          Date: string;
          Examen: string;
          Facturé: string;
          Montant: string;
          Patient: string;
          Produit: string;
          Validé: boolean | null;
        }>).map(item => ({
          ...item,
          selected: false,
          Validé: item.Validé || false
        }))
      }));
      setCommissions(formattedCommissions);
      setFilteredCommissions(formattedCommissions);
    } catch (error) {
      console.error('Error fetching commissions data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissionsData();
  }, []);

  useEffect(() => {
    let filtered = [...commissions];
    if (startDate) {
      filtered = filtered.map(commission => ({
        ...commission,
        commissionData: commission.commissionData.filter(item => new Date(item.Date) >= startDate)
      })).filter(commission => commission.commissionData.length > 0);
    }
    if (endDate) {
      filtered = filtered.map(commission => ({
        ...commission,
        commissionData: commission.commissionData.filter(item => new Date(item.Date) <= endDate)
      })).filter(commission => commission.commissionData.length > 0);
    }
    setFilteredCommissions(filtered);
    setCurrentPage(1);
  }, [startDate, endDate, commissions]);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setFilteredCommissions(filteredCommissions.map(commission => ({
      ...commission,
      commissionData: commission.commissionData.map(item => ({ ...item, selected: newSelectAll }))
    })));
  };

  const handleSelectCommission = (doctorName: string, index: number) => {
    setFilteredCommissions(filteredCommissions.map(commission => {
      if (commission.doctorName === doctorName) {
        const updatedCommissionData = commission.commissionData.map((item, i) =>
          i === index ? { ...item, selected: !item.selected } : item
        );
        return { ...commission, commissionData: updatedCommissionData };
      }
      return commission;
    }));
  };

  const handlePrint = () => {
    const selectedCommissions = filteredCommissions.flatMap(commission =>
      commission.commissionData.filter(item => item.selected)
    );
    if (selectedCommissions.length === 0) {
      alert("Please select at least one commission to print");
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const totalAmount = selectedCommissions.reduce((sum, item) => sum + parseFloat(item.Montant), 0).toFixed(2);
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Commission Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #1a56db; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8fafc; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            .total { margin-top: 20px; text-align: right; font-weight: bold; font-size: 18px; color: black; }
            .status {
              border: 0.4px solid #ccc;
              border-radius: 10px;
              padding: 5px 10px;
              text-align: center;
              color: white;
            }
            .invoiced {
              background-color: #31B749;
            }
            .not-invoiced {
              background-color: #F03940;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">PDMD</div>
            <p>Commission Report - ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Examination</th>
                <th>Patient</th>
                <th>Amount</th>
                <th>Facturé</th>
              </tr>
            </thead>
            <tbody>
              ${selectedCommissions.map(item => `
                <tr>
                  <td>${item.Date}</td>
                  <td>${item.Examen}</td>
                  <td>${item.Patient}</td>
                  <td>${parseFloat(item.Montant).toFixed(2)}</td>
                  <td class="status ${item.Facturé ? 'invoiced' : 'not-invoiced'}">
                    ${item.Facturé ? 'Invoiced' : 'Not Invoiced'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            Total Amount: ${totalAmount}
          </div>
          <div class="footer">
            <p>Generated by PDMD</p>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    fetchCommissionsData();
  };

  const allCommissionItems = filteredCommissions.flatMap(commission =>
    commission.commissionData.map(item => ({
      ...item,
      doctorName: commission.doctorName
    }))
  );

  const paginatedItems = allCommissionItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(allCommissionItems.length / itemsPerPage);
  const totalAmount = paginatedItems.reduce((sum, item) => sum + parseFloat(item.Montant), 0).toFixed(2);

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 relative">
      {loading && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span className="text-sm">Loading commissions data...</span>
          </div>
        </div>
      )}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Commissions</h2>
        <div className="w-24 h-1 bg-blue-500 mx-auto mt-2 rounded-full"></div>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-bold text-gray-800 mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date) => setStartDate(date)}
              className="px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select start date"
              maxDate={endDate || new Date()}
              disabled={loading}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-bold text-gray-800 mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date) => setEndDate(date)}
              className="px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select end date"
              minDate={startDate}
              maxDate={new Date()}
              disabled={loading}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button
            onClick={handleReset}
            className="flex items-center px-4 py-2 border-2 border-black text-black rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reset
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Selected
          </button>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {allCommissionItems.length} of {allCommissionItems.length} Commissions
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Examination</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Patient</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Facturé</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                    Loading commissions...
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems.map((item, index) => (
                <tr key={`${item.doctorName}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={item.selected || false}
                      onChange={() => handleSelectCommission(item.doctorName, index)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.Date}</td>
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">{item.Examen}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.Patient}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{parseFloat(item.Montant).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div
                      className={`border-[0.4px] border-gray-300 rounded-[10px] p-[5px] text-center text-white ${
                        item.Facturé ? 'bg-[#31B749]' : 'bg-[#F03940]'
                      }`}
                    >
                      <span className="font-bold">
                        {item.Facturé ? 'Invoiced' : 'Not Invoiced'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-6">
        <div className="flex justify-end mb-2 mr-8">
          <p className="text-lg font-bold text-black">
            Total Amount: {totalAmount} FCFA
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="p-2 border-2 border-black rounded-full text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 py-2 rounded-lg bg-gray-100">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
            className="p-2 border-2 border-black rounded-full text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommissionView;
