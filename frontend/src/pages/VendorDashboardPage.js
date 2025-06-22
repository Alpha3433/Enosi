import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  MessageSquare,
  Star,
  DollarSign,
  Calendar,
  Users,
  Settings,
  Edit,
  Eye,
  TrendingUp,
  Bell,
  Plus,
  Camera,
  Award,
  Shield,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Header, Footer } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { vendorsAPI, quotesAPI } from '../services/api';

const VendorDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch vendor data
  const { data: profile } = useQuery({
    queryKey: ['vendor-profile'],
    queryFn: vendorsAPI.getProfile,
  });

  const { data: quotes } = useQuery({
    queryKey: ['quote-requests'],
    queryFn: quotesAPI.getRequests,
  });

  const stats = [
    {
      name: 'Quote Requests',
      value: quotes?.data?.length || 0,
      icon: MessageSquare,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      name: 'Average Rating',
      value: profile?.data?.average_rating?.toFixed(1) || '—',
      icon: Star,
      color: 'bg-yellow-500',
      change: '+0.2'
    },
    {
      name: 'Revenue (Est.)',
      value: '$2,450',
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      name: 'Profile Views',
      value: '124',
      icon: Eye,
      color: 'bg-purple-500',
      change: '+15%'
    }
  ];

  const recentQuotes = quotes?.data?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.data?.business_name || user?.first_name}! 💼
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your wedding business and connect with couples
          </p>
        </div>

        {/* Subscription Status Banner */}
        {profile?.data && !profile?.data?.subscription_active && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-yellow-900">Activate Your Subscription</h2>
                <p className="text-yellow-700 mt-1">
                  Subscribe to start receiving quote requests and unlock premium features
                </p>
              </div>
              <Link
                to="/vendor/subscription"
                className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
              >
                View Plans
              </Link>
            </div>
          </motion.div>
        )}

        {/* Active Subscription Status */}
        {profile?.data?.subscription_active && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-green-900">Subscription Active ✅</h2>
                <p className="text-green-700 mt-1">
                  Your subscription is active until {profile?.data?.subscription_expires ? new Date(profile.data.subscription_expires).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <Link
                to="/vendor/subscription"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Manage Plan
              </Link>
            </div>
          </motion.div>
        )}

        {/* Profile Overview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your Business Profile</h2>
              <p className="text-gray-600 mt-1">Manage your contact details and availability</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/search"
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Live Profile
              </Link>
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </button>
            </div>
          </div>
          
          {/* Profile Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Business Info</h3>
              <p className="text-sm text-gray-600">
                <strong>Business:</strong> {profile?.data?.business_name || user?.business_name || 'Not set'}<br/>
                <strong>Category:</strong> {profile?.data?.category || 'Not set'}<br/>
                <strong>Status:</strong> <span className="text-green-600">Live Profile</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Contact Info</h3>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {profile?.data?.email || user?.email}<br/>
                <strong>Phone:</strong> {profile?.data?.phone || 'Add phone number'}<br/>
                <strong>Website:</strong> {profile?.data?.website || 'Add website'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Availability</h3>
              <p className="text-sm text-gray-600">
                <strong>Status:</strong> {profile?.data?.accepting_bookings ? 'Accepting bookings' : 'Unavailable'}<br/>
                <strong>Hours:</strong> {profile?.data?.business_hours || 'Add business hours'}<br/>
                <strong>Lead Time:</strong> {profile?.data?.booking_lead_time || 'Not set'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <span className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </span>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/profile"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-rose-300 hover:bg-rose-50 transition-colors"
            >
              <Edit className="h-6 w-6 text-rose-600 mr-3" />
              <span className="font-medium text-gray-900">Edit Profile</span>
            </Link>
            
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-rose-300 hover:bg-rose-50 transition-colors">
              <Camera className="h-6 w-6 text-rose-600 mr-3" />
              <span className="font-medium text-gray-900">Add Photos</span>
            </button>
            
            <Link
              to="/vendor/subscription"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-rose-300 hover:bg-rose-50 transition-colors"
            >
              <DollarSign className="h-6 w-6 text-rose-600 mr-3" />
              <span className="font-medium text-gray-900">Subscription</span>
            </Link>
            
            <Link
              to="/profile"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-rose-300 hover:bg-rose-50 transition-colors"
            >
              <Settings className="h-6 w-6 text-rose-600 mr-3" />
              <span className="font-medium text-gray-900">Settings</span>
            </Link>
          </div>
        </div>

        {/* Conditional Content Based on Active Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quote Requests */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Quote Requests</h2>
                <span className="text-sm text-gray-600">
                  {quotes?.data?.filter(q => q.status === 'pending').length || 0} pending
                </span>
              </div>
              
              {recentQuotes.length > 0 ? (
                <div className="space-y-4">
                  {recentQuotes.map((quote) => (
                    <div key={quote.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Wedding Quote Request
                          </h3>
                          <p className="text-sm text-gray-600">
                            {quote.wedding_date && `Wedding: ${new Date(quote.wedding_date).toLocaleDateString()}`}
                            {quote.guest_count && ` • ${quote.guest_count} guests`}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          quote.status === 'responded' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {quote.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-3">
                        {quote.event_details}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(quote.created_at).toLocaleDateString()}
                        </span>
                        {quote.status === 'pending' && (
                          <button className="bg-rose-600 text-white px-3 py-1 rounded text-sm hover:bg-rose-700 transition-colors">
                            Respond
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No quote requests yet</h3>
                  <p className="text-gray-600 mb-4">
                    Complete your profile to start receiving requests from couples
                  </p>
                  <Link
                    to="/profile"
                    className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    Complete Profile
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Status */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Status</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    profile?.data ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {profile?.data ? (
                      <Shield className="h-4 w-4 text-green-600" />
                    ) : (
                      <Settings className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Basic Info</p>
                    <p className="text-sm text-gray-600">
                      {profile?.data ? 'Complete' : 'Incomplete'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    profile?.data?.gallery_images?.length > 0 ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {profile?.data?.gallery_images?.length > 0 ? (
                      <Camera className="h-4 w-4 text-green-600" />
                    ) : (
                      <Camera className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Photos</p>
                    <p className="text-sm text-gray-600">
                      {profile?.data?.gallery_images?.length || 0} uploaded
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    profile?.data?.verified ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {profile?.data?.verified ? (
                      <Award className="h-4 w-4 text-green-600" />
                    ) : (
                      <Award className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Verification</p>
                    <p className="text-sm text-gray-600">
                      {profile?.data?.verified ? 'Verified' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">This Month</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Views</span>
                  <span className="font-bold text-gray-900">124</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Quote Requests</span>
                  <span className="font-bold text-gray-900">{quotes?.data?.length || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="font-bold text-gray-900">100%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Response Time</span>
                  <span className="font-bold text-gray-900">2h</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">💡 Pro Tips</h2>
              
              <div className="space-y-3 text-sm">
                <p className="text-gray-700">
                  • Add 5+ high-quality photos to get 3x more views
                </p>
                <p className="text-gray-700">
                  • Respond to quotes within 24 hours for better rankings
                </p>
                <p className="text-gray-700">
                  • Complete your profile to appear in more searches
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Business Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Profile Visibility</h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">124</p>
              <p className="text-sm text-gray-600">views this month</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Lead Generation</h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">{quotes?.data?.length || 0}</p>
              <p className="text-sm text-gray-600">quote requests</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Customer Satisfaction</h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {profile?.data?.average_rating?.toFixed(1) || '—'}
              </p>
              <p className="text-sm text-gray-600">average rating</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VendorDashboardPage;