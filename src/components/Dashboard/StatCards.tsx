import { useState, useEffect } from 'react';
import { Wallet, Eye, EyeOff, Users, User } from 'lucide-react';
import axiosInstance from "../../api/axioConfig";

// Définir les props pour le composant CircularProgress
interface CircularProgressProps {
  percentage: number;
  icon: React.ComponentType<{ className?: string }>;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ percentage, icon: Icon }) => {
  return (
    <div className="relative w-16 h-16">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <path
          className="text-gray-200"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          strokeWidth="3"
          stroke="currentColor"
        />
        <path
          className="text-emerald-500"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          strokeWidth="3"
          strokeDasharray={`${percentage}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="w-6 h-6 text-emerald-600" />
      </div>
    </div>
  );
};

// Définir le type pour l'état des statistiques
interface Stats {
  commission: {
    amount: number;
    count: number;
  };
  patients: {
    total: number;
    percentage: number;
  };
  patientNames: string[];
}

const StatCards: React.FC = () => {
  const [showCommissions, setShowCommissions] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats>({
    commission: {
      amount: 0,
      count: 0,
    },
    patients: {
      total: 0,
      percentage: 0,
    },
    patientNames: [],
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataString = localStorage.getItem('userData');
        const userData = userDataString ? JSON.parse(userDataString) : null;
        const doctorId = userData?.doctor_id || '65';
        const response = await axiosInstance.get(`gnu_doctor/${doctorId}/research/`);
        const data = response.data;

        // Utiliser une assertion de type pour indiquer à TypeScript que les clés sont des chaînes de caractères
        const uniquePatients = [...new Set(data.Data.data_patients.map((patientData: { [key: string]: unknown }) =>
          Object.keys(patientData)[0]
        ))] as string[];

        const patientsPercentage = (uniquePatients.length / 100) * 100;

        setStats({
          commission: {
            amount: data.Data.commission,
            count: data.number,
          },
          patients: {
            total: uniquePatients.length,
            percentage: patientsPercentage,
          },
          patientNames: uniquePatients.slice(0, 3),
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* État de chargement de la Commission d'aujourd'hui */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200 rounded-lg p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-20 h-20 bg-gray-100 opacity-30 rounded-full -translate-y-10 -translate-x-10"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-slate-200 opacity-20 rounded-full translate-y-12 translate-x-12"></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-gray-700 font-bold">Commission d'aujourd'hui</span>
          </div>

          <div className="flex items-center mb-4 relative z-10">
            <Wallet className="w-6 h-6 text-slate-600 mr-4" />
            <div className="flex space-x-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
          </div>

          <div className="flex justify-end items-center text-sm text-gray-600 relative z-10">
            <Users className="w-4 h-4 mr-1" />
            <div className="flex space-x-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
        {/* État de chargement des Patients enregistrés aujourd'hui */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-16 bg-purple-200 opacity-20 rounded-full -translate-y-8 translate-x-16 rotate-45"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-indigo-200 opacity-15 rounded-full translate-y-10 -translate-x-10"></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-gray-700 font-bold">Patients enregistrés aujourd'hui</span>
          </div>

          <div className="flex items-center justify-center relative z-10">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex space-x-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="ml-4">
              <div className="flex space-x-1 mb-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
              <div className="text-sm text-gray-600">Patients</div>
            </div>
          </div>
        </div>
        {/* État de chargement des Noms des patients */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-6 shadow-sm relative overflow-hidden md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-gray-700 font-bold">Noms des patients d'aujourd'hui</span>
          </div>
          <hr className="mb-4 border-blue-200 relative z-10" />
          <div className="text-sm text-gray-600 relative z-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center mb-2 p-2 rounded">
                <div className="flex space-x-1">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${j * 0.1}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Conteneur de la Commission d'aujourd'hui */}
      <div className="bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200 rounded-lg p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-20 h-20 bg-gray-100 opacity-30 rounded-full -translate-y-10 -translate-x-10"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-slate-200 opacity-20 rounded-full translate-y-12 translate-x-12"></div>

        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-gray-700 font-bold">Commission d'aujourd'hui</span>
        </div>

        <div className="flex items-center mb-1 ml-1 relative z-10">
          <Wallet className="w-6 h-6 text-slate-600 mr-4" />
          <span className="text-2xl font-bold text-gray-900 flex items-center">
            {showCommissions ? formatAmount(stats.commission.amount) : '*****'}
            <button
              onClick={() => setShowCommissions(!showCommissions)}
              className="ml-2 hover:bg-gray-200 p-1 rounded transition-colors"
            >
              {showCommissions ? (
                <EyeOff className="w-5 h-5 text-gray-600" />
              ) : (
                <Eye className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </span>
        </div>

        <div className="flex justify-end items-center text-sm text-gray-600 relative z-10">
          <Users className="w-4 h-4 mr-1" />
          <span>{stats.commission.count} commissions</span>
        </div>
      </div>
      {/* Conteneur des Patients enregistrés aujourd'hui */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-16 bg-purple-200 opacity-20 rounded-full -translate-y-8 translate-x-16 rotate-45"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-indigo-200 opacity-15 rounded-full translate-y-10 -translate-x-10"></div>

        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-gray-700 font-bold">Patients enregistrés aujourd'hui</span>
        </div>

        <div className="flex items-center justify-center relative z-10">
          <CircularProgress percentage={stats.patients.percentage} icon={Users} />
          <div className="ml-4">
            <div className="text-2xl font-bold">{stats.patients.total}</div>
            <div className="text-sm text-gray-600">Patients</div>
          </div>
        </div>
      </div>
      {/* Conteneur des Noms des patients */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-6 shadow-sm relative overflow-hidden md:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-gray-700 font-bold">Noms des patients d'aujourd'hui</span>
        </div>
        <hr className="mb-4 border-blue-200 relative z-10" />
        <div className="text-sm text-gray-600 relative z-10">
          {stats.patientNames.map((name, index) => (
            <div
              key={index}
              className="flex items-center mb-2 hover:bg-blue-50 p-2 rounded transition-colors"
            >
              <User className="w-4 h-4 mr-2 text-blue-500" />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatCards;
