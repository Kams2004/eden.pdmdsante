// PersonalInfoForm.tsx
'use client';
import { useState } from 'react';

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

export default function PersonalInfoForm() {
  const [formData, setFormData] = useState<PersonalInfo>({
    firstName: 'Dr. LECKPA',
    lastName: 'HERMINE',
    email: 'kamsu.perold@pdmdsante.com',
    dateOfBirth: '',
    placeOfBirth: 'Cameroun',
    nationality: 'Cameroun',
    cni: '1234'
  });

  const [doctorData, setDoctorData] = useState<DoctorInfo>({
    doctorNO: '',
    speciality: '',
    doctorFederationID: '',
    doctorPhone: '',
    doctorPhone2: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const handleInputChange = (field: keyof PersonalInfo | keyof DoctorInfo, value: string, isDoctorInfo: boolean = false) => {
    if (isDoctorInfo) {
      setDoctorData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
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

  const handleSave = () => {
    console.log('Form data saved:', { formData, doctorData });
    // Add your save logic here
  };

  return (
    <div className="w-full max-w-2xl">
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
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors !rounded-button"
          >
            Previous
          </button>
          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors !rounded-button"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors !rounded-button"
            >
              Save
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
}
