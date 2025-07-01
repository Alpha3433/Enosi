import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  TrendingUp,
  Clock,
  Search,
  FileText,
  Camera,
  Target,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { couplesAPI, planningAPI } from '../services/api';

// Initialize match object for this component
if (typeof window !== 'undefined' && !window.match) {
  window.match = {
    params: {},
    isExact: true,
    path: window.location.pathname,
    url: window.location.pathname
  };
}

const CouplesDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [coupleProfile, setCoupleProfile] = useState(null);
  const [budgetItems, setBudgetItems] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch couple profile and planning data
      const [profileResponse, budgetResponse, checklistResponse] = await Promise.allSettled([
        couplesAPI.getProfile(),
        planningAPI.getBudgetItems(),
        planningAPI.getChecklistItems()
      ]);

      // Handle profile data
      if (profileResponse.status === 'fulfilled') {
        setCoupleProfile(profileResponse.value.data);
      }

      // Handle budget data
      if (budgetResponse.status === 'fulfilled') {
        setBudgetItems(budgetResponse.value.data || []);
      }

      // Handle checklist data
      if (checklistResponse.status === 'fulfilled') {
        setChecklistItems(checklistResponse.value.data || []);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate dashboard statistics from real data
  const calculateStats = () => {
    const totalBudget = budgetItems.reduce((sum, item) => sum + (item.budgeted_amount || 0), 0);
    const totalSpent = budgetItems.reduce((sum, item) => sum + (item.actual_amount || 0), 0);
    const completedTasks = checklistItems.filter(item => item.completed).length;
    const totalTasks = checklistItems.length;
    
    // Calculate days until wedding
    const weddingDate = coupleProfile?.wedding_date ? new Date(coupleProfile.wedding_date) : null;
    const today = new Date();
    const daysUntilWedding = weddingDate ? Math.ceil((weddingDate - today) / (1000 * 60 * 60 * 24)) : 0;

    return {
      daysUntilWedding: Math.max(0, daysUntilWedding),
      totalBudget,
      totalSpent,
      budgetRemaining: totalBudget - totalSpent,
      completedTasks,
      totalTasks,
      weddingDate: weddingDate ? weddingDate.toLocaleDateString('en-AU', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : 'Not set'
    };
  };

  const stats = calculateStats();

  const dashboardStats = [
    { 
      title: "Days Until Wedding", 
      value: stats.daysUntilWedding || "Not set", 
      icon: Calendar, 
      color: "text-cement",
      bgColor: "bg-linen" 
    },
    { 
      title: "Budget Remaining", 
      value: `$${stats.budgetRemaining.toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-millbrook",
      bgColor: "bg-tallow/20" 
    },
    { 
      title: "Guest Count", 
      value: `${coupleProfile?.guest_count || 0}`, 
      icon: Users, 
      color: "text-kabul",
      bgColor: "bg-coral-reef/10" 
    },
    { 
      title: "Tasks Completed", 
      value: `${stats.completedTasks}/${stats.totalTasks}`, 
      icon: CheckCircle, 
      color: "text-napa",
      bgColor: "bg-rodeo-dust/20" 
    }
  ];

  // Get recent incomplete tasks for upcoming tasks section
  const upcomingTasks = checklistItems
    .filter(item => !item.completed)
    .slice(0, 4)
    .map(item => ({
      task: item.task_name,
      dueDate: item.due_date ? new Date(item.due_date).toLocaleDateString() : 'No due date',
      priority: item.priority || 'medium',
      id: item.id
    }));

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header - Same as landing page */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-9 py-5 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="text-xl font-bold font-sans"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              Enosi
            </button>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <button onClick={() => navigate('/search')} className="text-sm hover:text-blue-500 transition-colors font-sans">
              Find Vendors
            </button>
            <button onClick={() => navigate('/planning')} className="text-sm hover:text-blue-500 transition-colors font-sans">
              Planning Tools
            </button>
            <a href="#inspiration" className="text-sm hover:text-blue-500 transition-colors font-sans">
              Inspiration
            </a>
          </nav>

          <div className="flex space-x-2 items-center">
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <span className="text-sm font-sans">{user?.first_name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-sans"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => navigate('/planning')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-sans"
                    >
                      Planning Tools
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-sans"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <div className="container mx-auto px-9 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sans">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600 font-sans">
            Your wedding is on <span className="font-semibold text-blue-600">{stats.weddingDate}</span> - only {stats.daysUntilWedding} days to go! 🎉
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0px 1px 12px rgba(3,3,3,0.08)',
                padding: '24px'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1 font-sans">{stat.value}</h3>
              <p className="text-sm text-gray-600 font-sans">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Activity & Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0px 1px 12px rgba(3,3,3,0.08)',
                padding: '24px'
              }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-sans">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => navigate('/search')}
                  className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Search className="w-6 h-6 text-blue-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900 font-sans">Find Vendors</span>
                </button>
                <button 
                  onClick={() => navigate('/planning/budget')}
                  className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <DollarSign className="w-6 h-6 text-green-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900 font-sans">Budget</span>
                </button>
                <button 
                  onClick={() => navigate('/planning/guest-list')}
                  className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Users className="w-6 h-6 text-purple-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900 font-sans">Guest List</span>
                </button>
                <button 
                  onClick={() => navigate('/planning/checklist')}
                  className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <CheckCircle className="w-6 h-6 text-orange-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900 font-sans">Checklist</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0px 1px 12px rgba(3,3,3,0.08)',
                padding: '24px'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 font-sans">Recent Activity</h2>
                <button className="text-sm text-blue-500 hover:text-blue-600 font-sans">View All</button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'quote' ? 'bg-blue-100' :
                      activity.type === 'favorite' ? 'bg-red-100' :
                      activity.type === 'task' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {activity.type === 'quote' && <FileText className="w-4 h-4 text-blue-500" />}
                      {activity.type === 'favorite' && <Heart className="w-4 h-4 text-red-500" />}
                      {activity.type === 'task' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {activity.type === 'message' && <MessageSquare className="w-4 h-4 text-purple-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-sans">
                        {activity.action} <span className="font-medium">{activity.vendor}</span>
                      </p>
                      <p className="text-xs text-gray-500 font-sans">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0px 1px 12px rgba(3,3,3,0.08)',
                padding: '24px'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 font-sans">Upcoming Tasks</h2>
                <button 
                  onClick={() => navigate('/planning/checklist')}
                  className="text-sm text-blue-500 hover:text-blue-600 font-sans"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {upcomingTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900 font-sans">{task.task}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 font-sans">Due in {task.dueDate}</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Saved Vendors & Budget */}
          <div className="space-y-6">
            {/* Budget Progress */}
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0px 1px 12px rgba(3,3,3,0.08)',
                padding: '24px'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 font-sans">Budget Progress</h2>
                <button 
                  onClick={() => navigate('/planning/budget')}
                  className="text-sm text-blue-500 hover:text-blue-600 font-sans"
                >
                  Manage
                </button>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2 font-sans">
                  <span>Spent: ${weddingDetails.spent.toLocaleString()}</span>
                  <span>Budget: ${weddingDetails.budget.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(weddingDetails.spent / weddingDetails.budget) * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-sans">
                {((weddingDetails.spent / weddingDetails.budget) * 100).toFixed(0)}% of budget used
              </p>
            </div>

            {/* Saved Vendors */}
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0px 1px 12px rgba(3,3,3,0.08)',
                padding: '24px'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 font-sans">Saved Vendors</h2>
                <button className="text-sm text-blue-500 hover:text-blue-600 font-sans">View All</button>
              </div>
              <div className="space-y-4">
                {savedVendors.map((vendor) => (
                  <div key={vendor.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <img 
                      src={vendor.image}
                      alt={vendor.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm font-sans">{vendor.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-sans">{vendor.category}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600 font-sans">{vendor.rating}</span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-blue-600 font-sans">{vendor.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Same as landing page */}
      <footer className="bg-gray-100 py-12 mt-12">
        <div className="container mx-auto px-9">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 font-sans">Enosi</h3>
              <p className="text-gray-600 text-sm font-sans">
                Australia's premier wedding vendor marketplace, connecting couples with the perfect professionals for their special day.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-sans">For Couples</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 font-sans">Find Vendors</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Wedding Planning</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Budget Calculator</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Inspiration</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-sans">Planning Tools</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 font-sans">Budget Planner</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Guest List Manager</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Wedding Checklist</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Timeline Builder</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-sans">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 font-sans">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Terms of Service</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-600 text-sm font-sans">
              © 2025 Enosi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CouplesDashboard;