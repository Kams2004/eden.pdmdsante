import React, { useState } from 'react';
import DashboardHeader from './MobileHeader';
import MobileGeneralInfo from './MobileGeneralInfo';
import MobilePatientsList from './MobilePatientsList';
import MobileStatsCards from './MobileStatsCards';
import MobileTodayStats from './MobileTodayStats';
import MobilePatientsContent from './pages/MobilePatientsPage';
import MobileCommission from './pages/MobileCommissionContent';
import MobileRequestsContent from './pages/MobileRequestsContent';
import MobileSidebar from './MobileSidebar'; // Import the MobileSidebar component
import PersonalInfoForm from './pages/PersonalInfoForm'; // Import the PersonalInfoForm component

const MobileDoctorDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = (view) => {
    if (view === 'toggleSidebar') {
      setSidebarOpen(!sidebarOpen);
    } else {
      setCurrentView(view);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Header */}
      <DashboardHeader onMenuClick={handleMenuClick} currentView={currentView} />

      {/* Sidebar */}
      <MobileSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onMenuClick={handleMenuClick}
        currentView={currentView}
      />

      {/* Content Area with Padding to Account for Fixed Header */}
      <div className="flex-grow overflow-y-auto pt-16">
        <div className="px-4 py-6 space-y-6">
          {currentView === 'dashboard' && (
            <>
              <MobileStatsCards />
              <MobileTodayStats />
              <MobileGeneralInfo />
              <MobilePatientsList />
            </>
          )}
          {currentView === 'patients' && <MobilePatientsContent />}
          {currentView === 'request' && <MobileRequestsContent />}
          {currentView === 'commissions' && <MobileCommission />}
          {currentView === 'settings' && <PersonalInfoForm />}
        </div>
      </div>
    </div>
  );
};

export default MobileDoctorDashboard;
