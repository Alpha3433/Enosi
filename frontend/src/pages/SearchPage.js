import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, MapPin, Calendar, Users, Loader2, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { vendorsAPI } from '../services/api';
import NotificationDropdown from '../components/NotificationDropdown';

// Initialize match object for this component
if (typeof window !== 'undefined' && !window.match) {
  window.match = {
    params: {},
    isExact: true,
    path: window.location.pathname,
    url: window.location.pathname
  };
}

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { createMessageNotification } = useNotifications();
  
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    vendorType: searchParams.get('category') || '',
    weddingDate: searchParams.get('date') || '',
    guestCount: searchParams.get('guests') || '',
    priceRange: '',
    rating: '',
    vendorClass: '',
    features: []
  });

  const [sortBy, setSortBy] = useState('relevance');

  // Use dynamic vendor search instead of static data
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedVendors, setSavedVendors] = useState([]);

  // Get saved vendors from localStorage
  const getSavedVendorsKey = () => `saved_vendors_${user?.id || 'default'}`;

  useEffect(() => {
    // Load saved vendors from localStorage
    const savedVendorsKey = getSavedVendorsKey();
    const saved = localStorage.getItem(savedVendorsKey);
    if (saved) {
      setSavedVendors(JSON.parse(saved));
    }
  }, [user]);

  const saveVendor = (vendor) => {
    const savedVendorsKey = getSavedVendorsKey();
    const isAlreadySaved = savedVendors.some(saved => saved.id === vendor.id);
    
    let updatedSaved;
    if (isAlreadySaved) {
      updatedSaved = savedVendors.filter(saved => saved.id !== vendor.id);
    } else {
      updatedSaved = [...savedVendors, vendor];
    }
    
    setSavedVendors(updatedSaved);
    localStorage.setItem(savedVendorsKey, JSON.stringify(updatedSaved));
    
    // Also save to couple profile for dashboard
    const coupleProfileKey = `couple_profile_${user?.id || 'default'}`;
    const existingProfile = localStorage.getItem(coupleProfileKey);
    const profile = existingProfile ? JSON.parse(existingProfile) : {};
    profile.saved_vendors = updatedSaved;
    localStorage.setItem(coupleProfileKey, JSON.stringify(profile));
  };

  const fetchVendors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Transform search params to match backend API
      const apiParams = {
        limit: 20,
        skip: 0
      };
      
      if (filters.vendorType && filters.vendorType !== '') {
        apiParams.category = filters.vendorType;
      }
      
      if (filters.location && filters.location !== '') {
        apiParams.location = filters.location;
      }
      
      if (filters.rating && filters.rating !== 'Any' && filters.rating !== '') {
        const ratingMap = {
          'Excellent': 9.0,
          'Very good': 8.0,
          'Good': 7.0
        };
        apiParams.min_rating = ratingMap[filters.rating] || 0;
      }
      
      if (filters.featured) {
        apiParams.featured_only = true;
      }
      
      const response = await vendorsAPI.search(apiParams);
      setVendors(response.data || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = fetchVendors;

  useEffect(() => {
    fetchVendors();
  }, [filters]); // Re-fetch when filters change

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  // Function to transform backend vendor data to UI format
  const transformVendorData = (vendor) => {
    // Safety check for vendor object
    if (!vendor || typeof vendor !== 'object') {
      return {
        id: 'unknown',
        name: 'Unknown Vendor',
        type: 'Vendor',
        location: 'Location not specified',
        features: ['Professional service'],
        description: 'Professional wedding service',
        details: ['Professional service'],
        tags: ['#professional'],
        rating: 0,
        ratingText: 'Average',
        reviewCount: '0 reviews',
        price: 0,
        priceUnit: undefined,
        image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      };
    }

    const getRatingText = (rating) => {
      if (rating >= 9.0) return 'Excellent';
      if (rating >= 8.0) return 'Very good';
      if (rating >= 7.0) return 'Good';
      return 'Average';
    };

    return {
      id: vendor.id || 'unknown',
      name: vendor.business_name || 'Unknown Vendor',
      type: vendor.category?.charAt(0).toUpperCase() + vendor.category?.slice(1) || 'Vendor',
      location: vendor.location || 'Location not specified',
      features: (vendor.packages && Array.isArray(vendor.packages)) 
        ? vendor.packages.slice(0, 2).map(pkg => pkg?.name || 'Service').filter(Boolean)
        : ['Professional service'],
      description: vendor.description || 'Professional wedding service',
      details: [
        `${vendor.years_experience || 0}+ years experience`,
        `${(vendor.service_areas && Array.isArray(vendor.service_areas)) ? vendor.service_areas.length : 1} service areas`,
        vendor.verified ? 'Verified vendor' : 'Professional service'
      ],
      tags: [
        vendor.featured ? '#featured' : '#professional',
        vendor.verified ? '#verified' : '#trusted'
      ],
      rating: vendor.average_rating || 0,
      ratingText: getRatingText(vendor.average_rating || 0),
      reviewCount: `${vendor.total_reviews || 0} reviews`,
      price: vendor.pricing_from || 0,
      priceUnit: vendor.pricing_type === 'per_person' ? 'per person' : undefined,
      image: (vendor.gallery_images && Array.isArray(vendor.gallery_images) && vendor.gallery_images[0]) 
        ? vendor.gallery_images[0] 
        : 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    };
  };

  // Transform vendors data for UI with safe handling
  const transformedVendors = (vendors || []).map(transformVendorData);

  const getRatingColor = (rating) => {
    if (rating >= 9.0) return 'bg-green-100 text-green-800';
    if (rating >= 8.0) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getRatingTextColor = (ratingText) => {
    if (ratingText === 'Excellent') return 'text-green-600';
    if (ratingText === 'Very good' || ratingText === 'Good') return 'text-blue-600';
    return 'text-yellow-600';
  };

  // Handle search when filters change
  const handleSearch = () => {
    refetch();
  };

  // Handle filter changes and trigger search
  const handleFilterChangeWithSearch = (key, value) => {
    handleFilterChange(key, value);
    // Small delay to allow state to update before refetching
    setTimeout(() => {
      refetch();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-linen font-sans" style={{ fontFamily: 'Prompt, sans-serif', zoom: 0.9 }}>
      {/* Header */}
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

      <div className="grid grid-cols-1 md:grid-cols-12 relative">
        {/* Vertical Divider */}
        <div 
          style={{
            position: 'absolute',
            top: '95px',
            left: '422px',
            width: '1px',
            height: '1272px',
            backgroundColor: '#dedede',
            zIndex: 10
          }}
        />

        {/* Sidebar */}
        <div 
          className="md:col-span-3 border-r"
          style={{
            width: '422px',
            height: '550px',
            backgroundColor: '#f8f8f8',
            padding: '24px'
          }}
        >
          <button 
            onClick={() => navigate('/')}
            className="mb-6 hover:text-blue-500 transition-colors flex items-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h2 
            className="text-lg mb-6"
            style={{
              fontWeight: 'bold',
              color: '#030303',
              fontFamily: 'Prompt'
            }}
          >
            Your search
          </h2>
          
          {/* Compact Search Form */}
          <div className="space-y-4 mb-8">
            {/* Location */}
            <div>
              <label 
                className="block text-sm mb-2"
                style={{
                  color: '#030303',
                  fontFamily: 'Prompt',
                  fontWeight: 500,
                  textAlign: 'left',
                  paddingLeft: '8px'
                }}
              >
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChangeWithSearch('location', e.target.value)}
                placeholder="      Copenhagen, Denmark"
                style={{
                  width: '310px',
                  height: '42px',
                  padding: '0px 8px',
                  border: '0',
                  boxSizing: 'border-box',
                  borderRadius: '100px',
                  backgroundColor: '#ffffff',
                  color: '#030303',
                  fontSize: '14px',
                  fontFamily: 'Prompt',
                  fontWeight: 300,
                  lineHeight: '22px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Vendor Type */}
            <div>
              <label 
                className="block text-sm mb-2"
                style={{
                  color: '#030303',
                  fontFamily: 'Prompt',
                  fontWeight: 500,
                  textAlign: 'left',
                  paddingLeft: '8px'
                }}
              >
                Vendor
              </label>
              <select
                value={filters.vendorType}
                onChange={(e) => handleFilterChangeWithSearch('vendorType', e.target.value)}
                style={{
                  width: '310px',
                  height: '42px',
                  padding: '0px 8px',
                  border: '0',
                  boxSizing: 'border-box',
                  borderRadius: '100px',
                  backgroundColor: '#ffffff',
                  color: '#030303',
                  fontSize: '14px',
                  fontFamily: 'Prompt',
                  fontWeight: 300,
                  lineHeight: '22px',
                  outline: 'none',
                  appearance: 'none'
                }}
              >
                <option value="">      All Vendors</option>
                <option value="venue">      Venues</option>
                <option value="photographer">      Photographers</option>
                <option value="catering">      Catering</option>
                <option value="florist">      Florists</option>
                <option value="music">      Music & Entertainment</option>
                <option value="makeup">      Hair & Makeup</option>
              </select>
            </div>

            {/* Wedding Date */}
            <div>
              <label 
                className="block text-sm mb-2"
                style={{
                  color: '#030303',
                  fontFamily: 'Prompt',
                  fontWeight: 500,
                  textAlign: 'left',
                  paddingLeft: '8px'
                }}
              >
                Wedding date
              </label>
              <input
                type="text"
                value={filters.weddingDate}
                onChange={(e) => handleFilterChangeWithSearch('weddingDate', e.target.value)}
                placeholder="      DD/MM/YYYY"
                style={{
                  width: '310px',
                  height: '42px',
                  padding: '0px 8px',
                  border: '0',
                  boxSizing: 'border-box',
                  borderRadius: '100px',
                  backgroundColor: '#ffffff',
                  color: '#030303',
                  fontSize: '14px',
                  fontFamily: 'Prompt',
                  fontWeight: 300,
                  lineHeight: '22px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Guest Count */}
            <div>
              <label 
                className="block text-sm mb-2"
                style={{
                  color: '#030303',
                  fontFamily: 'Prompt',
                  fontWeight: 500,
                  textAlign: 'left',
                  paddingLeft: '8px'
                }}
              >
                Guests
              </label>
              <input
                type="text"
                value={filters.guestCount}
                onChange={(e) => handleFilterChangeWithSearch('guestCount', e.target.value)}
                placeholder="      Number of guests"
                style={{
                  width: '310px',
                  height: '42px',
                  padding: '0px 8px',
                  border: '0',
                  boxSizing: 'border-box',
                  borderRadius: '100px',
                  backgroundColor: '#ffffff',
                  color: '#030303',
                  fontSize: '14px',
                  fontFamily: 'Prompt',
                  fontWeight: 300,
                  lineHeight: '22px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Search Button */}
            <button 
              onClick={handleSearch}
              disabled={isLoading}
              style={{
                cursor: isLoading ? 'not-allowed' : 'pointer',
                width: '310px',
                height: '42px',
                padding: '0px 8px',
                border: '0',
                boxSizing: 'border-box',
                borderRadius: '100px',
                backgroundColor: isLoading ? '#94a3b8' : '#1d64ec',
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: 'Prompt',
                lineHeight: '18px',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {/* Filter Sections */}
          <div 
            className="space-y-8"
            style={{
              width: '422px',
              height: '722px',
              backgroundColor: '#ffffff',
              padding: '24px',
              borderRadius: '8px'
            }}
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 
                  className="text-lg"
                  style={{
                    color: '#030303',
                    fontFamily: 'Prompt',
                    fontWeight: 500,
                    textAlign: 'left'
                  }}
                >
                  Popular filters
                </h2>
                <div 
                  style={{
                    color: '#858585',
                    fontSize: '14px',
                    fontFamily: 'Prompt',
                    fontWeight: 300,
                    lineHeight: '22px',
                    textAlign: 'right',
                    cursor: 'pointer',
                    marginLeft: '-10px'
                  }}
                  onClick={() => {
                    setFilters({
                      location: searchParams.get('location') || '',
                      vendorType: searchParams.get('category') || '',
                      weddingDate: searchParams.get('date') || '',
                      guestCount: searchParams.get('guests') || '',
                      priceRange: '',
                      rating: '',
                      vendorClass: '',
                      features: []
                    });
                  }}
                >
                  Reset
                </div>
              </div>
              <div className="space-y-3">
                {['Budget-friendly', 'Premium packages', 'Free consultation', 'Same-day availability'].map((feature) => (
                  <label key={feature} className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={filters.features.includes(feature)}
                      onChange={() => {
                        handleFeatureToggle(feature);
                        setTimeout(() => refetch(), 100);
                      }}
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h2 
                className="text-lg mb-4"
                style={{
                  color: '#030303',
                  fontFamily: 'Prompt',
                  fontWeight: 500,
                  textAlign: 'left'
                }}
              >
                Price range
              </h2>
              <div className="space-y-3">
                {['Less than $1,000', '$1,000 to $2,500', '$2,500 to $5,000', '$5,000 and more'].map((range) => (
                  <label key={range} className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={filters.priceRange === range}
                      onChange={() => {
                        handleFilterChange('priceRange', range);
                        setTimeout(() => refetch(), 100);
                      }}
                    />
                    <span className="text-sm text-gray-700">{range}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h2 
                className="text-lg mb-4"
                style={{
                  color: '#030303',
                  fontFamily: 'Prompt',
                  fontWeight: 500,
                  textAlign: 'left'
                }}
              >
                Vendor rating
              </h2>
              <div className="space-y-3">
                {['Any', 'Excellent', 'Very good', 'Good'].map((rating) => (
                  <label key={rating} className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={filters.rating === rating}
                      onChange={() => {
                        handleFilterChange('rating', rating);
                        setTimeout(() => refetch(), 100);
                      }}
                    />
                    <span className="text-sm text-gray-700">{rating}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h2 
                className="text-lg"
                style={{
                  color: '#030303',
                  fontFamily: 'Prompt',
                  fontWeight: 500,
                  textAlign: 'left',
                  marginBottom: '16px'
                }}
              >
                Vendor class
              </h2>
              <div className="flex flex-wrap gap-2">
                {['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'].map((star) => (
                  <button 
                    key={star}
                    className={`px-3 py-2 border rounded-lg text-sm transition-colors ${
                      filters.vendorClass === star 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'hover:bg-gray-50 border-gray-300'
                    }`}
                    onClick={() => {
                      handleFilterChange('vendorClass', star);
                      setTimeout(() => refetch(), 100);
                    }}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* New Text Components */}
        <div 
          style={{
            position: 'absolute',
            left: '450px',
            top: '20px',
            zIndex: 5
          }}
        >
          <div 
            style={{
              color: '#030303',
              fontSize: '14px',
              fontFamily: 'Prompt',
              lineHeight: '22px',
              marginBottom: '8px',
              paddingLeft: '8px'
            }}
          >
            {transformedVendors.length} filtered results for: {(() => {
              const parts = [];
              if (filters.location) parts.push(filters.location);
              if (filters.weddingDate) parts.push(filters.weddingDate);
              if (filters.guestCount) parts.push(`${filters.guestCount} guests`);
              if (filters.vendorType) parts.push(filters.vendorType);
              
              return parts.length > 0 ? parts.join(', ') : 'All locations, All dates, All guests, All vendors';
            })()}
          </div>
          <div 
            style={{
              color: '#030303',
              fontSize: '24px',
              fontFamily: 'Prompt',
              fontWeight: 600,
              lineHeight: '36px',
              marginBottom: '40px'
            }}
          >
            {(() => {
              // Generate dynamic text based on user preferences
              const preferences = [];
              
              if (filters.features.includes('Budget-friendly')) {
                preferences.push('Budget-friendly options');
              }
              if (filters.features.includes('Premium packages')) {
                preferences.push('Premium packages available');
              }
              if (filters.features.includes('Free consultation')) {
                preferences.push('Free consultation included');
              }
              if (filters.features.includes('Same-day availability')) {
                preferences.push('Same-day availability');
              }
              if (filters.priceRange) {
                preferences.push(`Price range: ${filters.priceRange}`);
              }
              if (filters.rating && filters.rating !== 'Any') {
                preferences.push(`${filters.rating} rated vendors`);
              }
              if (filters.vendorClass) {
                preferences.push(`${filters.vendorClass} class vendors`);
              }
              
              if (preferences.length > 0) {
                return preferences[0]; // Show the first preference
              } else if (filters.vendorType) {
                return `${filters.vendorType} specialists available`;
              } else {
                return 'Wedding vendors available';
              }
            })()}
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-9 p-6" style={{ marginTop: '80px' }}>
          
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-lg text-gray-600">Loading vendors...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading vendors</h3>
                <p className="text-gray-600 mb-4">{error.message || 'Something went wrong while fetching vendors.'}</p>
                <button
                  onClick={refetch}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* No Results State */}
          {!isLoading && !error && transformedVendors.length === 0 && (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No vendors found</h3>
                <p className="text-gray-600">Try adjusting your search filters to find more vendors.</p>
              </div>
            </div>
          )}
          
          {/* Vendor List */}
          {!isLoading && !error && transformedVendors.length > 0 && (
            <div className="space-y-6">
              {transformedVendors.map((vendor) => (
              <div 
                key={vendor.id} 
                style={{
                  width: '1050px',
                  height: '232px',
                  backgroundColor: '#ffffff',
                  borderRadius: '24px',
                  boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
                  overflow: 'hidden',
                  display: 'flex'
                }}
              >
                <div style={{ width: '280px', height: '232px', flexShrink: 0 }}>
                  <img 
                    src={vendor.image}
                    alt={vendor.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors cursor-pointer" style={{ fontSize: '16px', lineHeight: '20px' }}>{vendor.name}</h2>
                    <p className="text-sm text-gray-600 mb-2 flex items-center" style={{ fontSize: '12px', lineHeight: '16px' }}>
                      <MapPin className="w-3 h-3 mr-1" />
                      {vendor.location}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 text-sm mb-3" style={{ fontSize: '10px' }}>
                      {(vendor.features || []).slice(0, 2).map((feature, idx) => (
                        <span key={feature || idx} className="text-gray-600 bg-gray-50 px-2 py-1 rounded-full" style={{ fontSize: '10px', padding: '2px 6px' }}>
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    <div className="text-sm text-gray-700 mb-3" style={{ fontSize: '11px', lineHeight: '14px' }}>
                      {(vendor.details || []).slice(0, 2).map((detail, idx) => (
                        <div key={detail || idx} style={{ marginBottom: '2px' }}>• {detail}</div>
                      ))}
                    </div>
                    
                    <div className="flex gap-1 mb-3">
                      {(vendor.tags || []).slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full" style={{ fontSize: '9px', padding: '1px 4px' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {(vendor.tags || []).slice(0, 2).map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                        style={{ fontSize: '10px', padding: '2px 6px' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ width: '200px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'rgba(248, 250, 252, 0.5)' }}>
                    {/* Heart button */}
                    <button
                      onClick={() => saveVendor(vendor)}
                      className={`mb-4 p-2 rounded-full transition-colors ${
                        savedVendors.some(saved => saved.id === vendor.id)
                          ? 'text-red-500 bg-red-50 hover:bg-red-100'
                          : 'text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-red-400'
                      }`}
                      title={savedVendors.some(saved => saved.id === vendor.id) ? 'Remove from saved' : 'Save vendor'}
                    >
                      <Heart className={`w-5 h-5 ${
                        savedVendors.some(saved => saved.id === vendor.id) ? 'fill-current' : ''
                      }`} />
                    </button>
                  <div className="flex items-center justify-end mb-3">
                    <div className="text-right mr-2">
                      <div className={`font-medium ${getRatingTextColor(vendor.ratingText)}`} style={{ fontSize: '12px', lineHeight: '16px' }}>
                        {vendor.ratingText}
                      </div>
                      <div className="text-xs text-gray-500" style={{ fontSize: '10px', lineHeight: '12px' }}>{vendor.reviewCount}</div>
                    </div>
                    <div className={`rounded-lg px-2 py-1 font-bold text-sm ${getRatingColor(vendor.rating)}`} style={{ fontSize: '12px', padding: '4px 8px' }}>
                      {vendor.rating}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-gray-900 mb-1" style={{ fontSize: '20px', lineHeight: '24px' }}>
                      ${vendor.price.toLocaleString()}
                      {vendor.priceUnit && <span className="text-sm font-normal text-gray-500" style={{ fontSize: '11px' }}>/{vendor.priceUnit}</span>}
                    </div>
                    <div className="text-sm text-gray-500 mb-3" style={{ fontSize: '10px', lineHeight: '12px' }}>Starting price</div>
                    <button 
                      onClick={() => navigate(`/vendors/${vendor.id}`)}
                      className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
                      style={{ fontSize: '12px', padding: '8px 12px' }}
                    >
                      View vendor details
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Pagination Component */}
      <div className="flex justify-center py-8">
        <div className="flex items-center space-x-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600 transition-all duration-200">
            1
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 border border-gray-200 transition-all duration-200">
            2
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 border border-gray-200 transition-all duration-200">
            3
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 border border-gray-200 transition-all duration-200">
            4
          </button>
          <span className="text-gray-400 px-2">...</span>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 border border-gray-200 transition-all duration-200">
            25
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;