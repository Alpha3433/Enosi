import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  PieChart,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Header, Footer } from '../components-airbnb';
import { useAuth } from '../contexts/AuthContext';

const BudgetPlannerPage = () => {
  const { user } = useAuth();
  const [totalBudget, setTotalBudget] = useState(25000);
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: 'Venue',
      budgeted: 10000,
      spent: 0,
      color: 'bg-blue-500',
      vendors: []
    },
    {
      id: 2,
      name: 'Photography',
      budgeted: 3000,
      spent: 0,
      color: 'bg-green-500',
      vendors: []
    },
    {
      id: 3,
      name: 'Catering',
      budgeted: 8000,
      spent: 0,
      color: 'bg-yellow-500',
      vendors: []
    },
    {
      id: 4,
      name: 'Music & Entertainment',
      budgeted: 2000,
      spent: 0,
      color: 'bg-purple-500',
      vendors: []
    },
    {
      id: 5,
      name: 'Flowers & Decoration',
      budgeted: 1500,
      spent: 0,
      color: 'bg-pink-500',
      vendors: []
    },
    {
      id: 6,
      name: 'Other',
      budgeted: 500,
      spent: 0,
      color: 'bg-gray-500',
      vendors: []
    }
  ]);
  
  const [newCategory, setNewCategory] = useState({ name: '', budget: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Load saved budget data
  useEffect(() => {
    const savedBudget = localStorage.getItem(`budget_${user?.id}`);
    if (savedBudget) {
      const budgetData = JSON.parse(savedBudget);
      setTotalBudget(budgetData.totalBudget || 25000);
      setCategories(budgetData.categories || categories);
    }
  }, [user]);

  // Save budget data
  useEffect(() => {
    if (user) {
      localStorage.setItem(`budget_${user.id}`, JSON.stringify({
        totalBudget,
        categories
      }));
    }
  }, [totalBudget, categories, user]);

  const totalBudgeted = categories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = totalBudget - totalSpent;

  const addCategory = () => {
    if (newCategory.name && newCategory.budget) {
      const category = {
        id: Date.now(),
        name: newCategory.name,
        budgeted: parseFloat(newCategory.budget),
        spent: 0,
        color: 'bg-indigo-500',
        vendors: []
      };
      setCategories([...categories, category]);
      setNewCategory({ name: '', budget: '' });
      setShowAddCategory(false);
    }
  };

  const updateCategory = (id, field, value) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, [field]: parseFloat(value) || 0 } : cat
    ));
  };

  const deleteCategory = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const getBudgetStatus = (category) => {
    const percentage = (category.spent / category.budgeted) * 100;
    if (percentage > 100) return { status: 'over', color: 'text-red-600', icon: AlertCircle };
    if (percentage > 80) return { status: 'warning', color: 'text-yellow-600', icon: AlertCircle };
    return { status: 'good', color: 'text-green-600', icon: CheckCircle };
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wedding Budget Planner</h1>
          <p className="text-gray-600">Track your wedding expenses and stay within budget</p>
        </motion.div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                    className="text-2xl font-bold text-gray-900 bg-transparent border-none p-0 w-32"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Budgeted</p>
                <p className="text-2xl font-bold text-gray-900">${totalBudgeted.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 mr-4">
                <PieChart className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Spent</p>
                <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-full mr-4 ${remaining >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`h-6 w-6 ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(remaining).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Budget Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h3>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className={`h-4 rounded-full transition-all duration-300 ${
                totalSpent > totalBudget ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>0%</span>
            <span>{((totalSpent / totalBudget) * 100).toFixed(1)}% used</span>
            <span>100%</span>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Budget Categories</h3>
            <button
              onClick={() => setShowAddCategory(true)}
              className="flex items-center bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </button>
          </div>

          <div className="space-y-4">
            {categories.map((category, index) => {
              const status = getBudgetStatus(category);
              const StatusIcon = status.icon;
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${category.color} mr-3`}></div>
                      <h4 className="font-medium text-gray-900">{category.name}</h4>
                      <StatusIcon className={`h-4 w-4 ml-2 ${status.color}`} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingCategory(category.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Budgeted Amount</label>
                      <input
                        type="number"
                        value={category.budgeted}
                        onChange={(e) => updateCategory(category.id, 'budgeted', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Spent Amount</label>
                      <input
                        type="number"
                        value={category.spent}
                        onChange={(e) => updateCategory(category.id, 'spent', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        category.spent > category.budgeted ? 'bg-red-500' : category.color
                      }`}
                      style={{ 
                        width: `${Math.min((category.spent / category.budgeted) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>${category.spent.toLocaleString()}</span>
                    <span>${category.budgeted.toLocaleString()}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Add Category Modal */}
        {showAddCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Category</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="e.g., Transportation"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Budget Amount</label>
                  <input
                    type="number"
                    value={newCategory.budget}
                    onChange={(e) => setNewCategory({...newCategory, budget: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addCategory}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                >
                  Add Category
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BudgetPlannerPage;