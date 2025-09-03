import { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import axiosInstance from '../../api/axioConfig';

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
  type: string;
  status: 'pending' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
}

const Requests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<number | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axiosInstance.get('/requete/');
        const formattedRequests = response.data.map((req: any) => ({
          ...req,
          type: determineRequestType(req),
          status: req.valide ? 'resolved' : 'pending',
          priority: determinePriority(req),
        }));
        setRequests(formattedRequests);
      } catch (error) {
   
      }
    };
    fetchRequests();
  }, []);

  const determineRequestType = (req: Request) => {
    if (req.connection) return 'Demande de connexion';
    if (req.commission) return 'Incohérence de commission';
    if (req.revendication_examen) return 'Problème de dossier patient';
    if (req.suggestion) return 'Retard de paiement';
    if (req.error) return 'Erreur système';
    if (req.administration) return 'Demande administrative';
    return 'Demande inconnue';
  };

  const determinePriority = (req: Request) => {
    const type = determineRequestType(req);
    switch (type) {
      case 'Erreur système':
        return 'high';
      case 'Incohérence de commission':
      case 'Problème de dossier patient':
        return 'medium';
      default:
        return 'low';
    }
  };

  const handleApprove = async (requestId: number) => {
    try {
      const response = await axiosInstance.put(`/requete/validate/${requestId}`);
      if (response.status === 200) {
        setRequests(requests.map(request =>
          request.id === requestId
            ? { ...request, status: 'resolved', valide: true, UpdateAt: response.data.UpdateAt }
            : request
        ));
      }
    } catch (error) {

    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await axiosInstance.delete(`/requete/del/${requestId}`);
      setRequests(requests.filter(request => request.id !== requestId));
    } catch (error) {

    }
  };

  const handleDelete = async (requestId: number) => {
    setRequestToDelete(requestId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (requestToDelete) {
      try {
        await axiosInstance.delete(`/requete/del/${requestToDelete}`);
        setRequests(requests.filter(request => request.id !== requestToDelete));
        setShowDeleteModal(false);
        setRequestToDelete(null);
      } catch (error) {
       
        setShowDeleteModal(false);
        setRequestToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setRequestToDelete(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getUniqueRequestTypes = () => {
    const types = requests.map(request => request.type);
    return [...new Set(types)].sort();
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    const matchesSearch =
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${request.first_name} ${request.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
    return (
      <div className="flex justify-center mt-4">
        <nav className="block">
          <ul className="flex pl-0 rounded list-none flex-wrap">
            <li>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`first:ml-0 text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid border-blue-500 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 bg-white hover:bg-blue-50'}`}
              >
                <span className="text-lg">«</span>
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, index) => (
              <li key={index}>
                <button
                  onClick={() => onPageChange(index + 1)}
                  className={`first:ml-0 text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 hover:bg-blue-50'}`}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`first:ml-0 text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid border-blue-500 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 bg-white hover:bg-blue-50'}`}
              >
                <span className="text-lg">»</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des demandes</h1>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="resolved">Résolues</option>
            <option value="rejected">Rejetées</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les types</option>
            {getUniqueRequestTypes().map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Rechercher des demandes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => {
              setStatusFilter('all');
              setTypeFilter('all');
              setSearchTerm('');
              setCurrentPage(1);
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Réinitialiser les filtres
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-500">
          Affichage de {currentRequests.length} sur {filteredRequests.length} demandes
          {filteredRequests.length !== requests.length && ` (filtrées depuis ${requests.length} au total)`}
        </div>
        <div className="space-y-4 mb-4">
          {currentRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune demande ne correspond à vos critères.</p>
            </div>
          ) : (
            currentRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <MessageSquare className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{request.type}</h3>
                      <p className="text-sm text-gray-600 mt-1">{request.message}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        De : {(request.commission || request.error || request.revendication_examen) ? `Dr. ${request.first_name} ${request.last_name}` : `${request.first_name} ${request.last_name}`}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Email : {request.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 relative">
                    {getStatusIcon(request.status)}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      request.priority === 'high' ? 'bg-red-100 text-red-800' :
                      request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {request.priority === 'high' ? 'Élevée' :
                       request.priority === 'medium' ? 'Moyenne' :
                       'Faible'}
                    </span>
                    <button
                      onClick={() => handleDelete(request.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                      title="Supprimer la demande"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>Créée le : {request.CreatedAt || 'N/A'}</span>
                  <span>Dernière mise à jour : {request.UpdateAt || 'N/A'}</span>
                </div>
                {request.status === 'pending' && (
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="px-4 py-2 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600"
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600"
                    >
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Supprimer la demande
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Êtes-vous sûr de vouloir supprimer cette demande ? Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
