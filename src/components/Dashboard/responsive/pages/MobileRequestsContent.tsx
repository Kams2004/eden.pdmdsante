import React, { useState } from 'react';
import { Send, AlertCircle, Clock, CheckCircle, XCircle, Search, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

const predefinedCommissions = [
  {
    id: 'commission-mismatch',
    title: 'Commission Mismatch',
    description: 'Report a discrepancy between displayed and received commissions'
  },
  {
    id: 'commission-delay',
    title: 'Commission Delay',
    description: 'Report delays in commission payments'
  },
  {
    id: 'commission-error',
    title: 'Commission Error',
    description: 'Report errors in commission calculations'
  },
  {
    id: 'commission-query',
    title: 'Commission Query',
    description: 'Query regarding commission structure or details'
  }
];

const defaultCommissions = [
  {
    id: '1',
    type: 'Commission Mismatch',
    description: 'Discrepancy in commission calculation',
    urgency: 'high',
    status: 'pending',
    customMessage: 'Please check the commission mismatch',
    createdAt: 'Feb 20, 2025',
    updatedAt: 'Feb 20, 2025'
  },
  {
    id: '2',
    type: 'Commission Delay',
    description: 'Delay in commission payment',
    urgency: 'medium',
    status: 'approved',
    customMessage: 'Commission payment delayed',
    createdAt: 'Feb 19, 2025',
    updatedAt: 'Feb 19, 2025'
  },
  {
    id: '3',
    type: 'Commission Error',
    description: 'Error in commission calculation',
    urgency: 'high',
    status: 'rejected',
    customMessage: 'Commission calculation error',
    createdAt: 'Feb 18, 2025',
    updatedAt: 'Feb 18, 2025'
  },
  {
    id: '4',
    type: 'Commission Query',
    description: 'Query about commission structure',
    urgency: 'low',
    status: 'pending',
    customMessage: 'Need clarification on commission structure',
    createdAt: 'Feb 17, 2025',
    updatedAt: 'Feb 17, 2025'
  },
  {
    id: '5',
    type: 'Commission Mismatch',
    description: 'Another discrepancy in commission',
    urgency: 'medium',
    status: 'approved',
    customMessage: 'Another commission mismatch',
    createdAt: 'Feb 16, 2025',
    updatedAt: 'Feb 16, 2025'
  },
];

const MobileCommissionsView = () => {
  const [selectedCommission, setSelectedCommission] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [urgency, setUrgency] = useState('low');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const sentCommissions = defaultCommissions;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCommission || !customMessage) return;
    console.log('Commission submitted:', { selectedCommission, customMessage, urgency });
  };

  const filteredCommissions = sentCommissions.filter(commission => {
    const matchesStatus = statusFilter === 'all' || commission.status === statusFilter;
    const matchesSearch =
      commission.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (commission.customMessage || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCommissions = filteredCommissions.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">Submit New Commission Request</h1>
      </div>

      {/* New Commission Form */}
      <div className="px-4 py-3">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {predefinedCommissions.map((commission) => (
              <div
                key={commission.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedCommission === commission.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedCommission(commission.id)}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className={`w-4 h-4 mt-0.5 ${
                    selectedCommission === commission.id ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{commission.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{commission.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Urgency Level</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`px-3 py-1 text-xs rounded-full capitalize ${
                    urgency === level
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setUrgency(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Additional Details</label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please provide any additional information about your commission request..."
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedCommission || !customMessage}
              className="flex items-center px-4 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3 h-3 mr-1" />
              Send Request
            </button>
          </div>
        </form>
      </div>

      {/* Sent Commissions List */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Sent Commissions</h2>
        </div>

        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search commissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="space-y-3">
          {currentCommissions.map((commission) => (
            <div key={commission.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">{commission.type}</h3>
                    <p className="text-xs text-gray-600 mt-1">{commission.description}</p>
                    {commission.customMessage && (
                      <p className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">
                        {commission.customMessage}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {commission.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {commission.status === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
                  {commission.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    commission.urgency === 'high' ? 'bg-red-100 text-red-800' :
                    commission.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {commission.urgency}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>Created: {commission.createdAt}</span>
                <span>Updated: {commission.updatedAt}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <ChevronLeft className="w-3 h-3 mr-1" />
            <span>Previous</span>
          </button>
          <span className="text-xs text-gray-700">Page {currentPage} of {Math.ceil(filteredCommissions.length / itemsPerPage)}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredCommissions.length / itemsPerPage)))}
            disabled={currentPage === Math.ceil(filteredCommissions.length / itemsPerPage)}
            className="flex items-center px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <span>Next</span>
            <ChevronRight className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileCommissionsView;
