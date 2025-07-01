import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CheckCircle,
  ArrowLeft,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { planningAPI } from '../services/api';

const BudgetPlannerPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [totalBudget, setTotalBudget] = useState(25000);
  const [budgetItems, setBudgetItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', budgeted_amount: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBudgetData();
  }, [user]);

  const fetchBudgetData = async () => {
    try {
      setIsLoading(true);
      
      // Load from localStorage first (demo mode)
      const budgetKey = `budget_items_${user?.id || 'default'}`;
      const savedBudget = localStorage.getItem(budgetKey);
      if (savedBudget) {
        setBudgetItems(JSON.parse(savedBudget));
        setIsLoading(false);
        return;
      }

      // Try API as fallback
      try {
        const response = await planningAPI.getBudgetItems();
        if (response.data && response.data.length > 0) {
          setBudgetItems(response.data);
          return;
        }
      } catch (apiErr) {
        console.log('API not available, using localStorage');
      }
      
      // If no data anywhere, start with empty array
      setBudgetItems([]);
      
    } catch (err) {
      console.error('Error fetching budget data:', err);
      setBudgetItems([]);
      setError('Failed to load budget data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveBudgetToStorage = (budgetList) => {
    try {
      const budgetKey = `budget_items_${user?.id || 'default'}`;
      localStorage.setItem(budgetKey, JSON.stringify(budgetList));
      
      // Also save to couple profile for dashboard
      const coupleProfileKey = `couple_profile_${user?.id || 'default'}`;
      const existingProfile = localStorage.getItem(coupleProfileKey);
      const profile = existingProfile ? JSON.parse(existingProfile) : {};
      profile.budget_items = budgetList;
      localStorage.setItem(coupleProfileKey, JSON.stringify(profile));
    } catch (err) {
      console.error('Error saving budget:', err);
    }
  };

  const addCategory = async () => {
    if (!newCategory.name || !newCategory.budgeted_amount) return;
    
    try {
      const budgetItem = {
        id: Date.now(), // Temporary ID for demo
        category: newCategory.name,
        budgeted_amount: parseFloat(newCategory.budgeted_amount),
        actual_amount: 0,
        description: `Budget for ${newCategory.name}`,
        created_at: new Date().toISOString()
      };
      
      // Always save to localStorage first (demo mode)
      const updatedBudgetItems = [...budgetItems, budgetItem];
      setBudgetItems(updatedBudgetItems);
      saveBudgetToStorage(updatedBudgetItems);
      
      // Try API but don't depend on it
      try {
        await planningAPI.createBudgetItem(budgetItem);
      } catch (apiErr) {
        console.log('API not available, data saved locally');
      }
      
      setNewCategory({ name: '', budgeted_amount: '' });
      setShowAddCategory(false);
    } catch (err) {
      console.error('Error adding budget category:', err);
      setError('Failed to add budget category');
    }
  };

  const updateCategory = async (id, updatedData) => {
    try {
      // Try API first, fall back to localStorage
      try {
        // Note: This would need an update endpoint in the API
        await fetchBudgetData();
      } catch (apiErr) {
        console.log('API not available, using localStorage');
        const updatedBudgetItems = budgetItems.map(item => 
          item.id === id ? { ...item, ...updatedData } : item
        );
        setBudgetItems(updatedBudgetItems);
        saveBudgetToStorage(updatedBudgetItems);
      }
      setEditingId(null);
    } catch (err) {
      console.error('Error updating budget category:', err);
      setError('Failed to update budget category');
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget category?')) return;
    
    try {
      // Try API first, fall back to localStorage
      try {
        // Note: This would need a delete endpoint in the API
        await fetchBudgetData();
      } catch (apiErr) {
        console.log('API not available, using localStorage');
        const updatedBudgetItems = budgetItems.filter(item => item.id !== id);
        setBudgetItems(updatedBudgetItems);
        saveBudgetToStorage(updatedBudgetItems);
      }
    } catch (err) {
      console.error('Error deleting budget category:', err);
      setError('Failed to delete budget category');
    }
  };

  const totalBudgeted = budgetItems.reduce((sum, item) => sum + (item.budgeted_amount || 0), 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + (item.actual_amount || 0), 0);
  const remaining = totalBudgeted - totalSpent;
  const percentageUsed = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

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
          <h1 className="text-3xl font-bold text-millbrook mb-2 font-sans">Budget Planner</h1>
          <p className="text-kabul font-sans">
            Track your wedding expenses and stay within budget
          </p>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
              padding: '24px'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-linen">
                <DollarSign className="w-6 h-6 text-cement" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-millbrook mb-1 font-sans">${totalBudgeted.toLocaleString()}</h3>
            <p className="text-sm text-kabul font-sans">Total Budget</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
              padding: '24px'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-tallow/20">
                <TrendingUp className="w-6 h-6 text-millbrook" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-millbrook mb-1 font-sans">${totalSpent.toLocaleString()}</h3>
            <p className="text-sm text-kabul font-sans">Total Spent</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
              padding: '24px'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-coral-reef/10">
                <CheckCircle className="w-6 h-6 text-kabul" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-millbrook mb-1 font-sans">${remaining.toLocaleString()}</h3>
            <p className="text-sm text-kabul font-sans">Remaining</p>
          </motion.div>
        </div>

        {/* Budget Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
            padding: '24px'
          }}
        >
          <h2 className="text-xl font-bold text-millbrook mb-4 font-sans">Budget Progress</h2>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-kabul mb-2 font-sans">
              <span>Used: ${totalSpent.toLocaleString()}</span>
              <span>Budget: ${totalBudgeted.toLocaleString()}</span>
            </div>
            <div className="w-full bg-linen rounded-full h-4">
              <div 
                className="bg-cement h-4 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              ></div>
            </div>
          </div>
          <p className="text-sm text-kabul font-sans">
            {percentageUsed.toFixed(1)}% of budget used
          </p>
        </motion.div>

        {/* Add Category Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddCategory(true)}
            className="flex items-center space-x-2 bg-cement text-white px-6 py-3 rounded-full hover:bg-millbrook transition-colors font-sans"
          >
            <Plus className="w-5 h-5" />
            <span>Add Budget Category</span>
          </button>
        </div>

        {/* Add Category Form */}
        {showAddCategory && (
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
            <h3 className="text-lg font-bold text-millbrook mb-4 font-sans">Add New Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                className="w-full px-4 py-3 bg-linen border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 font-sans placeholder-napa text-kabul"
              />
              <input
                type="number"
                placeholder="Budget amount"
                value={newCategory.budgeted_amount}
                onChange={(e) => setNewCategory({...newCategory, budgeted_amount: e.target.value})}
                className="w-full px-4 py-3 bg-linen border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 font-sans placeholder-napa text-kabul"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={addCategory}
                className="bg-cement text-white px-4 py-2 rounded-lg hover:bg-millbrook transition-colors font-sans"
              >
                Add Category
              </button>
              <button
                onClick={() => setShowAddCategory(false)}
                className="border border-coral-reef text-kabul px-4 py-2 rounded-lg hover:bg-linen transition-colors font-sans"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Budget Categories */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cement mx-auto"></div>
              <p className="text-kabul mt-2 font-sans">Loading budget categories...</p>
            </div>
          ) : budgetItems.length === 0 ? (
            <div 
              className="text-center py-12"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
                padding: '24px'
              }}
            >
              <DollarSign className="w-12 h-12 text-kabul mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-millbrook mb-2 font-sans">No budget categories yet</h3>
              <p className="text-kabul font-sans">Start by adding your first budget category</p>
            </div>
          ) : (
            budgetItems.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '24px',
                  boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
                  padding: '24px'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-millbrook font-sans">{item.category}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingId(item.id)}
                      className="p-2 text-kabul hover:text-cement transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCategory(item.id)}
                      className="p-2 text-coral-reef hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-kabul font-sans">Budgeted</p>
                    <p className="text-xl font-bold text-millbrook font-sans">${(item.budgeted_amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-kabul font-sans">Spent</p>
                    <p className="text-xl font-bold text-millbrook font-sans">${(item.actual_amount || 0).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="w-full bg-linen rounded-full h-2">
                    <div 
                      className="bg-cement h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${item.budgeted_amount > 0 ? Math.min((item.actual_amount / item.budgeted_amount) * 100, 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <p className="text-sm text-kabul font-sans">
                  {item.budgeted_amount > 0 ? ((item.actual_amount / item.budgeted_amount) * 100).toFixed(1) : 0}% used
                </p>
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

export default BudgetPlannerPage;