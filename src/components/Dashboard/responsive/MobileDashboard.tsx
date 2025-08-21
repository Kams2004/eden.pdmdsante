import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "./MobileHeader";
import MobileGeneralInfo from "./MobileGeneralInfo";
import MobilePatientsList from "./MobilePatientsList";
import MobileStatsCards from "./MobileStatsCards";
import MobileTodayStats from "./MobileTodayStats";
import MobilePatientsContent from "./pages/MobilePatientsPage";
import MobileCommission from "./pages/MobileCommissionContent";
import MobileRequestsContent from "./pages/MobileRequestsContent";
import MobileSidebar from "./MobileSidebar";
import PersonalInfoForm from "./pages/PersonalInfoForm";
import MobileCommissionAnalysis from "./pages/MobileCommissionAnalysis";

type ViewType =
  | "dashboard"
  | "patients"
  | "request"
  | "commissions"
  | "commissionAnalysis"
  | "settings"
  | "toggleSidebar";

const MobileDoctorDashboard = () => {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const navigate = useNavigate();

  // Fonction pour vérifier si le profil est complet
  const checkDoctorProfileComplete = (doctorData: any): boolean => {
    return doctorData.doctor_is_confirmed === true;
  };
  useEffect(() => {
    const userDataString = localStorage.getItem("userData");
    if (!userDataString) {
      navigate("/login");
      return;
    }
    try {
      const userData = JSON.parse(userDataString);
      const userRoles =
        userData.roles?.map((role: { name: string }) =>
          role.name.toLowerCase()
        ) || [];
      if (!userRoles.includes("doctor")) {
        navigate("/login");
        return;
      }
      const doctorDataString = localStorage.getItem("doctorData");
      if (doctorDataString) {
        try {
          const doctorData = JSON.parse(doctorDataString);
          const isComplete = checkDoctorProfileComplete(doctorData);
          setIsProfileComplete(isComplete);
          // Si le profil n'est pas complet, rediriger vers les paramètres
          if (!isComplete) {
            setCurrentView("settings");
          }
        } catch (error) {
          console.error("Error parsing doctor data:", error);
        }
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/login");
    }
  }, [navigate]);

  const handleMenuClick = (view: ViewType) => {
    if (view === "toggleSidebar") {
      setSidebarOpen(!sidebarOpen);
    } else {
      // Bloquer l'accès aux autres vues si le profil n'est pas complet
      if (!isProfileComplete && view !== "settings") {
        return;
      }
      setCurrentView(view);

      // Réinitialiser la sélection des patients si on quitte la vue patients
      if (view !== "patients") {
        setSelectedPatients([]);
      }
    }
  };

  const handleDetailsClick = (patients: string[]) => {
    // Bloquer l'accès si le profil n'est pas complet
    if (!isProfileComplete) {
      return;
    }
    setSelectedPatients(patients);
    setCurrentView("patients");
  };

  const handleProfileUpdate = () => {
    setIsProfileComplete(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Header */}
      <DashboardHeader
        onMenuClick={handleMenuClick}
        currentView={currentView}
      />

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
          {currentView === "dashboard" && isProfileComplete && (
            <>
              <MobileStatsCards />
              <MobileTodayStats />
            </>
          )}
          {currentView === "patients" && isProfileComplete && (
            <MobilePatientsContent selectedPatients={selectedPatients} />
          )}
          {currentView === "request" && isProfileComplete && (
            <MobileRequestsContent />
          )}
          {currentView === "commissions" && isProfileComplete && (
            <MobileCommission />
          )}
          {currentView === "commissionAnalysis" && isProfileComplete && (
            <MobileCommissionAnalysis />
          )}
          {currentView === "settings" && (
            <PersonalInfoForm onProfileUpdate={handleProfileUpdate} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileDoctorDashboard;
