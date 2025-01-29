import React from 'react';
import { LayoutDashboard, Users, Shield, User as UserMd, MessageSquare, Settings } from 'lucide-react';

interface AdminSidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  user: {
    name: string;
    initials: string;
  };
  onMenuClick: (view: string) => void;
  currentView: string;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Users, label: 'Users', id: 'users' },
  { icon: Shield, label: 'Roles', id: 'roles' },
  { icon: UserMd, label: 'Doctors', id: 'doctors' },
  { icon: Settings, label: 'Doctor Settings', id: 'doctor-settings' },
  { icon: MessageSquare, label: 'Requests', id: 'requests' },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isExpanded,
  setIsExpanded,
  user,
  onMenuClick,
  currentView,
}) => {
  return (
    <aside
      className={`fixed top-24 left-4 bottom-4 bg-white rounded-2xl shadow-md transition-all duration-300 z-40 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="p-4 flex flex-col h-full">
        <div className={`mb-6 transition-all duration-300 ${isExpanded ? 'text-center' : ''}`}>
          <div
            className={`bg-blue-100 text-blue-600 font-semibold rounded-full w-10 h-10 flex items-center justify-center ${
              isExpanded ? 'mx-auto mb-3' : ''
            }`}
          >
            {user.initials}
          </div>
          {isExpanded && (
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Welcome,</p>
              <p className="text-sm text-gray-600">{user.name}</p>
            </div>
          )}
        </div>

        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onMenuClick(item.id)}
              className={`w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center ${
                isExpanded ? 'flex items-center' : 'flex flex-col justify-center'
              } ${
                currentView === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-6 h-6 text-current" /> {/* Ensure icons use current text color */}
              <span className={`transition-all duration-300 ${isExpanded ? 'ml-3 block' : 'hidden'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;