import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Mail, Phone, Building, User, Calendar } from 'lucide-react';
import axios from 'axios';

const AdminDashboardPage = () => {
  const [pendingVendors, setPendingVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingVendor, setProcessingVendor] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const fetchPendingVendors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/pending-vendors`);
      setPendingVendors(response.data.vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError('Failed to fetch pending vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVendor = async (vendorId) => {
    try {
      setProcessingVendor(vendorId);
      await axios.post(`${API_BASE_URL}/api/admin/approve-vendor/${vendorId}`);
      
      // Remove from pending list
      setPendingVendors(prev => prev.filter(vendor => vendor.id !== vendorId));
      setSuccess('Vendor approved successfully! Approval email sent.');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error approving vendor:', error);
      setError('Failed to approve vendor');
    } finally {
      setProcessingVendor(null);
    }
  };

  const handleRejectVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to reject this vendor? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessingVendor(vendorId);
      await axios.post(`${API_BASE_URL}/api/admin/reject-vendor/${vendorId}`);
      
      // Remove from pending list
      setPendingVendors(prev => prev.filter(vendor => vendor.id !== vendorId));
      setSuccess('Vendor rejected successfully! Rejection email sent.');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      setError('Failed to reject vendor');
    } finally {
      setProcessingVendor(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage vendor applications</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Pending Reviews</div>
                <div className="text-2xl font-bold text-rose-600">{pendingVendors.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
          >
            {success}
          </motion.div>
        )}

        {/* Pending Vendors */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 text-yellow-500 mr-2" />
              Pending Vendor Applications
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading pending vendors...</p>
            </div>
          ) : pendingVendors.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">
                <CheckCircle className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">All caught up!</h3>
              <p className="text-gray-500">No pending vendor applications to review.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingVendors.map((vendor) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <div className="bg-rose-100 rounded-full p-2 mr-3">
                          <Building className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {vendor.business_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Registered on {formatDate(vendor.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-2" />
                            <span>{vendor.first_name} {vendor.last_name}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            <a
                              href={`mailto:${vendor.email}`}
                              className="text-rose-600 hover:text-rose-700"
                            >
                              {vendor.email}
                            </a>
                          </div>
                          {vendor.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              <a
                                href={`tel:${vendor.phone}`}
                                className="text-rose-600 hover:text-rose-700"
                              >
                                {vendor.phone}
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-gray-500">User ID:</span>
                            <span className="ml-1 font-mono text-xs">{vendor.id}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Account Type:</span>
                            <span className="ml-1 capitalize">{vendor.user_type}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleApproveVendor(vendor.id)}
                        disabled={processingVendor === vendor.id}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {processingVendor === vendor.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleRejectVendor(vendor.id)}
                        disabled={processingVendor === vendor.id}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {processingVendor === vendor.id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">📋 Review Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Approve:</strong> Vendor gains access to their dashboard and can start listing services</li>
            <li>• <strong>Reject:</strong> Vendor account is removed and they receive a rejection email</li>
            <li>• Email notifications are automatically sent to vendors upon approval/rejection</li>
            <li>• Admin notifications are sent to enosiaustralia@gmail.com for new registrations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;