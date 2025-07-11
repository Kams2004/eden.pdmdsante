import React, { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
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

const SettingsView: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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

  const steps = [
    { title: "Personal Info" },
    { title: "Professional Info" },
    { title: "Contact Info" }
  ];

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
      const doctorData: DoctorData = response.data;

      // Function to format date as YYYY-MM-DD
      const formatDate = (dateString) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
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

      await axiosInstance.put(`/doctors/update/${doctorId}`, updateData);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating doctor information:', error);
      setError('Failed to update doctor information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      {/* Loading indicator - same style as patients view */}
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

      <div className="flex justify-center items-center gap-4 mb-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold cursor-pointer ${
              currentStep === index + 1 ? "bg-blue-500" : "bg-gray-300 hover:bg-blue-400"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => !isLoading && setCurrentStep(index + 1)}
          >
            {index + 1}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleFormSubmit}>
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="doctorLastname"
                    value={formData.doctorLastname}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="doctorEmail"
                    value={formData.doctorEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="doctorDOB"
                    value={formData.doctorDOB}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth</label>
                  <input
                    type="text"
                    name="doctorPOB"
                    value={formData.doctorPOB}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                  <input
                    type="text"
                    name="doctorNat"
                    value={formData.doctorNat}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNI</label>
                  <input
                    type="text"
                    name="doctorCNI"
                    value={formData.doctorCNI}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Number (ONMC)</label>
                  <input
                    type="text"
                    name="doctorNO"
                    value={formData.doctorNO}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Speciality</label>
                  <input
                    type="text"
                    name="speciality"
                    value={formData.speciality}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Federation ID</label>
                  <input
                    type="text"
                    name="doctorFederationID"
                    value={formData.doctorFederationID}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone</label>
                  <input
                    type="tel"
                    name="doctorPhone"
                    value={formData.doctorPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Phone</label>
                  <input
                    type="tel"
                    name="doctorPhone2"
                    value={formData.doctorPhone2}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handlePrev}
              className={`px-4 py-2 rounded-lg ${
                currentStep === 1 || isLoading ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-400"
              }`}
              disabled={currentStep === 1 || isLoading}
            >
              Previous
            </button>
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving || isLoading}
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
        </form>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              currentStep === index + 1 ? "bg-blue-500" : "bg-gray-300"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => !isLoading && setCurrentStep(index + 1)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default SettingsView;