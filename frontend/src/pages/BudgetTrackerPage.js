import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  DollarSign,
  Plus,
  Edit,
  Trash2,
  PieChart,
  TrendingUp,
  Calculator,
  ArrowLeft,
  Download,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header, Footer } from '../components';
import { planningAPI, couplesAPI } from '../services/api';

const BudgetTrackerPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const queryClient = useQueryClient();

  const { data: budgetItems, isLoading } = useQuery({
    queryKey: ['budget-items'],
    queryFn: planningAPI.getBudgetItems,
  });

  const { data: profile } = useQuery({
    queryKey: ['couple-profile'],
    queryFn: couplesAPI.getProfile,
  });

  const createItemMutation = useMutation({
    mutationFn: planningAPI.createBudgetItem,
    onSuccess: () => {
      queryClient.invalidateQueries(['budget-items']);
      setShowAddModal(false);
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    createItemMutation.mutate({
      ...data,
      estimated_cost: parseFloat(data.estimated_cost),
      actual_cost: data.actual_cost ? parseFloat(data.actual_cost) : null
    });
    reset();
  };

  const items = budgetItems?.data || [];
  const totalBudget = profile?.data?.budget || 0;
  const totalEstimated = items.reduce((sum, item) => sum + item.estimated_cost, 0);
  const totalSpent = items.reduce((sum, item) => sum + (item.actual_cost || 0), 0);
  const remaining = totalBudget - totalSpent;

  const categories = [
    'Venue',
    'Photography',
    'Catering',
    'Flowers',
    'Music',
    'Dress/Attire',
    'Rings',
    'Transportation',
    'Decorations',
    'Stationery',
    'Other'
  ];

  const categoryTotals = categories.map(category => {
    const categoryItems = items.filter(item => item.category === category);
    return {
      category,
      estimated: categoryItems.reduce((sum, item) => sum + item.estimated_cost, 0),
      actual: categoryItems.reduce((sum, item) => sum + (item.actual_cost || 0), 0),
      count: categoryItems.length
    };
  }).filter(cat => cat.count > 0);

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
            <h1 className="text-3xl font-bold text-gray-900">Budget Tracker</h1>
            <p className="text-gray-600 mt-1">
              Track your wedding expenses and stay within budget
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalBudget.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estimated Cost</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${totalEstimated.toLocaleString()}
                </p>
              </div>
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actual Spent</p>
                <p className="text-2xl font-bold text-rose-600">
                  ${totalSpent.toLocaleString()}
                </p>
              </div>
              <div className="bg-rose-100 w-12 h-12 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-rose-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${remaining.toLocaleString()}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                remaining >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <PieChart className={`h-6 w-6 ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Budget Progress */}
        {totalBudget > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Spent: ${totalSpent.toLocaleString()}</span>
                  <span>{((totalSpent / totalBudget) * 100).toFixed(1)}% of budget</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      (totalSpent / totalBudget) > 1 ? 'bg-red-500' : 
                      (totalSpent / totalBudget) > 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
                  ></div>
                </div>
                {(totalSpent / totalBudget) > 1 && (
                  <div className="flex items-center mt-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Over budget by ${(totalSpent - totalBudget).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {categoryTotals.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Category Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTotals.map((cat) => (
                <div key={cat.category} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{cat.category}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated:</span>
                      <span className="font-medium">${cat.estimated.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actual:</span>
                      <span className="font-medium text-rose-600">${cat.actual.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">{cat.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Budget Items</h2>
          </div>
          
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estimated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.item_name}</div>
                          {item.notes && (
                            <div className="text-sm text-gray-500">{item.notes}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.estimated_cost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.actual_cost ? (
                          <span className="text-rose-600 font-medium">
                            ${item.actual_cost.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.actual_cost 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.actual_cost ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-rose-600 hover:text-rose-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No budget items yet</h3>
              <p className="text-gray-600 mb-6">Start tracking your wedding expenses</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700"
              >
                Add First Item
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add Budget Item</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input
                  {...register('item_name', { required: 'Item name is required' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g., Wedding dress"
                />
                {errors.item_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.item_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost</label>
                <input
                  {...register('estimated_cost', { required: 'Estimated cost is required' })}
                  type="number"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="0.00"
                />
                {errors.estimated_cost && (
                  <p className="mt-1 text-sm text-red-600">{errors.estimated_cost.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Actual Cost (Optional)</label>
                <input
                  {...register('actual_cost')}
                  type="number"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="Additional notes..."
                />
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
                  {createItemMutation.isLoading ? 'Adding...' : 'Add Item'}
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

export default BudgetTrackerPage;