import React from 'react';
import { LayoutDashboard, User, FileText, DollarSign, Settings, BarChart2, Phone, HelpCircle } from 'lucide-react';
import { getUserInitials, getUserFromStorage } from '../utils/userUtils';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  onMenuClick: (view: string) => void;
  currentView: string;
  isProfileComplete: boolean;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', key: 'dashboard' },
  { icon: User, label: 'Patients', key: 'patients' },
  { icon: FileText, label: 'Requêtes', key: 'request' },
  { icon: BarChart2, label: 'Résultats', key: 'results' },
  // { icon: DollarSign, label: 'Commissions', key: 'commissions' },
  // { icon: BarChart2, label: 'Analyse commissions', key: 'commissionAnalysis' },
  { icon: Settings, label: 'Paramètres', key: 'settings' }
];

const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  setIsExpanded,
  onMenuClick,
  currentView,
  isProfileComplete,
}) => {
  const userData = getUserFromStorage();
  const initials = userData ? getUserInitials(userData.firstName, userData.lastName) : 'US';
  const displayName = userData?.firstName || 'Utilisateur';

  const handlePhoneCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  return (
    <aside
      className={`fixed top-24 left-4 bottom-4 bg-white rounded-2xl shadow-md transition-all duration-300 z-40 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="p-4 flex flex-col h-full">
        {/* User Profile */}
        <div className={`mb-6 transition-all duration-300 ${isExpanded ? 'text-center' : ''}`}>
          <div className="bg-blue-100 text-blue-600 font-semibold rounded-full w-10 h-10 flex items-center justify-center mx-auto">
            {initials}
          </div>
          {isExpanded && (
            <div className="text-center mt-3">
              <p className="text-sm font-medium text-gray-700">Bienvenue,</p>
              <p className="text-sm text-gray-600">{displayName}</p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onMenuClick(item.key)}
                className={`w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center ${
                  isExpanded ? 'justify-start' : 'justify-center'
                } ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-6 h-6 text-current" />
                {isExpanded && (
                  <span className="ml-3 text-sm whitespace-nowrap">
                    {item.label}
                  </span>
                )}
                {isActive && isExpanded && (
                  <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Help Service Section */}
        {isExpanded && (
          <div className="mt-auto p-3 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <HelpCircle className="text-blue-600" size={16} />
              <span className="text-gray-700 font-semibold text-xs">Service d'aide</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Relations publiques */}
              <div className="space-y-1 pr-2 border-r border-gray-200">
                <p className="text-[10px] text-gray-500 mb-1">Relations publiques:</p>
                <div className="space-y-1">
                  <button
                    onClick={() => handlePhoneCall('+237696134160')}
                    className="flex items-center space-x-1 w-full px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors group"
                  >
                    <Phone className="text-green-600" size={14} />
                    <span className="text-[10px] text-gray-700 group-hover:text-blue-600">+237 696134160</span>
                  </button>
                </div>
              </div>
              {/* Service technique */}
              <div className="space-y-1 pl-2">
                <p className="text-[10px] text-gray-500 mb-1">Service technique:</p>
                <div className="space-y-1">
                  <button
                    onClick={() => handlePhoneCall('+237695995842')}
                    className="flex items-center space-x-1 w-full px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors group"
                  >
                    <Phone className="text-green-600" size={14} />
                    <span className="text-[10px] text-gray-700 group-hover:text-blue-600">+237 695995842</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {isExpanded && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600">À votre service pour votre santé</p>
            <div className="w-8 h-0.5 bg-gradient-to-r from-blue-300 to-blue-400 mx-auto mt-2 rounded-full"></div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
