import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import pdmdLogo from "./pdmd.png";
import imgBackground from "./img.png";
import { clearAuthData } from '../api/axioConfig';
import axiosInstance from '../api/axioConfig';

const BASE_URL = 'http://65.21.73.170:7600';

type UserType = 'doctor' | 'patient' | null;

interface Role {
  id: number;
  name: string;
}

interface UserData {
  doctor_id: number | null;
  email: string;
  first_name: string;
  id: number;
  last_name: string;
  password: string;
  roles: Role[];
  username: string;
}

interface LoginResponse {
  access_token: string;
  data: UserData;
}

const LoginPage: React.FC = () => {
  const [userType, setUserType] = useState<UserType>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.username) {
      setUsername(location.state.username);
    }
  }, [location.state?.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType || !username || !password) {
      setError("Please fill all fields and select a user type");
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post<LoginResponse>('/user/login', {
        username,
        password,
        remember_me: rememberMe
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Save auth data
      localStorage.setItem('authToken', response.data.access_token);
      localStorage.setItem('userData', JSON.stringify(response.data.data));

      // Get user roles
      const roles = response.data.data.roles.map(role => role.name.toLowerCase());
      setUserRoles(roles);

      // Check role access
      const selectedRole = userType === 'doctor' ? 'doctor' : 'patient';
      if (roles.includes(selectedRole)) {
        navigate(`/${userType}`);
      } else {
        const availableRoles = roles.join(', ');
        setError(`Selected role (${userType}) doesn't match your permissions. Your available roles: ${availableRoles}`);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.Messages || "Please check your login credentials and try again";
      setError(errorMessage);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = (role: UserType) => {
    setUserType(role);
    // Clear error when user changes role selection
    if (error.includes("Le rôle sélectionné")) {
      setError('');
    }
  };

  const isFormValid = userType && username && password;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Section */}
      <div className="w-full md:w-1/3 bg-gray-50 p-8 md:p-12 flex flex-col justify-start items-center space-y-4">
        {/* <button
          onClick={() => navigate('/')}
          className="self-start mb-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button> */}
        <img src={pdmdLogo} alt="Logo PDMD" className="h-20 mb-4" />
        <h2 className="text-2xl font-bold text-blue-600">Connectez-vous en tant que :</h2>
        {error && (
          <div className="w-full p-3 bg-red-100 text-red-700 rounded-md text-center">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 w-full">
          <button
            type="button"
            onClick={() => handleRoleSelection('doctor')}
            className={`p-4 rounded-lg border-2 transition-colors flex items-center justify-center ${
              userType === 'doctor'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            Docteur
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelection('patient')}
            className={`p-4 rounded-lg border-2 transition-colors flex items-center justify-center ${
              userType === 'patient'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            Patient
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
            disabled={!isFormValid || loading}
            className={`w-full py-3 px-4 rounded-lg text-white transition-colors flex items-center justify-center ${
              isFormValid && !loading
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? "Connexion en cours..." : "Connexion"}
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
