import { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Calendar, Clock } from 'lucide-react';

// Circular Progress Component
interface CircularProgressProps {
  percentage: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ percentage, icon: Icon, color }) => {
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
          className={color}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          strokeWidth="3"
          strokeDasharray={`${percentage}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="w-6 h-6 text-gray-700" />
      </div>
    </div>
  );
};

interface DailyStats {
  appointments: {
    scheduled: number;
    completed: number;
    cancelled: number;
    percentage: number;
  };
  consultations: {
    total: number;
    emergency: number;
    routine: number;
    percentage: number;
  };
  activities: {
    total: number;
    recent: string[];
  };
}

const StatCards: React.FC = () => {
  const [stats, setStats] = useState<DailyStats>({
    appointments: {
      scheduled: 12,
      completed: 8,
      cancelled: 2,
      percentage: 75
    },
    consultations: {
      total: 15,
      emergency: 3,
      routine: 12,
      percentage: 85
    },
    activities: {
      total: 24,
      recent: ['Consultation générale', 'Examen cardiologique', 'Suivi post-opératoire']
    }
  });
  const [loading, setLoading] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Loading state for Appointments */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-20 h-20 bg-blue-100 opacity-30 rounded-full -translate-y-10 -translate-x-10"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-200 opacity-20 rounded-full translate-y-12 translate-x-12"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-gray-700 font-bold">Rendez-vous d'aujourd'hui</span>
          </div>
          <div className="flex items-center mb-4 relative z-10">
            <Calendar className="w-6 h-6 text-blue-600 mr-4" />
            <div className="flex space-x-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Loading state for Consultations */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-16 bg-green-200 opacity-20 rounded-full -translate-y-8 translate-x-16 rotate-45"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-emerald-200 opacity-15 rounded-full translate-y-10 -translate-x-10"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-gray-700 font-bold">Consultations d'aujourd'hui</span>
          </div>
          <div className="flex items-center justify-center relative z-10">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex space-x-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading state for Activities */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-100 rounded-lg p-6 shadow-sm relative overflow-hidden md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-gray-700 font-bold">Activités récentes</span>
          </div>
          <hr className="mb-4 border-purple-200 relative z-10" />
          <div className="text-sm text-gray-600 relative z-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center mb-2 p-2 rounded">
                <div className="flex space-x-1">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
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
      {/* Appointments Container */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-20 h-20 bg-blue-100 opacity-30 rounded-full -translate-y-10 -translate-x-10"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-200 opacity-20 rounded-full translate-y-12 translate-x-12"></div>
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <span className="text-gray-700 font-bold">Rendez-vous d'aujourd'hui</span>
        </div>
        
        <div className="flex items-center mb-4 relative z-10">
          <Calendar className="w-8 h-8 text-blue-600 mr-4" />
          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900">{stats.appointments.scheduled}</div>
            <div className="text-sm text-gray-600">Programmés</div>
          </div>
        </div>
        
        <div className="space-y-2 text-sm relative z-10">
          <div className="flex justify-between">
            <span className="text-gray-600">Terminés</span>
            <span className="font-semibold text-green-600">{stats.appointments.completed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Annulés</span>
            <span className="font-semibold text-red-500">{stats.appointments.cancelled}</span>
          </div>
        </div>
      </div>

      {/* Consultations Container */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-100 rounded-lg p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-16 bg-green-200 opacity-20 rounded-full -translate-y-8 translate-x-16 rotate-45"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-emerald-200 opacity-15 rounded-full translate-y-10 -translate-x-10"></div>
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <span className="text-gray-700 font-bold">Consultations d'aujourd'hui</span>
        </div>
        
        <div className="flex items-center justify-center relative z-10">
          <CircularProgress 
            percentage={stats.consultations.percentage} 
            icon={FileText} 
            color="text-emerald-500"
          />
          <div className="ml-4">
            <div className="text-2xl font-bold text-gray-900">{stats.consultations.total}</div>
            <div className="text-sm text-gray-600">Consultations</div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2 text-sm relative z-10">
          <div className="flex justify-between">
            <span className="text-gray-600">Urgences</span>
            <span className="font-semibold text-red-500">{stats.consultations.emergency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Routine</span>
            <span className="font-semibold text-green-600">{stats.consultations.routine}</span>
          </div>
        </div>
      </div>

      {/* Recent Activities Container */}
      <div className="bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-100 rounded-lg p-6 shadow-sm relative overflow-hidden md:col-span-2 lg:col-span-1">
        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-200 opacity-25 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-violet-200 opacity-20 rounded-full translate-y-6 -translate-x-6"></div>
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-purple-600 mr-2" />
            <span className="text-gray-700 font-bold">Activités récentes</span>
          </div>
          <div className="text-sm text-gray-500">
            <Clock className="w-4 h-4 inline mr-1" />
            {stats.activities.total} aujourd'hui
          </div>
        </div>
        
        <hr className="mb-4 border-purple-200 relative z-10" />
        
        <div className="text-sm text-gray-600 relative z-10 space-y-2">
          {stats.activities.recent.map((activity, index) => (
            <div
              key={index}
              className="flex items-center p-3 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
              <span className="flex-1">{activity}</span>
              <span className="text-xs text-gray-400 ml-2">
                {new Date().getHours() - index}h
              </span>
            </div>
          ))}
          
          {stats.activities.recent.length === 0 && (
            <div className="text-center py-4 text-gray-400">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <span>Aucune activité récente</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCards;