import React, { useState } from 'react';
import Header from '../components/Header/Header';
import AccountantSidebar from '../components/Sidebar/AccountantSidebar';
import Dashboard from './accountant/Dashboard';
import Doctors from './accountant/Doctors';
import Report from './accountant/Report';
import Settings from './accountant/Settings';
import Transactions from './accountant/Transactions';
import backgroundImage from './61804.jpg'; // Replace with the correct path to your background image

const AccountantDashboard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  const user = {
    name: "Accountant User",
    initials: "AU"
  };

  const stats = {
    totalRevenue: 125000,
    pendingPayments: 15000,
    completedPayments: 110000,
    monthlyGrowth: 12.5
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard stats={stats} />;
      case 'doctors':
        return <Doctors />;
      case 'report':
        return <Report />;
      case 'transactions':
        return <Transactions />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard stats={stats} />;
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundColor: '#002b36', // Fallback background color
        backgroundImage: `url(${backgroundImage})`, // Background image
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header showLanguages={showLanguages} setShowLanguages={setShowLanguages} />
      </div>
      
      <div className="pt-24 px-4 pb-4 flex">
        <AccountantSidebar 
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          user={user}
          onMenuClick={setCurrentView}
          currentView={currentView}
        />

        <main className="ml-24 w-full transition-all duration-300">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default AccountantDashboard;