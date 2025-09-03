import React, { useState, useEffect, FormEvent } from 'react';
import { Send, AlertCircle, Clock, CheckCircle, XCircle, Search, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../../../../api/axioConfig';
import { useToast } from '../../../../hooks/useToast';

// Définir les interfaces
interface Commission {
  id: string;
  type: string;
  description: string;
  urgency: string;
  status: string;
  customMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface PredefinedCommission {
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

const predefinedCommissions: PredefinedCommission[] = [
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
      timeZone: 'Europe/Paris' // Ajustez selon votre fuseau horaire
    };
    
    return new Intl.DateTimeFormat('fr-FR', options).format(date);
  } catch (error) {

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

const MobileRequestView: React.FC = () => {
  const { showSuccessToast, showErrorToast, ToastComponent } = useToast();
  const [selectedCommission, setSelectedCommission] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [urgency, setUrgency] = useState<string>('low');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const itemsPerPage: number = 3;
  const [sentCommissions, setSentCommissions] = useState<Commission[]>([]);

  const fetchUserCommissions = async () => {
    try {
      const userData: UserData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = userData.id;

      if (userId) {
        const response = await axiosInstance.get<Commission[]>(`/requete/get_requests/${userId}`);
        const commissions: Commission[] = response.data.map((req: any) => ({
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
        setSentCommissions(commissions);
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCommissions();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCommission || !customMessage) return;

    setLoading(true);
    const selectedPredefinedCommission = predefinedCommissions.find(c => c.id === selectedCommission);
    
    if (!selectedPredefinedCommission) {
      setLoading(false);
      return;
    }

    const userData: UserData = JSON.parse(localStorage.getItem('userData') || '{}');
    const { email, first_name, last_name } = userData;

    const requestData = {
      administration: false,
      commission: selectedCommission === 'commission-mismatch',
      connection: false,
      email,
      error: selectedCommission === 'commission-error',
      first_name: first_name,
      last_name: last_name,
      message: customMessage,
      revendication_examen: selectedCommission === 'commission-query',
      suggestion: selectedCommission === 'commission-delay'
    };

    try {
      await axiosInstance.post('/requete/add', requestData);
      showSuccessToast('Requête envoyée avec succès');
      await fetchUserCommissions();
      setSelectedCommission('');
      setCustomMessage('');
      setUrgency('low');
    } catch (error) {

      showErrorToast('Échec de l\'envoi de la requête');
    } finally {
      setLoading(false);
    }
  };

  const filteredCommissions = sentCommissions.filter((commission: Commission) => {
    const matchesStatus = statusFilter === 'all' || commission.status === statusFilter;
    const matchesSearch =
      commission.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (commission.customMessage || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const indexOfLastItem: number = currentPage * itemsPerPage;
  const indexOfFirstItem: number = indexOfLastItem - itemsPerPage;
  const currentCommissions: Commission[] = filteredCommissions.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* En-tête */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
          <h1 className="text-xl font-semibold text-black">Soumettre une Requête</h1>
          <div className="w-12 h-1 bg-blue-400 mt-2 rounded-full"></div>
        </div>

        {/* Chargement du formulaire de nouvelle requête */}
        <div className="px-4 sm:px-6 py-4 bg-blue-50/30 border-b border-blue-200">
          <div className="space-y-4">
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="p-4 border rounded-lg shadow-sm bg-white animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 bg-slate-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 w-full bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm animate-pulse">
              <div className="h-4 w-32 bg-slate-200 rounded mb-4"></div>
              <div className="flex gap-2">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="px-4 py-2 text-sm rounded-lg capitalize font-medium bg-slate-200"></div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm animate-pulse">
              <div className="h-4 w-48 bg-slate-200 rounded mb-2"></div>
              <div className="w-full h-20 bg-slate-200 rounded-lg"></div>
            </div>

            <div className="flex justify-end">
              <div className="flex items-center px-6 py-3 bg-slate-200 text-white text-sm font-medium rounded-lg w-32"></div>
            </div>
          </div>
        </div>

        {/* Chargement de la liste des requêtes envoyées */}
        <div className="px-4 sm:px-6 py-4 border-t border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="h-6 w-48 bg-slate-200 rounded mb-2"></div>
              <div className="w-8 h-1 bg-slate-200 rounded-full"></div>
            </div>
          </div>

          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 mb-4">
            <div className="relative flex-1">
              <div className="h-10 w-full bg-slate-200 rounded-lg"></div>
            </div>
            <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
          </div>

          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-4 shadow-sm relative overflow-hidden animate-pulse">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-blue-300 opacity-15 rounded-full translate-y-6 -translate-x-6"></div>
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-slate-200 rounded-full mt-0.5"></div>
                    <div>
                      <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 w-48 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-slate-200 rounded-full"></div>
                    <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
                <div className="mb-3 relative z-10">
                  <div className="h-12 w-full bg-slate-200 rounded-lg"></div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-blue-200 relative z-10">
                  <div className="h-3 w-24 bg-slate-200 rounded"></div>
                  <div className="h-3 w-24 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Chargement de la pagination */}
          <div className="px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
              <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* En-tête */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <h1 className="text-xl font-semibold text-black">Soumettre une Requête</h1>
        <div className="w-12 h-1 bg-blue-400 mt-2 rounded-full"></div>
      </div>

      {/* Formulaire de Nouvelle Requête */}
      <div className="px-4 sm:px-6 py-4 bg-blue-50/30 border-b border-blue-200">
        <div className="space-y-4">
          <div className="space-y-3">
            {predefinedCommissions.map((commission: PredefinedCommission) => (
              <div
                key={commission.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${
                  selectedCommission === commission.id
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100'
                    : 'border-slate-200 hover:border-blue-300 bg-white'
                }`}
                onClick={() => setSelectedCommission(commission.id)}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 mt-0.5 ${
                    selectedCommission === commission.id ? 'text-blue-500' : 'text-slate-400'
                  }`} />
                  <div>
                    <h3 className={`text-sm font-semibold ${
                      selectedCommission === commission.id ? 'text-blue-800' : 'text-slate-800'
                    }`}>{commission.title}</h3>
                    <p className={`text-xs mt-1 ${
                      selectedCommission === commission.id ? 'text-blue-600' : 'text-slate-600'
                    }`}>{commission.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
            <label className="block text-sm font-semibold text-blue-800 mb-2">Niveau d'Urgence</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map((level: string) => (
                <button
                  key={level}
                  type="button"
                  className={`px-4 py-2 text-sm rounded-lg capitalize font-medium transition-colors ${
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

          <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
            <label className="block text-sm font-semibold text-blue-800 mb-2">Détails Supplémentaires</label>
            <textarea
              value={customMessage}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white hover:border-slate-400 transition-colors"
              placeholder="Veuillez fournir toute information supplémentaire concernant votre requête..."
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedCommission || !customMessage || loading}
              className="flex items-center px-6 py-3 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              onClick={handleSubmit}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer la Requête
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des Requêtes Envoyées */}
      <div className="px-4 sm:px-6 py-4 border-t border-blue-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-blue-800">Requêtes Envoyées</h2>
            <div className="w-8 h-1 bg-blue-400 mt-1 rounded-full"></div>
          </div>
        </div>

        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher des requêtes..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 w-full bg-white hover:border-slate-400 transition-colors"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            className="px-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white hover:border-slate-400 transition-colors"
          >
            <option value="all">Tous les Statuts</option>
            <option value="pending">En Attente</option>
            <option value="approved">Approuvé</option>
            <option value="rejected">Rejeté</option>
          </select>
        </div>

        <div className="space-y-4">
          {currentCommissions.map((commission: Commission) => (
            <div key={commission.id} className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-blue-300 opacity-15 rounded-full translate-y-6 -translate-x-6"></div>
              
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-blue-800">{commission.type}</h3>
                    {/* <p className="text-sm text-blue-700 mt-1">{commission.description}</p> */}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {commission.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {commission.status === 'rejected' && <XCircle className="w-5 h-5 text-red-500" />}
                  {commission.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    commission.urgency === 'high' ? 'bg-red-100 text-red-800' :
                    commission.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {commission.urgency === 'high' ? 'Élevé' : commission.urgency === 'medium' ? 'Moyen' : 'Faible'}
                  </span>
                </div>
              </div>

              {commission.customMessage && (
                <div className="mb-3 relative z-10">
                  <p className="text-sm font-medium text-blue-700 bg-white p-3 rounded-lg border border-blue-200">
                    {commission.customMessage}
                  </p>
                </div>
              )}

              {/* Section des dates compacte */}
              <div className="flex justify-between items-center pt-3 border-t border-blue-200 relative z-10">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-800">Créée</span>
                  </div>
                  <span className="text-xs font-medium text-slate-600">{formatDate(commission.createdAt)}</span>
                  <span className="text-xs text-slate-500">{getRelativeTime(commission.createdAt)}</span>
                </div>
                
                <div className="flex flex-col text-right">
                  <div className="flex items-center gap-1 mb-1 justify-end">
                    <span className="text-xs font-semibold text-blue-800">Mise à jour</span>
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600">{formatDate(commission.updatedAt)}</span>
                  <span className="text-xs text-slate-500">{getRelativeTime(commission.updatedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 text-sm text-black font-bold hover:text-black hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Précédent</span>
            </button>
            <span className="text-sm text-black font-bold">
              Page {currentPage} sur {Math.ceil(filteredCommissions.length / itemsPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredCommissions.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(filteredCommissions.length / itemsPerPage)}
              className="flex items-center px-3 py-2 text-sm text-black font-bold hover:text-black hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Suivant</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {ToastComponent}
    </div>
  );
};

export default MobileRequestView;