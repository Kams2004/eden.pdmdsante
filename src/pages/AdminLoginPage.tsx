import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axioConfig';
import pdmdLogo from "./pdmd.png";
import imgBackground from "./img.png";

const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const navigate = useNavigate();

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!username || !password || !role) {
    setError("Please fill all fields and select a role");
    setTimeout(() => setError(''), 3000);
    return;
  }

  setLoading(true);
  setError('');

  try {
    const response = await axiosInstance.post('/user/login', {
      username,
      password,
      remember_me: true
    });

    const userData = response.data.data;
    const userRoles = userData.roles.map((roleObj: { name: string }) => roleObj.name);

    // Save the access token to localStorage
    localStorage.setItem('authToken', response.data.access_token);

    // Check if the selected role is present in the user's roles
    const roleMapping = { Standard: 'Admin', Accountant: 'Accountant' };
    const selectedRole = roleMapping[role as keyof typeof roleMapping];

    if (userRoles.includes(selectedRole)) {
      // Save user data
      localStorage.setItem('userData', JSON.stringify(userData));

      // Navigate based on the selected role
      if (selectedRole === 'Admin') {
        navigate('/admin');
      } else if (selectedRole === 'Accountant') {
        navigate('/accountant');
      }
    } else {
      setError(`You are not allowed to login with this role or you don't have the required role.`);
    }
  } catch (err: any) {
    const errorMessage = err.response?.data?.Messages || "Failed to login. Please try again.";
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleRoleSelection = (selectedRole: string) => {
    setRole(selectedRole);
    if (error) {
      setError('');
    }
  };

  const isFormValid = role && username && password;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Section */}
      <div className="w-full md:w-1/3 bg-gray-50 p-8 md:p-12 flex flex-col justify-start items-center space-y-4">
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
            onClick={() => handleRoleSelection('Standard')}
            className={`p-4 rounded-lg border-2 transition-colors flex items-center justify-center ${
              role === 'Standard'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelection('Accountant')}
            className={`p-4 rounded-lg border-2 transition-colors flex items-center justify-center ${
              role === 'Accountant'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            Accountant
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

export default AdminLoginPage;
