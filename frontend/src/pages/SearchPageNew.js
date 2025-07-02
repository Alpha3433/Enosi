import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  Loader2, 
  Heart, 
  Star,
  Search,
  Filter,
  Grid,
  List,
  Map,
  SlidersHorizontal,
  CheckCircle,
  Phone,
  Mail,
  Eye,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { vendorsAPI } from '../services/api';
import NotificationDropdown from '../components/NotificationDropdown';

const SearchPageNew = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { createMessageNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [showMap, setShowMap] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    vendorType: searchParams.get('category') || '',
    weddingDate: searchParams.get('date') || '',
    guestCount: searchParams.get('guests') || '',
    priceMin: '',
    priceMax: '',
    rating: '',
    features: [],
    availability: ''
  });
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
      // Create notification when vendor is saved
      createMessageNotification(vendor.name, 'vendor_saved');
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
          'Excellent (9.0+)': 9.0,
          'Very good (8.0+)': 8.0,
          'Good (7.0+)': 7.0
        };
        apiParams.min_rating = ratingMap[filters.rating] || 0;
      }
      
      // Add price filtering
      if (filters.priceMin && filters.priceMin !== '') {
        apiParams.price_min = parseInt(filters.priceMin);
      }
      
      if (filters.priceMax && filters.priceMax !== '') {
        apiParams.price_max = parseInt(filters.priceMax);
      }
      
      if (filters.features.includes('featured')) {
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

  useEffect(() => {
    fetchVendors();
  }, [filters.vendorType, filters.location, filters.rating, filters.features]);

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

  const clearAllFilters = () => {
    setFilters({
      location: '',
      vendorType: '',
      weddingDate: '',
      guestCount: '',
      priceMin: '',
      priceMax: '',
      rating: '',
      features: [],
      availability: ''
    });
  };

  // Transform backend vendor data to UI format
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

  return (
    <div className="min-h-screen bg-white font-sans" style={{ zoom: 0.9 }}>
      {/* Header */}
      <header className="bg-white border-b border-coral-reef">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="text-xl font-bold font-sans text-millbrook"
            >
              Enosi
            </button>
          </div>
          
          <nav className="hidden md:flex space-x-8">
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
                <NotificationDropdown />
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

      {/* Search Bar - Booking.com style */}
      <div className="bg-millbrook py-6">
        <div className="container mx-auto px-6 flex justify-center">
          <div className="flex items-center space-x-4 bg-white rounded-lg p-2 shadow-lg max-w-6xl w-full">
            <div className="flex-1 flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-kabul" />
                  <input
                    type="text"
                    placeholder="Where are you getting married?"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-0 focus:ring-0 focus:outline-none text-sm font-sans placeholder-napa"
                  />
                </div>
              </div>
              <div className="w-px h-8 bg-coral-reef"></div>
              <div className="flex-1">
                <select
                  value={filters.vendorType}
                  onChange={(e) => handleFilterChange('vendorType', e.target.value)}
                  className="w-full py-3 px-4 border-0 focus:ring-0 focus:outline-none text-sm font-sans bg-transparent"
                >
                  <option value="">All vendors</option>
                  <option value="venue">Venues</option>
                  <option value="photographer">Photography</option>
                  <option value="catering">Catering</option>
                  <option value="florist">Florists</option>
                  <option value="music">Music & Entertainment</option>
                  <option value="makeup">Hair & Makeup</option>
                  <option value="videographer">Videography</option>
                  <option value="decorator">Decoration</option>
                  <option value="transport">Transportation</option>
                  <option value="stationery">Stationery</option>
                </select>
              </div>
              <div className="w-px h-8 bg-coral-reef"></div>
              <div className="flex-1">
                <input
                  type="date"
                  placeholder="Wedding date"
                  value={filters.weddingDate}
                  onChange={(e) => handleFilterChange('weddingDate', e.target.value)}
                  className="w-full py-3 px-4 border-0 focus:ring-0 focus:outline-none text-sm font-sans"
                />
              </div>
              <div className="w-px h-8 bg-coral-reef"></div>
              <div className="flex-1">
                <div className="relative">
                  <Users className="absolute left-3 top-3 w-5 h-5 text-kabul" />
                  <input
                    type="number"
                    placeholder="Number of guests"
                    value={filters.guestCount}
                    onChange={(e) => handleFilterChange('guestCount', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-0 focus:ring-0 focus:outline-none text-sm font-sans placeholder-napa"
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={fetchVendors}
              disabled={isLoading}
              className="bg-cement text-white px-8 py-3 rounded-lg hover:bg-millbrook transition-colors font-sans font-medium disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-6">
              {/* Back Button */}
              <button 
                onClick={() => navigate('/')}
                className="flex items-center text-kabul hover:text-cement transition-colors font-sans mb-6"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to home
              </button>

              {/* Results Count */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-millbrook mb-2 font-sans">
                  {filters.location || 'Australia'}: {transformedVendors.length} vendors found
                </h1>
                <p className="text-sm text-kabul font-sans">
                  {(() => {
                    const filterParts = [];
                    if (filters.location) filterParts.push(filters.location);
                    if (filters.vendorType) {
                      const vendorTypeMap = {
                        'venue': 'Venues',
                        'photographer': 'Photography', 
                        'catering': 'Catering',
                        'florist': 'Florists',
                        'music': 'Music & Entertainment',
                        'makeup': 'Hair & Makeup',
                        'videographer': 'Videography',
                        'decorator': 'Decoration',
                        'transport': 'Transportation',
                        'stationery': 'Stationery'
                      };
                      filterParts.push(vendorTypeMap[filters.vendorType] || filters.vendorType);
                    }
                    if (filters.weddingDate) filterParts.push(filters.weddingDate);
                    if (filters.guestCount) filterParts.push(`${filters.guestCount} guests`);
                    if (filters.rating && filters.rating !== 'Any') filterParts.push(filters.rating);
                    if (filters.priceMin || filters.priceMax) {
                      const priceRange = `$${filters.priceMin || '0'} - $${filters.priceMax || '∞'}`;
                      filterParts.push(priceRange);
                    }
                    if (filters.features.length > 0) {
                      const featureLabels = {
                        'featured': 'Featured',
                        'verified': 'Verified',
                        'free_consultation': 'Free consultation',
                        'same_day_response': 'Same day response',
                        'budget_friendly': 'Budget friendly',
                        'premium_service': 'Premium service',
                        'package_deals': 'Package deals',
                        'flexible_booking': 'Flexible booking'
                      };
                      const selectedFeatures = filters.features.map(f => featureLabels[f] || f);
                      filterParts.push(...selectedFeatures);
                    }
                    
                    return filterParts.length > 0 ? filterParts.join(', ') : 'All locations, All vendors, Any date, Any guests';
                  })()}
                </p>
              </div>

              {/* Vendor Category Filter */}
              <div className="mb-6 bg-white rounded-xl p-4 shadow-sm border border-coral-reef">
                <h3 className="text-lg font-semibold text-millbrook mb-3 font-sans">Vendor category</h3>
                <div className="space-y-2">
                  {[
                    { key: '', label: 'All vendors' },
                    { key: 'venue', label: 'Venues' },
                    { key: 'photographer', label: 'Photography' },
                    { key: 'catering', label: 'Catering' },
                    { key: 'florist', label: 'Florists' },
                    { key: 'music', label: 'Music & Entertainment' },
                    { key: 'makeup', label: 'Hair & Makeup' },
                    { key: 'videographer', label: 'Videography' },
                    { key: 'decorator', label: 'Decoration' },
                    { key: 'transport', label: 'Transportation' },
                    { key: 'stationery', label: 'Stationery' }
                  ].map((category) => (
                    <label key={category.key} className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="vendorCategory"
                        className="mr-3 w-4 h-4 text-cement border-coral-reef focus:ring-cement"
                        checked={filters.vendorType === category.key}
                        onChange={() => handleFilterChange('vendorType', category.key)}
                      />
                      <span className="text-sm text-kabul font-sans">{category.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Budget Filter */}
              <div className="mb-6 bg-white rounded-xl p-4 shadow-sm border border-coral-reef">
                <h3 className="text-lg font-semibold text-millbrook mb-3 font-sans">Your budget (per vendor)</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-kabul font-sans">AUD</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin}
                      onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                      className="flex-1 px-3 py-2 border border-coral-reef rounded-lg text-sm font-sans"
                    />
                    <span className="text-kabul">–</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                      className="flex-1 px-3 py-2 border border-coral-reef rounded-lg text-sm font-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    {['Under $1,000', '$1,000 - $2,500', '$2,500 - $5,000', '$5,000 - $10,000', 'Over $10,000'].map((range) => (
                      <label key={range} className="flex items-center cursor-pointer">
                        <input 
                          type="radio" 
                          name="priceRange"
                          className="mr-3 w-4 h-4 text-cement border-coral-reef focus:ring-cement"
                          onChange={() => {
                            const [min, max] = range.includes('Under') ? ['', '1000'] :
                                             range.includes('Over') ? ['10000', ''] :
                                             range.split(' - ').map(p => p.replace(/[$,]/g, ''));
                            handleFilterChange('priceMin', min);
                            handleFilterChange('priceMax', max);
                          }}
                        />
                        <span className="text-sm text-kabul font-sans">{range}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Popular Filters */}
              <div className="mb-6 bg-white rounded-xl p-4 shadow-sm border border-coral-reef">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-millbrook font-sans">Popular filters</h3>
                  <button 
                    onClick={clearAllFilters}
                    className="text-sm text-cement hover:text-millbrook transition-colors font-sans"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'featured', label: 'Featured vendors' },
                    { key: 'verified', label: 'Verified vendors' },
                    { key: 'free_consultation', label: 'Free consultation' },
                    { key: 'same_day_response', label: 'Same day response' },
                    { key: 'budget_friendly', label: 'Budget friendly' },
                    { key: 'premium_service', label: 'Premium service' },
                    { key: 'package_deals', label: 'Package deals available' },
                    { key: 'flexible_booking', label: 'Flexible booking' }
                  ].map((feature) => (
                    <label key={feature.key} className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="mr-3 w-4 h-4 text-cement border-coral-reef rounded focus:ring-cement"
                        checked={filters.features.includes(feature.key)}
                        onChange={() => handleFeatureToggle(feature.key)}
                      />
                      <span className="text-sm text-kabul font-sans">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6 bg-white rounded-xl p-4 shadow-sm border border-coral-reef">
                <h3 className="text-lg font-semibold text-millbrook mb-3 font-sans">Vendor rating</h3>
                <div className="space-y-2">
                  {['Any', 'Excellent (9.0+)', 'Very good (8.0+)', 'Good (7.0+)'].map((rating) => (
                    <label key={rating} className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="rating"
                        className="mr-3 w-4 h-4 text-cement border-coral-reef focus:ring-cement"
                        checked={filters.rating === rating}
                        onChange={() => handleFilterChange('rating', rating)}
                      />
                      <span className="text-sm text-kabul font-sans">{rating}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-coral-reef">
                <h3 className="text-lg font-semibold text-millbrook mb-3 font-sans">Availability</h3>
                <div className="space-y-2">
                  {['Any time', 'Available this month', 'Available next month', 'Available in 3+ months'].map((availability) => (
                    <label key={availability} className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="availability"
                        className="mr-3 w-4 h-4 text-cement border-coral-reef focus:ring-cement"
                        checked={filters.availability === availability}
                        onChange={() => handleFilterChange('availability', availability)}
                      />
                      <span className="text-sm text-kabul font-sans">{availability}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-coral-reef rounded-lg text-sm font-sans focus:ring-2 focus:ring-cement focus:border-cement"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-sans transition-colors ${
                    showMap ? 'bg-cement text-white' : 'border border-coral-reef text-kabul hover:bg-linen'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  <span>Show on map</span>
                </button>
                
                <div className="flex border border-coral-reef rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-cement text-white' : 'text-kabul hover:bg-linen'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-cement text-white' : 'text-kabul hover:bg-linen'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center h-64">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-6 h-6 animate-spin text-cement" />
                  <span className="text-lg text-kabul font-sans">Finding the perfect vendors...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="text-coral-reef mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-millbrook mb-2 font-sans">Error loading vendors</h3>
                  <p className="text-kabul mb-4 font-sans">{error.message || 'Something went wrong while fetching vendors.'}</p>
                  <button
                    onClick={fetchVendors}
                    className="px-4 py-2 bg-cement text-white rounded-lg hover:bg-millbrook transition-colors font-sans"
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
                  <div className="text-kabul mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-millbrook mb-2 font-sans">No vendors found</h3>
                  <p className="text-kabul font-sans">Try adjusting your search filters to find more vendors.</p>
                </div>
              </div>
            )}

            {/* Vendor Results - Booking.com Style */}
            {!isLoading && !error && transformedVendors.length > 0 && (
              <div className="space-y-4">
                {transformedVendors.map((vendor) => (
                  <div 
                    key={vendor.id} 
                    className="bg-white border border-coral-reef rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex">
                      {/* Vendor Image */}
                      <div className="w-72 h-48 flex-shrink-0">
                        <img 
                          src={vendor.image}
                          alt={vendor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Vendor Info */}
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-xl font-semibold text-millbrook mb-1 font-sans hover:text-cement cursor-pointer">
                                {vendor.name}
                              </h3>
                              <p className="text-sm text-kabul flex items-center font-sans">
                                <MapPin className="w-4 h-4 mr-1" />
                                {vendor.location}
                              </p>
                            </div>
                            
                            {/* Heart Save Button */}
                            <button
                              onClick={() => saveVendor(vendor)}
                              className={`p-2 rounded-full transition-colors ${
                                savedVendors.some(saved => saved.id === vendor.id)
                                  ? 'text-coral-reef bg-red-50 hover:bg-red-100'
                                  : 'text-kabul bg-linen hover:bg-coral-reef hover:text-white'
                              }`}
                              title={savedVendors.some(saved => saved.id === vendor.id) ? 'Remove from saved' : 'Save vendor'}
                            >
                              <Heart className={`w-5 h-5 ${
                                savedVendors.some(saved => saved.id === vendor.id) ? 'fill-current' : ''
                              }`} />
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {(vendor.features || []).slice(0, 3).map((feature, idx) => (
                              <span key={feature || idx} className="text-xs text-cement bg-linen px-2 py-1 rounded-full font-sans">
                                {feature}
                              </span>
                            ))}
                          </div>
                          
                          <p className="text-sm text-kabul font-sans line-clamp-2 mb-3">
                            {vendor.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-1">
                            {(vendor.details || []).slice(0, 2).map((detail, idx) => (
                              <span key={detail || idx} className="text-xs text-kabul font-sans">
                                • {detail}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Price and Rating */}
                      <div className="w-64 p-6 bg-linen flex flex-col justify-between">
                        <div className="text-right">
                          <div className="flex items-center justify-end space-x-2 mb-2">
                            <div className="text-right">
                              <div className="text-sm font-medium text-kabul font-sans">
                                {vendor.ratingText}
                              </div>
                              <div className="text-xs text-napa font-sans">{vendor.reviewCount}</div>
                            </div>
                            <div className={`text-white text-sm font-bold px-2 py-1 rounded-lg ${getRatingColor(vendor.rating)}`}>
                              {vendor.rating > 0 ? vendor.rating.toFixed(1) : 'New'}
                            </div>
                          </div>
                          
                          {vendor.tags && vendor.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-end mb-3">
                              {vendor.tags.slice(0, 2).map((tag) => (
                                <span 
                                  key={tag}
                                  className="text-xs bg-white text-cement px-2 py-1 rounded-full border border-coral-reef font-sans"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-millbrook mb-1 font-sans">
                            ${vendor.price > 0 ? vendor.price.toLocaleString() : 'Contact'}
                            {vendor.priceUnit && <span className="text-sm font-normal text-kabul">/{vendor.priceUnit}</span>}
                          </div>
                          <div className="text-xs text-napa mb-4 font-sans">Starting price</div>
                          
                          <div className="space-y-2">
                            <button 
                              onClick={() => navigate(`/vendors/${vendor.id}`)}
                              className="w-full bg-cement text-white py-2 px-4 rounded-lg hover:bg-millbrook transition-colors font-sans font-medium"
                            >
                              See availability
                            </button>
                            <button className="w-full border border-coral-reef text-kabul py-2 px-4 rounded-lg hover:bg-linen transition-colors font-sans text-sm">
                              Save to favorites
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && transformedVendors.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 text-sm font-sans text-kabul border border-coral-reef rounded-lg hover:bg-linen transition-colors">
                    Previous
                  </button>
                  <button className="px-4 py-2 text-sm font-sans bg-cement text-white rounded-lg">
                    1
                  </button>
                  <button className="px-4 py-2 text-sm font-sans text-kabul border border-coral-reef rounded-lg hover:bg-linen transition-colors">
                    2
                  </button>
                  <button className="px-4 py-2 text-sm font-sans text-kabul border border-coral-reef rounded-lg hover:bg-linen transition-colors">
                    3
                  </button>
                  <span className="px-2 text-kabul">...</span>
                  <button className="px-4 py-2 text-sm font-sans text-kabul border border-coral-reef rounded-lg hover:bg-linen transition-colors">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-linen py-12 mt-12">
        <div className="container mx-auto px-6">
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

export default SearchPageNew;