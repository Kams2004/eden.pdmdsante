
import { Home, Users, MessageSquare, Settings, Calendar ,DollarSign} from 'lucide-react';
import { getUserInitials, getUserFromStorage } from '../utils/userUtils';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  onMenuClick: (view: string) => void;
  currentView: string;
}

const menuItems = [
  { icon: Home, label: 'Dashboard' },
  { icon: Users, label: 'Patients' },
  // { icon: Calendar, label: 'Appointments' },
  { icon: MessageSquare, label: 'Requests' },
   { icon: DollarSign, label: 'Commission' },
  { icon: Settings, label: 'Settings' },
];

const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  setIsExpanded,
  onMenuClick,
  currentView,
}) => {
  const userData = getUserFromStorage();
  const initials = userData ? getUserInitials(userData.firstName, userData.lastName) : 'US';
  const displayName = userData?.firstName || 'User';

  return (
    <aside
      className={`fixed top-24 left-4 bottom-4 bg-white rounded-2xl shadow-md transition-all duration-300 z-40 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="p-4 flex flex-col h-full">
        {/* User Profile */}
        <div className={`mb-6 transition-all duration-300 ${isExpanded ? 'text-center' : ''}`}>
          <div className="bg-blue-100 text-blue-600 font-semibold rounded-full w-10 h-10 flex items-center justify-center mx-auto">
            {initials}
          </div>
          {isExpanded && (
            <div className="text-center mt-3">
              <p className="text-sm font-medium text-gray-700">Welcome,</p>
              <p className="text-sm text-gray-600">{displayName}</p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onMenuClick(item.label)}
              className={`w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center ${
                isExpanded ? 'flex items-center' : 'flex flex-col justify-center'
              } ${
                currentView === item.label.toLowerCase()
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-6 h-6 text-current" />
              {isExpanded && <span className={`transition-all duration-300 ${isExpanded ? 'ml-3 block' : 'hidden'}`}>
                {item.label}
              </span>}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;