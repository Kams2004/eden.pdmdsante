import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axioConfig';
import { X } from 'lucide-react';

interface Role {
  id: number;
  name: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  mode: 'add' | 'edit';
  showNotification: (message: string, type: 'success' | 'error') => void;
  onUserUpdate: () => void; // Callback to refresh user data
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  initialData,
  mode,
  showNotification,
  onUserUpdate
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    roles: [] as string[],
  });

  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchRoles = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get('/roles/');
          setAvailableRoles(response.data);
        } catch (error) {
          console.error('Failed to fetch roles:', error);
          showNotification('Failed to fetch roles', 'error');
        } finally {
          setLoading(false);
        }
      };

      fetchRoles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        email: initialData.email || '',
        roles: Array.from(new Set(initialData.roles?.map((r: Role) => r.name))) || [],
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        roles: [],
      });
    }
  }, [initialData]);

  const handleRoleChange = (roleName: string) => {
    setFormData(prev => {
      const rolesSet = new Set(prev.roles);
      if (rolesSet.has(roleName)) {
        rolesSet.delete(roleName);
      } else {
        rolesSet.add(roleName);
      }
      return {
        ...prev,
        roles: Array.from(rolesSet),
      };
    });
  };

  const handleSubmit = async () => {
    try {
      if (mode === 'edit' && initialData) {
        await axiosInstance.put(`/users/mod/${initialData.id}`, formData);
        showNotification('User updated successfully', 'success');
      } else {
        const response = await axiosInstance.post('/signup', formData);
        if (response.status === 200) {
          showNotification('User added successfully', 'success');
        }
      }
      onClose();
      onUserUpdate(); // Refresh the user data
    } catch (error) {
      console.error('Failed to update user:', error);
      showNotification('Failed to update user', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'add' ? 'Add New User' : 'Edit User'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Roles
            </label>
            {loading ? (
              <div className="text-gray-500">Loading roles...</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {availableRoles.map(role => (
                  <label key={role.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(role.name)}
                      onChange={() => handleRoleChange(role.name)}
                      className="rounded text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{role.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {mode === 'add' ? 'Add User' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
