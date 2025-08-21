import React, { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import axiosInstance from '../../api/axioConfig';

interface SettingsViewProps {
  onProfileUpdate?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onProfileUpdate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    doctorName: "",
    doctorLastname: "",
    doctorEmail: "",
    doctorDOB: "",
    doctorPOB: "",
    doctorNat: "",
    doctorCNI: "",
    doctorNO: "",
    speciality: "",
    doctorFederationID: "",
    doctorPhone: "",
    doctorPhone2: "",
  });

  const totalSteps = 3;

  const checkDoctorProfileComplete = (doctorData: any): boolean => {
    return doctorData.doctor_is_confirmed === true;
  };

  const validateCurrentFormData = (): boolean => {
    const requiredFields = [
      { key: 'doctorName', label: 'Prénom' },
      { key: 'doctorLastname', label: 'Nom' },
      { key: 'doctorEmail', label: 'Email' },
      { key: 'doctorCNI', label: 'CNI' },
      { key: 'doctorNO', label: 'Numéro de Médecin' },
      { key: 'speciality', label: 'Spécialité' },
      { key: 'doctorPhone', label: 'Téléphone Principal' }
    ];

    const errors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.doctorName) {
        errors.doctorName = "Prénom est requis";
        isValid = false;
      }
      if (!formData.doctorLastname) {
        errors.doctorLastname = "Nom est requis";
        isValid = false;
      }
      if (!formData.doctorEmail) {
        errors.doctorEmail = "Email est requis";
        isValid = false;
      }
      if (!formData.doctorCNI) {
        errors.doctorCNI = "CNI est requise";
        isValid = false;
      }
    } else if (currentStep === 2) {
      if (!formData.doctorNO) {
        errors.doctorNO = "Numéro de Médecin est requis";
        isValid = false;
      }
      if (!formData.speciality) {
        errors.speciality = "Spécialité est requise";
        isValid = false;
      }
    } else if (currentStep === 3) {
      if (!formData.doctorPhone) {
        errors.doctorPhone = "Téléphone Principal est requis";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Informations Personnelles';
      case 2:
        return 'Informations Professionnelles';
      case 3:
        return 'Informations de Contact';
      default:
        return 'Paramètres';
    }
  };

  const getDoctorId = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      return userData.doctor_id || userData.id || userData.user_id;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'ID:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      const doctorId = getDoctorId();
      if (!doctorId) {
        setError('ID non trouvé');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/doctors/informations/${doctorId}`);
        const doctorData = response.data;
        const isComplete = checkDoctorProfileComplete(doctorData);
        setIsProfileIncomplete(!isComplete);
        const formatDate = (dateString: string | null): string => {
          if (!dateString) return "";
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        setFormData({
          doctorName: doctorData.DoctorName || "",
          doctorLastname: doctorData.DoctorLastname || "",
          doctorEmail: doctorData.DoctorEmail || "",
          doctorDOB: formatDate(doctorData.DoctorDOB),
          doctorPOB: doctorData.DoctorPOB || "",
          doctorNat: doctorData.DoctorNat || "",
          doctorCNI: doctorData.DoctorCNI || "",
          doctorNO: doctorData.DoctorNO || "",
          speciality: doctorData.Speciality || "",
          doctorFederationID: doctorData.DoctorFederationID || "",
          doctorPhone: doctorData.DoctorPhone || "",
          doctorPhone2: doctorData.DoctorPhone2 || "",
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des informations:', error);
        setError('Échec du chargement des informations');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctorInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Réinitialiser l'erreur pour ce champ
    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleNext = () => {
    if (validateCurrentFormData()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const confirmAndUpdate = async (doctorId: number) => {
    try {
      // Étape 1: Confirmer
      await axiosInstance.put(`/doctors/confirm/${doctorId}`);
      // Étape 2: Mettre à jour les informations
      const updateData = {
        DoctorName: formData.doctorName,
        DoctorLastname: formData.doctorLastname,
        DoctorEmail: formData.doctorEmail,
        DoctorDOB: formData.doctorDOB || null,
        DoctorPOB: formData.doctorPOB,
        DoctorNat: formData.doctorNat,
        DoctorCNI: formData.doctorCNI,
        DoctorNO: formData.doctorNO,
        Speciality: formData.speciality,
        DoctorFederationID: formData.doctorFederationID,
        DoctorPhone: formData.doctorPhone,
        DoctorPhone2: formData.doctorPhone2,
      };
      const response = await axiosInstance.put(`/doctors/update/${doctorId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des informations:', error);
      throw new Error('Échec de la mise à jour des informations');
    }
  };

  const handleSave = async () => {
    if (!validateCurrentFormData()) {
      setError(`Veuillez remplir tous les champs obligatoires.`);
      return;
    }
    const doctorId = getDoctorId();
    if (!doctorId) {
      setError('ID non trouvé');
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      const updateResponse = await confirmAndUpdate(doctorId);
      if (updateResponse && updateResponse.Doctor) {
        localStorage.setItem('doctorData', JSON.stringify(updateResponse.Doctor));
        localStorage.setItem('isProfileComplete', 'true');
        localStorage.removeItem('showSettingsFirst');
        // Afficher la modale de succès
        setModalType("success");
        setModalMessage("Les informations ont été mises à jour avec succès !");
        setShowResultModal(true);
        setIsProfileIncomplete(false);
        setMissingFields([]);
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      }
    } catch (error: any) {
      // Afficher la modale d'erreur
      setModalType("error");
      setModalMessage(error.message || "Une erreur est survenue lors de la mise à jour des informations.");
      setShowResultModal(true);
      console.error('Erreur:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const closeResultModal = () => {
    setShowResultModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {isLoading && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              <span className="text-sm">Chargement des informations...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {isProfileIncomplete && (
          <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 p-4 mb-6 rounded-md shadow-sm flex items-start">
            <div className="mr-3 mt-1">
              <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">
                Veuillez compléter vos informations avant d'accéder aux autres sections.
              </p>
            </div>
          </div>
        )}
        {/* Indicateur d'étape */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep
                    ? 'bg-blue-500 text-white shadow-lg'
                    : step < currentStep
                    ? 'bg-blue-200 text-blue-700'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
        {/* Carte de formulaire avec motifs colorés */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-8 relative overflow-hidden">
          {/* Éléments de motif colorés */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-20"></div>
            <div className="absolute top-8 right-8 w-12 h-12 bg-gradient-to-br from-red-200 to-red-300 rounded-full opacity-25"></div>
            <div className="absolute bottom-12 left-12 w-20 h-20 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full opacity-20"></div>
            <div className="absolute bottom-4 right-4 w-14 h-14 bg-gradient-to-br from-green-200 to-green-300 rounded-full opacity-25"></div>
            <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full opacity-30"></div>
            <div className="absolute top-1/3 right-1/3 w-10 h-10 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full opacity-25"></div>
            <div className="absolute top-16 left-1/2 w-6 h-6 bg-gradient-to-br from-blue-300 to-blue-400 opacity-20 transform rotate-45"></div>
            <div className="absolute bottom-16 right-1/4 w-8 h-8 bg-gradient-to-br from-red-300 to-red-400 opacity-20 transform rotate-12"></div>
            <div className="absolute top-3/4 left-1/3 w-7 h-7 bg-gradient-to-br from-yellow-300 to-yellow-400 opacity-25 rounded-lg transform rotate-45"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/30 via-transparent to-red-50/30"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-3 shadow-md"></div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {getStepTitle()}
              </h2>
            </div>
            {/* Formulaires par étape */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="doctorName"
                      value={formData.doctorName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                        formErrors.doctorName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Entrez votre prénom"
                      disabled={isLoading}
                      required
                    />
                    {formErrors.doctorName && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.doctorName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="doctorLastname"
                      value={formData.doctorLastname}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                        formErrors.doctorLastname ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Entrez votre nom"
                      disabled={isLoading}
                      required
                    />
                    {formErrors.doctorLastname && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.doctorLastname}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="doctorEmail"
                      value={formData.doctorEmail}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                        formErrors.doctorEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Entrez votre email"
                      disabled={isLoading}
                      required
                    />
                    {formErrors.doctorEmail && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.doctorEmail}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de Naissance
                    </label>
                    <input
                      type="date"
                      name="doctorDOB"
                      value={formData.doctorDOB}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lieu de Naissance
                    </label>
                    <input
                      type="text"
                      name="doctorPOB"
                      value={formData.doctorPOB}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors"
                      placeholder="Entrez votre lieu de naissance"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nationalité
                    </label>
                    <input
                      type="text"
                      name="doctorNat"
                      value={formData.doctorNat}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors"
                      placeholder="Entrez votre nationalité"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNI <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="doctorCNI"
                    value={formData.doctorCNI}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                      formErrors.doctorCNI ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Entrez votre numéro de CNI"
                    disabled={isLoading}
                    required
                  />
                  {formErrors.doctorCNI && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.doctorCNI}</p>
                  )}
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de Médecin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="doctorNO"
                      value={formData.doctorNO}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                        formErrors.doctorNO ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Entrez votre numéro de médecin"
                      disabled={isLoading}
                      required
                    />
                    {formErrors.doctorNO && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.doctorNO}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spécialité <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="speciality"
                      value={formData.speciality}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                        formErrors.speciality ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Entrez votre spécialité"
                      disabled={isLoading}
                      required
                    />
                    {formErrors.speciality && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.speciality}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID de Fédération
                  </label>
                  <input
                    type="text"
                    name="doctorFederationID"
                    value={formData.doctorFederationID}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors"
                    placeholder="Entrez votre ID de fédération"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="doctorPhone"
                      value={formData.doctorPhone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                        formErrors.doctorPhone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Entrez votre numéro de téléphone"
                      disabled={isLoading}
                      required
                    />
                    {formErrors.doctorPhone && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.doctorPhone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone Secondaire
                    </label>
                    <input
                      type="tel"
                      name="doctorPhone2"
                      value={formData.doctorPhone2}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors"
                      placeholder="Entrez votre numéro de téléphone secondaire"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}
            {/* Boutons de navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1 || isLoading}
                className="p-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={isSaving || isLoading}
                  className="p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Indicateur du bas */}
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full shadow-sm"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full shadow-sm"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>
      {/* Modale de résultat */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex justify-center mb-4">
              {modalType === "success" && <CheckCircle2 className="h-12 w-12 text-green-500" />}
              {modalType === "error" && <XCircle className="h-12 w-12 text-red-500" />}
            </div>
            <h3 className="text-lg font-medium text-center mb-2">
              {modalType === "success" && "Succès"}
              {modalType === "error" && "Erreur"}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {modalMessage}
            </p>
            <div className="flex justify-center">
              <button
                onClick={closeResultModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
