import { useState, useEffect } from "react";
import { Save, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import axiosInstance from '../../api/axioConfig';

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
}

interface SettingsViewProps {
  onProfileUpdate?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onProfileUpdate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
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

  const checkDoctorProfileComplete = (doctorData: DoctorData): boolean => {
    const requiredFields = [
      { key: 'DoctorName', label: 'Prénom' },
      { key: 'DoctorLastname', label: 'Nom' },
      { key: 'DoctorEmail', label: 'Email' },
      { key: 'DoctorCNI', label: 'CNI' },
      { key: 'DoctorNO', label: 'Numéro de Médecin' },
      { key: 'Speciality', label: 'Spécialité' },
      { key: 'DoctorPhone', label: 'Téléphone Principal' }
    ];

    const missing = requiredFields.filter(field => 
      !doctorData[field.key] || doctorData[field.key].trim() === ''
    ).map(field => field.label);

    setMissingFields(missing);
    return missing.length === 0 && doctorData.ModifiedAt !== null;
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

    const missing = requiredFields.filter(field => 
      !formData[field.key] || formData[field.key].trim() === ''
    ).map(field => field.label);

    setMissingFields(missing);
    return missing.length === 0;
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
      console.error('Erreur lors de la récupération de l\'ID du médecin:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      const doctorId = getDoctorId();
      if (!doctorId) {
        setError('ID du médecin non trouvé');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await axiosInstance.get<DoctorData>(`/doctors/informations/${doctorId}`);
        const doctorData: DoctorData = response.data;

        // Check if profile is incomplete
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
        console.error('Erreur lors de la récupération des informations du médecin:', error);
        setError('Échec du chargement des informations du médecin');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorInfo();
  }, []);

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    // Validate form data before saving
    if (!validateCurrentFormData()) {
      setError(`Veuillez remplir tous les champs obligatoires: ${missingFields.join(', ')}`);
      return;
    }

    const doctorId = getDoctorId();
    if (!doctorId) {
      setError('ID du médecin non trouvé');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
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
      
      // Update localStorage with new doctor data
      if (response.data && response.data.Doctor) {
        localStorage.setItem('doctorData', JSON.stringify(response.data.Doctor));
        localStorage.setItem('isProfileComplete', 'true');
        localStorage.removeItem('showSettingsFirst');
      }

      setShowSuccessModal(true);
      setIsProfileIncomplete(false);
      setMissingFields([]);

      // Call the callback to update parent component
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des informations du médecin:', error);
      setError('Échec de la mise à jour des informations du médecin');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {isLoading && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              <span className="text-sm">Chargement des informations du médecin...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isProfileIncomplete && missingFields.length > 0 && (
          <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <strong>Profil incomplet!</strong>
                <p className="text-sm mt-1">
                  Veuillez remplir les champs obligatoires suivants: {missingFields.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {showSuccessModal && (
          <div className="fixed top-30 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
            Informations du médecin mises à jour avec succès !
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
          {/* Éléments de motif colorés à l'intérieur du conteneur */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-20"></div>
            <div className="absolute top-8 right-8 w-12 h-12 bg-gradient-to-br from-red-200 to-red-300 rounded-full opacity-25"></div>
            <div className="absolute bottom-12 left-12 w-20 h-20 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full opacity-20"></div>
            <div className="absolute bottom-4 right-4 w-14 h-14 bg-gradient-to-br from-green-200 to-green-300 rounded-full opacity-25"></div>
            <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full opacity-30"></div>
            <div className="absolute top-1/3 right-1/3 w-10 h-10 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full opacity-25"></div>
            {/* Formes géométriques */}
            <div className="absolute top-16 left-1/2 w-6 h-6 bg-gradient-to-br from-blue-300 to-blue-400 opacity-20 transform rotate-45"></div>
            <div className="absolute bottom-16 right-1/4 w-8 h-8 bg-gradient-to-br from-red-300 to-red-400 opacity-20 transform rotate-12"></div>
            <div className="absolute top-3/4 left-1/3 w-7 h-7 bg-gradient-to-br from-yellow-300 to-yellow-400 opacity-25 rounded-lg transform rotate-45"></div>
            {/* Superposition de motif subtil */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/30 via-transparent to-red-50/30"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-3 shadow-md"></div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {getStepTitle()}
              </h2>
            </div>

            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Prénom et Nom */}
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
                        missingFields.includes('Prénom') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Entrez votre prénom"
                      disabled={isLoading}
                      required
                    />
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
                        missingFields.includes('Nom') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Entrez votre nom"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* Email et Date de Naissance */}
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
                        missingFields.includes('Email') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Entrez votre email"
                      disabled={isLoading}
                      required
                    />
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

                {/* Lieu de Naissance et Nationalité */}
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

                {/* CNI */}
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
                      missingFields.includes('CNI') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Entrez votre numéro de CNI"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Numéro de Médecin et Spécialité */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de Médecin (ONMC) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="doctorNO"
                      value={formData.doctorNO}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                        missingFields.includes('Numéro de Médecin') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Entrez votre numéro de médecin"
                      disabled={isLoading}
                      required
                    />
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
                        missingFields.includes('Spécialité') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Entrez votre spécialité"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* ID de Fédération */}
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
                {/* Numéros de Téléphone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone Principal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="doctorPhone"
                      value={formData.doctorPhone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-colors ${
                        missingFields.includes('Téléphone Principal') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Entrez votre numéro de téléphone principal"
                      disabled={isLoading}
                      required
                    />
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
    </div>
  );
};

export default SettingsView;