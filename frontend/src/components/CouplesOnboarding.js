import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft, 
  Heart, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  CheckCircle,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CouplesOnboarding = ({ onComplete, onSkip }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    partner1_name: '',
    partner2_name: '',
    wedding_location: '',
    wedding_date: '',
    wedding_timeframe: '',
    guest_count: '',
    budget_type: '', // 'per_vendor' or 'total'
    budget_range: '',
    vendor_categories: [],
    planning_priorities: [],
    planning_progress: '',
    referral_source: ''
  });

  const totalSteps = 5;

  const vendorCategories = [
    { key: 'venue', label: 'Venues', icon: '🏛️' },
    { key: 'photographer', label: 'Photography', icon: '📸' },
    { key: 'videographer', label: 'Videography', icon: '🎥' },
    { key: 'catering', label: 'Catering', icon: '🍽️' },
    { key: 'florist', label: 'Florists', icon: '🌸' },
    { key: 'music', label: 'Music & Entertainment', icon: '🎵' },
    { key: 'makeup', label: 'Hair & Makeup', icon: '💄' },
    { key: 'decorator', label: 'Decoration', icon: '🎨' },
    { key: 'transport', label: 'Transportation', icon: '🚗' },
    { key: 'celebrant', label: 'Celebrant', icon: '👥' },
    { key: 'stationery', label: 'Stationery', icon: '📋' }
  ];

  const planningPriorities = [
    'Staying on budget',
    'Beautiful aesthetic',
    'Easy communication',
    'Reliability & punctuality',
    'Unique & creative ideas',
    'Local vendors',
    'Eco-friendly options',
    'Quick responses',
    'Package deals',
    'Flexible booking'
  ];

  const budgetRanges = {
    per_vendor: [
      'Under $1,000',
      '$1,000 - $2,500',
      '$2,500 - $5,000',
      '$5,000 - $10,000',
      'Over $10,000'
    ],
    total: [
      'Under $10,000',
      '$10,000 - $20,000',
      '$20,000 - $35,000',
      '$35,000 - $50,000',
      '$50,000 - $75,000',
      'Over $75,000'
    ]
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value].slice(0, field === 'planning_priorities' ? 3 : 10)
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    // Save onboarding data to localStorage and user profile
    const onboardingData = {
      ...formData,
      completed_at: new Date().toISOString(),
      user_id: user?.id
    };

    // Save to localStorage for immediate use
    localStorage.setItem(`onboarding_data_${user?.id}`, JSON.stringify(onboardingData));
    
    // Mark onboarding as completed
    localStorage.setItem(`onboarding_completed_${user?.id}`, 'true');

    // Save to couple profile for dashboard
    const coupleProfileKey = `couple_profile_${user?.id || 'default'}`;
    const existingProfile = localStorage.getItem(coupleProfileKey);
    const profile = existingProfile ? JSON.parse(existingProfile) : {};
    
    profile.onboarding_data = onboardingData;
    profile.wedding_location = formData.wedding_location;
    profile.wedding_date = formData.wedding_date;
    profile.guest_count = formData.guest_count;
    profile.budget_range = formData.budget_range;
    profile.preferred_vendors = formData.vendor_categories;
    
    localStorage.setItem(coupleProfileKey, JSON.stringify(profile));

    onComplete(onboardingData);
  };

  const skipOnboarding = () => {
    // Mark as completed but without data
    localStorage.setItem(`onboarding_completed_${user?.id}`, 'true');
    onSkip();
  };

  const renderProgressBar = () => (
    <div className="w-full bg-linen rounded-full h-2 mb-8">
      <div 
        className="bg-cement h-2 rounded-full transition-all duration-300"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      ></div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-coral-reef bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-coral-reef" />
        </div>
        <h2 className="text-2xl font-bold text-millbrook mb-2 font-sans">Let's get to know you!</h2>
        <p className="text-kabul font-sans">Tell us about yourselves so we can personalize your experience</p>
        <p className="text-sm text-napa font-sans mt-2">This will only take 2 minutes</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-millbrook mb-2 font-sans">
            First partner's name
          </label>
          <input
            type="text"
            value={formData.partner1_name}
            onChange={(e) => handleInputChange('partner1_name', e.target.value)}
            placeholder="Enter first name"
            className="w-full px-4 py-3 border border-coral-reef rounded-lg focus:ring-2 focus:ring-cement focus:border-cement font-sans"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-millbrook mb-2 font-sans">
            Second partner's name
          </label>
          <input
            type="text"
            value={formData.partner2_name}
            onChange={(e) => handleInputChange('partner2_name', e.target.value)}
            placeholder="Enter first name"
            className="w-full px-4 py-3 border border-coral-reef rounded-lg focus:ring-2 focus:ring-cement focus:border-cement font-sans"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-coral-reef bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-coral-reef" />
        </div>
        <h2 className="text-2xl font-bold text-millbrook mb-2 font-sans">Where's the magic happening?</h2>
        <p className="text-kabul font-sans">Help us find vendors in your area</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-millbrook mb-2 font-sans">
            Wedding location
          </label>
          <select
            value={formData.wedding_location}
            onChange={(e) => handleInputChange('wedding_location', e.target.value)}
            className="w-full px-4 py-3 border border-coral-reef rounded-lg focus:ring-2 focus:ring-cement focus:border-cement font-sans"
          >
            <option value="">Select your location</option>
            <option value="New South Wales">New South Wales</option>
            <option value="Victoria">Victoria</option>
            <option value="Queensland">Queensland</option>
            <option value="Western Australia">Western Australia</option>
            <option value="South Australia">South Australia</option>
            <option value="Tasmania">Tasmania</option>
            <option value="Australian Capital Territory">Australian Capital Territory</option>
            <option value="Northern Territory">Northern Territory</option>
            <option value="Other">Other / International</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-millbrook mb-2 font-sans">
              Wedding date (if known)
            </label>
            <input
              type="date"
              value={formData.wedding_date}
              onChange={(e) => handleInputChange('wedding_date', e.target.value)}
              className="w-full px-4 py-3 border border-coral-reef rounded-lg focus:ring-2 focus:ring-cement focus:border-cement font-sans"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-millbrook mb-2 font-sans">
              Or timeframe
            </label>
            <select
              value={formData.wedding_timeframe}
              onChange={(e) => handleInputChange('wedding_timeframe', e.target.value)}
              className="w-full px-4 py-3 border border-coral-reef rounded-lg focus:ring-2 focus:ring-cement focus:border-cement font-sans"
            >
              <option value="">Select timeframe</option>
              <option value="Next 3 months">Next 3 months</option>
              <option value="3-6 months">3-6 months</option>
              <option value="6-12 months">6-12 months</option>
              <option value="1-2 years">1-2 years</option>
              <option value="2+ years">2+ years</option>
              <option value="Just browsing">Just browsing</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-coral-reef bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-coral-reef" />
        </div>
        <h2 className="text-2xl font-bold text-millbrook mb-2 font-sans">Let's talk numbers</h2>
        <p className="text-kabul font-sans">This helps us find vendors that match your scale and budget</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-millbrook mb-2 font-sans">
            Estimated guest count
          </label>
          <select
            value={formData.guest_count}
            onChange={(e) => handleInputChange('guest_count', e.target.value)}
            className="w-full px-4 py-3 border border-coral-reef rounded-lg focus:ring-2 focus:ring-cement focus:border-cement font-sans"
          >
            <option value="">Select guest count</option>
            <option value="Under 25">Intimate (Under 25)</option>
            <option value="25-50">Small (25-50)</option>
            <option value="50-100">Medium (50-100)</option>
            <option value="100-150">Large (100-150)</option>
            <option value="150+">Very Large (150+)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-millbrook mb-3 font-sans">
            Budget type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center p-4 border border-coral-reef rounded-lg cursor-pointer hover:bg-linen transition-colors">
              <input
                type="radio"
                name="budget_type"
                value="per_vendor"
                checked={formData.budget_type === 'per_vendor'}
                onChange={(e) => handleInputChange('budget_type', e.target.value)}
                className="mr-3 w-4 h-4 text-cement border-coral-reef focus:ring-cement"
              />
              <div>
                <span className="text-sm font-medium text-millbrook font-sans">Per vendor</span>
                <p className="text-xs text-kabul font-sans">Budget for each vendor category</p>
              </div>
            </label>
            <label className="flex items-center p-4 border border-coral-reef rounded-lg cursor-pointer hover:bg-linen transition-colors">
              <input
                type="radio"
                name="budget_type"
                value="total"
                checked={formData.budget_type === 'total'}
                onChange={(e) => handleInputChange('budget_type', e.target.value)}
                className="mr-3 w-4 h-4 text-cement border-coral-reef focus:ring-cement"
              />
              <div>
                <span className="text-sm font-medium text-millbrook font-sans">Total wedding</span>
                <p className="text-xs text-kabul font-sans">Overall wedding budget</p>
              </div>
            </label>
          </div>
        </div>

        {formData.budget_type && (
          <div>
            <label className="block text-sm font-medium text-millbrook mb-2 font-sans">
              Budget range {formData.budget_type === 'per_vendor' ? '(per vendor)' : '(total wedding)'}
            </label>
            <select
              value={formData.budget_range}
              onChange={(e) => handleInputChange('budget_range', e.target.value)}
              className="w-full px-4 py-3 border border-coral-reef rounded-lg focus:ring-2 focus:ring-cement focus:border-cement font-sans"
            >
              <option value="">Select budget range</option>
              {budgetRanges[formData.budget_type].map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-coral-reef bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-coral-reef" />
        </div>
        <h2 className="text-2xl font-bold text-millbrook mb-2 font-sans">What vendors do you need?</h2>
        <p className="text-kabul font-sans">Select all the vendor categories you're interested in</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {vendorCategories.map(category => (
          <label
            key={category.key}
            className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
              formData.vendor_categories.includes(category.key)
                ? 'border-cement bg-cement bg-opacity-10 text-cement'
                : 'border-coral-reef hover:bg-linen'
            }`}
          >
            <input
              type="checkbox"
              checked={formData.vendor_categories.includes(category.key)}
              onChange={() => handleArrayToggle('vendor_categories', category.key)}
              className="sr-only"
            />
            <span className="text-2xl mb-2">{category.icon}</span>
            <span className="text-sm text-center font-medium font-sans">{category.label}</span>
          </label>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-millbrook mb-3 font-sans">
            What's your top 3 planning priorities? (Select up to 3)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {planningPriorities.map(priority => (
              <label
                key={priority}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.planning_priorities.includes(priority)
                    ? 'border-cement bg-cement bg-opacity-10'
                    : 'border-coral-reef hover:bg-linen'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.planning_priorities.includes(priority)}
                  onChange={() => handleArrayToggle('planning_priorities', priority)}
                  disabled={!formData.planning_priorities.includes(priority) && formData.planning_priorities.length >= 3}
                  className="mr-3 w-4 h-4 text-cement border-coral-reef rounded focus:ring-cement"
                />
                <span className="text-sm text-kabul font-sans">{priority}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-napa mt-2 font-sans">
            Selected: {formData.planning_priorities.length}/3
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-coral-reef bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-coral-reef" />
        </div>
        <h2 className="text-2xl font-bold text-millbrook mb-2 font-sans">Almost done!</h2>
        <p className="text-kabul font-sans">Just a couple more questions to personalize your experience</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-millbrook mb-3 font-sans">
            How far along are you in your planning?
          </label>
          <div className="space-y-3">
            {[
              { value: 'just_browsing', label: 'Just browsing - early stages' },
              { value: 'some_research', label: 'Done some research, ready to book' },
              { value: 'some_vendors', label: 'Have booked some vendors already' },
              { value: 'nearly_done', label: 'Nearly done, just need a few more' }
            ].map(option => (
              <label
                key={option.value}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.planning_progress === option.value
                    ? 'border-cement bg-cement bg-opacity-10'
                    : 'border-coral-reef hover:bg-linen'
                }`}
              >
                <input
                  type="radio"
                  name="planning_progress"
                  value={option.value}
                  checked={formData.planning_progress === option.value}
                  onChange={(e) => handleInputChange('planning_progress', e.target.value)}
                  className="mr-3 w-4 h-4 text-cement border-coral-reef focus:ring-cement"
                />
                <span className="text-sm text-kabul font-sans">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-millbrook mb-2 font-sans">
            How did you hear about Enosi? (Optional)
          </label>
          <select
            value={formData.referral_source}
            onChange={(e) => handleInputChange('referral_source', e.target.value)}
            className="w-full px-4 py-3 border border-coral-reef rounded-lg focus:ring-2 focus:ring-cement focus:border-cement font-sans"
          >
            <option value="">Select an option</option>
            <option value="google_search">Google search</option>
            <option value="social_media">Social media</option>
            <option value="friend_family">Friend or family</option>
            <option value="vendor_referral">Vendor referral</option>
            <option value="wedding_website">Wedding website/blog</option>
            <option value="advertisement">Advertisement</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.partner1_name.trim() !== '' || formData.partner2_name.trim() !== '';
      case 2:
        return formData.wedding_location !== '' || formData.wedding_timeframe !== '';
      case 3:
        return formData.guest_count !== '' || formData.budget_range !== '';
      case 4:
        return formData.vendor_categories.length > 0;
      case 5:
        return formData.planning_progress !== '';
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-millbrook font-sans">Enosi</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-kabul font-sans">Step {currentStep} of {totalSteps}</span>
              <button
                onClick={skipOnboarding}
                className="text-sm text-napa hover:text-kabul transition-colors font-sans"
              >
                Skip for now
              </button>
              <button
                onClick={skipOnboarding}
                className="text-kabul hover:text-millbrook transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Step Content */}
          <div className="mb-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-sans transition-colors ${
                currentStep === 1
                  ? 'text-napa cursor-not-allowed'
                  : 'text-kabul hover:text-millbrook'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-sans font-medium transition-colors ${
                isStepValid()
                  ? 'bg-cement text-white hover:bg-millbrook'
                  : 'bg-napa text-white cursor-not-allowed'
              }`}
            >
              <span>{currentStep === totalSteps ? 'Complete Setup' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Reassuring Message */}
          <p className="text-center text-xs text-napa mt-4 font-sans">
            We'll use this to make your planning easier • Nothing's locked in – you can update this later
          </p>
        </div>
      </div>
    </div>
  );
};

export default CouplesOnboarding;