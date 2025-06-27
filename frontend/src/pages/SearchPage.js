import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, MapPin, Calendar, Users } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-white font-sans" style={{ fontFamily: 'Prompt, sans-serif' }}>
      {/* Header */}
      <header className="bg-white">
        <div className="container mx-auto px-9 py-5 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="text-xl font-bold font-sans"
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
          
          <nav className="hidden md:flex space-x-6">
            <button onClick={() => navigate('/search')} className="text-sm hover:text-blue-500 transition-colors font-sans">
              Find Vendors
            </button>
            <a href="#inspiration" className="text-sm hover:text-blue-500 transition-colors font-sans">
              Inspiration
            </a>
            <a href="#about" className="text-sm hover:text-blue-500 transition-colors font-sans">
              About Us
            </a>
          </nav>

          <div className="flex space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <span className="text-sm font-sans">{user?.first_name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => navigate(user?.user_type === 'vendor' ? '/vendor-dashboard' : '/dashboard')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-sans"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-sans"
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
                  className="border border-gray-300 text-gray-700 rounded-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors font-sans"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-blue-500 text-white rounded-full px-4 py-2 text-sm hover:bg-blue-600 transition-colors font-sans"
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
                onChange={(e) => handleFilterChange('location', e.target.value)}
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
                onChange={(e) => handleFilterChange('vendorType', e.target.value)}
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
                onChange={(e) => handleFilterChange('weddingDate', e.target.value)}
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
                onChange={(e) => handleFilterChange('guestCount', e.target.value)}
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
              style={{
                cursor: 'pointer',
                width: '310px',
                height: '42px',
                padding: '0px 8px',
                border: '0',
                boxSizing: 'border-box',
                borderRadius: '100px',
                backgroundColor: '#1d64ec',
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: 'Prompt',
                lineHeight: '18px',
                outline: 'none',
              }}
            >
              Search
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
                      onChange={() => handleFeatureToggle(feature)}
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
                      onChange={() => handleFilterChange('priceRange', range)}
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
                      onChange={() => handleFilterChange('rating', rating)}
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
                    onClick={() => handleFilterChange('vendorClass', star)}
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
            {vendors.length} filtered results for: {(() => {
              const parts = [];
              if (filters.location) parts.push(filters.location);
              if (filters.weddingDate) parts.push(filters.weddingDate);
              if (filters.guestCount) parts.push(`${filters.guestCount} guests`);
              if (filters.vendorType) parts.push(filters.vendorType);
              
              return parts.length > 0 ? parts.join(', ') : 'Copenhagen, 9.-12. Dec, 2 guests, 1 room';
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
            Breakfast included
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-9 p-6" style={{ marginTop: '80px' }}>
          
          {/* Vendor List */}
          <div className="space-y-6">
            {vendors.map((vendor) => (
              <div 
                key={vendor.id} 
                style={{
                  width: '905px',
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
                <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
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
                  
                  <div className="mb-4 flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">{vendor.description}</h3>
                    <div className="space-y-1">
                      {vendor.details.slice(0, 2).map((detail, idx) => (
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
                <div style={{ width: '200px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'rgba(248, 250, 252, 0.5)' }}>
                  <div className="flex items-center justify-end mb-4">
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
                    <div className="text-sm text-gray-500 mb-4">Starting price</div>
                    <button 
                      onClick={() => navigate(`/vendors/${vendor.id}`)}
                      className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm"
                    >
                      View vendor details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom Footer */}
      <div 
        style={{
          width: '1440px',
          height: '176px',
          backgroundColor: '#f8f8f8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div 
          style={{
            color: '#030303',
            fontSize: '12px',
            fontFamily: 'Prompt',
            fontWeight: 300,
            lineHeight: '16px',
          }}
        >
          Your favorite wedding vendor booking experience since 1997!
        </div>
        <div 
          style={{
            color: '#858585',
            fontSize: '12px',
            fontFamily: 'Prompt',
            fontWeight: 300,
            lineHeight: '16px',
          }}
        >
          Enosi © 2025
        </div>
      </div>
    </div>
  );
};

export default SearchPage;