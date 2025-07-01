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
      } else {
        // Load from localStorage if API fails
        const coupleProfileKey = `couple_profile_${user?.id || 'default'}`;
        const savedProfile = localStorage.getItem(coupleProfileKey);
        if (savedProfile) {
          setCoupleProfile(JSON.parse(savedProfile));
        }
      }

      // Handle budget data
      if (budgetResponse.status === 'fulfilled') {
        setBudgetItems(budgetResponse.value.data || []);
      } else {
        // Load from localStorage if API fails
        const budgetKey = `budget_items_${user?.id || 'default'}`;
        const savedBudget = localStorage.getItem(budgetKey);
        if (savedBudget) {
          setBudgetItems(JSON.parse(savedBudget));
        }
      }

      // Handle checklist data
      if (checklistResponse.status === 'fulfilled') {
        setChecklistItems(checklistResponse.value.data || []);
      } else {
        // Load from localStorage if API fails
        const checklistKey = `checklist_items_${user?.id || 'default'}`;
        const savedChecklist = localStorage.getItem(checklistKey);
        if (savedChecklist) {
          setChecklistItems(JSON.parse(savedChecklist));
        }
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

    // Get saved vendors
    const savedVendors = coupleProfile?.saved_vendors || [];

    return {
      daysUntilWedding: Math.max(0, daysUntilWedding),
      totalBudget,
      totalSpent,
      budgetRemaining: totalBudget - totalSpent,
      completedTasks,
      totalTasks,
      savedVendorsCount: savedVendors.length,
      savedVendors: savedVendors.slice(0, 3), // Show top 3 for dashboard
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
      bgColor: "bg-linen",
      onClick: () => navigate('/planning') // Navigate to planning tools to set wedding date
    },
    { 
      title: "Budget Remaining", 
      value: `$${stats.budgetRemaining.toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-millbrook",
      bgColor: "bg-tallow/20",
      onClick: () => navigate('/planning/budget') // Navigate to budget planner
    },
    { 
      title: "Guest Count", 
      value: `${coupleProfile?.guest_count || 0}`, 
      icon: Users, 
      color: "text-kabul",
      bgColor: "bg-coral-reef/10",
      onClick: () => navigate('/planning/guest-list') // Navigate to guest list manager
    },
    { 
      title: "Tasks Completed", 
      value: `${stats.completedTasks}/${stats.totalTasks}`, 
      icon: CheckCircle, 
      color: "text-napa",
      bgColor: "bg-rodeo-dust/20",
      onClick: () => navigate('/planning/checklist') // Navigate to wedding checklist
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
    <div className="min-h-screen bg-linen font-sans" style={{ zoom: 0.9 }}>
      {/* Header - Same as landing page */}
      <header className="bg-white">
        <div className="container mx-auto px-9 py-5 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="text-xl font-bold font-sans text-millbrook"
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
          
          <nav className="hidden md:flex space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <button onClick={() => navigate('/search')} className="text-sm hover:text-cement transition-colors font-sans text-millbrook font-medium">
              Find Vendors
            </button>
            <button onClick={() => navigate('/inspiration')} className="text-sm hover:text-cement transition-colors font-sans text-millbrook font-medium">
              Inspiration
            </button>
            <button onClick={() => navigate('/about')} className="text-sm hover:text-cement transition-colors font-sans text-millbrook font-medium">
              About Us
            </button>
          </nav>

          <div className="flex space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <button className="p-2 text-kabul hover:text-millbrook transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-coral-reef text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
                </button>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-kabul hover:text-millbrook transition-colors">
                    <span className="text-sm font-sans">{user?.first_name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-coral-reef opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => navigate(user?.user_type === 'vendor' ? '/vendor-dashboard' : '/dashboard')}
                        className="block w-full text-left px-4 py-2 text-sm text-kabul hover:bg-linen font-sans"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-kabul hover:bg-linen font-sans"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="border border-coral-reef text-kabul rounded-full px-4 py-2 text-sm hover:bg-linen transition-colors font-sans"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-cement text-white rounded-full px-4 py-2 text-sm hover:bg-millbrook transition-colors font-sans"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <div className="container mx-auto px-9 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-millbrook mb-2 font-sans">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-kabul font-sans">
            Your wedding is on <span className="font-semibold text-cement">{stats.weddingDate}</span> - only {stats.daysUntilWedding} days to go! 🎉
          </p>
        </div>

        {/* Loading State for Dashboard */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-8 h-8 animate-spin text-cement" />
              <span className="text-xl text-kabul">Loading your wedding dashboard...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-coral-reef mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-millbrook mb-2">Unable to load dashboard</h3>
              <p className="text-kabul mb-4">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="px-6 py-3 bg-cement text-white rounded-lg hover:bg-millbrook transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Main Dashboard Content */}
        {!isLoading && !error && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {dashboardStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={stat.onClick}
                  className="cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
                    padding: '24px'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-millbrook mb-1 font-sans">{stat.value}</h3>
                  <p className="text-sm text-kabul font-sans">{stat.title}</p>
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
                    borderRadius: '24px',
                    boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
                    padding: '24px'
                  }}
                >
                  <h2 className="text-xl font-bold text-millbrook mb-4 font-sans">Quick Actions</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button 
                      onClick={() => navigate('/search')}
                      className="flex flex-col items-center p-4 bg-linen rounded-lg hover:bg-tallow/20 transition-colors"
                    >
                      <Search className="w-6 h-6 text-cement mb-2" />
                      <span className="text-sm font-medium text-millbrook font-sans">Find Vendors</span>
                    </button>
                    <button 
                      onClick={() => navigate('/planning/budget')}
                      className="flex flex-col items-center p-4 bg-linen rounded-lg hover:bg-tallow/20 transition-colors"
                    >
                      <DollarSign className="w-6 h-6 text-cement mb-2" />
                      <span className="text-sm font-medium text-millbrook font-sans">Budget</span>
                    </button>
                    <button 
                      onClick={() => navigate('/planning/guest-list')}
                      className="flex flex-col items-center p-4 bg-linen rounded-lg hover:bg-tallow/20 transition-colors"
                    >
                      <Users className="w-6 h-6 text-cement mb-2" />
                      <span className="text-sm font-medium text-millbrook font-sans">Guest List</span>
                    </button>
                    <button 
                      onClick={() => navigate('/planning/checklist')}
                      className="flex flex-col items-center p-4 bg-linen rounded-lg hover:bg-tallow/20 transition-colors"
                    >
                      <CheckCircle className="w-6 h-6 text-cement mb-2" />
                      <span className="text-sm font-medium text-millbrook font-sans">Checklist</span>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div 
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
                    padding: '24px'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-millbrook font-sans">Recent Activity</h2>
                    <button className="text-sm text-cement hover:text-millbrook font-sans">View All</button>
                  </div>
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-6 h-6 text-cement animate-spin" />
                      </div>
                    ) : error ? (
                      <div className="text-center text-coral-reef p-4">
                        Failed to load recent activity
                      </div>
                    ) : (
                      <div className="text-center text-kabul p-4">
                        No recent activity to display
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming Tasks */}
                <div 
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
                    padding: '24px'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-millbrook font-sans">Upcoming Tasks</h2>
                    <button 
                      onClick={() => navigate('/planning/checklist')}
                      className="text-sm text-cement hover:text-millbrook font-sans"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {upcomingTasks.length > 0 ? (
                      upcomingTasks.map((task, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-coral-reef rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              task.priority === 'high' ? 'bg-coral-reef' :
                              task.priority === 'medium' ? 'bg-tallow' : 'bg-cement'
                            }`}></div>
                            <span className="text-sm font-medium text-millbrook font-sans">{task.task}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-kabul font-sans">Due: {task.dueDate}</span>
                            <button className="text-kabul hover:text-cement">
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-kabul p-4">
                        No upcoming tasks
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Saved Vendors & Budget */}
              <div className="space-y-6">
                {/* Budget Progress */}
                <div 
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
                    padding: '24px'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-millbrook font-sans">Budget Progress</h2>
                    <button 
                      onClick={() => navigate('/planning/budget')}
                      className="text-sm text-cement hover:text-millbrook font-sans"
                    >
                      Manage
                    </button>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-kabul mb-2 font-sans">
                      <span>Spent: ${stats.totalSpent.toLocaleString()}</span>
                      <span>Budget: ${stats.totalBudget.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-linen rounded-full h-3">
                      <div 
                        className="bg-cement h-3 rounded-full transition-all duration-300"
                        style={{ width: `${stats.totalBudget > 0 ? (stats.totalSpent / stats.totalBudget) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-kabul font-sans">
                    {stats.totalBudget > 0 ? ((stats.totalSpent / stats.totalBudget) * 100).toFixed(0) : 0}% of budget used
                  </p>
                </div>

                {/* Saved Vendors */}
                <div 
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
                    padding: '24px'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-millbrook font-sans">Saved Vendors</h2>
                    <button className="text-sm text-cement hover:text-millbrook font-sans">View All</button>
                  </div>
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-6 h-6 text-cement animate-spin" />
                      </div>
                    ) : error ? (
                      <div className="text-center text-coral-reef p-4">
                        Failed to load saved vendors
                      </div>
                    ) : (
                      <div className="text-center text-kabul p-4">
                        No saved vendors yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer - Same as landing page */}
      <footer className="bg-linen py-12 mt-12">
        <div className="container mx-auto px-9">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-millbrook font-sans">Enosi</h3>
              <p className="text-sm text-kabul mb-2 font-sans">Your favorite wedding planning experience</p>
              <p className="text-sm text-kabul font-sans">since 2024</p>
            </div>
            <div>
              <h4 className="font-semibold text-millbrook mb-4 font-sans">Support</h4>
              <ul className="space-y-2 text-sm text-kabul">
                <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Help</a>
                <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">FAQ</a>
                <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Customer service</a>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-millbrook mb-4 font-sans">Company</h4>
              <ul className="space-y-2 text-sm text-kabul">
                <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">About Us</a>
                <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Careers</a>
                <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Press</a>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-millbrook mb-4 font-sans">Legal</h4>
              <ul className="space-y-2 text-sm text-kabul">
                <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Terms of Service</a>
                <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Privacy Policy</a>
                <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Cookies</a>
              </ul>
            </div>
          </div>
          <div className="border-t border-coral-reef mt-8 pt-8 text-center">
            <p className="text-kabul text-sm font-sans">
              © 2025 Enosi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CouplesDashboard;