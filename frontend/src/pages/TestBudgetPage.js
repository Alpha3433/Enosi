import React, { useState, useEffect } from 'react';
import { Header, Footer } from '../components-airbnb';

const TestBudgetPage = () => {
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
    }
  ]);
  
  const [newCategory, setNewCategory] = useState({ name: '', budget: '' });
  const [showAddCategory, setShowAddCategory] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Budget Page</h1>
          <p className="text-gray-600">Simple test page for budget functionality</p>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
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
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Budgeted</p>
              <p className="text-2xl font-bold text-gray-900">${totalBudgeted.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Spent</p>
              <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(remaining).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Budget Categories</h3>
            <button
              onClick={() => setShowAddCategory(true)}
              className="flex items-center bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
            >
              Add Category
            </button>
          </div>

          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${category.color} mr-3`}></div>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      Delete
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
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Spent Amount</label>
                    <input
                      type="number"
                      value={category.spent}
                      onChange={(e) => updateCategory(category.id, 'spent', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
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
              </div>
            ))}
          </div>
        </div>

        {/* Add Category Modal */}
        {showAddCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Category</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Transportation"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Budget Amount</label>
                  <input
                    type="number"
                    value={newCategory.budget}
                    onChange={(e) => setNewCategory({...newCategory, budget: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
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
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TestBudgetPage;