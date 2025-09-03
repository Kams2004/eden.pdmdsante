
// // MobileDoctorDashboardHeader.tsx
// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Bell, Globe, LogOut, Menu, X, LayoutDashboard, User, FileText, DollarSign, Settings } from 'lucide-react';

// const DashboardHeader = ({ onMenuClick, currentView }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [showLanguages, setShowLanguages] = useState(false);

//   const menuItems = [
//     { name: 'Dashboard', icon: LayoutDashboard, key: 'dashboard', action: () => onMenuClick('dashboard') },
//     { name: 'Patient', icon: User, key: 'patients', action: () => onMenuClick('patients') },
//     { name: 'Request', icon: FileText, key: 'request', action: () => onMenuClick('request') },
//     { name: 'Commissions', icon: DollarSign, key: 'commissions', action: () => onMenuClick('commissions') },
//     { name: 'Settings', icon: Settings, key: 'settings', action: () => onMenuClick('settings') }
//   ];

//   const handleLogout = () => {
//     console.log('Logout clicked');
//   };

//   // Get the current page title based on active view
//   const getCurrentPageTitle = () => {
//     const activeItem = menuItems.find(item => item.key === currentView);
//     return activeItem ? activeItem.name : 'Dashboard';
//   };

//   return (
//     <>
//       <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between relative z-50">
//         <div className="flex items-center space-x-3">
//           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-6 h-6 flex items-center justify-center">
//             <Menu className="text-gray-600" size={18} />
//           </button>
//           <img src="/pdmd.png" alt="Logo" className="h-10" />
//           <div className="flex flex-col">
//             <span className="text-gray-600 text-sm">LH</span>
//             <span className="text-xs text-blue-600 font-medium">{getCurrentPageTitle()}</span>
//           </div>
//         </div>

//         <div className="flex items-center space-x-3">
//           <div className="w-6 h-6 flex items-center justify-center">
//             <Bell className="text-gray-600" size={18} />
//           </div>
//           <div className="relative">
//             <button className="w-6 h-6 flex items-center justify-center" onClick={() => setShowLanguages(!showLanguages)}>
//               <Globe className="text-gray-600" size={18} />
//             </button>
//             {showLanguages && (
//               <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg py-2 z-60">
//                 <button className="w-full px-4 py-2 text-left hover:bg-gray-100">English</button>
//                 <button className="w-full px-4 py-2 text-left hover:bg-gray-100">French</button>
//               </div>
//             )}
//           </div>
//           <button onClick={handleLogout} className="w-6 h-6 flex items-center justify-center">
//             <LogOut className="text-red-500" size={18} />
//           </button>
//         </div>
//       </div>

//       {/* Sidebar */}
//       <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
//         <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
//         <div className={`absolute left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
//           <div className="p-4 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <img src="/pdmd.png" alt="Logo" className="h-8" />
//                 <span className="text-gray-900 font-medium">Menu</span>
//               </div>
//               <button onClick={() => setSidebarOpen(false)} className="w-6 h-6 flex items-center justify-center">
//                 <X className="text-gray-600" size={18} />
//               </button>
//             </div>
//           </div>

//           <div className="p-4 border-b border-gray-200">
//             <span className="text-gray-900 font-medium">Welcome, Legba Hermine</span>
//           </div>

//           <nav className="p-4">
//             <ul className="space-y-2">
//               {menuItems.map((item, index) => {
//                 const Icon = item.icon;
//                 const isActive = currentView === item.key;
//                 return (
//                   <li key={index}>
//                     <button
//                       onClick={() => { item.action(); setSidebarOpen(false); }}
//                       className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
//                         isActive 
//                           ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
//                           : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
//                       }`}
//                     >
//                       <div className="w-5 h-5 flex items-center justify-center">
//                         <Icon size={18} className={isActive ? 'text-blue-600' : ''} />
//                       </div>
//                       <span className={`font-medium ${isActive ? 'text-blue-700' : ''}`}>
//                         {item.name}
//                       </span>
//                       {isActive && (
//                         <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
//                       )}
//                     </button>
//                     {index < menuItems.length - 1 && (
//                       <hr className={`border-gray-200 my-2 ${isActive ? 'border-blue-200' : ''}`} />
//                     )}
//                   </li>
//                 );
//               })}
//             </ul>
//           </nav>

//           {/* Active Page Indicator */}
//           <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200">
//             <div className="flex items-center space-x-2">
//               <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
//               <span className="text-sm text-gray-600">Currently viewing:</span>
//               <span className="text-sm font-semibold text-blue-600">{getCurrentPageTitle()}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default DashboardHeader;