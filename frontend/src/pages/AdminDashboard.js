import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({});
  const [pendingVendors, setPendingVendors] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.user_type !== 'admin') {
      window.location.href = '/';
      return;
    }
    
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch platform metrics
      const metricsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/metrics`, { headers });
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData);

      // Fetch pending vendors
      const pendingResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/vendors/pending`, { headers });
      const pendingData = await pendingResponse.json();
      setPendingVendors(pendingData);

      // Fetch all vendors
      const vendorsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/vendors`, { headers });
      const vendorsData = await vendorsResponse.json();
      setAllVendors(vendorsData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setLoading(false);
    }
  };

  const handleVendorAction = async (vendorId, action, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      const url = `${process.env.REACT_APP_BACKEND_URL}/api/admin/vendors/${vendorId}/${action}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: action === 'reject' ? JSON.stringify({ reason }) : null
      });

      if (response.ok) {
        // Refresh data
        fetchData();
        alert(`Vendor ${action}ed successfully!`);
      } else {
        alert(`Failed to ${action} vendor`);
      }
    } catch (error) {
      console.error(`Error ${action}ing vendor:`, error);
      alert(`Error ${action}ing vendor`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {user?.first_name}</span>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
              >
                Back to Site
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'vendors', name: 'Vendor Management' },
              { id: 'users', name: 'User Management' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl">👥</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Vendors</dt>
                        <dd className="text-lg font-medium text-gray-900">{metrics.total_vendors || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl">✅</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Vendors</dt>
                        <dd className="text-lg font-medium text-gray-900">{metrics.active_vendors || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl">⏳</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Approval</dt>
                        <dd className="text-lg font-medium text-gray-900">{metrics.pending_vendors || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl">💰</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                        <dd className="text-lg font-medium text-gray-900">${metrics.monthly_revenue || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total Couples</span>
                      <span className="text-sm font-medium">{metrics.total_couples || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total Quotes</span>
                      <span className="text-sm font-medium">{metrics.total_quotes || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Processed Quotes</span>
                      <span className="text-sm font-medium">{metrics.processed_quotes || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Conversion Rate</span>
                      <span className="text-sm font-medium">{metrics.conversion_rate?.toFixed(1) || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="text-sm text-gray-500">
                    Activity tracking coming soon...
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'vendors' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {pendingVendors.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Vendor Approvals</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {pendingVendors.map((vendor) => (
                      <li key={vendor.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{vendor.business_name}</p>
                                <p className="text-sm text-gray-500">{vendor.category} • {vendor.location}</p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleVendorAction(vendor.id, 'approve')}
                                  className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Reason for rejection:');
                                    if (reason) handleVendorAction(vendor.id, 'reject', reason);
                                  }}
                                  className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">{vendor.description}</p>
                              {vendor.pricing_from && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Pricing: ${vendor.pricing_from} - ${vendor.pricing_to || 'Contact for quote'}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">All Vendors</h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {allVendors.map((vendor) => (
                    <li key={vendor.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{vendor.business_name}</p>
                              <p className="text-sm text-gray-500">{vendor.category} • {vendor.location}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                vendor.status === 'approved' ? 'bg-green-100 text-green-800' :
                                vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {vendor.status}
                              </span>
                              {vendor.subscription_active && (
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                  Subscribed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;