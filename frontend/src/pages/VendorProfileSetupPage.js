import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, CheckCircle, Clock } from 'lucide-react';
import BusinessProfileWizard from '../components/BusinessProfileWizard';
import { Header, Footer } from '../components-airbnb';
import withRouterCompat from '../utils/routerCompat';

const VendorProfileSetupPage = () => {
  const { user, isAuthenticated, updateUserProfileStatus } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.user_type !== 'vendor') {
      navigate('/login');
      return;
    }
    
    // Load existing profile data
    loadProfileData();
  }, [isAuthenticated, user, navigate]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      // In a real app, fetch from API
      // const response = await fetch(`/api/vendor/profile/${user.id}`);
      // if (response.ok) {
      //   const data = await response.json();
      //   setProfileData(data);
      // }
      
      // For now, use empty data or localStorage
      const savedData = localStorage.getItem(`vendor_profile_${user?.id}`);
      if (savedData) {
        setProfileData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (formData) => {
    try {
      setSaving(true);
      
      // In a real app, save to API
      // const response = await fetch('/api/vendor/profile', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // For now, save to localStorage
      localStorage.setItem(`vendor_profile_${user?.id}`, JSON.stringify(formData));
      setProfileData(formData);
      
      // Update user profile status in auth context
      const isComplete = formData.profile_status === 'pending_review' || formData.profile_status === 'live';
      updateUserProfileStatus(isComplete);
      
      // Show success message and redirect
      if (formData.profile_status === 'pending_review') {
        setSaveMessage('Profile submitted for review! Redirecting to vendor dashboard...');
        
        // Redirect to vendor dashboard after submission
        setTimeout(() => {
          navigate('/vendor-dashboard');
        }, 2000);
      } else {
        setSaveMessage('Profile saved as draft successfully!');
      }
      
      // Clear message after 3 seconds (if not redirecting)
      if (formData.profile_status !== 'pending_review') {
        setTimeout(() => setSaveMessage(''), 3000);
      }
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewProfile = (currentFormData) => {
    setPreviewData(currentFormData);
    setShowPreview(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (showPreview) {
    return <ProfilePreview profileData={previewData} onBack={() => setShowPreview(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/vendor-dashboard')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Business Profile Setup</h1>
                <p className="text-gray-600">Create your professional wedding vendor profile</p>
              </div>
            </div>
            
            {profileData?.profile_status && (
              <div className="flex items-center">
                {profileData.profile_status === 'pending_review' && (
                  <div className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4 mr-2" />
                    Pending Review
                  </div>
                )}
                {profileData.profile_status === 'live' && (
                  <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Live
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Save Message */}
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              saveMessage.includes('Error') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          >
            {saveMessage}
          </motion.div>
        )}

        {/* Profile Wizard */}
        <BusinessProfileWizard
          initialData={profileData}
          onSave={handleSaveProfile}
          onPreview={handlePreviewProfile}
        />

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">💡 Profile Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Complete at least 80% of your profile to submit for review</li>
            <li>• High-quality photos significantly improve booking chances</li>
            <li>• Clear pricing helps couples make informed decisions</li>
            <li>• Detailed service descriptions build trust and transparency</li>
            <li>• Your profile will be reviewed within 24-48 hours</li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Profile Preview Component
const ProfilePreview = ({ profileData, onBack }) => {
  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>No profile data to preview</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Preview Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
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

      {/* Preview Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Hero Section */}
          <div className="relative h-64 bg-gradient-to-r from-rose-500 to-pink-600">
            {profileData.featured_image && (
              <img
                src={profileData.featured_image}
                alt="Featured"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">{profileData.business_name}</h1>
                <p className="text-lg opacity-90">{profileData.category}</p>
                {profileData.business_address && (
                  <p className="opacity-80">{profileData.business_address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Description */}
            {profileData.business_description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">About Us</h2>
                <p className="text-gray-700 leading-relaxed">{profileData.business_description}</p>
              </div>
            )}

            {/* Services */}
            {profileData.services && profileData.services.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profileData.services.map((service, index) => (
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

            {/* Gallery */}
            {profileData.gallery_images && profileData.gallery_images.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {profileData.gallery_images.slice(0, 8).map((image, index) => (
                    <div key={index} className="aspect-square">
                      <img
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                  {profileData.gallery_images.length > 8 && (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">+{profileData.gallery_images.length - 8} more</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Coverage Areas */}
            {profileData.coverage_areas && profileData.coverage_areas.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Service Areas</h2>
                <div className="flex flex-wrap gap-2">
                  {profileData.coverage_areas.map((area, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default withRouterCompat(VendorProfileSetupPage);