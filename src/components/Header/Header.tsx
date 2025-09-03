import React from 'react';
import { Bell, Globe, LogOut, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface HeaderProps {
  showLanguages: boolean;
  setShowLanguages: (show: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ showLanguages, setShowLanguages }) => {
  const navigate = useNavigate();
  const BASE_URL = 'https://site.pdmdsante.com/';

  const handleLogout = async () => {
    try {
      // Récupérer le token d'authentification depuis localStorage
      const authToken = localStorage.getItem('authToken');

      if (!authToken) {
        navigate('/login');
        return;
      }

      // Envoyer la requête de déconnexion à l'API
      await axios.post(`${BASE_URL}/user/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      // Supprimer les données utilisateur de localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');

      // Rediriger vers la page de connexion
      navigate('/login');
    } catch (error) {

      // Supprimer localStorage et rediriger même si l'appel API échoue
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      navigate('/login');
    }
  };

  return (
    <header className="fixed top-4 left-4 right-4 bg-white shadow-md h-16 z-50 rounded-2xl">
      <div className="h-full flex items-center justify-between px-6">
        <img
          src="/pdmd.png"
          alt="Logo"
          className="h-14"
        />

        <div className="relative max-w-xl w-full mx-4">
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-blue-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>

          <div className="relative">
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setShowLanguages(!showLanguages)}
            >
              <Globe className="w-5 h-5 text-gray-600" />
            </button>

            {showLanguages && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg py-2">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-100">Anglais</button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-100">Français</button>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-1" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
