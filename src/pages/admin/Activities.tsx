import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  Globe, 
  MapPin, 
  Monitor, 
  User, 
  Calendar,
  Router,
  Timer,
  LogIn,
  LogOut,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Trash2,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Smartphone
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

// API Configuration
const BASE_URL = 'http://65.21.73.170:1000/';

// Create axios-like function using fetch
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

interface DeviceInfo {
  language?: string;
  memory?: string;
  screen?: {
    height: number;
    width: number;
  };
  timezone?: string;
}

interface RouteAccess {
  access_date: string;
  method: string;
  route: string;
}

interface UserInfo {
  doctor_id?: number;
  email: string;
  first_name: string;
  id: number;
  last_name: string;
  roles: Array<{
    id: number;
    name: string;
  }>;
  username: string;
}

interface ActivityData {
  active_time: number;
  browser: string | null;
  city: string;
  country: string;
  created_at: string;
  device_info: DeviceInfo | null;
  id: number;
  ip: string;
  last_seen: string | null;
  login_time: string | null;
  logout_time: string | null;
  method: string;
  modified_at: string | null;
  platform: string | null;
  route: RouteAccess[] | string;
  session_duration: number;
  user_agent: string;
  user_id: number | null;
  user_info?: UserInfo;
}

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const itemsPerPage = 10;
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Fetch user information
  const fetchUserInfo = async (userId: number): Promise<UserInfo | null> => {
    try {
      const response = await apiCall(`users/get/${userId}`);
      return response.user || null;
    } catch (err) {
      console.error(`Error fetching user ${userId}:`, err);
      return null;
    }
  };

  // Fetch activities from API
  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCall('activity/all');
      
      // Handle different response structures
      let activitiesData: ActivityData[] = [];
      if (Array.isArray(response)) {
        activitiesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        activitiesData = response.data;
      } else if (response.activities && Array.isArray(response.activities)) {
        activitiesData = response.activities;
      } else {
        console.warn('Unexpected API response structure:', response);
        activitiesData = [];
      }
      
      // Fetch user information for each activity with user_id
      const activitiesWithUserInfo = await Promise.all(
        activitiesData.map(async (activity) => {
          if (activity.user_id) {
            const userInfo = await fetchUserInfo(activity.user_id);
            return { ...activity, user_info: userInfo };
          }
          return activity;
        })
      );
      
      setActivities(activitiesWithUserInfo);
      setFilteredActivities(activitiesWithUserInfo);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err instanceof Error ? err.message : 'Échec du chargement des activités');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete all activities
  const deleteAllActivities = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await apiCall('activity/delete/', {
        method: 'DELETE',
      });
      
      // Clear local state
      setActivities([]);
      setFilteredActivities([]);
      setCurrentPage(1);
      setExpandedRow(null);
      
      setSuccessMessage('Toutes les activités ont été supprimées avec succès');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error deleting activities:', err);
      setError(err instanceof Error ? err.message : 'Échec de la suppression des activités');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Filter activities based on search and filters
  const filterActivities = () => {
    let filtered = activities;

    if (searchTerm) {
      filtered = filtered.filter(activity => {
        const routeStr = Array.isArray(activity.route) 
          ? activity.route.map(r => r.route).join(' ')
          : activity.route;
        
        const userStr = activity.user_info 
          ? `${activity.user_info.first_name} ${activity.user_info.last_name} ${activity.user_info.email}`
          : '';
        
        return routeStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
               activity.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
               activity.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
               activity.ip.includes(searchTerm) ||
               activity.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
               userStr.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (filterMethod !== 'all') {
      filtered = filtered.filter(activity => activity.method === filterMethod);
    }

    if (filterCountry !== 'all') {
      filtered = filtered.filter(activity => activity.country === filterCountry);
    }

    setFilteredActivities(filtered);
    setCurrentPage(1);
  };

  // Initial data fetch
  useEffect(() => {
    fetchActivities();
  }, []);

  // Update filtered activities when search/filters change
  useEffect(() => {
    filterActivities();
  }, [searchTerm, activities, filterMethod, filterCountry]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'OPTIONS': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBrowserInfo = (userAgent: string) => {
    if (!userAgent) return { browser: 'Inconnu', platform: 'Inconnu' };
    
    let browser = 'Inconnu';
    let platform = 'Inconnu';

    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    if (userAgent.includes('Windows')) platform = 'Windows';
    else if (userAgent.includes('Mac')) platform = 'macOS';
    else if (userAgent.includes('Linux')) platform = 'Linux';
    else if (userAgent.includes('Android')) platform = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) platform = 'iOS';

    return { browser, platform };
  };

  const getMainRoute = (route: RouteAccess[] | string): string => {
    if (Array.isArray(route) && route.length > 0) {
      return route[0].route;
    }
    return typeof route === 'string' ? route : 'N/A';
  };

  // Calculate statistics
  const totalActivities = activities.length;
  const uniqueIPs = new Set(activities.map(a => a.ip)).size;
  const uniqueCountries = [...new Set(activities.map(a => a.country))];
  const uniqueMethods = [...new Set(activities.map(a => a.method))];
  
  // Data for charts - SWAPPED as requested
  const countryData = uniqueCountries.map(country => ({
    name: country,
    value: activities.filter(a => a.country === country).length
  }));

  const methodData = uniqueMethods.slice(0, 5).map(method => ({
    name: method,
    value: activities.filter(a => a.method === method).length
  }));

  // Enhanced hourly data with user session duration
  const hourlyUserData = activities.reduce((acc, activity) => {
    if (activity.user_info && activity.login_time && activity.session_duration > 0) {
      const hour = new Date(activity.login_time).getHours();
      if (!acc[hour]) {
        acc[hour] = { hour: `${hour}:00`, duration: 0, users: new Set() };
      }
      acc[hour].duration += activity.session_duration;
      acc[hour].users.add(activity.user_info.id);
    }
    return acc;
  }, {} as Record<number, { hour: string; duration: number; users: Set<number> }>);

  const hourlyData = Array.from({length: 24}, (_, hour) => {
    const data = hourlyUserData[hour];
    return {
      hour: `${hour}:00`,
      duration: data ? Math.round(data.duration / 60) : 0, // Convert to minutes
      users: data ? data.users.size : 0
    };
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentActivities = filteredActivities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Error and Success Messages */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center z-50">
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center z-50">
          <span>{successMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 rounded-full p-3 mr-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Supprimer toutes les activités
                </h3>
                <p className="text-sm text-gray-600">
                  Cette action ne peut pas être annulée.
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Êtes-vous sûr de vouloir supprimer toutes les {activities.length} activités ? 
              Cette action supprimera définitivement toutes les données d'activité.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                onClick={deleteAllActivities}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Supprimer tout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard des Activités</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchActivities}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600 disabled:bg-blue-300"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading || isDeleting || activities.length === 0}
            className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2 hover:bg-red-600 disabled:bg-red-300"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer tout
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="p-2 bg-white bg-opacity-30 rounded-lg">
              <Activity className="w-8 h-8" />
            </div>
            <div className="ml-4">
              <p className="text-blue-100">Total Activités</p>
              <p className="text-2xl font-bold">{totalActivities}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="p-2 bg-white bg-opacity-30 rounded-lg">
              <Globe className="w-8 h-8" />
            </div>
            <div className="ml-4">
              <p className="text-green-100">IPs Uniques</p>
              <p className="text-2xl font-bold">{uniqueIPs}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="p-2 bg-white bg-opacity-30 rounded-lg">
              <MapPin className="w-8 h-8" />
            </div>
            <div className="ml-4">
              <p className="text-purple-100">Pays</p>
              <p className="text-2xl font-bold">{uniqueCountries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="p-2 bg-white bg-opacity-30 rounded-lg">
              <Users className="w-8 h-8" />
            </div>
            <div className="ml-4">
              <p className="text-orange-100">Utilisateurs Actifs</p>
              <p className="text-2xl font-bold">{new Set(activities.filter(a => a.user_id).map(a => a.user_id)).size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {activities.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Répartition par pays
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={countryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {countryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Timer className="w-5 h-5 mr-2" />
                Durée de session par heure
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'duration' ? `${value} min` : value,
                      name === 'duration' ? 'Durée totale' : 'Utilisateurs uniques'
                    ]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="duration" stroke="#8884d8" strokeWidth={2} name="Durée (min)" />
                  <Line type="monotone" dataKey="users" stroke="#82ca9d" strokeWidth={2} name="Utilisateurs" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Méthodes HTTP
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={methodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les méthodes</option>
            {uniqueMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>

          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les pays</option>
            {uniqueCountries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Total: {filteredActivities.length} activités
          </div>
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Détail des Activités</h2>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune activité trouvée</p>
              {activities.length === 0 && !isLoading && (
                <button
                  onClick={fetchActivities}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Charger les activités
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Détails
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Méthode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durée Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date/Heure
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentActivities.map((activity) => {
                  const { browser, platform } = getBrowserInfo(activity.user_agent);
                  const isExpanded = expandedRow === activity.id;
                  
                  return (
                    <React.Fragment key={activity.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setExpandedRow(isExpanded ? null : activity.id)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{activity.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {activity.user_info ? (
                            <div className="flex items-center">
                              <User className="w-4 h-4 text-gray-400 mr-2" />
                              <div>
                                <div className="font-medium">{activity.user_info.first_name} {activity.user_info.last_name}</div>
                                <div className="text-xs text-gray-500">{activity.user_info.email}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Non connecté</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(activity.method)}`}>
                            {activity.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Router className="w-4 h-4 text-gray-400 mr-2" />
                            {getMainRoute(activity.route)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                            {activity.city}, {activity.country}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Timer className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <div className="font-medium">{formatDuration(activity.session_duration)}</div>
                              {activity.login_time && activity.logout_time && (
                                <div className="text-xs text-gray-500">
                                  {new Date(activity.logout_time) > new Date(activity.login_time) ? 'Session complète' : 'Session active'}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            {formatDate(activity.created_at)}
                          </div>
                        </td>
                      </tr>
                      
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-700 flex items-center">
                                  <User className="w-4 h-4 mr-2" />
                                  Informations Utilisateur
                                </h4>
                                <div className="text-sm space-y-1">
                                  {activity.user_info ? (
                                    <>
                                      <p><span className="font-medium">Nom:</span> {activity.user_info.first_name} {activity.user_info.last_name}</p>
                                      <p><span className="font-medium">Email:</span> {activity.user_info.email}</p>
                                      <p><span className="font-medium">Username:</span> {activity.user_info.username}</p>
                                      <p><span className="font-medium">Doctor ID:</span> {activity.user_info.doctor_id || 'N/A'}</p>
                                      <p><span className="font-medium">Rôles:</span> {activity.user_info.roles.map(r => r.name).join(', ')}</p>
                                    </>
                                  ) : (
                                    <p className="text-gray-500">Utilisateur non connecté</p>
                                  )}
                                  <p><span className="font-medium">Temps actif:</span> {formatDuration(activity.active_time)}</p>
                                  <p><span className="font-medium">Durée session:</span> {formatDuration(activity.session_duration)}</p>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-700 flex items-center">
                                  <Smartphone className="w-4 h-4 mr-2" />
                                  Informations Appareil & Réseau
                                </h4>
                                <div className="text-sm space-y-1">
                                  <p><span className="font-medium">IP:</span> {activity.ip}</p>
                                  <p><span className="font-medium">Navigateur:</span> {browser}</p>
                                  <p><span className="font-medium">Plateforme:</span> {platform}</p>
                                  {activity.device_info ? (
                                    <>
                                      <p><span className="font-medium">Langue:</span> {activity.device_info.language || 'N/A'}</p>
                                      <p><span className="font-medium">Mémoire:</span> {activity.device_info.memory || 'Inconnue'}</p>
                                      <p><span className="font-medium">Écran:</span> {activity.device_info.screen ? `${activity.device_info.screen.width}x${activity.device_info.screen.height}` : 'N/A'}</p>
                                      <p><span className="font-medium">Fuseau:</span> {activity.device_info.timezone || 'N/A'}</p>
                                    </>
                                  ) : (
                                    <p className="text-gray-500 mt-2">Aucune information d'appareil disponible</p>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-700 flex items-center">
                                  <Clock className="w-4 h-4 mr-2" />
                                  Chronologie de Session
                                </h4>
                                <div className="text-sm space-y-1">
                                  <p><span className="font-medium">Créé:</span> {formatDate(activity.created_at)}</p>
                                  {activity.login_time && (
                                    <div className="flex items-center text-green-600">
                                      <LogIn className="w-3 h-3 mr-1" />
                                      <span>Connexion: {formatDate(activity.login_time)}</span>
                                    </div>
                                  )}
                                  {activity.last_seen && (
                                    <p><span className="font-medium">Dernière activité:</span> {formatDate(activity.last_seen)}</p>
                                  )}
                                  {activity.logout_time && (
                                    <div className="flex items-center text-red-600">
                                      <LogOut className="w-3 h-3 mr-1" />
                                      <span>Déconnexion: {formatDate(activity.logout_time)}</span>
                                    </div>
                                  )}
                                  {activity.modified_at && (
                                    <p><span className="font-medium">Modifié:</span> {formatDate(activity.modified_at)}</p>
                                  )}
                                </div>
                              </div>

                              <div className="md:col-span-3 space-y-2">
                                <h4 className="font-semibold text-gray-700 flex items-center">
                                  <Router className="w-4 h-4 mr-2" />
                                  Historique des Routes
                                </h4>
                                <div className="max-h-48 overflow-y-auto bg-gray-100 p-3 rounded-lg">
                                  {Array.isArray(activity.route) ? (
                                    <div className="space-y-2">
                                      {activity.route.map((routeItem, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm">
                                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getMethodColor(routeItem.method)}`}>
                                            {routeItem.method}
                                          </span>
                                          <span className="font-mono text-gray-700">{routeItem.route}</span>
                                          <span className="text-gray-500 text-xs">
                                            {new Date(routeItem.access_date).toLocaleTimeString('fr-FR')}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-sm font-mono text-gray-700">{activity.route}</div>
                                  )}
                                </div>
                              </div>

                              <div className="md:col-span-3 space-y-2">
                                <h4 className="font-semibold text-gray-700 flex items-center">
                                  <Monitor className="w-4 h-4 mr-2" />
                                  User Agent Complet
                                </h4>
                                <div className="text-sm bg-gray-100 p-3 rounded-lg font-mono break-all">
                                  {activity.user_agent}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredActivities.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de{' '}
                  <span className="font-medium">{indexOfFirstItem + 1}</span>
                  {' '}à{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredActivities.length)}
                  </span>
                  {' '}sur{' '}
                  <span className="font-medium">{filteredActivities.length}</span>
                  {' '}résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;