import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Search, Shield, Check, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import axiosInstance from '../../api/axioConfig';
import loadingImage from './image.png';

interface Role {
  id: number;
  name: string;
  usersCount: number;
  createdAt: string;
}

interface User {
  id: number;
  roles: {
    id: number;
    name: string;
  }[];
}

const BASE_URL = 'http://65.21.73.170:7600';

const Roles: React.FC = () => {
  const { t } = useLanguage();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const addRoleInputRef = useRef<HTMLDivElement>(null);
  const addRoleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rolesResponse, usersResponse] = await Promise.all([
          axiosInstance.get(`${BASE_URL}/roles/`),
          axiosInstance.get(`${BASE_URL}/users/all`)
        ]);
        const rolesData = rolesResponse.data;
        const usersData = usersResponse.data;
        const rolesWithCounts = rolesData.map((role: any) => ({
          id: role.id,
          name: role.name,
          usersCount: usersData.filter((user: User) =>
            user.roles.some(r => r.id === role.id)
          ).length,
          createdAt: new Date().toISOString().split('T')[0]
        }));
        setRoles(rolesWithCounts);
      } catch (err) {

      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAddInput &&
          addRoleInputRef.current &&
          !addRoleInputRef.current.contains(event.target as Node)) {
        if (addRoleButtonRef.current &&
            !addRoleButtonRef.current.contains(event.target as Node)) {
          setShowAddInput(false);
          setNewRoleName('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddInput]);

  const handleAddRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      const response = await axiosInstance.post(`${BASE_URL}/roles/add`, {
        name: newRoleName
      });
      const newRole = {
        id: response.data.id,
        name: newRoleName,
        usersCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setRoles([...roles, newRole]);
      setNewRoleName('');
      setShowAddInput(false);
      showNotification('Rôle créé avec succès', 'success');
    } catch (err) {
      showNotification('Échec de la création du rôle', 'error');
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    try {
      await axiosInstance.delete(`${BASE_URL}/roles/del/${roleToDelete}`);
      setRoles(roles.filter(role => role.id !== roleToDelete));
      setShowDeleteModal(false);
      setRoleToDelete(null);
      showNotification('Rôle supprimé avec succès', 'success');
    } catch (err) {
      showNotification('Échec de la suppression du rôle', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto relative">
      {loading && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span className="text-sm">Chargement des rôles...</span>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('roles') || 'Rôles'}</h1>
        <div className="relative">
          <button
            ref={addRoleButtonRef}
            onClick={() => setShowAddInput(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            {t('addNew') || 'Ajouter'}
          </button>
          {showAddInput && (
            <div
              ref={addRoleInputRef}
              className="absolute top-full mt-2 right-0 flex items-center bg-white rounded-lg shadow-lg border p-2 min-w-[300px]"
            >
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Nom du rôle"
                className="flex-1 px-3 py-2 border-none focus:outline-none"
                autoFocus
              />
              {newRoleName && (
                <button
                  onClick={handleAddRole}
                  className="ml-2 p-2 text-green-600 hover:bg-green-50 rounded-full"
                >
                  <Check className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        {loading || roles.length === 0 ? (
          <div className="flex justify-center items-center">
            <img src={loadingImage} alt="Chargement..." className="w-32 h-32" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder={t('search') || 'Rechercher...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedRoles.map((role) => (
                <div key={role.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-blue-500 mr-2" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{role.name}</h3>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => {
                          setRoleToDelete(role.id);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>{role.usersCount} utilisateur{role.usersCount > 1 ? 's' : ''}</span>
                    <span>Créé le {role.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 px-4">
              <div className="flex items-center text-sm text-gray-500">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredRoles.length)} sur {filteredRoles.length} entrées
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
                >
                  Précédent
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Supprimer un rôle</h2>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="mb-6">Êtes-vous sûr de vouloir supprimer ce rôle ? Cette action est irréversible.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteRole}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed bottom-4 right-4 w-80 z-50">
          <div className={`${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white rounded-lg shadow-lg overflow-hidden`}>
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium">{notification.message}</p>
                </div>
                <button onClick={() => setNotification(null)} className="text-white hover:text-gray-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="h-1 bg-black bg-opacity-20">
              <div
                className={`h-full ${notification.type === 'success' ? 'bg-green-300' : 'bg-red-300'}`}
                style={{ animation: 'progress 6s linear forwards' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
