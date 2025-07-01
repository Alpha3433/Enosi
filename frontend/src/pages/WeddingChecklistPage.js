import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle,
  Circle,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Calendar,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Bell,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { planningAPI } from '../services/api';

const WeddingChecklistPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ task_name: '', due_date: '', priority: 'medium' });
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await planningAPI.getChecklistItems();
      setTasks(response.data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load checklist');
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.task_name) return;
    
    try {
      const taskData = {
        task_name: newTask.task_name,
        due_date: newTask.due_date || null,
        priority: newTask.priority,
        completed: false,
        notes: ''
      };
      
      await planningAPI.createChecklistItem(taskData);
      await fetchTasks();
      setNewTask({ task_name: '', due_date: '', priority: 'medium' });
      setShowAddTask(false);
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task');
    }
  };

  const toggleTask = async (taskId, completed) => {
    try {
      // Note: This would need an update endpoint in the API
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, completed: !completed } : task
      );
      setTasks(updatedTasks);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      // Note: This would need a delete endpoint in the API
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && task.completed) ||
                         (filterStatus === 'pending' && !task.completed);
    const matchesSearch = task.task_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-coral-reef';
      case 'medium': return 'bg-tallow';
      case 'low': return 'bg-cement';
      default: return 'bg-cement';
    }
  };

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

      {/* Main Content */}
      <div className="container mx-auto px-9 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-kabul hover:text-cement transition-colors font-sans"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-millbrook mb-2 font-sans">Wedding Checklist</h1>
          <p className="text-kabul font-sans">
            Keep track of all your wedding planning tasks
          </p>
        </div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
            padding: '24px'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-millbrook font-sans">Progress Overview</h2>
            <div className="text-right">
              <p className="text-2xl font-bold text-millbrook font-sans">{completedCount}/{totalCount}</p>
              <p className="text-sm text-kabul font-sans">Tasks Completed</p>
            </div>
          </div>
          <div className="mb-2">
            <div className="w-full bg-linen rounded-full h-4">
              <div 
                className="bg-cement h-4 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
          <p className="text-sm text-kabul font-sans">
            {completionPercentage.toFixed(1)}% complete
          </p>
        </motion.div>

        {/* Controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center space-x-2 bg-cement text-white px-6 py-3 rounded-full hover:bg-millbrook transition-colors font-sans"
            >
              <Plus className="w-5 h-5" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="flex space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-kabul" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement transition-all duration-200 font-sans placeholder-napa text-kabul"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement transition-all duration-200 font-sans text-kabul"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Add Task Form */}
        {showAddTask && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
              padding: '24px'
            }}
          >
            <h3 className="text-lg font-bold text-millbrook mb-4 font-sans">Add New Task</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Task name"
                value={newTask.task_name}
                onChange={(e) => setNewTask({...newTask, task_name: e.target.value})}
                className="w-full px-4 py-3 bg-linen border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 font-sans placeholder-napa text-kabul"
              />
              <input
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                className="w-full px-4 py-3 bg-linen border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 font-sans text-kabul"
              />
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                className="w-full px-4 py-3 bg-linen border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 font-sans text-kabul"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={addTask}
                className="bg-cement text-white px-4 py-2 rounded-lg hover:bg-millbrook transition-colors font-sans"
              >
                Add Task
              </button>
              <button
                onClick={() => setShowAddTask(false)}
                className="border border-coral-reef text-kabul px-4 py-2 rounded-lg hover:bg-linen transition-colors font-sans"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cement mx-auto"></div>
              <p className="text-kabul mt-2 font-sans">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div 
              className="text-center py-12"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
                padding: '24px'
              }}
            >
              <CheckCircle className="w-12 h-12 text-kabul mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-millbrook mb-2 font-sans">
                {searchTerm ? 'No tasks found' : 'No tasks yet'}
              </h3>
              <p className="text-kabul font-sans">
                {searchTerm ? 'Try adjusting your search' : 'Start by adding your first wedding planning task'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task, index) => (
              <motion.div
                key={task.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '24px',
                  boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
                  padding: '24px'
                }}
                className={task.completed ? 'opacity-75' : ''}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <button
                      onClick={() => toggleTask(task.id, task.completed)}
                      className="flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle className="w-6 h-6 text-cement" />
                      ) : (
                        <Circle className="w-6 h-6 text-kabul hover:text-cement transition-colors" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold font-sans ${task.completed ? 'line-through text-kabul' : 'text-millbrook'}`}>
                        {task.task_name}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                          <span className="text-sm text-kabul font-sans capitalize">{task.priority} priority</span>
                        </div>
                        {task.due_date && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-kabul" />
                            <span className="text-sm text-kabul font-sans">
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingId(task.id)}
                      className="p-2 text-kabul hover:text-cement transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-coral-reef hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
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

export default WeddingChecklistPage;