import React, { useState, useEffect } from 'react';
import { Bell, Globe, LogOut, Menu, LayoutDashboard, User, FileText, DollarSign, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUserFromStorage, getUserInitials, debugUserData } from './userUtils';

type ViewType = 'dashboard' | 'patients' | 'request' | 'commissions' | 'settings' | 'toggleSidebar';

interface DashboardHeaderProps {
  onMenuClick: (view: ViewType) => void;
  currentView: ViewType;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick, currentView }) => {
  const [showLanguages, setShowLanguages] = useState(false);
  const [userInitials, setUserInitials] = useState('UN');
  const navigate = useNavigate();
  const BASE_URL = 'https://site.pdmdsante.com/';

  useEffect(() => {
    debugUserData();
    const userData = getUserFromStorage();

    if (userData) {
      const initials = getUserInitials(userData.firstName || userData.first_name, userData.lastName || userData.last_name);
      setUserInitials(initials);
    } else {
      setUserInitials('UN');
    }
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' as ViewType },
    { name: 'Patient', icon: User, key: 'patients' as ViewType },
    { name: 'Request', icon: FileText, key: 'request' as ViewType },
    { name: 'Commissions', icon: DollarSign, key: 'commissions' as ViewType },
    { name: 'Settings', icon: Settings, key: 'settings' as ViewType }
  ];

  const handleLogout = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        navigate('/login');
        return;
      }
      await axios.post(`${BASE_URL}/user/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      navigate('/login');
    }
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
        <img src="/pdmd.png" alt="Logo" className="h-12" />
        <div className="bg-blue-100 text-blue-600 font-semibold rounded-full w-8 h-8 flex items-center justify-center">
          {userInitials}
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
