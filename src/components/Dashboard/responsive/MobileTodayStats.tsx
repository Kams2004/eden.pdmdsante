import React, { useState } from 'react';
import { Wallet, Eye, EyeOff, Users, User } from 'lucide-react';

const CircularProgress = ({ percentage, icon: Icon }) => {
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

const MobileTodayStats = () => {
  const [showCommissions, setShowCommissions] = useState<boolean>(false);

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Today's Commissions Container */}
      <div className="bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
        {/* Decorative patterns */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gray-100 opacity-30 rounded-full -translate-y-10 -translate-x-10"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-slate-200 opacity-20 rounded-full translate-y-12 translate-x-12"></div>
        <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-gray-200 opacity-40 rounded-full"></div>
        
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-gray-700 font-bold">Today's Commissions</span>
        </div>
        <div className="flex items-center mb-1 ml-1 relative z-10">
          <Wallet className="w-6 h-6 text-slate-600 mr-4" />
          <span className="text-2xl font-bold text-gray-900 flex items-center">
            {showCommissions ? '0,00 FCFA' : '*****'}
            <button onClick={() => setShowCommissions(!showCommissions)} className="ml-2 hover:bg-gray-200 p-1 rounded transition-colors">
              {showCommissions ? <EyeOff className="w-5 h-5 text-gray-600" /> : <Eye className="w-5 h-5 text-gray-600" />}
            </button>
          </span>
        </div>
        <div className="flex justify-end items-center text-sm text-gray-600 relative z-10">
          <Users className="w-4 h-4 mr-1" />
          <span>0 commissions</span>
        </div>
      </div>

      {/* Today's Registered Patients Container */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-100 rounded-lg p-4 shadow-sm relative overflow-hidden">
        {/* Decorative patterns */}
        <div className="absolute top-0 right-0 w-32 h-16 bg-purple-200 opacity-20 rounded-full -translate-y-8 translate-x-16 rotate-45"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-indigo-200 opacity-15 rounded-full translate-y-10 -translate-x-10"></div>
        <div className="absolute top-3 left-1/3 w-4 h-4 bg-purple-300 opacity-30 rounded-full"></div>
        <div className="absolute bottom-3 right-1/3 w-8 h-8 bg-indigo-300 opacity-20 rounded-full"></div>
        
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-gray-700 font-bold">Today's Registered Patients</span>
        </div>
        <div className="flex items-center ml-20 relative z-10">
          <CircularProgress percentage={0} icon={Users} />
          <div className="ml-4">
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-gray-600">Patients</div>
          </div>
        </div>
      </div>

      {/* Patient Names Container */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 shadow-sm relative overflow-hidden">
        {/* Decorative patterns */}
        <div className="absolute top-0 left-1/2 w-16 h-16 bg-blue-100 opacity-25 rounded-full -translate-y-8 -translate-x-8"></div>
        <div className="absolute bottom-0 right-0 w-14 h-14 bg-indigo-100 opacity-30 rounded-full translate-y-7 translate-x-7"></div>
        <div className="absolute top-1/4 left-0 w-10 h-10 bg-blue-200 opacity-20 rounded-full -translate-x-5"></div>
        <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-indigo-200 opacity-25 rounded-full"></div>
        
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-gray-700 font-bold">Today's Patient Names</span>
        </div>
        <hr className="mb-4 border-blue-200 relative z-10" />
        <div className="text-sm text-gray-600 relative z-10">
          <div className="flex items-center mb-2 hover:bg-blue-50 p-2 rounded transition-colors">
            <User className="w-4 h-4 mr-2 text-blue-500" />
            <span>Patient One</span>
          </div>
          <div className="flex items-center mb-2 hover:bg-blue-50 p-2 rounded transition-colors">
            <User className="w-4 h-4 mr-2 text-blue-500" />
            <span>Patient Two</span>
          </div>
          <div className="flex items-center hover:bg-blue-50 p-2 rounded transition-colors">
            <User className="w-4 h-4 mr-2 text-blue-500" />
            <span>Patient Three</span>
          </div>
        </div>
        <hr className="mt-4 border-blue-200 relative z-10" />
      </div>
    </div>
  );
};

export default MobileTodayStats;