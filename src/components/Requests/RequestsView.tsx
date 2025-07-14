import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, Clock, CheckCircle, XCircle, Filter, Search, MessageSquare } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import Pagination from '../UI/Pagination';
import axiosInstance from '../../api/axioConfig';

interface Request {
  id: string;
  type: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  customMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiRequest {
  CreatedAt: string;
  CreatedBy: number;
  UpdatedAt: string | null;
  UpdatedBy: number | null;
  administration: boolean;
  commission: boolean;
  connection: boolean;
  email: string;
  error: boolean;
  first_name: string;
  id: number;
  last_name: string;
  message: string;
  revendication_examen: boolean;
  suggestion: boolean;
  valide: boolean;
}

const predefinedRequests = [
  {
    id: 'commission-mismatch',
    title: 'Commission Mismatch',
    description: 'Report a discrepancy between displayed and received commissions'
  },
  {
    id: 'patient-record',
    title: 'Patient Record Issue',
    description: 'Report issues with patient records or missing information'
  },
  {
    id: 'system-error',
    title: 'System Error',
    description: 'Report technical issues or system malfunctions'
  },
  {
    id: 'payment-delay',
    title: 'Payment Delay',
    description: 'Report delays in commission payments'
  }
];

const RequestsView: React.FC = () => {
  const { showSuccessToast, showErrorToast, ToastComponent } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('low');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false); // Loading state
  const itemsPerPage = 5;
  const [sentRequests, setSentRequests] = useState<Request[]>([]);

  const fetchUserRequests = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = userData.id;

      if (userId) {
        const response = await axiosInstance.get<ApiRequest[]>(`/requete/get_requests/${userId}`);
        const requests = response.data.map((req: ApiRequest) => ({
          id: String(req.id),
          type: req.commission ? 'Commission Mismatch' :
                req.revendication_examen ? 'Patient Record Issue' :
                req.error ? 'System Error' : 'Payment Delay',
          description: req.message,
          urgency: 'low',
          status: req.valide ? 'approved' : 'pending',
          customMessage: req.message,
          createdAt: req.CreatedAt,
          updatedAt: req.UpdatedAt || req.CreatedAt
        }));
        setSentRequests(requests);
      }
    } catch (error) {
      console.error('Error fetching user requests:', error);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !customMessage) return;

    setLoading(true); // Set loading to true when starting the request

    const selectedPredefinedRequest = predefinedRequests.find(r => r.id === selectedRequest);
    if (!selectedPredefinedRequest) {
      setLoading(false);
      return;
    }

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const { email, first_name, last_name } = userData;

    const requestData = {
      administration: false,
      commission: selectedRequest === 'commission-mismatch',
      connection: false,
      email,
      error: selectedRequest === 'system-error',
      first_name,
      last_name,
      message: customMessage,
      revendication_examen: selectedRequest === 'patient-record',
      suggestion: selectedRequest === 'payment-delay'
    };

    try {
      const response = await axiosInstance.post('/requete/add', requestData);
      showSuccessToast('Request sent successfully');

      // Refetch requests to update the list
      await fetchUserRequests();

      // Reset form
      setSelectedRequest('');
      setCustomMessage('');
      setUrgency('low');
    } catch (error) {
      console.error('Error sending request:', error);
      showErrorToast('Failed to send request');
    } finally {
      setLoading(false); // Set loading to false when the request is completed
    }
  };

  const filteredRequests = sentRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesSearch =
      request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.customMessage || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      {/* New Request Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Submit New Request</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predefinedRequests.map((request) => (
              <div
                key={request.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedRequest === request.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedRequest(request.id)}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 mt-0.5 ${
                    selectedRequest === request.id ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <div>
                    <h3 className="font-medium text-gray-900">{request.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{request.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level
            </label>
            <div className="flex gap-4">
              {['low', 'medium', 'high'].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`px-4 py-2 rounded-full capitalize ${
                    urgency === level
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setUrgency(level as 'low' | 'medium' | 'high')}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please provide any additional information about your request..."
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedRequest || !customMessage || loading}
              className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Sent Requests List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Sent Requests</h2>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="space-y-4">
          {currentRequests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <MessageSquare className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{request.type}</h3>
                    <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                    {request.customMessage && (
                      <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                        {request.customMessage}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {request.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {request.status === 'rejected' && <XCircle className="w-5 h-5 text-red-500" />}
                  {request.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    request.urgency === 'high' ? 'bg-red-100 text-red-800' :
                    request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {request.urgency}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>Created: {request.createdAt}</span>
                <span>Last Updated: {request.updatedAt}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredRequests.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredRequests.length}
          />
        </div>
      </div>
      {ToastComponent}
    </div>
  );
};

export default RequestsView;
