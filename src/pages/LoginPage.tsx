import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pdmdLogo from "./pdmd.png"; // Replace with the correct path to your logo
import imgBackground from "./img.png"; // Replace with the correct path to your image

type UserType = 'doctor' | 'standard' | 'accountant' | null;

const LoginPage: React.FC = () => {
  const [userType, setUserType] = useState<UserType>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleConnexion = () => {
    if (userType === 'doctor') {
      navigate('/doctor');
    } else if (userType === 'standard') {
      navigate('/admin');
    } else if (userType === 'accountant') {
      navigate('/accountant');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType || !username || !password) return;

    handleConnexion();
  };

  const isFormValid = userType && username && password;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Section */}
      <div className="w-full md:w-1/3 bg-gray-50 p-8 md:p-12 flex flex-col justify-start items-center space-y-4">
        <img src={pdmdLogo} alt="Logo PDMD" className="h-20 mb-4" />
        <h2 className="text-2xl font-bold text-blue-600">Connectez-vous en tant que :</h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setUserType('doctor')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              userType === 'doctor'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            Docteur
          </button>
          <button
            onClick={() => setUserType('standard')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              userType === 'standard'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setUserType('accountant')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              userType === 'accountant'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            Comptable
          </button>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
                Se souvenir de moi
              </label>
            </div>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Mot de passe oublié ?
            </a>
          </div>
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3 px-4 rounded-lg text-white transition-colors ${
              isFormValid
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Connexion
          </button>
        </form>
      </div>

      {/* Right Section */}
      <div
        className="w-full md:w-2/3 relative"
        style={{ backgroundColor: '#002b36', backgroundImage: `url(${imgBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      ></div>
    </div>
  );
};

export default LoginPage;
