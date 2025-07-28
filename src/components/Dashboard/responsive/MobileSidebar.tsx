
import { X, LayoutDashboard, User, FileText, DollarSign, Settings } from 'lucide-react';

const MobileSidebar = ({ sidebarOpen, setSidebarOpen, onMenuClick, currentView }) => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
    { name: 'Patients', icon: User, key: 'patients' },
    { name: 'Requests', icon: FileText, key: 'request' },
    { name: 'Commissions', icon: DollarSign, key: 'commissions' },
    { name: 'Settings', icon: Settings, key: 'settings' }
  ];

  const handleMenuItemClick = (menuKey) => {
    onMenuClick(menuKey);
    setSidebarOpen(false);
  };

  return (
    <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
      <div className={`absolute left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/pdmd.png" alt="Logo" className="h-8" />
              <span className="text-gray-900 font-medium">Menu</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="w-6 h-6 flex items-center justify-center">
              <X className="text-gray-600" size={18} />
            </button>
          </div>
        </div>

        {/* Centered Welcome Text */}
        <div className="p-4 border-b border-gray-200 flex flex-col items-center justify-center">
          <span className="text-gray-900 font-medium text-center">Welcome,</span>
          <span className="text-gray-900 font-medium text-center">Legba Hermine</span>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentView === item.key;
              return (
                <li key={index}>
                  <button
                    onClick={() => handleMenuItemClick(item.key)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors ${
                      isActive ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </button>
                  {index < menuItems.length - 1 && <hr className="border-gray-200 my-2" />}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default MobileSidebar;
