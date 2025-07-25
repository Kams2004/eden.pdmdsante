import React, { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import axiosInstance from '../../api/axioConfig'; // Import the configured axios instance

interface Request {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  message: string;
  administration: boolean;
  commission: boolean;
  connection: boolean;
  revendication_examen: boolean;
  suggestion: boolean;
  error: boolean;
  valide: boolean;
  CreatedAt: string | null;
  UpdateAt: string | null;
  type: string;
  status: 'pending' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
}

const Requests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all'); // Add type filter
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axiosInstance.get('/requete/');
        const formattedRequests = response.data.map((req: any) => ({
          ...req,
          type: determineRequestType(req),
          status: req.valide ? 'resolved' : 'pending',
          priority: determinePriority(req),
        }));
        setRequests(formattedRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    fetchRequests();
  }, []);

  const determineRequestType = (req: Request) => {
    if (req.connection) return 'Demande de Connexion';
    if (req.commission) return 'Commission Mismatch';
    if (req.revendication_examen) return 'Patient Record Issue';
    if (req.suggestion) return 'Payment Delay';
    if (req.error) return 'System Error';
    if (req.administration) return 'Administrative Request';
    return 'Unknown Request';
  };

  const determinePriority = (req: Request) => {
    const type = determineRequestType(req);
    switch (type) {
      case 'System Error':
        return 'high';
      case 'Commission Mismatch':
      case 'Patient Record Issue':
        return 'medium';
      default:
        return 'low';
    }
  };

  const handleApprove = async (requestId: number) => {
    try {
      const response = await axiosInstance.put(`/requete/validate/${requestId}`);
      if (response.status === 200) {
        setRequests(requests.map(request =>
          request.id === requestId
            ? { ...request, status: 'resolved', valide: true, UpdateAt: response.data.UpdateAt }
            : request
        ));
      }
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await axiosInstance.delete(`/requete/del/${requestId}`);
      setRequests(requests.filter(request => request.id !== requestId));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  // Get unique request types for the filter dropdown
  const getUniqueRequestTypes = () => {
    const types = requests.map(request => request.type);
    return [...new Set(types)].sort();
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    const matchesSearch =
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${request.first_name} ${request.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
    return (
      <div className="flex justify-center mt-4">
        <nav className="block">
          <ul className="flex pl-0 rounded list-none flex-wrap">
            <li>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`first:ml-0 text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid border-blue-500 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 bg-white hover:bg-blue-50'}`}
              >
                <span className="text-lg">«</span>
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, index) => (
              <li key={index}>
                <button
                  onClick={() => onPageChange(index + 1)}
                  className={`first:ml-0 text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 hover:bg-blue-50'}`}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`first:ml-0 text-xs font-semibold flex w-8 h-8 mx-1 p-0 rounded-full items-center justify-center leading-tight relative border border-solid border-blue-500 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 bg-white hover:bg-blue-50'}`}
              >
                <span className="text-lg">»</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Requests Management</h1>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
          
          {/* Add Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {getUniqueRequestTypes().map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          
          {/* Clear Filters Button */}
          <button 
            onClick={() => {
              setStatusFilter('all');
              setTypeFilter('all');
              setSearchTerm('');
              setCurrentPage(1);
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Clear Filters
          </button>
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-gray-500">
          Showing {currentRequests.length} of {filteredRequests.length} requests
          {filteredRequests.length !== requests.length && ` (filtered from ${requests.length} total)`}
        </div>

        <div className="space-y-4 mb-4">
          {currentRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No requests found matching your criteria.</p>
            </div>
          ) : (
            currentRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <MessageSquare className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{request.type}</h3>
                      <p className="text-sm text-gray-600 mt-1">{request.message}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        From: {(request.commission || request.error || request.revendication_examen) ? `Dr. ${request.first_name} ${request.last_name}` : `${request.first_name} ${request.last_name}`}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Email: {request.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(request.status)}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      request.priority === 'high' ? 'bg-red-100 text-red-800' :
                      request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {request.priority}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>Created: {request.CreatedAt || 'N/A'}</span>
                  <span>Last Updated: {request.UpdateAt || 'N/A'}</span>
                </div>

                {request.status === 'pending' && (
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="px-4 py-2 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default Requests;