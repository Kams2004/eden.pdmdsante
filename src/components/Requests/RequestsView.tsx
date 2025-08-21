import React, { useState, useEffect, FormEvent } from 'react';
import { Send, AlertCircle, Clock, CheckCircle, XCircle, Search, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../../api/axioConfig';
import { useToast } from '../../hooks/useToast';

// Définir les interfaces
interface Request {
  id: string;
  type: string;
  description: string;
  urgency: string;
  status: string;
  customMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface PredefinedRequest {
  id: string;
  title: string;
  description: string;
}

interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

const predefinedRequests: PredefinedRequest[] = [
  {
    id: 'commission-mismatch',
    title: 'Inadéquation de Commission',
    description: 'Signaler une divergence entre les commissions affichées et reçues'
  },
  {
    id: 'commission-delay',
    title: 'Retard de Commission',
    description: 'Signaler des retards dans les paiements de commissions'
  },
  {
    id: 'commission-error',
    title: 'Erreur de Commission',
    description: 'Signaler des erreurs dans les calculs de commissions'
  },
  {
    id: 'commission-query',
    title: 'Requête de Commission',
    description: 'Requête concernant la structure ou les détails de la commission'
  }
];

// Fonction pour formater les dates
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);

    // Options pour le formatage français
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Douala' // Ajusté pour le Cameroun
    };

    return new Intl.DateTimeFormat('fr-FR', options).format(date);
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return dateString; // Retourne la date originale en cas d'erreur
  }
};

// Fonction pour obtenir une date relative (optionnelle)
const getRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'À l\'instant';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      if (days < 7) {
        return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
      } else {
        return formatDate(dateString);
      }
    }
  } catch (error) {
    return formatDate(dateString);
  }
};

