import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import pdmdLogo from "./pdmd.png";
import imgBackground from "./img.png";
import axios, { AxiosError } from 'axios';
import axiosInstance from '../api/axioConfig'; // Import the configured axios instance

const RequestPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    message: ""
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSendRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError("Veuillez remplir tous les champs obligatoires.");
      setTimeout(() => setError(""), 3000);
      setLoading(false);
      return;
    }

    const requestBody = {
      ...formData,
      commission: false,
      administration: true,
      revendication_examen: false,
      suggestion: false,
      error: false
    };

    try {
      const response = await axiosInstance.post('/requete/add', requestBody);
      if (response.status === 200) {
        setSuccessMessage(`Demande envoyée avec succès à ${formData.email}`);
      } else {
        setError(response.data.Message || "Erreur lors de l'envoi de la demande.");
      }
    } catch (err) {
      const error = err as AxiosError<{ Message: string }>;
      setError(error.response?.data?.Message || "Erreur lors de l'envoi de la demande.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setError("");
        setSuccessMessage("");
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Section */}
      <div className="w-full md:w-1/3 bg-gray-50 p-8 md:p-12 flex flex-col justify-start items-center space-y-4">
        <img src={pdmdLogo} alt="Logo PDMD" className="h-24 mb-4" />
        <h2 className="text-2xl font-bold text-blue-600">Demande de connexion</h2>
        <p className="text-sm text-gray-600 mb-4">
          Vous avez déjà un compte ?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Connectez-vous
          </a>
        </p>
        <div className="w-full my-4 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-sm text-gray-500">ou</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <form onSubmit={handleSendRequest} className="w-full space-y-4">
          {successMessage && (
            <div className="p-3 bg-green-100 text-green-700 rounded-md">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          <input
            type="text"
            name="first_name"
            placeholder="Prénom"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.first_name}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="last_name"
            placeholder="Nom"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.last_name}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Adresse email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="message"
            placeholder="Message"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.message}
            onChange={handleInputChange}
            rows={4}
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Envoi en cours..." : "Envoyer la demande"}
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

export default RequestPage;
