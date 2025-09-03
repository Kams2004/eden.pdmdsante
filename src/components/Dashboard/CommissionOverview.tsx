import { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, BarChart3, ChevronRight } from 'lucide-react';
import { startActivityTracking, stopActivityTracking } from '../utils/activityTracker';

interface StatsData {
  totalPatients: number;
  totalExamens: number;
  totalResultatsRecus: number;
  patientsEnAttente: number;
  examensTermines: number;
  resultatsEnCours: number;
}

interface CommissionOverviewProps {
  onNavigateToAnalysis?: () => void;
}

const CommissionOverview: React.FC<CommissionOverviewProps> = ({ 
  onNavigateToAnalysis 
}) => {
  const [statsData, setStatsData] = useState<StatsData>({
    totalPatients: 0,
    totalExamens: 0,
    totalResultatsRecus: 0,
    patientsEnAttente: 0,
    examensTermines: 0,
    resultatsEnCours: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Function to get the date range description
  const getDateRangeDescription = () => {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let cycleStartDate: Date;
    let cycleEndDate: Date;

    if (currentDay >= 21) {
      cycleStartDate = new Date(currentYear, currentMonth, 21);
      cycleEndDate = new Date(currentYear, currentMonth + 1, 21);
    } else {
      cycleStartDate = new Date(currentYear, currentMonth - 1, 21);
      cycleEndDate = new Date(currentYear, currentMonth, 21);
    }

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: currentYear !== date.getFullYear() ? 'numeric' : undefined
      });
    };

    const formattedStartDate = formatDate(cycleStartDate);
    const formattedCurrentDate = currentDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });

    return `(du ${formattedStartDate} au ${formattedCurrentDate})`;
  };

  useEffect(() => {
    const handleIdle = () => {
    };
    startActivityTracking(handleIdle);

    return () => {
      stopActivityTracking();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simuler des données (remplacer par vos vraies données)
        setTimeout(() => {
          setStatsData({
            totalPatients: 156,
            totalExamens: 234,
            totalResultatsRecus: 189,
            patientsEnAttente: 12,
            examensTermines: 201,
            resultatsEnCours: 33,
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Patients</h3>
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

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Examens</h3>
            <div className="flex justify-center space-x-1 mb-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Résultats Reçus</h3>
            <div className="flex justify-center space-x-1 mb-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Loading state for analysis navigation */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-100 rounded-lg p-4 shadow-sm">
          <div className="flex justify-center space-x-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-4">
      <div className="grid grid-cols-3 gap-4">
        {/* Total Patients Container */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-blue-300 opacity-15 rounded-full translate-y-6 -translate-x-6"></div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Patients</h3>
                <p className="text-gray-500 text-xs">{getDateRangeDescription()}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center mb-4">
            <span className="text-3xl font-bold text-blue-700">
              {statsData.totalPatients}
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span className="text-sm">{statsData.patientsEnAttente} En attente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Actif</span>
            </div>
          </div>
        </div>

        {/* Total Examens Container */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-purple-300 opacity-15 rounded-full translate-y-6 -translate-x-6"></div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-purple-600 mr-2" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Examens</h3>
                <p className="text-gray-500 text-xs">{getDateRangeDescription()}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center mb-4">
            <span className="text-3xl font-bold text-purple-700">
              {statsData.totalExamens}
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">{statsData.examensTermines} Terminés</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">En cours</span>
            </div>
          </div>
        </div>

        {/* Total Résultats Reçus Container */}
        {/* <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-emerald-300 opacity-15 rounded-full translate-y-6 -translate-x-6"></div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-emerald-600 mr-2" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Résultats Reçus</h3>
                <p className="text-gray-500 text-xs">{getDateRangeDescription()}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center mb-4">
            <span className="text-3xl font-bold text-emerald-700">
              {statsData.totalResultatsRecus}
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">{statsData.resultatsEnCours} En cours</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Reçus</span>
            </div>
          </div>
        </div> */}
      </div>

      {/* Monthly Analysis Navigation Container */}
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-100 rounded-lg p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-200 opacity-20 rounded-full -translate-y-6 translate-x-6"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 bg-indigo-300 opacity-25 rounded-full translate-y-4 -translate-x-4"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center">
            <BarChart3 className="w-5 h-5 text-indigo-600 mr-3" />
            <span className="text-base font-semibold text-gray-800">Analyser les statistiques mensuelles</span>
          </div>
          
          <button
            onClick={onNavigateToAnalysis}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            Analyser
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommissionOverview;