import React, { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import axiosInstance from "../../../../api/axioConfig";

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  cni: string;
}

interface DoctorInfo {
  doctorNO: string;
  speciality: string;
  doctorFederationID: string;
  doctorPhone: string;
  doctorPhone2: string;
}

interface DoctorData {
  CreatedAt: string;
  DoctorCNI: string;
  DoctorDOB: string | null;
  DoctorEmail: string;
  DoctorFederationID: string;
  DoctorLastname: string;
  DoctorNO: string;
  DoctorName: string;
  DoctorNat: string;
  DoctorPOB: string;
  DoctorPhone: string;
  DoctorPhone2: string;
  ModifiedAt: string | null;
  Speciality: string;
  id: number;
  user: number;
  doctor_is_confirmed: boolean | null;
}

interface PersonalInfoFormProps {
  onProfileUpdate?: () => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ onProfileUpdate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<PersonalInfo>({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    placeOfBirth: "",
    nationality: "",
    cni: "",
  });

  const [doctorData, setDoctorData] = useState<DoctorInfo>({
    doctorNO: "",
    speciality: "",
    doctorFederationID: "",
    doctorPhone: "",
    doctorPhone2: "",
  });

  const totalSteps = 2;

  const getDoctorId = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      return userData.doctor_id || userData.id || userData.user_id;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'ID du médecin :", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      const doctorId = getDoctorId();
      if (!doctorId) {
        setError("ID non trouvé");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const response = await axiosInstance.get<DoctorData>(`/doctors/informations/${doctorId}`);
        const doctorData = response.data;
        const isComplete = doctorData.doctor_is_confirmed === true;
        setIsProfileIncomplete(!isComplete);
        const formatDate = (dateString: string | null): string => {
          if (!dateString) return "";
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };
        setFormData({
          firstName: doctorData.DoctorName || "",
          lastName: doctorData.DoctorLastname || "",
          email: doctorData.DoctorEmail || "",
          dateOfBirth: formatDate(doctorData.DoctorDOB),
          placeOfBirth: doctorData.DoctorPOB || "",
          nationality: doctorData.DoctorNat || "",
          cni: doctorData.DoctorCNI || "",
        });
        setDoctorData({
          doctorNO: doctorData.DoctorNO || "",
          speciality: doctorData.Speciality || "",
          doctorFederationID: doctorData.DoctorFederationID || "",
          doctorPhone: doctorData.DoctorPhone || "",
          doctorPhone2: doctorData.DoctorPhone2 || "",
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des informations :", error);
        setError("Échec du chargement des informations");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctorInfo();
  }, []);

  const validateStep = (): boolean => {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.firstName) errors.firstName = "Prénom est requis";
      if (!formData.lastName) errors.lastName = "Nom est requis";
      if (!formData.email) errors.email = "Email est requis";
      if (!formData.dateOfBirth) errors.dateOfBirth = "Date de Naissance est requise";
      if (!formData.placeOfBirth) errors.placeOfBirth = "Lieu de Naissance est requis";
      if (!formData.nationality) errors.nationality = "Nationalité est requise";
      if (!formData.cni) errors.cni = "CNI est requise";
    } else {
      if (!doctorData.doctorNO) errors.doctorNO = "Numéro de Médecin est requis";
      if (!doctorData.speciality) errors.speciality = "Spécialité est requise";
      if (!doctorData.doctorFederationID) errors.doctorFederationID = "ID de Fédération est requis";
      if (!doctorData.doctorPhone) errors.doctorPhone = "Téléphone est requis";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    field: keyof PersonalInfo | keyof DoctorInfo,
    value: string,
    isDoctorInfo: boolean = false
  ) => {
    if (isDoctorInfo) {
      setDoctorData((prev) => ({
        ...prev,
        [field as keyof DoctorInfo]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field as keyof PersonalInfo]: value,
      }));
    }

