import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Shield } from 'lucide-react';
import Toast from '../../components/UI/Toast';
import ConfirmModal from '../../components/UI/ConfirmModal';
import { useLanguage } from '../../context/LanguageContext';
import Pagination from '../UI/Pagination';

// ... (keep existing interfaces and initial state)

const Roles: React.FC = () => {
  // ... (keep existing state and functions)

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentRoles = filteredRoles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);

  return (
    <div className="space-y-4">
      {/* ... (keep existing header) */}

      <div className="bg-white rounded-xl shadow-md p-6">
        {/* ... (keep existing search bar) */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {currentRoles.map((role) => (
            // ... (keep existing role card)
          ))}
        </div>

        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredRoles.length}
          />
        </div>
      </div>

      {/* ... (keep existing modals and toasts) */}
    </div>
  );
};

export default Roles;