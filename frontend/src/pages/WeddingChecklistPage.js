import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Circle,
  Calendar,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { Header, Footer } from '../components-airbnb';
import { useAuth } from '../contexts/AuthContext';

const WeddingChecklistPage = () => {
  const { user } = useAuth();
  const [checklist, setChecklist] = useState([]);
  const [filter, setFilter] = useState('all'); // all, completed, pending, overdue
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  const defaultChecklist = [
    // 12+ Months Before
    {
      id: 1,
      task: 'Set your wedding date',
      timeframe: '12+ months',
      category: 'Planning',
      completed: false,
      priority: 'high',
      description: 'Choose your wedding date and consider season, holidays, and important dates for family',
      dueDate: null
    },
    {
      id: 2,
      task: 'Determine your budget',
      timeframe: '12+ months',
      category: 'Budget',
      completed: false,
      priority: 'high',
      description: 'Set overall budget and allocate amounts to different categories',
      dueDate: null
    },
    {
      id: 3,
      task: 'Create guest list (rough estimate)',
      timeframe: '12+ months',
      category: 'Guest Management',
      completed: false,
      priority: 'high',
      description: 'Initial estimate to help determine venue size and budget',
      dueDate: null
    },
    {
      id: 4,
      task: 'Book your venue',
      timeframe: '12+ months',
      category: 'Venue',
      completed: false,
      priority: 'high',
      description: 'Secure your ceremony and reception venues',
      dueDate: null
    },
    {
      id: 5,
      task: 'Hire wedding planner (if using one)',
      timeframe: '12+ months',
      category: 'Planning',
      completed: false,
      priority: 'medium',
      description: 'Research and book a wedding planner if desired',
      dueDate: null
    },

    // 9-11 Months Before
    {
      id: 6,
      task: 'Book photographer',
      timeframe: '9-11 months',
      category: 'Photography',
      completed: false,
      priority: 'high',
      description: 'Research and book your wedding photographer',
      dueDate: null
    },
    {
      id: 7,
      task: 'Book videographer',
      timeframe: '9-11 months',
      category: 'Photography',
      completed: false,
      priority: 'medium',
      description: 'Research and book your wedding videographer',
      dueDate: null
    },
    {
      id: 8,
      task: 'Choose wedding party',
      timeframe: '9-11 months',
      category: 'Wedding Party',
      completed: false,
      priority: 'medium',
      description: 'Ask friends and family to be in your wedding party',
      dueDate: null
    },
    {
      id: 9,
      task: 'Book caterer or finalize venue catering',
      timeframe: '9-11 months',
      category: 'Catering',
      completed: false,
      priority: 'high',
      description: 'Secure catering for your reception',
      dueDate: null
    },
    {
      id: 10,
      task: 'Book florist',
      timeframe: '9-11 months',
      category: 'Flowers',
      completed: false,
      priority: 'medium',
      description: 'Research and book your wedding florist',
      dueDate: null
    },

    // 6-8 Months Before
    {
      id: 11,
      task: 'Order wedding dress',
      timeframe: '6-8 months',
      category: 'Attire',
      completed: false,
      priority: 'high',
      description: 'Shop for and order your wedding dress',
      dueDate: null
    },
    {
      id: 12,
      task: 'Book music/entertainment',
      timeframe: '6-8 months',
      category: 'Entertainment',
      completed: false,
      priority: 'high',
      description: 'Book DJ, band, or other entertainment',
      dueDate: null
    },
    {
      id: 13,
      task: 'Send save the dates',
      timeframe: '6-8 months',
      category: 'Invitations',
      completed: false,
      priority: 'high',
      description: 'Send save the date cards to all guests',
      dueDate: null
    },
    {
      id: 14,
      task: 'Register for gifts',
      timeframe: '6-8 months',
      category: 'Gifts',
      completed: false,
      priority: 'medium',
      description: 'Create wedding registries at your preferred stores',
      dueDate: null
    },

    // 3-5 Months Before
    {
      id: 15,
      task: 'Order wedding invitations',
      timeframe: '3-5 months',
      category: 'Invitations',
      completed: false,
      priority: 'high',
      description: 'Design and order your wedding invitations',
      dueDate: null
    },
    {
      id: 16,
      task: 'Plan honeymoon',
      timeframe: '3-5 months',
      category: 'Honeymoon',
      completed: false,
      priority: 'medium',
      description: 'Book flights, accommodations, and activities',
      dueDate: null
    },
    {
      id: 17,
      task: 'Schedule dress fittings',
      timeframe: '3-5 months',
      category: 'Attire',
      completed: false,
      priority: 'high',
      description: 'Schedule initial dress fitting appointments',
      dueDate: null
    },
    {
      id: 18,
      task: 'Order groom\'s attire',
      timeframe: '3-5 months',
      category: 'Attire',
      completed: false,
      priority: 'high',
      description: 'Shop for and order groom\'s wedding attire',
      dueDate: null
    },

    // 1-2 Months Before
    {
      id: 19,
      task: 'Send wedding invitations',
      timeframe: '1-2 months',
      category: 'Invitations',
      completed: false,
      priority: 'high',
      description: 'Mail wedding invitations to all guests',
      dueDate: null
    },
    {
      id: 20,
      task: 'Final dress fitting',
      timeframe: '1-2 months',
      category: 'Attire',
      completed: false,
      priority: 'high',
      description: 'Complete final dress alterations',
      dueDate: null
    },
    {
      id: 21,
      task: 'Finalize menu and cake',
      timeframe: '1-2 months',
      category: 'Catering',
      completed: false,
      priority: 'high',
      description: 'Confirm final menu details and cake design',
      dueDate: null
    },
    {
      id: 22,
      task: 'Plan rehearsal dinner',
      timeframe: '1-2 months',
      category: 'Events',
      completed: false,
      priority: 'medium',
      description: 'Organize rehearsal dinner details',
      dueDate: null
    },

    // 1-2 Weeks Before
    {
      id: 23,
      task: 'Confirm guest count',
      timeframe: '1-2 weeks',
      category: 'Guest Management',
      completed: false,
      priority: 'high',
      description: 'Get final RSVP count from all guests',
      dueDate: null
    },
    {
      id: 24,
      task: 'Create seating chart',
      timeframe: '1-2 weeks',
      category: 'Reception',
      completed: false,
      priority: 'high',
      description: 'Finalize table assignments for reception',
      dueDate: null
    },
    {
      id: 25,
      task: 'Pack for honeymoon',
      timeframe: '1-2 weeks',
      category: 'Honeymoon',
      completed: false,
      priority: 'medium',
      description: 'Pack bags and prepare for honeymoon',
      dueDate: null
    },
    {
      id: 26,
      task: 'Prepare vendor payments',
      timeframe: '1-2 weeks',
      category: 'Budget',
      completed: false,
      priority: 'high',
      description: 'Prepare final payments for all vendors',
      dueDate: null
    }
  ];

  // Load saved checklist
  useEffect(() => {
    const savedChecklist = localStorage.getItem(`checklist_${user?.id}`);
    if (savedChecklist) {
      setChecklist(JSON.parse(savedChecklist));
    } else {
      setChecklist(defaultChecklist);
    }
  }, [user]);

  // Save checklist
  useEffect(() => {
    if (user && checklist.length > 0) {
      localStorage.setItem(`checklist_${user.id}`, JSON.stringify(checklist));
    }
  }, [checklist, user]);

  const toggleTask = (taskId) => {
    setChecklist(checklist.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const addCustomTask = (newTask) => {
    const task = {
      id: Date.now(),
      task: newTask.task,
      timeframe: newTask.timeframe,
      category: newTask.category,
      completed: false,
      priority: newTask.priority,
      description: newTask.description,
      dueDate: newTask.dueDate
    };
    setChecklist([...checklist, task]);
  };

  const filteredTasks = checklist.filter(task => {
    const matchesFilter = filter === 'all' || 
      (filter === 'completed' && task.completed) ||
      (filter === 'pending' && !task.completed);
    
    const matchesTimeframe = selectedTimeframe === 'all' || task.timeframe === selectedTimeframe;
    
    const matchesSearch = task.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesTimeframe && matchesSearch;
  });

  const completedCount = checklist.filter(task => task.completed).length;
  const progressPercentage = (completedCount / checklist.length) * 100;

  const timeframes = [...new Set(checklist.map(task => task.timeframe))];
  const categories = [...new Set(checklist.map(task => task.category))];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wedding Checklist</h1>
          <p className="text-gray-600">Stay organized with our comprehensive wedding planning timeline</p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Progress Overview</h3>
            <span className="text-sm text-gray-600">
              {completedCount} of {checklist.length} tasks completed
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-rose-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="text-center">
            <span className="text-2xl font-bold text-rose-600">{progressPercentage.toFixed(1)}%</span>
            <span className="text-gray-600 ml-2">Complete</span>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Tasks</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Search tasks..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Timeline</label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="all">All Timeframes</option>
                {timeframes.map(timeframe => (
                  <option key={timeframe} value={timeframe}>{timeframe}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors">
                <Filter className="h-4 w-4 inline mr-2" />
                Apply Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Task List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Wedding Tasks</h3>
          </div>

          <div className="divide-y divide-gray-200">
            <AnimatePresence>
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    task.completed ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="mt-1 flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-400 hover:text-rose-600 transition-colors" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`text-lg font-medium ${
                          task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {task.task}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {task.timeframe}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-2">{task.description}</p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {task.category}
                        </span>
                        {task.dueDate && (
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default WeddingChecklistPage;