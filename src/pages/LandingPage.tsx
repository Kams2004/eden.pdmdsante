import { useState,useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import pdmdLogo from "./pdmd.png";
import imgBackground from "./img.png";
import axios, { AxiosError } from 'axios';
import { sendDeviceInfo } from "../components/utils/deviceInfo";

const BASE_URL = 'http://65.21.73.170:1000/';

const LandingPage = () => {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendId = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);
    if (!id) {
      setError("Veuillez entrer un Matricule ou ID de fédération valide.");
      setTimeout(() => setError(""), 3000);
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(`${BASE_URL}/users/send_email/`, {
        federation_id: id
      });
      if (response.data.Message === "Identifiants Envoyés avec succès") {
        setSuccessMessage("Envoyé avec succès. Vous recevrez un e-mail contenant vos identifiants de connexion.");
        setTimeout(() => {
          navigate("/login", { state: { username: response.data.Username } });
        }, 3000);
      } else {
        setError(response.data.Message || "Erreur lors de l'envoi de l'ID.");
      }
    } catch (err) {
      const error = err as AxiosError<{ Message: string }>;
      setError(error.response?.data?.Message || "Erreur lors de l'envoi de l'ID.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setError("");
        setSuccessMessage("");
      }, 3000);
    }
  };
  useEffect(() => {
    sendDeviceInfo();
  }, []);
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Section */}
      <div className="w-full md:w-1/3 bg-gray-50 p-8 md:p-12 flex flex-col justify-start items-center space-y-4">
        <img src={pdmdLogo} alt="Logo PDMD" className="h-24 mb-4" />
        <h2 className="text-2xl font-bold text-blue-600">Veuillez entrer votre Matricule</h2>
        <form onSubmit={handleSendId} className="w-full space-y-4">
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
            placeholder="Matricule"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
          <div className="w-full text-right">
            <p className="text-sm text-gray-600">
              Identifiant reçu ? <Link to="/login" className="text-blue-600 hover:underline">Veuillez vous connecter</Link>
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Envoi en cours..." : "Envoyer"}
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

export default LandingPage;
