import { useState, useEffect } from 'react';
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
import MobileDoctorDashboard from '../components/Dashboard/responsive/MobileDashboard';
import DesktopCommissionAnalysis from '../components/DesktopCommissionAnalysis/DesktopCommissionAnalysis';

interface DoctorData {
  CreatedAt: string;
  DoctorCNI: string;
  DoctorDOB: string | null;
  DoctorEmail: string;
  DoctorFederationID: string;
  DoctorLastname: string;
  DoctorNO: string;
  DoctorName: string;
  DoctorNat: string;
  DoctorPOB: string;
  DoctorPhone: string;
  DoctorPhone2: string;
  ModifiedAt: string | null;
  Speciality: string;
  id: number;
  user: number;
}

function DoctorDashboard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [showAllCommissions, setShowAllCommissions] = useState(false);
  const [showTodaysCommissions, setShowTodaysCommissions] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [showProfileWarning, setShowProfileWarning] = useState(false);
  const navigate = useNavigate();
  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 768;

  const checkDoctorProfileComplete = (doctorData: DoctorData): boolean => {
    const requiredFields = [
      doctorData.DoctorName,
      doctorData.DoctorLastname,
      doctorData.DoctorEmail,
      doctorData.DoctorCNI,
      doctorData.DoctorNO,
      doctorData.Speciality,
      doctorData.DoctorPhone
    ];

    return requiredFields.every(field => field && field.trim() !== '') && 
           doctorData.ModifiedAt !== null;
  };

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
        return;
      }

      // Check if we need to show settings first
      const showSettingsFirst = localStorage.getItem('showSettingsFirst');
      const storedProfileComplete = localStorage.getItem('isProfileComplete');
      const doctorDataString = localStorage.getItem('doctorData');
      
      if (showSettingsFirst === 'true' || storedProfileComplete === 'false') {
        setIsProfileComplete(false);
        setCurrentView('settings');
        setShowProfileWarning(true);
        
        // If we have doctor data, double-check the profile completion
        if (doctorDataString) {
          try {
            const doctorData: DoctorData = JSON.parse(doctorDataString);
            const profileComplete = checkDoctorProfileComplete(doctorData);
            setIsProfileComplete(profileComplete);
            
            if (profileComplete) {
              // If profile is actually complete, remove the flags
              localStorage.removeItem('showSettingsFirst');
              localStorage.setItem('isProfileComplete', 'true');
              setShowProfileWarning(false);
              setCurrentView('dashboard');
            }
          } catch (error) {
            console.error('Error parsing doctor data:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const handleMenuClick = (view) => {
    // Prevent navigation if profile is incomplete
    if (!isProfileComplete && view.toLowerCase() !== 'settings') {
      setShowProfileWarning(true);
      return;
    }

    setCurrentView(view.toLowerCase());
    setShowProfileWarning(false);
    
    if (view.toLowerCase() !== 'patients') {
      setSelectedPatients([]);
    }
  };

  const handleDetailsClick = (patients) => {
    // Prevent navigation if profile is incomplete
    if (!isProfileComplete) {
      setShowProfileWarning(true);
      return;
    }

    setSelectedPatients(patients);
    setCurrentView('patients');
  };

  const handleProfileUpdate = () => {
    // This function will be called from SettingsView when profile is successfully updated
    setIsProfileComplete(true);
    setShowProfileWarning(false);
    localStorage.removeItem('showSettingsFirst');
    localStorage.setItem('isProfileComplete', 'true');
    setCurrentView('dashboard');
  };

  const actualities = [
    {
      id: 1,
      title: "New Medical Equipment Arrival",
      date: "2024-03-15",
      description: "State-of-the-art MRI machine installed to enhance diagnostic capabilities.",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format"
    },
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
    <div className="min-h-screen bg-cover bg-center" style={{ 
      backgroundColor: '#002b36', 
      backgroundImage: `url(${backgroundImage})`, 
      backgroundRepeat: 'no-repeat', 
      backgroundSize: 'cover' 
    }}>
      {isMobile ? (
        <MobileDoctorDashboard />
      ) : (
        <>
          <div className="fixed top-0 left-0 right-0 z-50">
            <Header showLanguages={showLanguages} setShowLanguages={setShowLanguages} />
          </div>

          {/* Profile completion warning banner */}
          {showProfileWarning && !isProfileComplete && (
            <div className="fixed top-24 left-0 right-0 z-40 bg-orange-500 text-white px-4 py-3 shadow-lg">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">
                    Veuillez compléter vos informations de profil avant d'accéder aux autres sections.
                  </span>
                </div>
                <button
                  onClick={() => setShowProfileWarning(false)}
                  className="text-white hover:text-gray-200 ml-4"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className={`pt-24 px-4 pb-4 flex flex-col md:flex-row ${showProfileWarning && !isProfileComplete ? 'pt-36' : ''}`}>
            <Sidebar 
              isExpanded={isExpanded} 
              setIsExpanded={setIsExpanded} 
              onMenuClick={handleMenuClick} 
              currentView={currentView}
              isProfileComplete={isProfileComplete}
            />
            
            <main className="w-full md:ml-24 transition-all duration-300">
              <div className="h-full overflow-y-auto no-scrollbar">
                {currentView === 'dashboard' && isProfileComplete && (
                  <div className="grid grid-cols-1 gap-4">
                    <CommissionOverview 
                      commissionData={commissionData} 
                      showAmount={showAllCommissions} 
                      setShowAmount={setShowAllCommissions} 
                    />
                    <StatCards 
                      showAmount={showTodaysCommissions} 
                      setShowAmount={setShowTodaysCommissions} 
                      stats={{ 
                        commission: { amount: 15750, count: 25, transactions: 42 }, 
                        patients: { total: 150, percentage: 75 }, 
                        examinations: { total: 85, percentage: 60 } 
                      }} 
                    />
                    <Actualities />
                    <PatientsList onDetailsClick={handleDetailsClick} />
                  </div>
                )}
                
                {currentView === 'patients' && isProfileComplete && (
                  <PatientsView  />
                )}
                {currentView === 'request' && isProfileComplete && <RequestsView />}
                {currentView === 'commissions' && isProfileComplete && <CommissionView />}
                {currentView === 'commissionanalysis' && isProfileComplete && <DesktopCommissionAnalysis />}
                {currentView === 'settings' && (
                  <SettingsView onProfileUpdate={handleProfileUpdate} />
                )}
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}

export default DoctorDashboard;