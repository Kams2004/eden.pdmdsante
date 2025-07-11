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
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [filteredCommissions, setFilteredCommissions] = useState<CommissionData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const itemsPerPage = 10;

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

  useEffect(() => {
    const fetchCommissionsData = async () => {
      try {
        setLoading(true);
        const userData = localStorage.getItem('userData');
        if (!userData) {
          console.error('No user data found in localStorage');
          return;
        }

        const { doctor_id } = JSON.parse(userData);
        const startDateStr = startDate ? formatDateToString(startDate) : '';
        const endDateStr = endDate ? formatDateToString(endDate) : '';

        if (startDateStr && endDateStr) {
          const response = await axiosInstance.get(`gnu_doctor/${doctor_id}/commissions/${startDateStr}/${endDateStr}`);
          const formattedCommissions = Object.entries(response.data).map(([doctorName, commissionData]) => ({
            doctorName,
            commissionData: (commissionData as Commission[]).map(item => ({
              ...item,
              selected: false,
              Validé: item.Validé || false
            }))
          }));

          setCommissions(formattedCommissions);
          setFilteredCommissions(formattedCommissions);
        }
      } catch (error) {
        console.error('Error fetching commissions data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommissionsData();
  }, [startDate, endDate]);

  const formatDateToString = (date: Date | null): string => {
    if (!date) return '';

    const pad = (num: number) => num.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());

    return `${year}-${month}-${day} 00:00:00.000`;
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setFilteredCommissions(filteredCommissions.map(commission => ({
      ...commission,
      commissionData: commission.commissionData.map(item => ({ ...item, selected: !selectAll }))
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
                <th>Examen</th>
                <th>Patient</th>
                <th>Montant</th>
                <th>Validé</th>
              </tr>
            </thead>
            <tbody>
              ${selectedCommissions.map(item => `
                <tr>
                  <td>${item.Date}</td>
                  <td>${item.Examen}</td>
                  <td>${item.Patient}</td>
                  <td>${item.Montant}</td>
                  <td>${item.Validé ? 'Validated' : 'Not Validated'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
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
    setStartDate(new Date(new Date().getFullYear(), 0, 1));
    setEndDate(new Date());
  };

  const totalPages = Math.ceil(allCommissionItems.length / itemsPerPage);

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 relative">
      {/* Loading indicator */}
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
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Examen</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Patient</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Montant</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Validé</th>
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
                      onChange={() => {
                        setFilteredCommissions(prev =>
                          prev.map(commission => {
                            const updatedCommissionData = commission.commissionData.map(cItem =>
                              cItem.Date === item.Date && cItem.Examen === item.Examen
                                ? { ...cItem, selected: !cItem.selected }
                                : cItem
                            );
                            return { ...commission, commissionData: updatedCommissionData };
                          })
                        );
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.Date}</td>
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">{item.Examen}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.Patient}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.Montant}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.Validé ? 'Validated' : 'Not Validated'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="p-2 border-2 border-black rounded-full text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="px-4 py-2 rounded-lg bg-gray-100">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