    // Réinitialiser l'erreur pour ce champ
    setFormErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleNext = () => {
    if (validateStep()) {
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

  const confirmAndUpdateDoctor = async (doctorId: number) => {
    try {
      // Étape 1: Confirmer le médecin
      await axiosInstance.put(`/doctors/confirm/${doctorId}`);
      // Étape 2: Mettre à jour les informations
      const updateData = {
        DoctorName: formData.firstName,
        DoctorLastname: formData.lastName,
        DoctorEmail: formData.email,
        DoctorDOB: formData.dateOfBirth || null,
        DoctorPOB: formData.placeOfBirth,
        DoctorNat: formData.nationality,
        DoctorCNI: formData.cni,
        DoctorNO: doctorData.doctorNO,
        Speciality: doctorData.speciality,
        DoctorFederationID: doctorData.doctorFederationID,
        DoctorPhone: doctorData.doctorPhone,
        DoctorPhone2: doctorData.doctorPhone2,
      };
      const response = await axiosInstance.put(`/doctors/update/${doctorId}`, updateData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour des informations :", error);
      throw new Error("Échec de la mise à jour des informations");
    }
  };

  const handleSave = async () => {
    if (!validateStep()) {
      return;
    }

    const doctorId = getDoctorId();
    if (!doctorId) {
      setError("ID non trouvé");
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      const updateResponse = await confirmAndUpdateDoctor(doctorId);
      if (updateResponse && updateResponse.Doctor) {
        localStorage.setItem("doctorData", JSON.stringify(updateResponse.Doctor));
        localStorage.setItem("isProfileComplete", "true");
        localStorage.removeItem("showSettingsFirst");
        // Afficher la modale de succès
        setModalType("success");
        setModalMessage("Les informations ont été mises à jour avec succès !");
        setShowResultModal(true);
        setIsProfileIncomplete(false);
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      }
    } catch (error: any) {
      // Afficher la modale d'erreur
      setModalType("error");
      setModalMessage(error.message || "Une erreur est survenue lors de la mise à jour des informations.");
      setShowResultModal(true);
      console.error("Erreur:", error);
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
              <svg
                className="h-5 w-5 text-orange-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">
                Veuillez compléter vos informations avant d'accéder aux autres sections.
              </p>
            </div>
          </div>
        )}
        {/* Indicateur d'Étape */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2].map((step) => (
              <div
                key={step}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep
                    ? "bg-blue-500 text-white shadow-lg"
                    : step < currentStep
                    ? "bg-blue-200 text-blue-700"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
        {/* Carte de Formulaire avec Motifs Colorés */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-8 relative overflow-hidden">
          {/* Éléments de Motifs Colorés à l'intérieur du conteneur */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-20"></div>
            <div className="absolute top-8 right-8 w-12 h-12 bg-gradient-to-br from-red-200 to-red-300 rounded-full opacity-25"></div>
            <div className="absolute bottom-12 left-12 w-20 h-20 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full opacity-20"></div>
            <div className="absolute bottom-4 right-4 w-14 h-14 bg-gradient-to-br from-green-200 to-green-300 rounded-full opacity-25"></div>
            <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full opacity-30"></div>
            <div className="absolute top-1/3 right-1/3 w-10 h-10 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full opacity-25"></div>
            {/* Formes Géométriques */}
            <div className="absolute top-16 left-1/2 w-6 h-6 bg-gradient-to-br from-blue-300 to-blue-400 opacity-20 transform rotate-45"></div>
            <div className="absolute bottom-16 right-1/4 w-8 h-8 bg-gradient-to-br from-red-300 to-red-400 opacity-20 transform rotate-12"></div>
            <div className="absolute top-3/4 left-1/3 w-7 h-7 bg-gradient-to-br from-yellow-300 to-yellow-400 opacity-25 rounded-lg transform rotate-45"></div>
            {/* Superposition de Motifs Subtiles */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/30 via-transparent to-red-50/30"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-3 shadow-md"></div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {currentStep === 1 ? "Informations Personnelles" : "Informations Professionnelles"}
              </h2>
            </div>
            {currentStep === 1 ? (
              <div className="space-y-6">
                {/* Prénom et Nom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                        formErrors.firstName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Entrez votre prénom"
                      disabled={isLoading}
                    />
                    {formErrors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                        formErrors.lastName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Entrez votre nom"
                      disabled={isLoading}
                    />
                    {formErrors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>
                {/* Email et Date de Naissance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                        formErrors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Entrez votre email"
                      disabled={isLoading}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de Naissance
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                        formErrors.dateOfBirth ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="jj/mm/aaaa"
                      disabled={isLoading}
                    />
                    {formErrors.dateOfBirth && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.dateOfBirth}</p>
                    )}
                  </div>
                </div>
                {/* Lieu de Naissance et Nationalité */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lieu de Naissance
                    </label>
                    <input
                      type="text"
                      value={formData.placeOfBirth}
                      onChange={(e) => handleInputChange("placeOfBirth", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                        formErrors.placeOfBirth ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Entrez votre lieu de naissance"
                      disabled={isLoading}
                    />
                    {formErrors.placeOfBirth && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.placeOfBirth}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nationalité
                    </label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => handleInputChange("nationality", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                        formErrors.nationality ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Entrez votre nationalité"
                      disabled={isLoading}
                    />
                    {formErrors.nationality && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.nationality}</p>
                    )}
                  </div>
                </div>
                {/* CNI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNI
                  </label>
                  <input
                    type="text"
                    value={formData.cni}
                    onChange={(e) => handleInputChange("cni", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                      formErrors.cni ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Entrez votre numéro de CNI"
                    disabled={isLoading}
                  />
                  {formErrors.cni && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.cni}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Champs d'Informations Professionnelles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de Médecin
                  </label>
                  <input
                    type="text"
                    value={doctorData.doctorNO}
                    onChange={(e) => handleInputChange("doctorNO", e.target.value, true)}
                    className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                      formErrors.doctorNO ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Entrez votre numéro de médecin"
                    disabled={isLoading}
                  />
                  {formErrors.doctorNO && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.doctorNO}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spécialité
                  </label>
                  <input
                    type="text"
                    value={doctorData.speciality}
                    onChange={(e) => handleInputChange("speciality", e.target.value, true)}
                    className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                      formErrors.speciality ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Entrez votre spécialité"
                    disabled={isLoading}
                  />
                  {formErrors.speciality && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.speciality}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID de Fédération
                  </label>
                  <input
                    type="text"
                    value={doctorData.doctorFederationID}
                    onChange={(e) => handleInputChange("doctorFederationID", e.target.value, true)}
                    className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                      formErrors.doctorFederationID ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Entrez votre ID de fédération"
                    disabled={isLoading}
                  />
                  {formErrors.doctorFederationID && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.doctorFederationID}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="text"
                      value={doctorData.doctorPhone}
                      onChange={(e) => handleInputChange("doctorPhone", e.target.value, true)}
                      className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                        formErrors.doctorPhone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Entrez votre numéro de téléphone"
                      disabled={isLoading}
                    />
                    {formErrors.doctorPhone && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.doctorPhone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone 2
                    </label>
                    <input
                      type="text"
                      value={doctorData.doctorPhone2}
                      onChange={(e) => handleInputChange("doctorPhone2", e.target.value, true)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors"
                      placeholder="Entrez votre second numéro de téléphone"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}
            {/* Boutons de Navigation */}
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
        {/* Indicateur du Bas */}
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
              {modalType === "success" && (
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              )}
              {modalType === "error" && (
                <XCircle className="h-12 w-12 text-red-500" />
              )}
            </div>
            <h3 className="text-lg font-medium text-center mb-2">
              {modalType === "success" && "Succès"}
              {modalType === "error" && "Erreur"}
            </h3>
            <p className="text-gray-600 text-center mb-6">{modalMessage}</p>
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

export default PersonalInfoForm;
