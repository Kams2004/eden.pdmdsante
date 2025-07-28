import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axioConfig';
import { Users, Shield, User as UserMd, MessageSquare, Activity, Calendar, Bell, X } from 'lucide-react';

interface Request {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  message: string;
  administration: boolean;
  commission: boolean;
  connection: boolean;
  revendication_examen: boolean;
  suggestion: boolean;
  error: boolean;
  valide: boolean;
  CreatedAt: string | null;
  UpdateAt: string | null;
}

interface Role {
  id: number;
  name: string;
}

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
      <h3 className="ml-3 text-3xl font-bold text-gray-800">{value !== null ? value : '---'}</h3>
    </div>
    <p className="mt-2 text-sm text-gray-600">{title}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchedStats, setFetchedStats] = useState({
    users: null,
    roles: null,
    doctors: null,
    requests: null,
  });
  const [recentRequests, setRecentRequests] = useState<Request[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch number of users
        const usersResponse = await axiosInstance.get('/users/nb');
        const numberOfUsers = usersResponse.data['Nombre Utilisateur '];

        // Fetch number of doctors
        const doctorsResponse = await axiosInstance.get('/doctors/nbr');
        const numberOfDoctors = doctorsResponse.data['Nombre'];

        // Fetch number of requests
        const requestsResponse = await axiosInstance.get('/requete/nbr');
        const numberOfRequests = requestsResponse.data['Nbr'];

        // Fetch roles
        const rolesResponse = await axiosInstance.get('/roles/');
        const roles = rolesResponse.data;
        const numberOfRoles = roles.length;

        // Fetch recent requests
        const requestsDataResponse = await axiosInstance.get('/requete/');
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const filteredRequests = requestsDataResponse.data
          .filter((request: Request) => {
            const requestDate = request.UpdateAt ? new Date(request.UpdateAt) : (request.CreatedAt ? new Date(request.CreatedAt) : new Date(0));
            return requestDate >= twentyFourHoursAgo;
          })
          .sort((a: Request, b: Request) => {
            const dateA = new Date(a.UpdateAt || a.CreatedAt || 0).getTime();
            const dateB = new Date(b.UpdateAt || b.CreatedAt || 0).getTime();
            return dateB - dateA; // Sort in descending order
          })
          .slice(0, 4); // Limit to 4 most recent requests

        setFetchedStats({
          users: numberOfUsers,
          roles: numberOfRoles,
          doctors: numberOfDoctors,
          requests: numberOfRequests,
        });

        setRecentRequests(filteredRequests);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);

        let errorMessage = 'Failed to load dashboard data.';
        if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Network connection error. Please check your internet connection.';
        } else if (err.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.response?.status === 404) {
          errorMessage = 'Service not found. Please contact support.';
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stats.roles]);

  // Auto-hide error after 8 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleCloseError = () => {
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
    window.location.reload();
  };

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

  const determineRequestType = (req: Request) => {
    if (req.connection) return 'Connection Request';
    if (req.commission) return 'Commission Mismatch';
    if (req.revendication_examen) return 'Patient Record Issue';
    if (req.suggestion) return 'Payment Delay';
    if (req.error) return 'System Error';
    if (req.administration) return 'Administrative Request';
    return 'Unknown Request';
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 relative">
      {/* Error Notification - Non-blocking */}
      {error && (
        <div className="fixed top-20 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Error</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
            <button
              onClick={handleCloseError}
              className="ml-3 text-white hover:text-gray-200 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleRetry}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span className="text-sm">Loading dashboard data...</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={fetchedStats.users}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="User Roles"
          value={fetchedStats.roles}
          icon={Shield}
          color="bg-green-500"
        />
        <StatCard
          title="Active Doctors"
          value={fetchedStats.doctors}
          icon={UserMd}
          color="bg-purple-500"
        />
        <StatCard
          title="Pending Requests"
          value={fetchedStats.requests}
          icon={MessageSquare}
          color="bg-yellow-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Activity className="w-6 h-6 text-blue-500 mr-2" />
            <span className="text-sm font-medium">System Status: </span>
            <span className={`text-sm ml-2 ${error ? 'text-red-500' : 'text-green-500'}`}>
              {error ? 'Issues Detected' : 'Operational'}
            </span>
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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requestor</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{determineRequestType(request)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{`${request.first_name} ${request.last_name}`}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{request.UpdateAt || request.CreatedAt || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      request.valide ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.valide ? 'Resolved' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
