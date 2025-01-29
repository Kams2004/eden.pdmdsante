import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Search, User as UserMd, Phone, Mail } from 'lucide-react';
import Pagination from '../UI/Pagination';

// ... (keep existing interfaces and initial state)

const Doctors: React.FC = () => {
  // ... (keep existing state and functions)

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Calculate pagination
  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

  return (
    <div className="space-y-4">
      {/* ... (keep existing header) */}

      <div className="bg-white rounded-xl shadow-md p-6">
        {/* ... (keep existing search bar) */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {currentDoctors.map((doctor) => (
            // ... (keep existing doctor card)
          ))}
        </div>

        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredDoctors.length}
          />
        </div>
      </div>

      {/* ... (keep existing modals) */}
    </div>
  );
};

export default Doctors;