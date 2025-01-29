import React from 'react';
import { Users, Shield, User as UserMd, MessageSquare, Activity, Calendar, Bell } from 'lucide-react';

interface DashboardProps {
  stats: {
    users: number;
    roles: number;
    doctors: number;
    requests: number;
  };
}

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
    <div className="flex items-center">
      <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="ml-3 text-3xl font-bold text-gray-800">{value}</h3>
    </div>
    <p className="mt-2 text-sm text-gray-600">{title}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const recentActivities = [
    { id: 1, action: "New user registered", time: "5 minutes ago" },
    { id: 2, action: "Role permissions updated", time: "10 minutes ago" },
    { id: 3, action: "System backup completed", time: "25 minutes ago" },
    { id: 4, action: "New doctor profile created", time: "1 hour ago" },
  ];

  const notifications = [
    { id: 1, message: "System maintenance scheduled", type: "warning" },
    { id: 2, message: "New feature deployment", type: "info" },
    { id: 3, message: "Security update available", type: "critical" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.users}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="User Roles"
          value={stats.roles}
          icon={Shield}
          color="bg-green-500"
        />
        <StatCard
          title="Active Doctors"
          value={stats.doctors}
          icon={UserMd}
          color="bg-purple-500"
        />
        <StatCard
          title="Pending Requests"
          value={stats.requests}
          icon={MessageSquare}
          color="bg-yellow-500"
        />
      </div>

      {/* Horizontal Alignment for System Status and Next Maintenance */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Activity className="w-6 h-6 text-blue-500 mr-2" />
            <span className="text-sm font-medium">System Status: </span>
            <span className="text-sm text-green-500 ml-2">Operational</span>
          </div>
          <span className="text-xs text-gray-500">Last checked: 2 min ago</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-purple-500 mr-2" />
            <span className="text-sm font-medium">Next Maintenance: </span>
            <span className="text-sm ml-2">March 25, 2024</span>
          </div>
          <span className="text-xs text-gray-500">In 5 days</span>
        </div>
      </div>

      {/* Activity & Notifications */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">{activity.action}</span>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">System Notifications</h3>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      notification.type === "critical"
                        ? "bg-red-500"
                        : notification.type === "warning"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <span className="text-sm text-gray-600">{notification.message}</span>
                </div>
                <span
                  className={`text-xs font-medium ${
                    notification.type === "critical"
                      ? "text-red-500"
                      : notification.type === "warning"
                      ? "text-yellow-500"
                      : "text-blue-500"
                  }`}
                >
                  {notification.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Requests</h3>
          <button className="text-sm text-blue-500 hover:text-blue-600">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">Access Request</td>
                <td className="px-4 py-3 text-sm text-gray-600">Dr. John Smith</td>
                <td className="px-4 py-3 text-sm text-gray-600">2024-03-15</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </td>
              </tr>
              {/* Add more rows as needed */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
