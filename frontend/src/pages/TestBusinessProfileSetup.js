import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Simple test component for Business Profile Setup
const TestBusinessProfileSetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    business_name: '',
    category: '',
    business_description: '',
    
    // Step 2: Services & Pricing
    services: [],
    
    // Step 3: Location & Coverage
    business_address: '',
    coverage_areas: [],
    
    // Step 4: Portfolio
    portfolio_description: '',
  });
  
  const [showPreview, setShowPreview] = useState(false);
  
  const categories = [
    'Photography', 'Videography', 'Catering', 'Venues', 'Florists', 
    'Music & Entertainment', 'Beauty & Hair', 'Wedding Planning',
    'Decoration', 'Transportation', 'Cake & Desserts', 'Other'
  ];
  
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const addService = () => {
    const services = [...formData.services, { name: '', description: '', price: '' }];
    updateFormData('services', services);
  };
  
  const updateService = (index, field, value) => {
    const services = [...formData.services];
    services[index] = { ...services[index], [field]: value };
    updateFormData('services', services);
  };
  
  const removeService = (index) => {
    const services = formData.services.filter((_, i) => i !== index);
    updateFormData('services', services);
  };
  
  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handlePreview = () => {
    setShowPreview(true);
  };
  
  if (showPreview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setShowPreview(false)}
                  className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Profile Preview</h1>
                  <p className="text-gray-600">How your profile will look to couples</p>
                </div>
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Preview Mode
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-64 bg-gradient-to-r from-rose-500 to-pink-600">
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                <div className="p-6 text-white">
                  <h1 className="text-3xl font-bold mb-2">{formData.business_name}</h1>
                  <p className="text-lg opacity-90">{formData.category}</p>
                  {formData.business_address && (
                    <p className="opacity-80">{formData.business_address}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {formData.business_description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">About Us</h2>
                  <p className="text-gray-700 leading-relaxed">{formData.business_description}</p>
                </div>
              )}
              
              {formData.services && formData.services.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Services</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.services.map((service, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">{service.name}</h3>
                          {service.price && (
                            <span className="text-rose-600 font-semibold">{service.price}</span>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-gray-600 text-sm">{service.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {formData.portfolio_description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Portfolio</h2>
                  <p className="text-gray-700 leading-relaxed">{formData.portfolio_description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Profile Setup</h1>
              <p className="text-gray-600">Create your professional wedding vendor profile</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Step {currentStep} of 5</h2>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-rose-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Business Information</h3>
                <p className="text-gray-600 mb-6">Let's start with the essential details about your business.</p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">📋 Requirements to proceed:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Business name (required)</li>
                    <li>• Category selection (required)</li>
                    <li>• Business description (required - tell couples about your business)</li>
                  </ul>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => updateFormData('business_name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent border-gray-300"
                    placeholder="Enter your business name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateFormData('category', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent border-gray-300"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description *
                </label>
                <textarea
                  value={formData.business_description}
                  onChange={(e) => updateFormData('business_description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent border-gray-300"
                  placeholder="Tell couples about your business, your style, and what makes your services special..."
                />
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Services & Pricing</h3>
                <p className="text-gray-600 mb-6">Define what you offer and your pricing structure.</p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">📋 Requirements to proceed:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• At least one complete service (required)</li>
                    <li>• Each service must have a name and starting price</li>
                    <li>• Service description is recommended but optional</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Services *
                  </label>
                  <button
                    onClick={addService}
                    className="px-3 py-1 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                  >
                    Add Service
                  </button>
                </div>
                
                {formData.services.map((service, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => updateService(index, 'name', e.target.value)}
                        placeholder="Service name"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={service.price}
                        onChange={(e) => updateService(index, 'price', e.target.value)}
                        placeholder="Starting price (e.g., $500)"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeService(index)}
                        className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      value={service.description}
                      onChange={(e) => updateService(index, 'description', e.target.value)}
                      placeholder="Describe this service..."
                      rows={2}
                      className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Coverage</h3>
                <p className="text-gray-600 mb-6">Where is your business located and what areas do you serve?</p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">📋 Requirements to proceed:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Business address (required - where clients can find you)</li>
                    <li>• Coverage areas are optional but recommended</li>
                    <li>• List areas you're willing to travel to for events</li>
                    <li>• Separate multiple areas with commas</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address *
                </label>
                <input
                  type="text"
                  value={formData.business_address}
                  onChange={(e) => updateFormData('business_address', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent border-gray-300"
                  placeholder="Enter your business address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coverage Areas
                </label>
                <input
                  type="text"
                  value={formData.coverage_areas.join(', ')}
                  onChange={(e) => updateFormData('coverage_areas', e.target.value.split(',').map(area => area.trim()))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="e.g., Sydney, Blue Mountains, Central Coast (separate with commas)"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter areas you're willing to travel to for events
                </p>
              </div>
            </div>
          )}
          
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h3>
                <p className="text-gray-600 mb-6">Showcase your work to attract potential clients.</p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">📋 Requirements to proceed:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Portfolio description (required - describe your style and approach)</li>
                    <li>• Gallery images are optional but highly recommended</li>
                    <li>• Upload your best work to showcase your quality</li>
                    <li>• Images help couples visualize your services</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio Description *
                </label>
                <textarea
                  value={formData.portfolio_description}
                  onChange={(e) => updateFormData('portfolio_description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent border-gray-300"
                  placeholder="Describe your style, approach, and what couples can expect when working with you..."
                />
              </div>
            </div>
          )}
          
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Profile</h3>
                <p className="text-gray-600 mb-6">Please review all information before submitting.</p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-green-900 mb-2">✅ Final Steps:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Review all your information below</li>
                    <li>• Use the Preview button to see how your profile will look to couples</li>
                    <li>• Save as draft to continue editing later</li>
                    <li>• Submit for review when you're ready (requires 80% completion)</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Business Name:</span>
                      <span className="ml-2 font-medium">{formData.business_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 font-medium">{formData.category}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Description:</span>
                      <p className="ml-2 font-medium">{formData.business_description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Services & Pricing</h4>
                  <div className="text-sm">
                    <div>
                      <span className="text-gray-500">Services:</span>
                      <span className="ml-2 font-medium">{formData.services.length} services</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Location</h4>
                  <div className="text-sm">
                    <div>
                      <span className="text-gray-500">Business Address:</span>
                      <span className="ml-2 font-medium">{formData.business_address}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Coverage Areas:</span>
                      <span className="ml-2 font-medium">{formData.coverage_areas.join(', ')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Portfolio</h4>
                  <div className="text-sm">
                    <div>
                      <span className="text-gray-500">Portfolio Description:</span>
                      <p className="ml-2 font-medium">{formData.portfolio_description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            
            <div className="flex items-center space-x-3">
              {currentStep < 5 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                >
                  Next →
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handlePreview}
                    className="flex items-center px-4 py-2 border border-rose-600 text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    Preview
                  </button>
                  <button
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Submit for Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestBusinessProfileSetup;