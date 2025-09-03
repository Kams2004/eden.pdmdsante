import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import axiosInstance from "../../../../api/axioConfig";
import {
  startActivityTracking,
  stopActivityTracking,
} from "../../../utils/activityTracker";

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

const MobileCommissionAnalysis: React.FC = () => {
  const [analysisType, setAnalysisType] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [invoiceStatus, setInvoiceStatus] = useState<
    "invoiced" | "not_invoiced"
  >("invoiced");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [yearlyData, setYearlyData] = useState<YearlyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPatientList, setShowPatientList] = useState(false);
  useEffect(() => {
    const handleIdle = () => {
     
      // You can add logic here to log out or show a warning
    };

    startActivityTracking(handleIdle);

    return () => {
      stopActivityTracking();
    };
  }, []);
  const months = [
    { value: 1, label: "Janvier" },
    { value: 2, label: "Février" },
    { value: 3, label: "Mars" },
    { value: 4, label: "Avril" },
    { value: 5, label: "Mai" },
    { value: 6, label: "Juin" },
    { value: 7, label: "Juillet" },
    { value: 8, label: "Août" },
    { value: 9, label: "Septembre" },
    { value: 10, label: "Octobre" },
    { value: 11, label: "Novembre" },
    { value: 12, label: "Décembre" },
  ];

  const monthsInFrench = {
    JANVIER: "Janvier",
    FEVRIER: "Février",
    MARS: "Mars",
    AVRIL: "Avril",
    MAI: "Mai",
    JUIN: "Juin",
    JUILLET: "Juillet",
    AOUT: "Août",
    SEPTEMBRE: "Septembre",
    OCTOBRE: "Octobre",
    NOVEMBRE: "Novembre",
    DECEMBRE: "Décembre",
  };

  const getDoctorId = () => {
    const userData = localStorage.getItem("userData");
    if (!userData) return null;
    const { doctor_id } = JSON.parse(userData);
    return doctor_id;
  };

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const doctorId = getDoctorId();
      if (!doctorId) return;
      const invoiceParam =
        invoiceStatus === "invoiced" ? "invoiced" : "Notinvoiced";
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
      const invoiceParam =
        invoiceStatus === "invoiced" ? "invoiced" : "Notinvoiced";
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
    if (analysisType === "monthly") {
      fetchMonthlyData();
    } else {
      fetchYearlyData();
    }
  }, [analysisType, invoiceStatus, selectedMonth, selectedYear]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
      .format(amount)
      .replace("XAF", "FCFA");
  };

  const getYearlyChartData = () => {
    if (!yearlyData) return [];
    const filteredData = Object.entries(yearlyData)
      .filter(([key]) => key !== "Total")
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
      .filter((data) => {
        if (invoiceStatus === "not_invoiced") {
          const monthIndex = Object.values(monthsInFrench).indexOf(data.month);
          return monthIndex >= 4;
        }
        return true;
      });
    return filteredData;
  };

  const calculateCustomTotal = (
    chartData: { month: string; amount: number }[]
  ) => {
    return chartData.reduce((sum, data) => sum + data.amount, 0);
  };

  const renderMonthlyAnalysis = () => {
    if (!monthlyData) return null;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 opacity-80" />
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">
                Patients
              </span>
            </div>
            <div className="text-2xl font-bold">
              {monthlyData.nb_total_patient}
            </div>
            <div className="text-xs opacity-80">Total des patients</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 opacity-80" />
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">
                Total
              </span>
            </div>
            <div className="text-lg font-bold mr-14">
              {formatCurrency(monthlyData.montant_total)}
            </div>
            <div className="text-xs opacity-80">Commission</div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Répartition des commissions
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">
                Montant des prescriptions
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {formatCurrency(monthlyData.montant_prescription)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">
                Montant des réalisations
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {formatCurrency(monthlyData.montant_realisation)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">
                Total des commissions
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {monthlyData.nb_total_commission}
              </span>
            </div>
          </div>
        </div>
        {monthlyData.list_patient_name.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200">
            <button
              onClick={() => setShowPatientList(!showPatientList)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg font-semibold text-gray-800">
                Liste des patients ({monthlyData.list_patient_name.length})
              </span>
              {showPatientList ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {showPatientList && (
              <div className="px-4 pb-4 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {monthlyData.list_patient_name.map((patientName, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        {patientName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderYearlyAnalysis = () => {
    if (!yearlyData) return null;

    const chartData = getYearlyChartData();
    const customTotal = calculateCustomTotal(chartData);
    const maxAmount = Math.max(...chartData.map((d) => d.amount));

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded">
              {selectedYear} Total
            </span>
          </div>
          <div className="text-sm font-medium mb-2">Total</div>
          <div className="text-3xl font-bold">
            {formatCurrency(customTotal)}
          </div>
          <div className="text-sm opacity-80">Commission annuelle</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Répartition mensuelle
          </h3>
          <div className="space-y-3">
            {chartData.map((data, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-16 text-xs text-gray-600 font-medium">
                  {data.month.slice(0, 3)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="h-6 bg-gray-200 rounded-full overflow-hidden flex-1 mr-3">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                        style={{
                          width:
                            maxAmount > 0
                              ? `${(data.amount / maxAmount) * 100}%`
                              : "0%",
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 min-w-0">
                      {formatCurrency(data.amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {chartData
            .filter((d) => d.amount > 0)
            .map((data, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200"
              >
                <div className="text-xs font-medium text-gray-600 mb-1">
                  {data.month}
                </div>
                <div className="text-xs text-gray-500">
                  Prescription: {formatCurrency(data.prescriptionCommission)}
                </div>
                <div className="text-xs text-gray-500">
                  Realization: {formatCurrency(data.realizationCommission)}
                </div>
                <div className="text-sm font-bold text-gray-800 mt-1">
                  {formatCurrency(data.amount)}
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-4">
          <h1 className="text-xl font-semibold text-slate-800">
            Analyse des commissions
          </h1>

          <div className="w-12 h-1 bg-blue-400 mt-2 rounded-full"></div>
        </div>
        <div className="px-4 py-8 flex items-center justify-center">
          <div className="flex space-x-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-4">
        <h1 className="text-xl font-semibold text-slate-800">
          Analyse des commissions
        </h1>

        <div className="w-12 h-1 bg-blue-400 mt-2 rounded-full"></div>
      </div>
      <div className="px-4 sm:px-6 py-4 bg-slate-50/50 border-b border-slate-200">
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
          <button
            onClick={() => setAnalysisType("monthly")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              analysisType === "monthly"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Mensuel
          </button>
          <button
            onClick={() => setAnalysisType("yearly")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              analysisType === "yearly"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Annuel
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {analysisType === "monthly" && (
            <div className="flex flex-row items-center space-x-2 w-full">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Mois
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  const month = Number(e.target.value);
                  setSelectedMonth(month);
                  if (month <= 4) {
                    setInvoiceStatus("invoiced");
                  }
                }}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 w-full"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {analysisType === "yearly" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Année
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              >
                {[2025, 2024, 2023, 2022].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <hr className="my-4 border-gray-200" />
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setInvoiceStatus("invoiced")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              invoiceStatus === "invoiced"
                ? "bg-green-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Facturé
          </button>
          {!(analysisType === "monthly" && selectedMonth <= 4) && (
            <button
              onClick={() => setInvoiceStatus("not_invoiced")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                invoiceStatus === "not_invoiced"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Non facturé
            </button>
          )}
        </div>
      </div>
      <div className="px-4 sm:px-6 py-4">
        {analysisType === "monthly"
          ? renderMonthlyAnalysis()
          : renderYearlyAnalysis()}
      </div>
    </div>
  );
};

export default MobileCommissionAnalysis;
