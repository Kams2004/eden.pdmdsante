import { useEffect, useState } from 'react';
import Header from '../components/Header/Header';
import AdminSidebar from '../components/Sidebar/AdminSidebar';
import Dashboard from './admin/Dashboard';
import Users from './admin/Users';
import Roles from './admin/Roles';
import Doctors from './admin/Doctors';
import DoctorSettings from './admin/DoctorSettings';
import Requests from './admin/Requests';
import backgroundImage from './61804.jpg';
import AppointmentManagement from '../components/admin/AppointmentManagement';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axioConfig';

const AdminDashboard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  const user = {
    name: "Admin User",
    initials: "AU"
  };

  const stats = {
    users: 1250,
    roles: 8,
    doctors: 45,
    requests: 124
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard stats={stats} />;
      case 'users':
        return <Users />;
      case 'roles':
        return <Roles />;
      case 'doctors':
        return <Doctors />;
      case 'requests':
        return <Requests />;
      case 'doctor-settings':
        return <DoctorSettings />;
      case 'appointments':
        return <AppointmentManagement />;
      default:
        return <Dashboard stats={stats} />;
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundColor: '#002b36',
        backgroundImage: `url(${backgroundImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header showLanguages={showLanguages} setShowLanguages={setShowLanguages} />
      </div>
      
      <div className="pt-24 px-4 pb-4 flex">
        <AdminSidebar 
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

export default AdminDashboard;