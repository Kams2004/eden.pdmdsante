import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Shield } from 'lucide-react';
import Toast from '../../components/UI/Toast';
import ConfirmModal from '../../components/UI/ConfirmModal';
import { useLanguage } from '../../context/LanguageContext';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
  createdAt: string;
}

const Roles: React.FC = () => {
  const { t } = useLanguage();
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: ['all'],
      usersCount: 5,
      createdAt: '2024-03-15'
    },
    {
      id: '2',
      name: 'Doctor',
      description: 'Access to patient records and medical features',
      permissions: ['read_patients', 'write_patients', 'read_medical'],
      usersCount: 45,
      createdAt: '2024-03-14'
    },
    {
      id: '3',
      name: 'Nurse',
      description: 'Limited access to patient records',
      permissions: ['read_patients', 'write_basic'],
      usersCount: 30,
      createdAt: '2024-03-13'
    },
    {
      id: '4',
      name: 'Receptionist',
      description: 'Front desk and appointment management',
      permissions: ['read_appointments', 'write_appointments'],
      usersCount: 10,
      createdAt: '2024-03-12'
    },
    {
      id: '5',
      name: 'Accountant',
      description: 'Financial and billing access',
      permissions: ['read_financial', 'write_financial'],
      usersCount: 8,
      createdAt: '2024-03-11'
    },
    {
      id: '6',
      name: 'Lab Technician',
      description: 'Laboratory results and test management',
      permissions: ['read_lab', 'write_lab'],
      usersCount: 15,
      createdAt: '2024-03-10'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleShowToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    if (selectedRole) {
      setRoles(roles.filter(role => role.id !== selectedRole.id));
      handleShowToast('Role deleted successfully');
    }
  };

  const handleSave = (roleData: Partial<Role>) => {
    if (selectedRole) {
      // Update existing role
      setRoles(roles.map(role => 
        role.id === selectedRole.id ? { ...role, ...roleData } : role
      ));
      handleShowToast('Role updated successfully');
    } else {
      // Add new role
      const newRole: Role = {
        id: String(roles.length + 1),
        name: roleData.name || '',
        description: roleData.description || '',
        permissions: roleData.permissions || [],
        usersCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setRoles([...roles, newRole]);
      handleShowToast('Role created successfully');
    }
    setShowModal(false);
    setSelectedRole(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('roles')}</h1>
        <button
          onClick={() => {
            setSelectedRole(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          {t('addNew')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div key={role.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-blue-500 mr-2" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{role.name}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedRole(role);
                      setShowModal(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(role)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((permission, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>{role.usersCount} users</span>
                <span>Created {role.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedRole ? t('edit') : t('addNew')} {t('roles')}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const roleData = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                permissions: Array.from(formData.getAll('permissions') as string[]),
              };
              handleSave(roleData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedRole?.name}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    defaultValue={selectedRole?.description}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="space-y-2">
                    {['read_patients', 'write_patients', 'read_medical', 'write_medical', 'read_financial', 'write_financial'].map((permission) => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          name="permissions"
                          value={permission}
                          defaultChecked={selectedRole?.permissions.includes(permission)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRole(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {selectedRole ? t('save') : t('addNew')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDelete}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${selectedRole?.name}"? This action cannot be undone.`}
      />

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
          duration={3000}
        />
      )}
    </div>
  );
};

export default Roles;