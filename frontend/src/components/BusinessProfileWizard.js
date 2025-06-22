import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Circle,
  Upload,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Eye,
  Save,
  AlertCircle,
  Info
} from 'lucide-react';

// Step Components (moved outside to prevent re-creation on each render)
const Step1BasicInfo = ({ formData, updateFormData, errors, categories }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Business Information</h3>
        <p className="text-gray-600 mb-6">Let's start with the essential details about your business.</p>
        
        {/* Requirements */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">📋 Requirements to proceed:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Business name (required)</li>
            <li>• Category selection (required)</li>
            <li>• Business description (required - tell couples about your business)</li>
            <li>• Subcategory and ABN are optional</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
            <Info className="inline h-4 w-4 ml-1 text-gray-400" title="This will appear on your public listing" />
          </label>
          <input
            type="text"
            value={formData.business_name}
            onChange={(e) => updateFormData('business_name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
              errors.business_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your business name"
          />
          {errors.business_name && (
            <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => updateFormData('category', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subcategory
          </label>
          <input
            type="text"
            value={formData.subcategory}
            onChange={(e) => updateFormData('subcategory', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="e.g., Wedding Photography, Portrait Photography"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ABN (Optional)
          </label>
          <input
            type="text"
            value={formData.abn}
            onChange={(e) => updateFormData('abn', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="12 345 678 901"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Description *
          <Info className="inline h-4 w-4 ml-1 text-gray-400" title="Describe your business and what makes you unique" />
        </label>
        <textarea
          value={formData.business_description}
          onChange={(e) => updateFormData('business_description', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
            errors.business_description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Tell couples about your business, your style, and what makes your services special..."
        />
        {errors.business_description && (
          <p className="mt-1 text-sm text-red-600">{errors.business_description}</p>
        )}
      </div>
    </div>
  );
};

const Step2ServicesAndPricing = ({ formData, updateFormData, errors, addService, updateService, removeService, addPricingPackage, updatePricingPackage, removePricingPackage, serviceSpecialties, toggleSpecialty }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Services & Pricing</h3>
        <p className="text-gray-600 mb-6">Define what you offer and your pricing structure.</p>
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
        
        {errors.services && (
          <p className="mt-1 text-sm text-red-600">{errors.services}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Service Specialties
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {serviceSpecialties.map(specialty => (
            <button
              key={specialty}
              onClick={() => toggleSpecialty(specialty)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                formData.service_specialties.includes(specialty)
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-rose-300'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Step3LocationAndCoverage = ({ formData, updateFormData, errors }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Coverage</h3>
        <p className="text-gray-600 mb-6">Where is your business located and what areas do you serve?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Address *
        </label>
        <input
          type="text"
          value={formData.business_address}
          onChange={(e) => updateFormData('business_address', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
            errors.business_address ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your business address"
        />
        {errors.business_address && (
          <p className="mt-1 text-sm text-red-600">{errors.business_address}</p>
        )}
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
  );
};

const Step4Portfolio = ({ formData, updateFormData, errors, handleImageUpload, removeImage }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h3>
        <p className="text-gray-600 mb-6">Showcase your work to attract potential clients.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Portfolio Description *
        </label>
        <textarea
          value={formData.portfolio_description}
          onChange={(e) => updateFormData('portfolio_description', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
            errors.portfolio_description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe your style, approach, and what couples can expect when working with you..."
        />
        {errors.portfolio_description && (
          <p className="mt-1 text-sm text-red-600">{errors.portfolio_description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Gallery Images *
        </label>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="gallery-upload"
          />
          <label
            htmlFor="gallery-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Upload Portfolio Images</p>
            <p className="text-gray-500">Drag and drop files here, or click to select</p>
            <p className="text-sm text-gray-400 mt-2">PNG, JPG, GIF up to 10MB each</p>
          </label>
        </div>

        {formData.gallery_images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {formData.gallery_images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Portfolio ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        {errors.gallery_images && (
          <p className="mt-1 text-sm text-red-600">{errors.gallery_images}</p>
        )}
      </div>
    </div>
  );
};

const Step5Review = ({ formData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Profile</h3>
        <p className="text-gray-600 mb-6">Please review all information before submitting.</p>
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
              <span className="text-gray-500">Gallery Images:</span>
              <span className="ml-2 font-medium">{formData.gallery_images.length} images</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BusinessProfileWizard = ({ initialData = null, onSave, onPreview }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    business_name: '',
    category: '',
    subcategory: '',
    abn: '',
    business_description: '',
    
    // Step 2: Services & Pricing
    services: [],
    pricing_packages: [],
    service_specialties: [],
    
    // Step 3: Location & Coverage
    business_address: '',
    coverage_areas: [],
    latitude: null,
    longitude: null,
    
    // Step 4: Portfolio
    portfolio_description: '',
    gallery_images: [],
    featured_image: '',
    
    // Additional Info
    website: '',
    social_media: {},
    years_experience: null,
    team_size: null,
    
    ...initialData
  });

  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isDraft, setIsDraft] = useState(true);
  const [errors, setErrors] = useState({});

  const steps = [
    {
      id: 1,
      title: 'Basic Info',
      description: 'Business details and category',
      icon: <Circle className="h-5 w-5" />,
      fields: ['business_name', 'category', 'business_description']
    },
    {
      id: 2,
      title: 'Services & Pricing',
      description: 'What you offer and pricing',
      icon: <DollarSign className="h-5 w-5" />,
      fields: ['services']
    },
    {
      id: 3,
      title: 'Location & Coverage',
      description: 'Where you operate',
      icon: <MapPin className="h-5 w-5" />,
      fields: ['business_address']
    },
    {
      id: 4,
      title: 'Portfolio',
      description: 'Showcase your work',
      icon: <ImageIcon className="h-5 w-5" />,
      fields: ['portfolio_description']
    },
    {
      id: 5,
      title: 'Review',
      description: 'Final review and submit',
      icon: <CheckCircle className="h-5 w-5" />,
      fields: []
    }
  ];

  const categories = [
    'Photography', 'Videography', 'Catering', 'Venues', 'Florists', 
    'Music & Entertainment', 'Beauty & Hair', 'Wedding Planning',
    'Decoration', 'Transportation', 'Cake & Desserts', 'Other'
  ];

  const serviceSpecialties = [
    'Outdoor', 'Indoor', 'Luxury', 'Budget-Friendly', 'Vintage', 
    'Modern', 'Rustic', 'Bohemian', 'Traditional', 'Destination',
    'Small Intimate', 'Large Events', 'Cultural Ceremonies'
  ];

  // Calculate completion percentage
  useEffect(() => {
    const calculateCompletion = () => {
      const requiredFields = [
        'business_name', 'category', 'business_description', 'business_address',
        'services', 'pricing_packages', 'portfolio_description', 'gallery_images'
      ];
      
      const optionalFields = [
        'subcategory', 'abn', 'service_specialties', 'coverage_areas',
        'featured_image', 'website', 'years_experience', 'team_size'
      ];
      
      let completedFields = 0;
      const maxPoints = requiredFields.length * 2 + optionalFields.length;
      
      // Check required fields (worth double)
      requiredFields.forEach(field => {
        const value = formData[field];
        if (value && (typeof value !== 'object' || value.length > 0)) {
          completedFields += 2;
        }
      });
      
      // Check optional fields
      optionalFields.forEach(field => {
        const value = formData[field];
        if (value && (typeof value !== 'object' || value.length > 0)) {
          completedFields += 1;
        }
      });
      
      const percentage = Math.min(100, Math.round((completedFields / maxPoints) * 100));
      setCompletionPercentage(percentage);
    };
    
    calculateCompletion();
  }, [formData]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = (stepId) => {
    const step = steps.find(s => s.id === stepId);
    const stepErrors = {};
    
    step.fields.forEach(field => {
      const value = formData[field];
      
      if (field === 'services') {
        // Special validation for services - need at least one complete service
        if (!value || value.length === 0) {
          stepErrors[field] = 'At least one service is required';
        } else {
          // Check if at least one service has name and price filled
          const hasCompleteService = value.some(service => 
            service.name && service.name.trim() && 
            service.price && service.price.trim()
          );
          if (!hasCompleteService) {
            stepErrors[field] = 'Please complete at least one service with name and price';
          }
        }
      } else if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === '')) {
        stepErrors[field] = 'This field is required';
      }
    });
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
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

  const addPricingPackage = () => {
    const packages = [...formData.pricing_packages, { 
      name: '', 
      description: '', 
      price: '', 
      inclusions: [] 
    }];
    updateFormData('pricing_packages', packages);
  };

  const updatePricingPackage = (index, field, value) => {
    const packages = [...formData.pricing_packages];
    packages[index] = { ...packages[index], [field]: value };
    updateFormData('pricing_packages', packages);
  };

  const removePricingPackage = (index) => {
    const packages = formData.pricing_packages.filter((_, i) => i !== index);
    updateFormData('pricing_packages', packages);
  };

  const toggleSpecialty = (specialty) => {
    const specialties = formData.service_specialties.includes(specialty)
      ? formData.service_specialties.filter(s => s !== specialty)
      : [...formData.service_specialties, specialty];
    updateFormData('service_specialties', specialties);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    // In a real app, you'd upload these to a cloud storage service
    const imageUrls = files.map(file => URL.createObjectURL(file));
    updateFormData('gallery_images', [...formData.gallery_images, ...imageUrls]);
  };

  const removeImage = (index) => {
    const images = formData.gallery_images.filter((_, i) => i !== index);
    updateFormData('gallery_images', images);
  };

  const saveDraft = () => {
    setIsDraft(true);
    onSave({ ...formData, profile_status: 'incomplete' });
  };

  const submitForReview = () => {
    if (completionPercentage >= 80) {
      setIsDraft(false);
      onSave({ ...formData, profile_status: 'pending_review' });
    }
  };

  const isStepCompleted = (stepId) => {
    const step = steps.find(s => s.id === stepId);
    return step.fields.every(field => {
      const value = formData[field];
      return value && (typeof value !== 'object' || value.length > 0);
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Progress Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Business Profile Setup</h2>
          <div className="text-right">
            <div className="text-sm text-gray-500">Profile Completion</div>
            <div className="text-2xl font-bold text-rose-600">{completionPercentage}%</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-rose-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all cursor-pointer ${
                  currentStep === step.id
                    ? 'border-rose-600 bg-rose-600 text-white'
                    : isStepCompleted(step.id)
                    ? 'border-green-500 bg-green-500 text-white'
                    : currentStep > step.id
                    ? 'border-gray-400 bg-gray-400 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                {isStepCompleted(step.id) ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              
              <div className="ml-3 hidden sm:block">
                <div className={`text-sm font-medium ${
                  currentStep === step.id ? 'text-rose-600' : 'text-gray-900'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-300 ml-4 hidden sm:block"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 1 && (
              <Step1BasicInfo 
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
                categories={categories}
              />
            )}
            {currentStep === 2 && (
              <Step2ServicesAndPricing 
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
                addService={addService}
                updateService={updateService}
                removeService={removeService}
                addPricingPackage={addPricingPackage}
                updatePricingPackage={updatePricingPackage}
                removePricingPackage={removePricingPackage}
                serviceSpecialties={serviceSpecialties}
                toggleSpecialty={toggleSpecialty}
              />
            )}
            {currentStep === 3 && (
              <Step3LocationAndCoverage 
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}
            {currentStep === 4 && (
              <Step4Portfolio 
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
                handleImageUpload={handleImageUpload}
                removeImage={removeImage}
              />
            )}
            {currentStep === 5 && (
              <Step5Review 
                formData={formData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={saveDraft}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              className="flex items-center px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={() => onPreview(formData)}
                className="flex items-center px-4 py-2 border border-rose-600 text-rose-600 rounded-lg hover:bg-rose-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>
              <button
                onClick={submitForReview}
                disabled={completionPercentage < 80}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit for Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

};

export default BusinessProfileWizard;