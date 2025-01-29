import React, { useState } from 'react';
import { Search, Filter, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import Pagination from '../UI/Pagination';

// ... (keep existing interfaces and initial state)

const Requests: React.FC = () => {
  // ... (keep existing state and functions)

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination
  const filteredRequests = requests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesSearch = 
      request.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  return (
    <div className="space-y-4">
      {/* ... (keep existing header) */}

      <div className="bg-white rounded-xl shadow-md p-6">
        {/* ... (keep existing filters) */}

        <div className="space-y-4 mb-4">
          {currentRequests.map((request) => (
            // ... (keep existing request card)
          ))}
        </div>

        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredRequests.length}
          />
        </div>
      </div>
    </div>
  );
};

export default Requests;