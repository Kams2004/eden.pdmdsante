import React, { useState } from 'react';
import { Search, Filter, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Request {
  id: string;
  type: string;
  description: string;
  doctor: string;
  status: 'pending' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

const Requests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([
    {
      id: '1',
      type: 'System Access',
      description: 'Request for additional system permissions',
      doctor: 'Dr. John Smith',
      status: 'pending',
      priority: 'high',
      createdAt: '2024-03-15 10:30',
      updatedAt: '2024-03-15 10:30'
    },
    {
      id: '2',
      type: 'Equipment Access',
      description: 'Request for MRI machine access',
      doctor: 'Dr. Sarah Johnson',
      status: 'pending',
      priority: 'medium',
      createdAt: '2024-03-14 15:45',
      updatedAt: '2024-03-14 15:45'
    },
    {
      id: '3',
      type: 'Patient Transfer',
      description: 'Request for patient transfer approval',
      doctor: 'Dr. Michael Brown',
      status: 'resolved',
      priority: 'high',
      createdAt: '2024-03-13 09:15',
      updatedAt: '2024-03-13 14:30'
    },
    {
      id: '4',
      type: 'Schedule Change',
      description: 'Request for emergency schedule adjustment',
      doctor: 'Dr. Emily Davis',
      status: 'pending',
      priority: 'low',
      createdAt: '2024-03-12 11:20',
      updatedAt: '2024-03-12 11:20'
    },
    {
      id: '5',
      type: 'Software Access',
      description: 'Request for specialized software access',
      doctor: 'Dr. Robert Wilson',
      status: 'rejected',
      priority: 'medium',
      createdAt: '2024-03-11 16:00',
      updatedAt: '2024-03-11 17:30'
    },
    {
      id: '6',
      type: 'Department Transfer',
      description: 'Request for department change approval',
      doctor: 'Dr. Lisa Anderson',
      status: 'pending',
      priority: 'high',
      createdAt: '2024-03-10 13:45',
      updatedAt: '2024-03-10 13:45'
    }
  ]);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleApprove = (requestId: string) => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, status: 'resolved', updatedAt: new Date().toLocaleString() }
        : request
    ));
  };

  const handleReject = (requestId: string) => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, status: 'rejected', updatedAt: new Date().toLocaleString() }
        : request
    ));
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

  const filteredRequests = requests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesSearch = 
      request.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>

        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <MessageSquare className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{request.type}</h3>
                    <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                    <p className="text-sm text-gray-500 mt-2">From: {request.doctor}</p>
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
                <span>Created: {request.createdAt}</span>
                <span>Last Updated: {request.updatedAt}</span>
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default Requests;