const RequestsView: React.FC = () => {
  const { showSuccessToast, showErrorToast, ToastComponent } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [urgency, setUrgency] = useState<string>('low');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const itemsPerPage: number = 6;
  const [sentRequests, setSentRequests] = useState<Request[]>([]);

  const fetchUserRequests = async () => {
    try {
      const userData: UserData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = userData.id;
      if (userId) {
        const response = await axiosInstance.get<Request[]>(`/requete/get_requests/${userId}`);
        const requests: Request[] = response.data.map((req: any) => ({
          id: String(req.id),
          type: req.commission ? 'Inadéquation de Commission' :
                req.revendication_examen ? 'Problème de Dossier Patient' :
                req.error ? 'Erreur Système' : 'Retard de Paiement',
          description: req.message,
          urgency: 'low',
          status: req.valide ? 'approved' : 'pending',
          customMessage: req.message,
          createdAt: req.CreatedAt,
          updatedAt: req.UpdatedAt || req.CreatedAt
        }));
        setSentRequests(requests);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des requêtes de l\'utilisateur :', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !customMessage) return;
    setLoading(true);
    const selectedPredefinedRequest = predefinedRequests.find(r => r.id === selectedRequest);
    if (!selectedPredefinedRequest) {
      setLoading(false);
      return;
    }
    const userData: UserData = JSON.parse(localStorage.getItem('userData') || '{}');
    const { email, first_name, last_name } = userData;
    const requestData = {
      administration: false,
      commission: selectedRequest === 'commission-mismatch',
      connection: false,
      email,
      error: selectedRequest === 'commission-error',
      first_name: first_name,
      last_name: last_name,
      message: customMessage,
      revendication_examen: selectedRequest === 'commission-query',
      suggestion: selectedRequest === 'commission-delay'
    };
    try {
      await axiosInstance.post('/requete/add', requestData);
      showSuccessToast('Requête envoyée avec succès');
      await fetchUserRequests();
      setSelectedRequest('');
      setCustomMessage('');
      setUrgency('low');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la requête :', error);
      showErrorToast('Échec de l\'envoi de la requête');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = sentRequests.filter((request: Request) => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesSearch =
      request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.customMessage || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const indexOfLastItem: number = currentPage * itemsPerPage;
  const indexOfFirstItem: number = indexOfLastItem - itemsPerPage;
  const currentRequests: Request[] = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* En-tête */}
        <div className="bg-white border-b border-slate-200 px-6 py-6">
          <h1 className="text-2xl font-semibold text-black">Soumettre une Requête de Commission</h1>
          <div className="w-16 h-1 bg-blue-400 mt-3 rounded-full"></div>
        </div>
        {/* Chargement du formulaire de nouvelle requête */}
        <div className="px-6 py-6 bg-blue-50/30 border-b border-blue-200">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="p-5 border rounded-lg shadow-sm bg-white animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 mt-0.5 bg-slate-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-5 w-40 bg-slate-200 rounded mb-3"></div>
                      <div className="h-4 w-full bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white p-5 rounded-lg border border-blue-200 shadow-sm animate-pulse">
              <div className="h-5 w-40 bg-slate-200 rounded mb-4"></div>
              <div className="flex gap-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="px-6 py-3 text-base rounded-lg capitalize font-medium bg-slate-200 w-24"></div>
                ))}
              </div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-blue-200 shadow-sm animate-pulse">
              <div className="h-5 w-56 bg-slate-200 rounded mb-3"></div>
              <div className="w-full h-24 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="flex justify-end">
              <div className="flex items-center px-8 py-4 bg-slate-200 text-white text-base font-medium rounded-lg w-48"></div>
            </div>
          </div>
        </div>
        {/* Chargement de la liste des requêtes envoyées */}
        <div className="px-6 py-6 border-t border-blue-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="h-7 w-56 bg-slate-200 rounded mb-3"></div>
              <div className="w-10 h-1 bg-slate-200 rounded-full"></div>
            </div>
          </div>
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4 mb-6">
            <div className="relative flex-1">
              <div className="h-12 w-full bg-slate-200 rounded-lg"></div>
            </div>
            <div className="h-12 w-48 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-5 shadow-sm relative overflow-hidden animate-pulse">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 opacity-20 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-300 opacity-15 rounded-full translate-y-8 -translate-x-8"></div>
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-slate-200 rounded-full mt-0.5"></div>
                    <div>
                      <div className="h-5 w-36 bg-slate-200 rounded mb-2"></div>
                      <div className="h-4 w-48 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
                    <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
                <div className="mb-4 relative z-10">
                  <div className="h-16 w-full bg-slate-200 rounded-lg"></div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-blue-200 relative z-10">
                  <div className="h-3 w-28 bg-slate-200 rounded"></div>
                  <div className="h-3 w-28 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
          {/* Chargement de la pagination */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 mt-6">
            <div className="flex items-center justify-between">
              <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
              <div className="h-5 w-32 bg-slate-200 rounded"></div>
              <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* En-tête */}
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <h1 className="text-2xl font-semibold text-black">Soumettre une Requête de Commission</h1>
        <div className="w-16 h-1 bg-blue-400 mt-3 rounded-full"></div>
      </div>
      {/* Formulaire de Nouvelle Requête */}
      <div className="px-6 py-6 bg-blue-50/30 border-b border-blue-200">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {predefinedRequests.map((request: PredefinedRequest) => (
              <div
                key={request.id}
                className={`p-5 border rounded-lg cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${
                  selectedRequest === request.id
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100'
                    : 'border-slate-200 hover:border-blue-300 bg-white'
                }`}
                onClick={() => setSelectedRequest(request.id)}
              >
                <div className="flex items-start gap-4">
                  <AlertCircle className={`w-6 h-6 mt-0.5 ${
                    selectedRequest === request.id ? 'text-blue-500' : 'text-slate-400'
                  }`} />
                  <div>
                    <h3 className={`text-base font-semibold ${
                      selectedRequest === request.id ? 'text-blue-800' : 'text-slate-800'
                    }`}>{request.title}</h3>
                    <p className={`text-sm mt-1 ${
                      selectedRequest === request.id ? 'text-blue-600' : 'text-slate-600'
                    }`}>{request.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white p-5 rounded-lg border border-blue-200 shadow-sm">
            <label className="block text-base font-semibold text-blue-800 mb-3">Niveau d'Urgence</label>
            <div className="flex gap-3">
              {['low', 'medium', 'high'].map((level: string) => (
                <button
                  key={level}
                  type="button"
                  className={`px-6 py-3 text-base rounded-lg capitalize font-medium transition-colors ${
                    urgency === level
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  onClick={() => setUrgency(level)}
                >
                  {level === 'low' ? 'Faible' : level === 'medium' ? 'Moyen' : 'Élevé'}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-blue-200 shadow-sm">
            <label className="block text-base font-semibold text-blue-800 mb-3">Détails Supplémentaires</label>
            <textarea
              value={customMessage}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomMessage(e.target.value)}
              rows={5}
              className="w-full px-4 py-4 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white hover:border-slate-400 transition-colors"
              placeholder="Veuillez fournir toute information supplémentaire concernant votre requête de commission..."
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedRequest || !customMessage || loading}
              className="flex items-center px-8 py-4 bg-blue-500 text-white text-base font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              onClick={handleSubmit}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Envoyer la Requête
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Liste des Requêtes Envoyées */}
      <div className="px-6 py-6 border-t border-blue-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-blue-800">Requêtes Envoyées</h2>
            <div className="w-10 h-1 bg-blue-400 mt-2 rounded-full"></div>
          </div>
        </div>
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher des requêtes..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-4 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 w-full bg-white hover:border-slate-400 transition-colors"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            className="px-6 py-4 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white hover:border-slate-400 transition-colors min-w-48"
          >
            <option value="all">Tous les Statuts</option>
            <option value="pending">En Attente</option>
            <option value="approved">Approuvé</option>
            <option value="rejected">Rejeté</option>
          </select>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentRequests.map((request: Request) => (
            <div key={request.id} className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 opacity-20 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-300 opacity-15 rounded-full translate-y-8 -translate-x-8"></div>

              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-6 h-6 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-blue-800">{request.type}</h3>
                    <p className="text-sm text-blue-700 mt-1">{request.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {request.status === 'approved' && <CheckCircle className="w-6 h-6 text-green-500" />}
                  {request.status === 'rejected' && <XCircle className="w-6 h-6 text-red-500" />}
                  {request.status === 'pending' && <Clock className="w-6 h-6 text-yellow-500" />}
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    request.urgency === 'high' ? 'bg-red-100 text-red-800' :
                    request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {request.urgency === 'high' ? 'Élevé' : request.urgency === 'medium' ? 'Moyen' : 'Faible'}
                  </span>
                </div>
              </div>
              {request.customMessage && (
                <div className="mb-4 relative z-10">
                  <p className="text-sm font-medium text-blue-700 bg-white p-4 rounded-lg border border-blue-200">
                    {request.customMessage}
                  </p>
                </div>
              )}

              {/* Section des dates compacte pour desktop */}
              <div className="flex justify-between items-center pt-4 border-t border-blue-200 relative z-10">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-800">Créée</span>
                  </div>
                  <span className="text-xs font-medium text-slate-600">{formatDate(request.createdAt)}</span>
                  <span className="text-xs text-slate-500">{getRelativeTime(request.createdAt)}</span>
                </div>

                <div className="flex flex-col text-right">
                  <div className="flex items-center gap-1 mb-1 justify-end">
                    <span className="text-xs font-semibold text-blue-800">Mise à jour</span>
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600">{formatDate(request.updatedAt)}</span>
                  <span className="text-xs text-slate-500">{getRelativeTime(request.updatedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 mt-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center px-4 py-3 text-base text-black font-bold hover:text-black hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              <span>Précédent</span>
            </button>
            <span className="text-base text-black font-bold">
              Page {currentPage} sur {Math.ceil(filteredRequests.length / itemsPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredRequests.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(filteredRequests.length / itemsPerPage)}
              className="flex items-center px-4 py-3 text-base text-black font-bold hover:text-black hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Suivant</span>
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
      {ToastComponent}
    </div>
  );
};

export default RequestsView;
