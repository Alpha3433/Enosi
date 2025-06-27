import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, MapPin, Calendar, Users, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  
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
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

  const [vendors] = useState([
    {
      id: 1,
      name: 'Elegant Garden Venues',
      type: 'Venue',
      location: '0.4 km from city center',
      features: ['Free consultation', 'Wedding planning included'],
      description: 'Premium wedding venue',
      details: ['Capacity for 200 guests', 'Garden & indoor options', 'Full catering kitchen'],
      tags: ['#popular', '#outdoor'],
      rating: 9.6,
      ratingText: 'Excellent',
      reviewCount: '1,020 reviews',
      price: 3500,
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      name: 'Artisan Photography Studio',
      type: 'Photography',
      location: '1.7 km from city center',
      features: ['Free engagement session'],
      description: 'Professional wedding photography',
      details: ['8-hour coverage', 'Online gallery included', '500+ edited photos'],
      tags: ['#highly-rated'],
      rating: 9.2,
      ratingText: 'Very good',
      reviewCount: '832 reviews',
      price: 2800,
      image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      name: 'Gourmet Wedding Catering',
      type: 'Catering',
      location: '2.0 km from city center',
      features: ['Menu tasting included'],
      description: 'Fine dining wedding catering',
      details: ['3-course plated dinner', 'Vegetarian options', 'Professional service staff'],
      tags: ['#popular'],
      rating: 8.0,
      ratingText: 'Good',
      reviewCount: '1,000 reviews',
      price: 85,
      priceUnit: 'per person',
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 4,
      name: 'Bella Rosa Florists',
      type: 'Florist',
      location: '2.2 km from city center',
      features: ['Same-day delivery'],
      description: 'Custom wedding florals',
      details: ['Bridal bouquet', 'Ceremony arrangements', 'Reception centerpieces'],
      tags: ['#popular', '#same-day'],
      rating: 6.3,
      ratingText: 'Average',
      reviewCount: '200 reviews',
      price: 1200,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ]);

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

  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
    setShowSortDropdown(false);
  };

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'rating', label: 'Rating' },
    { value: 'distance', label: 'Distance' }
  ];

  return (
    <div className="min-h-screen bg-white font-sans" style={{ fontFamily: 'Prompt, sans-serif' }}>
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-4 border-b">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-bold">Enosi</h1>
          <nav className="hidden md:flex space-x-6">
            <button onClick={() => navigate('/search')} className="text-sm hover:text-blue-500 transition-colors">Find Vendors</button>
            <a href="#inspiration" className="text-sm hover:text-blue-500 transition-colors">Inspiration</a>
            <a href="#about" className="text-sm hover:text-blue-500 transition-colors">About Us</a>
          </nav>
        </div>
        <div className="flex space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <span className="text-sm">{user?.first_name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={() => navigate(user?.user_type === 'vendor' ? '/vendor-dashboard' : '/dashboard')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
                onClick={() => navigate('/signup')}
                className="px-4 py-1.5 text-sm border border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
              >
                Sign up
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12">
        {/* Sidebar */}
        <div className="md:col-span-3 border-r p-6">
          <button 
            onClick={() => navigate('/')}
            className="mb-6 hover:text-blue-500 transition-colors flex items-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-medium mb-6">Your search</h2>
          
          {/* Compact Search Form */}
          <div className="space-y-4 mb-8">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="Search destinations"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </div>
            </div>

            {/* Vendor Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
              <div className="relative">
                <select
                  value={filters.vendorType}
                  onChange={(e) => handleFilterChange('vendorType', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md appearance-none"
                >
                  <option value="">All Vendors</option>
                  <option value="venue">Venues</option>
                  <option value="photographer">Photographers</option>
                  <option value="catering">Catering</option>
                  <option value="florist">Florists</option>
                  <option value="music">Music & Entertainment</option>
                  <option value="makeup">Hair & Makeup</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Wedding Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wedding date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.weddingDate}
                  onChange={(e) => handleFilterChange('weddingDate', e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </div>
            </div>

            {/* Guest Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.guestCount}
                  onChange={(e) => handleFilterChange('guestCount', e.target.value)}
                  placeholder="Number of guests"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </div>
            </div>

            {/* Search Button */}
            <button className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm">
              Search
            </button>
          </div>
          
          {/* Filter Sections */}
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-medium mb-4">Popular filters</h2>
              <div className="space-y-3">
                {['Budget-friendly', 'Premium packages', 'Free consultation', 'Same-day availability'].map((feature) => (
                  <label key={feature} className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={filters.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium mb-4">Price range</h2>
              <div className="space-y-3">
                {['Less than $1,000', '$1,000 to $2,500', '$2,500 to $5,000', '$5,000 and more'].map((range) => (
                  <label key={range} className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={filters.priceRange === range}
                      onChange={() => handleFilterChange('priceRange', range)}
                    />
                    <span className="text-sm text-gray-700">{range}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium mb-4">Vendor rating</h2>
              <div className="space-y-3">
                {['Any', 'Excellent', 'Very good', 'Good'].map((rating) => (
                  <label key={rating} className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={filters.rating === rating}
                      onChange={() => handleFilterChange('rating', rating)}
                    />
                    <span className="text-sm text-gray-700">{rating}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium mb-4">Vendor class</h2>
              <div className="flex flex-wrap gap-2">
                {['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'].map((star) => (
                  <button 
                    key={star}
                    className={`px-3 py-2 border rounded-lg text-sm transition-colors ${
                      filters.vendorClass === star 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'hover:bg-gray-50 border-gray-300'
                    }`}
                    onClick={() => handleFilterChange('vendorClass', star)}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-10">
            <h2 className="text-lg font-medium">Enosi</h2>
            <p className="text-xs text-gray-600">Your favorite wedding vendor booking experience since 1997!</p>
            <p className="text-xs text-gray-400 mt-6">Enosi © 2025</p>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-9 p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">{vendors.length} search results for</p>
            <h1 className="text-xl font-bold mb-4">
              {(() => {
                const parts = [];
                if (filters.location) parts.push(filters.location);
                if (filters.weddingDate) parts.push(filters.weddingDate);
                if (filters.vendorType) parts.push(filters.vendorType);
                if (filters.guestCount) parts.push(`${filters.guestCount} guests`);
                
                return parts.length > 0 ? parts.join(', ') : 'All Wedding Vendors';
              })()}
            </h1>
            
            <div className="flex justify-end space-x-3">
              {/* Filters Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                  className="flex items-center text-sm border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 hover:shadow-md transition-all duration-200 bg-white"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                {showFiltersDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="py-2">
                      <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-100">Quick Filters</div>
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Free consultation</button>
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Same-day availability</button>
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Premium packages</button>
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Budget-friendly</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center text-sm border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 hover:shadow-md transition-all duration-200 bg-white"
                >
                  Sort by: {sortOptions.find(option => option.value === sortBy)?.label}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="py-2">
                      {sortOptions.map((option) => (
                        <button 
                          key={option.value}
                          onClick={() => handleSortChange(option.value)}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                            sortBy === option.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Vendor List */}
          <div className="space-y-6">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="border border-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                  <div className="md:col-span-3">
                    <img 
                      src={vendor.image}
                      alt={vendor.name}
                      className="w-full h-48 md:h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="md:col-span-6 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors cursor-pointer">{vendor.name}</h2>
                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {vendor.location}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 text-sm mb-4">
                      {vendor.features.map((feature, idx) => (
                        <span key={feature} className="text-gray-600 bg-gray-50 px-2 py-1 rounded-full text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-900 mb-2">{vendor.description}</h3>
                      <div className="space-y-1">
                        {vendor.details.map((detail, idx) => (
                          <p key={idx} className="text-sm text-gray-600 flex items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 flex-shrink-0"></span>
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {vendor.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs hover:bg-blue-100 transition-colors border border-blue-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-3 p-6 flex flex-col justify-between bg-gray-50/50">
                    <div className="flex items-center justify-end mb-6">
                      <div className="text-right mr-3">
                        <div className={`font-medium ${getRatingTextColor(vendor.ratingText)}`}>
                          {vendor.ratingText}
                        </div>
                        <div className="text-xs text-gray-500">{vendor.reviewCount}</div>
                      </div>
                      <div className={`rounded-lg px-2 py-1 font-bold text-sm ${getRatingColor(vendor.rating)}`}>
                        {vendor.rating}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        ${vendor.price.toLocaleString()}
                        {vendor.priceUnit && <span className="text-sm font-normal text-gray-500">/{vendor.priceUnit}</span>}
                      </div>
                      <div className="text-sm text-gray-500 mb-6">Starting price</div>
                      <button 
                        onClick={() => navigate(`/vendors/${vendor.id}`)}
                        className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm"
                      >
                        View vendor details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">3</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">4</button>
              <span className="text-gray-400">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">25</button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-12 text-right text-sm text-gray-600">
            <p className="mb-1">Help</p>
            <p className="mb-1">FAQ</p>
            <p className="mb-1">Customer service</p>
            <p className="mb-1">How to guide</p>
            <p className="mb-1">Contact us</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;