import { useState, useRef, useEffect } from 'react';
import axiosInstance from '../../api/axioConfig';
import { Plus, Pencil, Trash2, Search, User as UserMd, Phone, Mail, Download, Check, X, AtSign, AlertTriangle } from 'lucide-react';

// Define the props for the ToggleSwitch component
interface ToggleSwitchProps {
  isOn: boolean;
  handleToggle: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, handleToggle }) => {
  return (
    <div className="flex items-center">
      <label className="text-sm text-gray-700 mr-2">Send Email</label>
      <div
        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${isOn ? 'bg-blue-500' : 'bg-gray-300'}`}
        onClick={handleToggle}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform ${isOn ? 'translate-x-6' : 'translate-x-0'}`}
        ></div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  doctorName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, doctorName, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
          <h2 className="text-xl font-bold text-gray-800">Confirm Deletion</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-semibold">{doctorName}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  email: string;
  phone: string;
  phone2?: string;
  status: 'active' | 'inactive';
  patients: number;
  joinDate: string;
  DoctorCNI?: string;
  DoctorDOB?: string;
  DoctorFederationID?: string;
  DoctorLastname?: string;
  DoctorName?: string;
  DoctorNat?: string;
  DoctorPOB?: string;
}

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newDoctorNO, setNewDoctorNO] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadSuccess, setLoadSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isStaticSearch, setIsStaticSearch] = useState(false);
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  
  const itemsPerPage = 6;
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoadingDoctors(true);
      try {
        const response = await axiosInstance.get('/doctors/');
        const fetchedDoctors = response.data.map((doc: any) => ({
          id: doc.id,
          name: `${doc.DoctorName} ${doc.DoctorLastname}`,
          DoctorName: doc.DoctorName,
          DoctorLastname: doc.DoctorLastname,
          speciality: doc.Speciality,
          email: doc.DoctorEmail,
          phone: doc.DoctorPhone,
          phone2: doc.DoctorPhone2,
          status: 'active',
          patients: 0,
          joinDate: doc.CreatedAt,
          DoctorCNI: doc.DoctorCNI,
          DoctorDOB: doc.DoctorDOB,
          DoctorFederationID: doc.DoctorFederationID,
          DoctorNat: doc.DoctorNat,
          DoctorPOB: doc.DoctorPOB,
        }));
        setDoctors(fetchedDoctors);
      } catch (err) {
        setError('Failed to fetch doctors');
        setTimeout(() => {
          setError(null);
        }, 5000);
      } finally {
        setIsLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchTerm('');
        setIsStaticSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isStaticSearch) {
      const results = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDoctors(results);
    }
  }, [searchTerm, doctors, isStaticSearch]);

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (doctorToDelete) {
      setDoctors(doctors.filter(doctor => doctor.id !== doctorToDelete.id));
      setIsDeleteModalOpen(false);
      setDoctorToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDoctorToDelete(null);
  };

  const handleLoadDoctors = async () => {
    setIsLoadingDoctors(true);
    try {
      const response = await axiosInstance.get('/doctors/');
      const fetchedDoctors = response.data.map((doc: any) => ({
        id: doc.id,
        name: `${doc.DoctorName} ${doc.DoctorLastname}`,
        speciality: doc.Speciality,
        email: doc.DoctorEmail,
        phone: doc.DoctorPhone,
        phone2: doc.DoctorPhone2,
        status: 'active',
        patients: 0,
        joinDate: doc.CreatedAt,
      }));
      setDoctors(fetchedDoctors);
      setLoadSuccess(true);
      setTimeout(() => {
        setLoadSuccess(false);
      }, 5000);
    } catch (err) {
      setError('Failed to load doctors');
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  const handleAddDoctor = async () => {
    if (!newDoctorNO.trim()) return;
    setIsAddingDoctor(true);
    try {
      const response = await axiosInstance.get(`/doctors/extract/${newDoctorNO}/`);
      if (response.status === 200) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
        setNewDoctorNO('');
        setShowAddInput(false);
        handleLoadDoctors();
      }
    } catch (err) {
      setError('Failed to add doctor');
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsAddingDoctor(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddDoctor();
    }
  };

  const handleSaveEdit = async () => {
    if (!editingDoctor) return;
    const updateData = {
      DoctorCNI: editingDoctor.DoctorCNI,
      DoctorDOB: editingDoctor.DoctorDOB,
      DoctorEmail: editingDoctor.email,
      DoctorLastname: editingDoctor.DoctorLastname,
      DoctorName: editingDoctor.DoctorName,
      DoctorNat: editingDoctor.DoctorNat,
      DoctorPOB: editingDoctor.DoctorPOB,
      DoctorPhone: editingDoctor.phone,
      DoctorPhone2: editingDoctor.phone2,
      Speciality: editingDoctor.speciality,
      id: editingDoctor.id,
    };
    try {
      const response = await axiosInstance.put(`/doctors/update/${editingDoctor.id}`, updateData);
      if (response.status === 200) {
        setDoctors(doctors.map(doctor => doctor.id === editingDoctor.id ? editingDoctor : doctor));
        setIsModalOpen(false);
        setUpdateSuccess(true);
        if (sendEmail) {
          await axiosInstance.post('/users/send_email/', { email: editingDoctor.email });
          setEmailSent(true);
        }
      }
    } catch (err) {
      setError('Failed to update doctor');
    } finally {
      setTimeout(() => {
        setUpdateSuccess(false);
        setEmailSent(false);
      }, 5000);
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSearchTerm(doctor.name);
    setFilteredDoctors([doctor]);
    setIsStaticSearch(true);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

  return (
    <div className="space-y-4 relative">
      {/* Error and success messages */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center">
          <span>{error}</span>
          <div className="ml-4 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-white" style={{ width: '100%', animation: 'progress 5s linear' }}></div>
          </div>
        </div>
      )}
      {loadSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center">
          <span>Doctors loaded successfully!</span>
          <div className="ml-4 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-white" style={{ width: '100%', animation: 'progress 5s linear' }}></div>
          </div>
        </div>
      )}
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2">
        {updateSuccess && (
          <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center">
            <span>Doctor updated successfully!</span>
          </div>
        )}
        {emailSent && (
          <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg flex items-center">
            <span>Email sent successfully!</span>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Doctors Management</h1>
        <div className="flex gap-4">
          <button
            onClick={handleLoadDoctors}
            disabled={isLoadingDoctors}
            className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 hover:bg-green-600 disabled:bg-green-300"
          >
            <Download className="w-4 h-4" />
            {isLoadingDoctors ? (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              </div>
            ) : (
              'Load Doctors'
            )}
          </button>
          <div className="relative">
            <button
              ref={addButtonRef}
              onClick={() => {
                setShowAddInput(true);
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              Add Doctor
            </button>
            {showAddInput && (
              <div className="absolute top-full mt-2 right-0 flex items-center bg-white rounded-lg shadow-lg border p-2 min-w-[300px]">
                <input
                  ref={inputRef}
                  type="text"
                  value={newDoctorNO}
                  onChange={(e) => setNewDoctorNO(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter doctor's ONMC"
                  className="flex-1 px-3 py-2 border-none focus:outline-none"
                />
                {newDoctorNO && (
                  <button
                    onClick={handleAddDoctor}
                    disabled={isAddingDoctor}
                    className="ml-2 p-2 text-green-600 hover:bg-green-50 rounded-full"
                  >
                    {isAddingDoctor ? (
                      <div className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce"></div>
                      </div>
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64" ref={searchContainerRef}>
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsStaticSearch(false);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchTerm && !isStaticSearch && filteredDoctors.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                {filteredDoctors.slice(0, 5).map((doctor) => (
                  <div
                    key={doctor.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    {doctor.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {filteredDoctors.length === 0 ? (
          <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
            <UserMd className="w-16 h-16 text-gray-300" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentDoctors.map((doctor) => (
              <div key={doctor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <UserMd className="w-4 h-4 text-blue-500 mr-2" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.speciality}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(doctor)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(doctor)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {doctor.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {doctor.phone}
                  </div>
                  {doctor.phone2 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {doctor.phone2}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    doctor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {doctor.status}
                  </span>
                  <span className="text-sm text-gray-500">{doctor.patients} patients</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-1 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 mx-1 bg-gray-100 rounded-lg">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-1 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Edit Doctor Modal */}
      {isModalOpen && editingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Doctor</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <div className="flex items-center">
                  <UserMd className="absolute left-3 w-4 h-4" />
                  <input
                    type="text"
                    value={editingDoctor.DoctorName || ''}
                    onChange={(e) => setEditingDoctor({...editingDoctor, DoctorName: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 pl-8"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <div className="flex items-center">
                  <UserMd className="absolute left-3 w-4 h-4" />
                  <input
                    type="text"
                    value={editingDoctor.DoctorLastname || ''}
                    onChange={(e) => setEditingDoctor({...editingDoctor, DoctorLastname: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 pl-8"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Speciality</label>
                <div className="flex items-center">
                  <AtSign className="absolute left-3 w-4 h-4" />
                  <input
                    type="text"
                    value={editingDoctor.speciality || ''}
                    onChange={(e) => setEditingDoctor({...editingDoctor, speciality: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 pl-8"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="flex items-center">
                  <Mail className="absolute left-3 w-4 h-4" />
                  <input
                    type="email"
                    value={editingDoctor.email || ''}
                    onChange={(e) => setEditingDoctor({...editingDoctor, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 pl-8"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <div className="flex items-center">
                  <Phone className="absolute left-3 w-4 h-4" />
                  <input
                    type="text"
                    value={editingDoctor.phone || ''}
                    onChange={(e) => setEditingDoctor({...editingDoctor, phone: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 pl-8"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Secondary Phone</label>
                <div className="flex items-center">
                  <Phone className="absolute left-3 w-4 h-4" />
                  <input
                    type="text"
                    value={editingDoctor.phone2 || ''}
                    onChange={(e) => setEditingDoctor({...editingDoctor, phone2: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 pl-8"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">CNI</label>
                <div className="flex items-center">
                  <UserMd className="absolute left-3 w-4 h-4" />
                  <input
                    type="text"
                    value={editingDoctor.DoctorCNI || ''}
                    onChange={(e) => setEditingDoctor({...editingDoctor, DoctorCNI: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 pl-8"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <div className="flex items-center">
                  <UserMd className="absolute left-3 w-4 h-4" />
                  <input
                    type="text"
                    value={editingDoctor.DoctorDOB || ''}
                    onChange={(e) => setEditingDoctor({...editingDoctor, DoctorDOB: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 pl-8"
                  />
                </div>
              </div>
              <div className="md:col-span-2 flex items-center space-x-2">
                <ToggleSwitch isOn={sendEmail} handleToggle={() => setSendEmail(!sendEmail)} />
              </div>
              <div className="md:col-span-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        doctorName={doctorToDelete?.name || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default Doctors;