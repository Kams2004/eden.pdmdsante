import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import axiosInstance from '../../../../api/axioConfig';

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

const PersonalInfoForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: '',
    cni: '',
  });

  const [doctorData, setDoctorData] = useState<DoctorInfo>({
    doctorNO: '',
    speciality: '',
    doctorFederationID: '',
    doctorPhone: '',
    doctorPhone2: '',
  });

  const totalSteps = 2;

  const getDoctorId = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      return userData.doctor_id || userData.id || userData.user_id;
    } catch (error) {
      console.error('Error getting doctor ID:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      const doctorId = getDoctorId();
      if (!doctorId) {
        setError('Doctor ID not found');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/doctors/informations/${doctorId}`);
        const doctorData = response.data;

        const formatDate = (dateString: string | null) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        setFormData({
          firstName: doctorData.DoctorName || '',
          lastName: doctorData.DoctorLastname || '',
          email: doctorData.DoctorEmail || '',
          dateOfBirth: formatDate(doctorData.DoctorDOB),
          placeOfBirth: doctorData.DoctorPOB || '',
          nationality: doctorData.DoctorNat || '',
          cni: doctorData.DoctorCNI || '',
        });

        setDoctorData({
          doctorNO: doctorData.DoctorNO || '',
          speciality: doctorData.Speciality || '',
          doctorFederationID: doctorData.DoctorFederationID || '',
          doctorPhone: doctorData.DoctorPhone || '',
          doctorPhone2: doctorData.DoctorPhone2 || '',
        });
      } catch (error) {
        console.error('Error fetching doctor information:', error);
        setError('Failed to load doctor information');
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

  const handleInputChange = (field: keyof PersonalInfo | keyof DoctorInfo, value: string, isDoctorInfo: boolean = false) => {
    if (isDoctorInfo) {
      setDoctorData(prev => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
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
    const doctorId = getDoctorId();
    if (!doctorId) {
      setError('Doctor ID not found');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

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

      await axiosInstance.put(`/doctors/update/${doctorId}`, updateData);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating doctor information:', error);
      setError('Failed to update doctor information');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      {isLoading && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span className="text-sm">Loading doctor information...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed top-30 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          Doctor information updated successfully!
        </div>
      )}
      {/* Step Indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2].map((step) => (
            <div
              key={step}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                step === currentStep
                  ? 'bg-blue-500 text-white'
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
      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          {currentStep === 1 ? 'Personal Information' : 'Doctor Information'}
        </h2>
        {currentStep === 1 ? (
          <div className="space-y-6">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your first name"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your last name"
                  disabled={isLoading}
                />
              </div>
            </div>
            {/* Email & Date of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="mm/dd/yyyy"
                  disabled={isLoading}
                />
              </div>
            </div>
            {/* Place of Birth & Nationality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Place of Birth
                </label>
                <input
                  type="text"
                  value={formData.placeOfBirth}
                  onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your place of birth"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your nationality"
                  disabled={isLoading}
                />
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
                onChange={(e) => handleInputChange('cni', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your CNI number"
                disabled={isLoading}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Doctor Information Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor Number
              </label>
              <input
                type="text"
                value={doctorData.doctorNO}
                onChange={(e) => handleInputChange('doctorNO', e.target.value, true)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your doctor number"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speciality
              </label>
              <input
                type="text"
                value={doctorData.speciality}
                onChange={(e) => handleInputChange('speciality', e.target.value, true)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your speciality"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor Federation ID
              </label>
              <input
                type="text"
                value={doctorData.doctorFederationID}
                onChange={(e) => handleInputChange('doctorFederationID', e.target.value, true)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your doctor federation ID"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Phone
                </label>
                <input
                  type="text"
                  value={doctorData.doctorPhone}
                  onChange={(e) => handleInputChange('doctorPhone', e.target.value, true)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Phone 2
                </label>
                <input
                  type="text"
                  value={doctorData.doctorPhone2}
                  onChange={(e) => handleInputChange('doctorPhone2', e.target.value, true)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your secondary phone number"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        )}
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1 || isLoading}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors !rounded-button"
          >
            Previous
          </button>
          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors !rounded-button"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors !rounded-button flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          )}
        </div>
      </div>
      {/* Bottom Indicator */}
      <div className="flex justify-center mt-6">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
