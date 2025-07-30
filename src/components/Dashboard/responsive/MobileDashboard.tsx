import React, { useState } from 'react';

import DashboardHeader from './MobileHeader';
import MobileGeneralInfo from './MobileGeneralInfo';
import MobilePatientsList from './MobilePatientsList';
import MobileStatsCards from './MobileStatsCards';
import MobileTodayStats from './MobileTodayStats';
import MobilePatientsContent from './pages/MobilePatientsPage';
import MobileCommission from './pages/MobileCommissionContent';
import MobileRequestsContent from './pages/MobileRequestsContent';
import MobileSidebar from './MobileSidebar';
import PersonalInfoForm from './pages/PersonalInfoForm';
import MobileCommissionAnalysis from './pages/MobileCommissionAnalysis';


// Define a type for the possible views
type ViewType = 'dashboard' | 'patients' | 'request' | 'commissions' | 'commissionAnalysis' | 'settings' | 'toggleSidebar';

const MobileDoctorDashboard = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);

  const handleMenuClick = (view: ViewType) => {
    if (view === 'toggleSidebar') {
      setSidebarOpen(!sidebarOpen);
    } else {
      setCurrentView(view);
      // Clear selected patients when navigating away from patients view
      if (view !== 'patients') {
        setSelectedPatients([]);
      }
    }
  };

  const handleDetailsClick = (patients: string[]) => {
    setSelectedPatients(patients);
    setCurrentView('patients');
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
        <div className="px-4 py-6 space-y-6 mt-2">
          {currentView === 'dashboard' && (
            <>
              <MobileStatsCards />
              <MobileTodayStats />
              <MobileGeneralInfo onMenuClick={handleMenuClick} />

              <MobilePatientsList onDetailsClick={handleDetailsClick} />
            </>
          )}
          {currentView === 'patients' && (
            <MobilePatientsContent selectedPatients={selectedPatients} />
          )}
          {currentView === 'request' && <MobileRequestsContent />}
          {currentView === 'commissions' && <MobileCommission />}
          {currentView === 'settings' && <PersonalInfoForm />}
          {currentView === 'commissionAnalysis' && <MobileCommissionAnalysis />}
        </div>
      </div>
    </div>
  );
};

export default MobileDoctorDashboard;