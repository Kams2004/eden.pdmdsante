import React, { useState } from 'react';
import { Bell, Globe, LogOut, Menu, LayoutDashboard, User, FileText, DollarSign, Settings } from 'lucide-react';

const DashboardHeader = ({ onMenuClick, currentView }) => {
  const [showLanguages, setShowLanguages] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
    { name: 'Patient', icon: User, key: 'patients' },
    { name: 'Request', icon: FileText, key: 'request' },
    { name: 'Commissions', icon: DollarSign, key: 'commissions' },
    { name: 'Settings', icon: Settings, key: 'settings' }
  ];

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  const getCurrentPageTitle = () => {
    const activeItem = menuItems.find(item => item.key === currentView);
    return activeItem ? activeItem.name : 'Dashboard';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center space-x-3">
        <button onClick={() => onMenuClick('toggleSidebar')} className="w-6 h-6 flex items-center justify-center">
          <Menu className="text-gray-600" size={18} />
        </button>
        <img src="/pdmd.png" alt="Logo" className="h-10" />
        <div className="flex flex-col">
          <span className="text-gray-600 text-sm">LH</span>
          {/* <span className="text-xs text-blue-600 font-medium">{getCurrentPageTitle()}</span> */}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 flex items-center justify-center">
          <Bell className="text-gray-600" size={18} />
        </div>
        <div className="relative">
          <button className="w-6 h-6 flex items-center justify-center" onClick={() => setShowLanguages(!showLanguages)}>
            <Globe className="text-gray-600" size={18} />
          </button>
          {showLanguages && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg py-2 z-60">
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100">English</button>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100">French</button>
            </div>
          )}
        </div>
        <button onClick={handleLogout} className="w-6 h-6 flex items-center justify-center">
          <LogOut className="text-red-500" size={18} />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
