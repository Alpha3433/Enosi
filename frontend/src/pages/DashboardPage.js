import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Heart,
  MessageSquare,
  Settings,
  Plus,
  ArrowRight,
  Star,
  MapPin,
  Bell,
  TrendingUp
} from 'lucide-react';
import { Header, Footer } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { couplesAPI, quotesAPI, planningAPI } from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user data
  const { data: profile } = useQuery({
    queryKey: ['couple-profile'],
    queryFn: couplesAPI.getProfile,
  });

  const { data: quotes } = useQuery({
    queryKey: ['quote-requests'],
    queryFn: quotesAPI.getRequests,
  });

  const { data: budgetItems } = useQuery({
    queryKey: ['budget-items'],
    queryFn: planningAPI.getBudgetItems,
  });

  const { data: checklistItems } = useQuery({
    queryKey: ['checklist-items'],
    queryFn: planningAPI.getChecklistItems,
  });

  const stats = [
    {
      name: 'Days to Wedding',
      value: profile?.data?.wedding_date 
        ? Math.ceil((new Date(profile.data.wedding_date) - new Date()) / (1000 * 60 * 60 * 24))
        : '—',
      icon: Calendar,
      color: 'bg-rose-500'
    },
    {
      name: 'Budget Spent',
      value: budgetItems?.data 
        ? `$${budgetItems.data.reduce((sum, item) => sum + (item.actual_cost || 0), 0).toLocaleString()}`
        : '$0',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      name: 'Guest Count',
      value: profile?.data?.guest_count || '—',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Tasks Complete',
      value: checklistItems?.data 
        ? `${checklistItems.data.filter(item => item.completed).length}/${checklistItems.data.length}`
        : '0/0',
      icon: CheckCircle,
      color: 'bg-purple-500'
    }
  ];

  const recentQuotes = quotes?.data?.slice(0, 3) || [];
  const upcomingTasks = checklistItems?.data?.filter(item => !item.completed)?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.first_name}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            {profile?.data?.wedding_date 
              ? `Your wedding is on ${new Date(profile.data.wedding_date).toLocaleDateString()}`
              : 'Let\'s start planning your perfect wedding'
            }
          </p>
        </div>

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
              <div className="flex items-center">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
              to="/search"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-rose-300 hover:bg-rose-50 transition-colors"
            >
              <Heart className="h-6 w-6 text-rose-600 mr-3" />
              <span className="font-medium text-gray-900">Find Vendors</span>
            </Link>
            
            <Link
              to="/planning/budget"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-rose-300 hover:bg-rose-50 transition-colors"
            >
              <DollarSign className="h-6 w-6 text-rose-600 mr-3" />
              <span className="font-medium text-gray-900">Manage Budget</span>
            </Link>
            
            <Link
              to="/planning/checklist"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-rose-300 hover:bg-rose-50 transition-colors"
            >
              <CheckCircle className="h-6 w-6 text-rose-600 mr-3" />
              <span className="font-medium text-gray-900">View Checklist</span>
            </Link>
            
            <Link
              to="/planning/guests"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-rose-300 hover:bg-rose-50 transition-colors"
            >
              <Users className="h-6 w-6 text-rose-600 mr-3" />
              <span className="font-medium text-gray-900">Guest List</span>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Quote Requests */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Quote Requests</h2>
                <Link to="/search" className="text-rose-600 hover:text-rose-700 text-sm font-medium">
                  Request new quote
                </Link>
              </div>
              
              {recentQuotes.length > 0 ? (
                <div className="space-y-4">
                  {recentQuotes.map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mr-4">
                          <MessageSquare className="h-6 w-6 text-rose-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Vendor Quote Request</h3>
                          <p className="text-sm text-gray-600">
                            Status: <span className="capitalize">{quote.status}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(quote.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        quote.status === 'responded' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {quote.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No quote requests yet</h3>
                  <p className="text-gray-600 mb-4">Start by browsing vendors and requesting quotes</p>
                  <Link
                    to="/search"
                    className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    Browse Vendors
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Tasks</h2>
                <Link to="/planning/checklist" className="text-rose-600 hover:text-rose-700 text-sm font-medium">
                  View all
                </Link>
              </div>
              
              {upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                        {task.due_date && (
                          <p className="text-xs text-gray-600">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">All caught up!</p>
                </div>
              )}
            </div>

            {/* Budget Overview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Budget Overview</h2>
                <Link to="/planning/budget" className="text-rose-600 hover:text-rose-700 text-sm font-medium">
                  Manage
                </Link>
              </div>
              
              {profile?.data?.budget ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">Total Budget</span>
                    <span className="font-bold text-gray-900">
                      ${profile.data.budget.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">Spent</span>
                    <span className="font-bold text-rose-600">
                      ${budgetItems?.data?.reduce((sum, item) => sum + (item.actual_cost || 0), 0).toLocaleString() || '0'}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-rose-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(
                          ((budgetItems?.data?.reduce((sum, item) => sum + (item.actual_cost || 0), 0) || 0) / profile.data.budget) * 100,
                          100
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">Set your wedding budget</p>
                  <Link
                    to="/profile"
                    className="text-rose-600 hover:text-rose-700 text-sm font-medium"
                  >
                    Update Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wedding Progress */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Wedding Planning Progress</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-rose-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Planning Phase</h3>
              <p className="text-sm text-gray-600">
                {checklistItems?.data?.filter(item => item.completed).length || 0} of{' '}
                {checklistItems?.data?.length || 0} tasks completed
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Guest Management</h3>
              <p className="text-sm text-gray-600">
                {profile?.data?.guest_count || 0} guests planned
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Budget Tracking</h3>
              <p className="text-sm text-gray-600">
                {budgetItems?.data?.length || 0} budget items tracked
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardPage;