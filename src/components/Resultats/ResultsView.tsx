import React from 'react';
import { BarChart2, Settings, AlertCircle, Clock } from 'lucide-react';

const ResultsView: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <div className="flex items-center">
          <BarChart2 className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-slate-800">
            Résultats d'Examens
          </h2>
        </div>
        <div className="w-24 h-1 bg-blue-500 mt-2 rounded-full"></div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <Settings className="w-12 h-12 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Page en Cours de Développement
          </h3>

          {/* Description */}
          <p className="text-lg text-slate-600 mb-6 leading-relaxed">
            La section des résultats d'examens est actuellement en développement. 
            Cette fonctionnalité permettra de visualiser et analyser les résultats 
            des examens de vos patients.
          </p>

          {/* Features Coming Soon
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-semibold text-blue-800">Fonctionnalités à venir</span>
            </div>
            <ul className="text-blue-700 space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Consultation des résultats d'examens
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Analyse et graphiques des données
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Export et impression des rapports
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Historique et suivi des résultats
              </li>
            </ul>
          </div> */}

          {/* Status */}
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full">
            <Clock className="w-4 h-4 mr-2" />
            <span className="font-medium">En développement</span>
          </div>

          {/* Footer Message */}
          <p className="text-sm text-slate-500 mt-8">
            Merci de votre patience. Cette fonctionnalité sera bientôt disponible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;