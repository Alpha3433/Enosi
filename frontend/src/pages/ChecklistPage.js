import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Calendar,
  ArrowLeft,
  Clock,
  AlertTriangle,
  Filter,
  Search,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header, Footer } from '../components';
import { planningAPI } from '../services/api';

const ChecklistPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const queryClient = useQueryClient();

  const { data: checklistItems, isLoading } = useQuery({
    queryKey: ['checklist-items'],
    queryFn: planningAPI.getChecklistItems,
  });

  const createItemMutation = useMutation({
    mutationFn: planningAPI.createChecklistItem,
    onSuccess: () => {
      queryClient.invalidateQueries(['checklist-items']);
      setShowAddModal(false);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, ...data }) => planningAPI.updateChecklistItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['checklist-items']);
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    createItemMutation.mutate({
      ...data,
      due_date: data.due_date || null,
      priority: parseInt(data.priority)
    });
    reset();
  };

  const toggleComplete = (item) => {
    updateItemMutation.mutate({
      id: item.id,
      completed: !item.completed
    });
  };

  const items = checklistItems?.data || [];
  
  // Filter items
  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || 
      (filter === 'pending' && !item.completed) ||
      (filter === 'completed' && item.completed);
    
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
    
    return matchesFilter && matchesSearch && matchesCategory;
  });

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const categories = [
    '12+ Months Before',
    '9 Months Before',
    '6 Months Before', 
    '3 Months Before',
    '1 Month Before',
    '1 Week Before',
    'Day Of',
    'After Wedding'
  ];

  const priorityColors = {
    1: 'bg-gray-100 text-gray-800',
    2: 'bg-blue-100 text-blue-800', 
    3: 'bg-yellow-100 text-yellow-800',
    4: 'bg-orange-100 text-orange-800',
    5: 'bg-red-100 text-red-800'
  };

  const defaultTasks = [
    {
      title: 'Set wedding date and budget',
      category: '12+ Months Before',
      priority: 5,
      description: 'Decide on your ideal wedding date and overall budget'
    },
    {
      title: 'Create guest list',
      category: '12+ Months Before', 
      priority: 4,
      description: 'Draft initial guest list to help determine venue size'
    },
    {
      title: 'Book ceremony and reception venue',
      category: '9 Months Before',
      priority: 5,
      description: 'Secure your ideal wedding venues'
    },
    {
      title: 'Hire photographer',
      category: '9 Months Before',
      priority: 4,
      description: 'Book your wedding photographer'
    },
    {
      title: 'Order wedding dress',
      category: '6 Months Before',
      priority: 4,
      description: 'Purchase and order alterations for wedding dress'
    },
    {
      title: 'Send invitations',
      category: '3 Months Before',
      priority: 5,
      description: 'Mail wedding invitations to guests'
    },
    {
      title: 'Final headcount to caterer',
      category: '1 Month Before',
      priority: 5,
      description: 'Provide final guest count to catering'
    },
    {
      title: 'Pack emergency kit',
      category: '1 Week Before',
      priority: 3,
      description: 'Prepare emergency kit for wedding day'
    },
    {
      title: 'Get ready and enjoy your day!',
      category: 'Day Of',
      priority: 5,
      description: 'Relax and enjoy your special day'
    }
  ];

  const addDefaultTasks = () => {
    defaultTasks.forEach(task => {
      createItemMutation.mutate(task);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/planning" className="flex items-center text-gray-600 hover:text-rose-600 mb-4">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Planning Tools
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Wedding Checklist</h1>
            <p className="text-gray-600 mt-1">
              Stay organized with our comprehensive wedding planning timeline
            </p>
          </div>
          <div className="flex space-x-3">
            {items.length === 0 && (
              <button
                onClick={addDefaultTasks}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Default Tasks
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Progress Overview</h2>
            <span className="text-2xl font-bold text-rose-600">
              {completedCount}/{totalCount} completed
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-rose-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{completionRate.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{totalCount - completedCount}</div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Tasks</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              >
                <option value="">All Timelines</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilter('all');
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="w-full p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 hover:bg-gray-50 ${item.completed ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    <button
                      onClick={() => toggleComplete(item)}
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        item.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-rose-500'
                      }`}
                    >
                      {item.completed && <Check className="h-4 w-4" />}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-medium ${
                            item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}>
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 mt-3">
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              {item.category}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${priorityColors[item.priority]}`}>
                              Priority {item.priority}
                            </span>
                            {item.due_date && (
                              <div className="flex items-center text-xs text-gray-600">
                                <Calendar className="h-3 w-3 mr-1" />
                                Due: {new Date(item.due_date).toLocaleDateString()}
                              </div>
                            )}
                            {item.completed && item.completed_at && (
                              <div className="flex items-center text-xs text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed: {new Date(item.completed_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button className="p-1 text-gray-400 hover:text-rose-600">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {items.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {items.length === 0 
                  ? 'Start organizing your wedding planning with our checklist'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {items.length === 0 ? (
                <div className="space-x-3">
                  <button
                    onClick={addDefaultTasks}
                    className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700"
                  >
                    Add Default Tasks
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Create Custom Task
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setFilter('all');
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Task</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                <input
                  {...register('title', { required: 'Task title is required' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g., Book wedding venue"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="Additional details about this task..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
                <select
                  {...register('category', { required: 'Timeline is required' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Select timeline</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    {...register('priority', { required: 'Priority is required' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Priority</option>
                    <option value="1">1 - Low</option>
                    <option value="2">2 - Medium</option>
                    <option value="3">3 - High</option>
                    <option value="4">4 - Urgent</option>
                    <option value="5">5 - Critical</option>
                  </select>
                  {errors.priority && (
                    <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    {...register('due_date')}
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createItemMutation.isLoading}
                  className="flex-1 bg-rose-600 text-white py-3 px-6 rounded-lg hover:bg-rose-700 disabled:opacity-50"
                >
                  {createItemMutation.isLoading ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ChecklistPage;