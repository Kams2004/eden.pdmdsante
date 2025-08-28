import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axioConfig';
import { Users, Shield, User as UserMd, MessageSquare, Activity, Calendar, Bell, X } from 'lucide-react';
import { sendDeviceInfo } from '../../components/utils/deviceInfo';

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
  const [systemStatus, setSystemStatus] = useState<'operational' | 'problems'>('operational');
  const [lastChecked, setLastChecked] = useState<string>('N/A');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Récupérer le nombre d'utilisateurs
        const usersResponse = await axiosInstance.get('/users/nb');
        const numberOfUsers = usersResponse.data['Nombre Utilisateur '];

        // Récupérer le nombre de médecins
        const doctorsResponse = await axiosInstance.get('/doctors/nbr');
        const numberOfDoctors = doctorsResponse.data['Nombre'];

        // Récupérer le nombre de demandes
        const requestsResponse = await axiosInstance.get('/requete/nbr');
        const numberOfRequests = requestsResponse.data['Nbr'];

        // Récupérer les rôles
        const rolesResponse = await axiosInstance.get('/roles/');
        const roles = rolesResponse.data;
        const numberOfRoles = roles.length;

        // Récupérer les demandes récentes
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
            return dateB - dateA;
          })
          .slice(0, 4);

        // Vérifier le statut du système
        const heartbeatResponse = await axiosInstance.post('/heartbeat');
        if (heartbeatResponse.data.status === 'ok') {
          setSystemStatus('operational');
          setLastChecked(new Date().toLocaleTimeString('fr-FR'));
        } else {
          setSystemStatus('problems');
        }

        setFetchedStats({
          users: numberOfUsers,
          roles: numberOfRoles,
          doctors: numberOfDoctors,
          requests: numberOfRequests,
        });
        setRecentRequests(filteredRequests);
        setError(null);
      } catch (err: any) {
        console.error('Échec de la récupération des données du tableau de bord :', err);
        let errorMessage = 'Échec du chargement des données du tableau de bord.';
        if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Erreur de connexion réseau. Veuillez vérifier votre connexion internet.';
        } else if (err.response?.status === 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else if (err.response?.status === 404) {
          errorMessage = 'Service introuvable. Veuillez contacter le support.';
        }
        setError(errorMessage);
        setSystemStatus('problems');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stats.roles]);
 useEffect(() => {
    sendDeviceInfo();
  }, []);
  // Vérification périodique du statut du système
  useEffect(() => {
    const heartbeatInterval = setInterval(async () => {
      try {
        const heartbeatResponse = await axiosInstance.post('/heartbeat');
        if (heartbeatResponse.data.status === 'ok') {
          setSystemStatus('operational');
          setLastChecked(new Date().toLocaleTimeString('fr-FR'));
        } else {
          setSystemStatus('problems');
        }
      } catch (err) {
        setSystemStatus('problems');
      }
    }, 30000); // Vérification toutes les 30 secondes

    return () => clearInterval(heartbeatInterval);
  }, []);

  // Masquer automatiquement l'erreur après 8 secondes
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
    { id: 1, action: "Nouvel utilisateur inscrit", time: "Il y a 5 minutes" },
    { id: 2, action: "Permissions de rôle mises à jour", time: "Il y a 10 minutes" },
    { id: 3, action: "Sauvegarde du système terminée", time: "Il y a 25 minutes" },
    { id: 4, action: "Nouveau profil de médecin créé", time: "Il y a 1 heure" },
  ];

  const notifications = [
    { id: 1, message: "Maintenance du système prévue", type: "avertissement" },
    { id: 2, message: "Nouvelle fonctionnalité déployée", type: "info" },
    { id: 3, message: "Mise à jour de sécurité disponible", type: "critique" },
  ];

  const determineRequestType = (req: Request) => {
    if (req.connection) return 'Demande de connexion';
    if (req.commission) return 'Incohérence de commission';
    if (req.revendication_examen) return 'Problème de dossier patient';
    if (req.suggestion) return 'Retard de paiement';
    if (req.error) return 'Erreur système';
    if (req.administration) return 'Demande administrative';
    return 'Demande inconnue';
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 relative">
      {/* Notification d'erreur */}
      {error && (
        <div className="fixed top-20 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Erreur</p>
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
            Réessayer
          </button>
        </div>
      )}

      {/* Indicateur de chargement */}
      {loading && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span className="text-sm">Chargement des données du tableau de bord...</span>
          </div>
        </div>
      )}

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Utilisateurs totaux"
          value={fetchedStats.users}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Rôles utilisateurs"
          value={fetchedStats.roles}
          icon={Shield}
          color="bg-green-500"
        />
        <StatCard
          title="Médecins actifs"
          value={fetchedStats.doctors}
          icon={UserMd}
          color="bg-purple-500"
        />
        <StatCard
          title="Demandes en attente"
          value={fetchedStats.requests}
          icon={MessageSquare}
          color="bg-yellow-500"
        />
      </div>

      {/* Statut du système et maintenance */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Activity className="w-6 h-6 text-blue-500 mr-2" />
            <span className="text-sm font-medium">Statut du système : </span>
            <span className={`text-sm ml-2 ${systemStatus === 'problems' ? 'text-red-500' : 'text-green-500'}`}>
              {systemStatus === 'problems' ? 'Problèmes détectés' : 'Opérationnel'}
            </span>
          </div>
          <span className="text-xs text-gray-500">Dernière vérification : {lastChecked}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-purple-500 mr-2" />
            <span className="text-sm font-medium">Prochaine maintenance : </span>
            <span className="text-sm ml-2">25 mars 2024</span>
          </div>
          <span className="text-xs text-gray-500">Dans 5 jours</span>
        </div>
      </div>

      {/* Activité récente et notifications */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Activité récente</h3>
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
            <h3 className="text-lg font-semibold text-gray-800">Notifications système</h3>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      notification.type === "critique"
                        ? "bg-red-500"
                        : notification.type === "avertissement"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <span className="text-sm text-gray-600">{notification.message}</span>
                </div>
                <span
                  className={`text-xs font-medium ${
                    notification.type === "critique"
                      ? "text-red-500"
                      : notification.type === "avertissement"
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

      {/* Tableau des demandes récentes */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Demandes récentes</h3>
          <button className="text-sm text-blue-500 hover:text-blue-600">Voir tout</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Demandeur</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
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
                      {request.valide ? 'Résolu' : 'En attente'}
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
