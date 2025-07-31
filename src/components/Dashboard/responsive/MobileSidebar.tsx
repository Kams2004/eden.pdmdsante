import React, { useState, useEffect } from 'react';
import { X, LayoutDashboard, User, FileText, DollarSign, Settings, BarChart2 } from 'lucide-react';
import { getUserFromStorage, getUserInitials, getUserFullName, debugUserData } from './userUtils';

interface MobileSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onMenuClick: (menuKey: string) => void;
  currentView: string;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  onMenuClick,
  currentView
}) => {
  const [userFullName, setUserFullName] = useState('Nom Utilisateur');
  const [userInitials, setUserInitials] = useState('NU');

  useEffect(() => {
    debugUserData();
    const userData = getUserFromStorage();
    if (userData) {
      const fullName = getUserFullName(userData.firstName || userData.first_name, userData.lastName || userData.last_name);
      const initials = getUserInitials(userData.firstName || userData.first_name, userData.lastName || userData.last_name);
      setUserFullName(fullName);
      setUserInitials(initials);
    } else {
      setUserFullName('Nom Utilisateur');
      setUserInitials('NU');
    }
  }, []);

  const menuItems = [
    { name: 'Tableau de bord', icon: LayoutDashboard, key: 'dashboard' },
    { name: 'Patients', icon: User, key: 'patients' },
    { name: 'Demandes', icon: FileText, key: 'request' },
    { name: 'Commissions', icon: DollarSign, key: 'commissions' },
    { name: 'Analyse des commissions', icon: BarChart2, key: 'commissionAnalysis' },
    { name: 'Paramètres', icon: Settings, key: 'settings' }
  ];

  const handleMenuItemClick = (menuKey: string) => {
    onMenuClick(menuKey);
    setSidebarOpen(false);
  };

  return (
    <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
      <div className={`absolute left-0 top-0 h-full w-64 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="p-4 border-b border-blue-200 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <span className="text-black font-semibold text-sm">Menu</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-100 transition-colors"
            >
              <X className="text-black" size={18} />
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-blue-200 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300 text-black font-semibold rounded-full w-12 h-12 flex items-center justify-center mx-auto shadow-sm">
            {userInitials}
          </div>
          <span className="text-black font-medium text-sm text-center mt-2">Bienvenue,</span>
          <span className="text-black font-semibold text-sm text-center">{userFullName}</span>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentView === item.key;
              return (
                <li key={index}>
                  <button
                    onClick={() => handleMenuItemClick(item.key)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-white/70 hover:shadow-sm text-black hover:text-black transition-all duration-200 ${
                      isActive
                        ? 'bg-white shadow-md border border-blue-200 text-black transform scale-[1.02]'
                        : 'hover:transform hover:scale-[1.01]'
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <Icon className="text-black" size={18} />
                    </div>
                    <span className="font-medium text-sm">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full"></div>
                    )}
                  </button>
                  {index < menuItems.length - 1 && (
                    <div className="mx-3 my-2 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="text-center">
            <p className="text-xs text-black">À votre service pour votre santé</p>
            <div className="w-8 h-0.5 bg-gradient-to-r from-blue-300 to-blue-400 mx-auto mt-2 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
