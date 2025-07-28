import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axioConfig';
import { Plus, Pencil, Trash2, Search, MoreVertical } from 'lucide-react';
import UserModal from '../../components/admin/UserModal';
import DeleteConfirmationModal from '../../pages/admin/DeleteConfirmationModal';
import Notification from '../../pages/admin/Notification';

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: Role[];
  doctor_id: number | null;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error'; } | null>(null);
  const [showAllPages, setShowAllPages] = useState(false);
  const itemsPerPage = 6;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/users/all');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showNotification('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalMode('edit');
    setShowModal(true);
  };

  const confirmDelete = (userId: number) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await axiosInstance.delete(`/users/del/${userToDelete}`);
      setUsers(users.filter(user => user.id !== userToDelete));
      showNotification('User deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete user:', error);
      showNotification('Failed to delete user', 'error');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 6000);
  };

  const handleUserUpdate = () => {
    fetchUsers();
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.roles.some(role => role.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = showAllPages ? totalPages : 5;

    for (let i = 1; i <= Math.min(maxVisiblePages, totalPages); i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-lg text-sm ${
            currentPage === i ? 'bg-blue-500 text-white' : 'border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    if (!showAllPages && totalPages > 5) {
      pageNumbers.push(
        <button
          key="more"
          onClick={() => setShowAllPages(true)}
          className="px-3 py-1 rounded-lg border border-gray-300 text-sm"
        >
          ...
        </button>
      );
    }

    if (showAllPages && totalPages > 5) {
      pageNumbers.push(
        <button
          key="less"
          onClick={() => setShowAllPages(false)}
          className="px-3 py-1 rounded-lg border border-gray-300 text-sm"
        >
          Show Less
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto relative">
      {/* Loading indicator */}
      {loading && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span className="text-sm">Loading users data...</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
        <button
          onClick={() => {
            setModalMode('add');
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{`${user.first_name} ${user.last_name}`}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(role => (
                        <span key={role.id} className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-lg"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(user.id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 px-4">
          <div className="flex items-center text-sm text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

    <UserModal
  isOpen={showModal}
  onClose={() => {
    setShowModal(false);
    setEditingUser(null);
  }}
  initialData={editingUser}
  mode={modalMode}
  showNotification={showNotification}
  onUserUpdate={handleUserUpdate}
/>


      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDelete}
        itemName="user"
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default Users;