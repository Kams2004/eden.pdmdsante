import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import pdmdLogo from "./pdmd.png"; // Replace with the correct path to your logo
import imgBackground from "./img.png"; // Replace with the correct path to your image

const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleConnexion = () => {
    navigate("/login"); // Navigate to login page
  };

  const handleSendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent form submission reload
    setError("");
    setSuccessMessage("");
    // Simulate email submission without actual HTTP requests
    if (email) {
      setSuccessMessage("E-mail envoyé avec succès !");
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setError("Veuillez entrer une adresse e-mail valide.");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Section */}
      <div className="w-full md:w-1/3 bg-gray-50 p-8 md:p-12 flex flex-col justify-start items-center space-y-4">
        <img src={pdmdLogo} alt="Logo PDMD" className="h-24 mb-4" />
        <h2 className="text-2xl font-bold text-blue-600">Connectez-vous à votre compte</h2>
        <p className="text-sm text-gray-600 mb-4">
          Vous n'avez pas de compte ? {" "}
          <a href="/send-request" className="text-blue-500 hover:underline">
            Inscrivez-vous
          </a>
        </p>
        <button
          className="w-full py-2 px-4 border-2 border-blue-500 text-blue-500 bg-white rounded-lg hover:bg-blue-50 transition"
          onClick={handleConnexion}
        >
          Connexion
        </button>
        <div className="w-full my-4 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-sm text-gray-500">ou</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <form onSubmit={handleSendEmail} className="w-full space-y-4">
          {successMessage && (
            <p className="text-green-600 text-sm">{successMessage}</p>
          )}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <input
            type="email"
            placeholder="Adresse email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Envoyer
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
