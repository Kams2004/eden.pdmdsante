// DoctorDashboard.tsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import StatCards from '../components/Dashboard/StatCards';
import Actualities from '../components/Actualities/Actualities';
import MonthlyTransactions from '../components/Dashboard/MonthlyTransactions';
import PatientsView from '../components/Patients/PatientsView';
import RequestsView from '../components/Requests/RequestsView';
import SettingsView from '../components/Settings/SettingsView';
import DoctorAppointments from '../components/Appointments/DoctorAppointments';
import backgroundImage from './61804.jpg';
import { useNavigate } from 'react-router-dom';
import CommissionView from '../components/commission/commissionView';
import PatientsList from '../components/Dashboard/PatientsList';
import CommissionOverview from '../components/Dashboard/CommissionOverview';
import useWindowSize from '../components/Dashboard/responsive/useWindowSize';
import MobileDoctorDashboard from '../components/Dashboard/responsive/MobileDashboard'; // Import the MobileDoctorDashboard component

function DoctorDashboard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [showAllCommissions, setShowAllCommissions] = useState(false);
  const [showTodaysCommissions, setShowTodaysCommissions] = useState(false);
  const navigate = useNavigate();
  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 768; // Adjust the breakpoint as needed

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      navigate('/login');
      return;
    }
    try {
      const userData = JSON.parse(userDataString);
      const userRoles = userData.roles?.map((role) => role.name.toLowerCase()) || [];
      if (!userRoles.includes('doctor')) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const handleMenuClick = (view) => {
    setCurrentView(view.toLowerCase());
    if (view.toLowerCase() !== 'patients') {
      setSelectedPatients([]);
    }
  };

  const handleDetailsClick = (patients) => {
    setSelectedPatients(patients);
    setCurrentView('patients');
  };

  const actualities = [
    {
      id: 1,
      title: "New Medical Equipment Arrival",
      date: "2024-03-15",
      description: "State-of-the-art MRI machine installed to enhance diagnostic capabilities.",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format"
    },
    // Additional actualities...
  ];

  const commissionData = {
    totalAmount: 15750,
    invoiced: 25,
    paid: 20,
    registeredPercentage: 75,
    topExaminations: [
      { name: 'Examination 1', value: 120 },
      { name: 'Examination 2', value: 90 },
      { name: 'Examination 3', value: 60 },
    ],
  };

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundColor: '#002b36', backgroundImage: `url(${backgroundImage})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
      {isMobile ? (
        <MobileDoctorDashboard />
      ) : (
        <>
          <div className="fixed top-0 left-0 right-0 z-50">
            <Header showLanguages={showLanguages} setShowLanguages={setShowLanguages} />
          </div>
          <div className="pt-24 px-4 pb-4 flex flex-col md:flex-row">
            <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} onMenuClick={handleMenuClick} currentView={currentView} />
            <main className="w-full md:ml-24 transition-all duration-300">
              <div className="h-full overflow-y-auto no-scrollbar">
                {currentView === 'dashboard' && (
                  <div className="grid grid-cols-1 gap-4">
                    <CommissionOverview commissionData={commissionData} showAmount={showAllCommissions} setShowAmount={setShowAllCommissions} />
                    <StatCards showAmount={showTodaysCommissions} setShowAmount={setShowTodaysCommissions} stats={{ commission: { amount: 15750, count: 25, transactions: 42 }, patients: { total: 150, percentage: 75 }, examinations: { total: 85, percentage: 60 } }} />
                    <Actualities />
                    <MonthlyTransactions data={{ count: 1234, amount: 45678, total: 5678 }} />
                    <PatientsList onDetailsClick={handleDetailsClick} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* <WeeklyRevenue />
                      <StatusByChannel /> */}
                    </div>
                  </div>
                )}
                {currentView === 'patients' && <PatientsView selectedPatients={selectedPatients} />}
                {currentView === 'appointments' && <DoctorAppointments />}
                {currentView === 'requests' && <RequestsView />}
                {currentView === 'commission' && <CommissionView />}
                {currentView === 'settings' && <SettingsView />}
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}

export default DoctorDashboard;
