import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, TrendingUp, Users, DollarSign, FileText, ChevronDown, ChevronUp, Filter, Eye, EyeOff } from 'lucide-react';
import axiosInstance from "../../api/axioConfig";
import { startActivityTracking, stopActivityTracking } from '../utils/activityTracker';

interface MonthlyData {
  list_patient_name: string[];
  montant_prescription: number;
  montant_realisation: number;
  montant_total: number;
  nb_total_commission: number;
  nb_total_patient: number;
}

interface YearlyData {
  [key: string]: {
    [key: string]: number;
    elements_prescription: {
      commission: number;
      data_patients: Array<{
        [key: string]: [string, number, string];
      }>;
    };
    elements_realisation: {
      commission: number;
      data_patients: Array<{
        [key: string]: [string, number, string];
      }>;
    };
  };
  Total: number;
}

const DesktopCommissionAnalysis: React.FC = () => {
  const [analysisType, setAnalysisType] = useState<'monthly' | 'yearly'>('monthly');
  const [invoiceStatus, setInvoiceStatus] = useState<'invoiced' | 'not_invoiced'>('invoiced');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [yearlyData, setYearlyData] = useState<YearlyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPatientList, setShowPatientList] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [showAmounts, setShowAmounts] = useState(false);

  const months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ];

  const monthsInFrench = {
    'JANVIER': 'Janvier',
    'FEVRIER': 'Février',
    'MARS': 'Mars',
    'AVRIL': 'Avril',
    'MAI': 'Mai',
    'JUIN': 'Juin',
    'JUILLET': 'Juillet',
    'AOUT': 'Août',
    'SEPTEMBRE': 'Septembre',
    'OCTOBRE': 'Octobre',
    'NOVEMBRE': 'Novembre',
    'DECEMBRE': 'Décembre'
  };

  const getDoctorId = () => {
    const userData = localStorage.getItem('userData');
    if (!userData) return null;
    const { doctor_id } = JSON.parse(userData);
    return doctor_id;
  };
  useEffect(() => {
    const handleIdle = () => {

      // You can add logic here to log out or show a warning
    };

    startActivityTracking(handleIdle);

    return () => {
      stopActivityTracking();
    };
  }, []);
  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const doctorId = getDoctorId();
      if (!doctorId) return;

      const invoiceParam = invoiceStatus === 'invoiced' ? 'invoiced' : 'Notinvoiced';
      const response = await axiosInstance.get(
        `doctor_com/invoiced_by_mounth/${doctorId}/${selectedMonth}/${invoiceParam}`
      );
      setMonthlyData(response.data);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const fetchYearlyData = async () => {
    setLoading(true);
    try {
      const doctorId = getDoctorId();
      if (!doctorId) return;

      const invoiceParam = invoiceStatus === 'invoiced' ? 'invoiced' : 'Notinvoiced';
      const response = await axiosInstance.get(
        `doctor_com/invoiced_by_year/${doctorId}/${selectedYear}/${invoiceParam}`
      );
      setYearlyData(response.data);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (analysisType === 'monthly') {
      fetchMonthlyData();
    } else {
      fetchYearlyData();
    }
  }, [analysisType, invoiceStatus, selectedMonth, selectedYear]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount).replace('XAF', 'FCFA');
  };

  const getYearlyChartData = () => {
    if (!yearlyData) return [];
    const filteredData = Object.entries(yearlyData)
      .filter(([key]) => key !== 'Total')
      .map(([month, data]) => {
        const monthlyData = data as {
          [key: string]: number;
          elements_prescription: {
            commission: number;
            data_patients: Array<{
              [key: string]: [string, number, string];
            }>;
          };
          elements_realisation: {
            commission: number;
            data_patients: Array<{
              [key: string]: [string, number, string];
            }>;
          };
        };
        return {
          month: monthsInFrench[month as keyof typeof monthsInFrench] || month,
          amount: monthlyData[month] || 0,
          prescriptionCommission: monthlyData.elements_prescription.commission,
          realizationCommission: monthlyData.elements_realisation.commission,
        };
      })
      .sort((a, b) => {
        const monthOrder = Object.values(monthsInFrench);
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
      })
      .filter(data => {
        if (invoiceStatus === 'not_invoiced') {
          const monthIndex = Object.values(monthsInFrench).indexOf(data.month);
          return monthIndex >= 4;
        }
        return true;
      });
    return filteredData;
  };

  const calculateCustomTotal = (chartData: { month: string; amount: number }[]) => {
    return chartData.reduce((sum, data) => sum + data.amount, 0);
  };

  const renderMonthlyAnalysis = () => {
    if (!monthlyData) return null;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cartes de statistiques */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Patients</span>
            </div>
            <div className="text-3xl font-bold mb-2">{monthlyData.nb_total_patient}</div>
            <div className="text-sm opacity-80">Total des patients</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Commission</span>
            </div>
            <div className="text-2xl font-bold mb-2">
              {showAmounts ? formatCurrency(monthlyData.montant_total) : '***'}
            </div>
            <div className="text-sm opacity-80">Commission totale</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Commissions</span>
            </div>
            <div className="text-3xl font-bold mb-2">{monthlyData.nb_total_commission}</div>
            <div className="text-sm opacity-80">Nombre total commission</div>
          </div>
        </div>
        {/* Section des détails */}
        <div className="lg:col-span-2 space-y-6">
          {/* Répartition des commissions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
              Répartition des commissions
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-4 border-b border-gray-100">
                <span className="text-base text-gray-600 font-medium">Montant des prescriptions</span>
                <span className="text-lg font-semibold text-gray-800">
                  {showAmounts ? formatCurrency(monthlyData.montant_prescription) : '***'}
                </span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-gray-100">
                <span className="text-base text-gray-600 font-medium">Montant des réalisations</span>
                <span className="text-lg font-semibold text-gray-800">
                  {showAmounts ? formatCurrency(monthlyData.montant_realisation) : '***'}
                </span>
              </div>
              <div className="flex justify-between items-center py-4">
                <span className="text-base text-gray-600 font-medium">Total des commissions</span>
                <span className="text-lg font-semibold text-blue-600">
                  {monthlyData.nb_total_commission}
                </span>
              </div>
            </div>
          </div>
          {/* Liste des patients */}
          {monthlyData.list_patient_name.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <button
                onClick={() => setShowPatientList(!showPatientList)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-t-xl"
              >
                <span className="text-xl font-semibold text-gray-800 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-blue-600" />
                  Liste des patients ({monthlyData.list_patient_name.length})
                </span>
                {showPatientList ? (
                  <ChevronUp className="w-6 h-6 text-gray-500" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-500" />
                )}
              </button>
              {showPatientList && (
                <div className="px-6 pb-6 max-h-80 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {monthlyData.list_patient_name.map((patientName, index) => (
                      <div
                        key={index}
                        className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{patientName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderYearlyAnalysis = () => {
    if (!yearlyData) return null;
    const chartData = getYearlyChartData();
    const customTotal = calculateCustomTotal(chartData);
    const maxAmount = Math.max(...chartData.map(d => d.amount));
    return (
      <div className="space-y-6">
        {/* Résumé total */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <TrendingUp className="w-10 h-10 opacity-80" />
            <span className="text-lg font-medium bg-white/20 px-4 py-2 rounded-full">
              {selectedYear} Total
            </span>
          </div>
          <div className="text-lg font-medium mb-2">Commission annuelle totale</div>
          <div className="text-4xl font-bold">
            {showAmounts ? formatCurrency(customTotal) : '***'}
          </div>
        </div>
        {/* Répartition mensuelle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
              Répartition mensuelle
            </h3>
            <div className="space-y-4">
              {chartData.map((data, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-20 text-sm text-gray-600 font-medium">
                    {data.month}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-8 bg-gray-200 rounded-full overflow-hidden flex-1 mr-4">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 rounded-full"
                          style={{
                            width: maxAmount > 0 ? `${(data.amount / maxAmount) * 100}%` : '0%',
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 min-w-0">
                        {showAmounts ? formatCurrency(data.amount) : '***'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Détails mensuels */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-blue-600" />
              Détails mensuels
            </h3>
            <div className="grid grid-cols-1 gap-4 max-h-80 overflow-y-auto">
              {chartData
                .filter(d => d.amount > 0)
                .map((data, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="text-lg font-semibold text-gray-800 mb-2">{data.month}</div>
                    <div className="text-sm text-gray-600 mb-1">
                      Prescription: {showAmounts ? formatCurrency(data.prescriptionCommission) : '***'}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Réalisation: {showAmounts ? formatCurrency(data.realizationCommission) : '***'}
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {showAmounts ? formatCurrency(data.amount) : '***'}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-6">
          <h1 className="text-2xl font-semibold text-slate-800">Analyse des commissions</h1>

          <div className="w-16 h-1 bg-blue-400 mt-3 rounded-full"></div>
        </div>
        <div className="px-6 py-12 flex items-center justify-center">
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-4 h-4 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* En-tête */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Analyse des commissions</h1>
         
            <div className="w-16 h-1 bg-blue-400 mt-3 rounded-full"></div>
          </div>
          <button
            onClick={() => setShowAmounts(!showAmounts)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            {showAmounts ? <EyeOff className="w-5 h-5 mr-2" /> : <Eye className="w-5 h-5 mr-2" />}
            {showAmounts ? 'Masquer' : 'Afficher'} les montants
          </button>
        </div>
      </div>
      {/* Section des filtres */}
      <div className="px-6 py-6 bg-slate-50/50 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-700">Options de filtrage</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {showFilters && (
          <div className="space-y-6">
            {/* Basculer le type d'analyse */}
            <div className="flex bg-gray-100 rounded-xl p-2">
              <button
                onClick={() => setAnalysisType('monthly')}
                className={`flex-1 py-3 px-6 rounded-lg text-base font-medium transition-colors flex items-center justify-center ${
                  analysisType === 'monthly'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Analyse mensuelle
              </button>
              <button
                onClick={() => setAnalysisType('yearly')}
                className={`flex-1 py-3 px-6 rounded-lg text-base font-medium transition-colors flex items-center justify-center ${
                  analysisType === 'yearly'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Analyse annuelle
              </button>
            </div>
            {/* Sélection de la période */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysisType === 'monthly' && (
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Sélectionner le mois
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      const month = Number(e.target.value);
                      setSelectedMonth(month);
                      if (month <= 4) {
                        setInvoiceStatus('invoiced');
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {analysisType === 'yearly' && (
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Sélectionner l'année
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  >
                    {[2025, 2024, 2023, 2022].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {/* Basculer le statut de facturation */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-3">
                Statut de facturation
              </label>
              <div className="flex bg-gray-100 rounded-xl p-2">
                <button
                  onClick={() => setInvoiceStatus('invoiced')}
                  className={`flex-1 py-3 px-6 rounded-lg text-base font-medium transition-colors flex items-center justify-center ${
                    invoiceStatus === 'invoiced'
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Facturé
                </button>
                {!(analysisType === 'monthly' && selectedMonth <= 4) && (
                  <button
                    onClick={() => setInvoiceStatus('not_invoiced')}
                    className={`flex-1 py-3 px-6 rounded-lg text-base font-medium transition-colors flex items-center justify-center ${
                      invoiceStatus === 'not_invoiced'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Non facturé
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Contenu */}
      <div className="px-6 py-6">
        {analysisType === 'monthly' ? renderMonthlyAnalysis() : renderYearlyAnalysis()}
      </div>
    </div>
  );
};

export default DesktopCommissionAnalysis;
