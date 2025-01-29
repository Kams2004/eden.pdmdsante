import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Search, User as UserMd, Phone, Mail } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  patients: number;
  joinDate: string;
}

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: '1',
      name: 'Dr. John Smith',
      speciality: 'Cardiology',
      email: 'john.smith@example.com',
      phone: '+1234567890',
      status: 'active',
      patients: 45,
      joinDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Dr. Sarah Johnson',
      speciality: 'Neurology',
      email: 'sarah.j@example.com',
      phone: '+1234567891',
      status: 'active',
      patients: 38,
      joinDate: '2024-02-01'
    },
    {
      id: '3',
      name: 'Dr. Michael Brown',
      speciality: 'Pediatrics',
      email: 'm.brown@example.com',
      phone: '+1234567892',
      status: 'inactive',
      patients: 25,
      joinDate: '2024-02-15'
    },
    {
      id: '4',
      name: 'Dr. Emily Davis',
      speciality: 'Dermatology',
      email: 'emily.d@example.com',
      phone: '+1234567893',
      status: 'active',
      patients: 52,
      joinDate: '2024-01-20'
    },
    {
      id: '5',
      name: 'Dr. Robert Wilson',
      speciality: 'Orthopedics',
      email: 'r.wilson@example.com',
      phone: '+1234567894',
      status: 'active',
      patients: 41,
      joinDate: '2024-02-10'
    },
    {
      id: '6',
      name: 'Dr. Lisa Anderson',
      speciality: 'Ophthalmology',
      email: 'l.anderson@example.com',
      phone: '+1234567895',
      status: 'active',
      patients: 33,
      joinDate: '2024-03-01'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setShowModal(true);
  };

  const handleDelete = (doctorId: string) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      setDoctors(doctors.filter(doctor => doctor.id !== doctorId));
    }
  };

  const handleSave = (doctorData: Doctor) => {
    if (editingDoctor) {
      // Update existing doctor
      setDoctors(doctors.map(doctor => 
        doctor.id === editingDoctor.id ? { ...doctor, ...doctorData } : doctor
      ));
    } else {
      // Add new doctor
      setDoctors([...doctors, { ...doctorData, id: String(doctors.length + 1) }]);
    }
    setShowModal(false);
    setEditingDoctor(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Doctors Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Add Doctor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <UserMd className="w-5 h-5 text-blue-500 mr-2" />
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
                    onClick={() => handleDelete(doctor.id)}
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
      </div>

      {/* Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const doctorData = {
                name: formData.get('name') as string,
                speciality: formData.get('speciality') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                status: formData.get('status') as 'active' | 'inactive',
                patients: parseInt(formData.get('patients') as string),
                joinDate: new Date().toISOString().split('T')[0],
                id: editingDoctor?.id || String(doctors.length + 1)
              };
              handleSave(doctorData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingDoctor?.name}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Speciality</label>
                  <input
                    type="text"
                    name="speciality"
                    defaultValue={editingDoctor?.speciality}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingDoctor?.email}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingDoctor?.phone}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    defaultValue={editingDoctor?.status || 'active'}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patients</label>
                  <input
                    type="number"
                    name="patients"
                    defaultValue={editingDoctor?.patients || 0}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDoctor(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingDoctor ? 'Save Changes' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;