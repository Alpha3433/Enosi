import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, CheckCircle, Clock } from 'lucide-react';
import BusinessProfileWizard from '../components/BusinessProfileWizard';
import { Header, Footer } from '../components-airbnb';

const VendorProfileSetupPage = () => {
  const { user, isAuthenticated, updateUserProfileStatus } = useAuth();
  const navigate = useNavigate();
  const params = useParams(); // Use useParams instead of match
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
      let profileData = {};
      
      if (savedData) {
        profileData = JSON.parse(savedData);
      }
      
      // Auto-fill business name from user signup data if not already set
      if (!profileData.business_name && user?.business_name) {
        profileData.business_name = user.business_name;
      }
      
      setProfileData(profileData);
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

// Profile Preview Component - Eternal Moments Photography Design
const ProfilePreview = ({ profileData, onBack }) => {
  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>No profile data to preview</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Preview Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Profile Preview</h1>
                <p className="text-gray-600 text-sm">How your profile will look to couples</p>
              </div>
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Preview Mode
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="h-96 bg-gradient-to-r from-amber-50 to-orange-50">
          {profileData.featured_image ? (
            <img
              src={profileData.featured_image}
              alt="Featured"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-amber-50 to-orange-50"></div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="text-center text-white max-w-2xl mx-auto px-6">
              <h1 className="text-5xl font-serif mb-4" style={{ color: '#333333', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                {profileData.business_name || 'Business Name'}
              </h1>
              <p className="text-xl font-light" style={{ color: '#333333', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                {profileData.category || 'Wedding Vendor'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* About Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif mb-8" style={{ color: '#7A8354' }}>About Us</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg leading-relaxed" style={{ color: '#333333', lineHeight: '1.6' }}>
              {profileData.business_description || 'Capturing life\'s most precious moments with timeless elegance and artistic vision. Every photograph tells a story, and we\'re here to make yours unforgettable.'}
            </p>
          </div>
          {profileData.business_address && (
            <div className="mt-6 flex items-center justify-center text-gray-600">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {profileData.business_address}
            </div>
          )}
        </div>

        {/* Services Section */}
        {profileData.services && profileData.services.length > 0 && (
          <div className="mb-16">
            <h2 className="text-4xl font-serif text-center mb-12" style={{ color: '#7A8354' }}>Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {profileData.services.map((service, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <h3 className="text-xl font-serif mb-3" style={{ color: '#333333' }}>{service.name}</h3>
                    {service.price && (
                      <div className="text-2xl font-bold mb-4" style={{ color: '#B1724C' }}>{service.price}</div>
                    )}
                    {service.description && (
                      <p className="text-gray-600 leading-relaxed text-sm">{service.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Section */}
        {profileData.portfolio_description && (
          <div className="mb-16">
            <h2 className="text-4xl font-serif text-center mb-8" style={{ color: '#7A8354' }}>Our Style</h2>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg leading-relaxed" style={{ color: '#333333', lineHeight: '1.6' }}>
                {profileData.portfolio_description}
              </p>
            </div>
          </div>
        )}

        {/* Gallery Section */}
        {profileData.gallery_images && profileData.gallery_images.length > 0 && (
          <div className="mb-16">
            <h2 className="text-4xl font-serif text-center mb-12" style={{ color: '#7A8354' }}>Portfolio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profileData.gallery_images.slice(0, 9).map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg shadow-md">
                  <img
                    src={image}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
              {profileData.gallery_images.length > 9 && (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center shadow-md">
                  <div className="text-center" style={{ color: '#7A8354' }}>
                    <div className="text-2xl font-bold">+{profileData.gallery_images.length - 9}</div>
                    <div className="text-sm">more photos</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Service Areas */}
        {profileData.coverage_areas && profileData.coverage_areas.length > 0 && (
          <div className="mb-16">
            <h2 className="text-4xl font-serif text-center mb-8" style={{ color: '#7A8354' }}>Service Areas</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {profileData.coverage_areas.map((area, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ backgroundColor: '#F2EDE3', color: '#7A8354' }}
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="text-center py-16" style={{ backgroundColor: '#F2EDE3', marginLeft: '-2rem', marginRight: '-2rem', borderRadius: '2rem' }}>
          <h2 className="text-4xl font-serif mb-6" style={{ color: '#7A8354' }}>Let's Create Magic Together</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#333333' }}>
            Ready to capture your special moments? We'd love to hear about your vision and bring it to life.
          </p>
          <div className="space-x-4">
            <button 
              className="px-8 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: '#7A8354', color: 'white' }}
            >
              Get Quote
            </button>
            <button 
              className="px-8 py-3 rounded-lg font-medium border-2 transition-colors"
              style={{ borderColor: '#7A8354', color: '#7A8354' }}
            >
              View Full Gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfileSetupPage;
