import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Heart, Star, MapPin, DollarSign, Calendar, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function EnhancedSearchPage() {
  const { user } = useAuth();
  const [searchResults, setSearchResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trendingVendors, setTrendingVendors] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Search filters
  const [filters, setFilters] = useState({
    location: '',
    category: '',
    price_min: '',
    price_max: '',
    availability_date: '',
    rating_min: '',
    style_tags: [],
    verified_only: false
  });

  // Search metadata
  const [searchMetadata, setSearchMetadata] = useState({});
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const categories = [
    'photographer', 'videographer', 'venue', 'catering', 'florist', 
    'musician', 'decorator', 'makeup_artist', 'dj', 'transport'
  ];

  const styleTags = [
    'modern', 'classic', 'rustic', 'boho', 'minimalist', 'vintage', 
    'romantic', 'candid', 'artistic', 'natural', 'elegant', 'fun'
  ];

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch recently viewed
      const recentResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tracking/recently-viewed?limit=6`, { headers });
      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        setRecentlyViewed(recentData.recently_viewed || []);
      }

      // Initial search to show all vendors
      handleSearch();
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const handleSearch = async (newOffset = 0) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const searchData = {
        ...filters,
        price_min: filters.price_min ? parseFloat(filters.price_min) : null,
        price_max: filters.price_max ? parseFloat(filters.price_max) : null,
        rating_min: filters.rating_min ? parseFloat(filters.rating_min) : null,
        availability_date: filters.availability_date ? new Date(filters.availability_date).toISOString() : null
      };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/search/vendors/enhanced?limit=12&offset=${newOffset}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchData)
      });

      if (response.ok) {
        const data = await response.json();
        
        if (newOffset === 0) {
          setSearchResults(data.vendors || []);
        } else {
          setSearchResults(prev => [...prev, ...(data.vendors || [])]);
        }
        
        setRecommendations(data.recommendations || []);
        setTrendingVendors(data.trending || []);
        setSearchMetadata(data.search_metadata || {});
        setHasMore(data.has_more || false);
        setOffset(newOffset);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    if (key === 'style_tags') {
      setFilters(prev => ({
        ...prev,
        style_tags: prev.style_tags.includes(value)
          ? prev.style_tags.filter(tag => tag !== value)
          : [...prev.style_tags, value]
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      category: '',
      price_min: '',
      price_max: '',
      availability_date: '',
      rating_min: '',
      style_tags: [],
      verified_only: false
    });
  };

  const handleWishlistToggle = async (vendorId, isInWishlist) => {
    try {
      const token = localStorage.getItem('token');
      const url = isInWishlist 
        ? `${process.env.REACT_APP_BACKEND_URL}/api/wishlist/remove/${vendorId}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/wishlist/add/${vendorId}`;
      
      const method = isInWishlist ? 'DELETE' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: method === 'POST' ? JSON.stringify({ notes: '' }) : null
      });

      if (response.ok) {
        // Update the vendor in search results
        setSearchResults(prev => prev.map(vendor => 
          vendor.id === vendorId 
            ? { ...vendor, in_wishlist: !isInWishlist }
            : vendor
        ));
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
    }
  };

  const trackVendorView = async (vendorId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tracking/view/${vendorId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ time_spent: 0 })
      });
    } catch (error) {
      console.error('View tracking error:', error);
    }
  };

  const VendorCard = ({ vendor, showRecommendationBadge = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative group"
    >
      {/* Recommendation Badge */}
      {showRecommendationBadge && (
        <div className="absolute top-3 left-3 z-10 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
          Recommended
        </div>
      )}

      {/* Trust Score Badge */}
      {vendor.trust_score > 80 && (
        <div className="absolute top-3 right-3 z-10 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
          {vendor.trust_score}/100
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleWishlistToggle(vendor.id, vendor.in_wishlist);
        }}
        className={`absolute top-3 right-12 z-10 p-2 rounded-full transition-colors ${
          vendor.in_wishlist 
            ? 'bg-red-500 text-white' 
            : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
        }`}
      >
        <Heart className={`h-4 w-4 ${vendor.in_wishlist ? 'fill-current' : ''}`} />
      </button>

      <div 
        className="cursor-pointer"
        onClick={() => {
          trackVendorView(vendor.id);
          window.location.href = `/vendors/${vendor.id}`;
        }}
      >
        {/* Image */}
        <div className="relative h-48">
          <img
            src={vendor.image || '/placeholder-vendor.jpg'}
            alt={vendor.business_name}
            className="w-full h-full object-cover"
          />
          
          {/* Social Proof Overlay */}
          {vendor.social_proof?.recent_bookings > 0 && (
            <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
              {vendor.social_proof.recent_bookings} bookings this month
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 truncate">{vendor.business_name}</h3>
            <div className="flex items-center text-yellow-400">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {vendor.average_rating?.toFixed(1) || '—'}
              </span>
            </div>
          </div>

          <div className="flex items-center text-gray-500 text-sm mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="truncate">{vendor.location}</span>
          </div>

          {vendor.pricing_from && (
            <div className="flex items-center text-gray-500 text-sm mb-3">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>From ${vendor.pricing_from}</span>
              {vendor.pricing_to && <span> - ${vendor.pricing_to}</span>}
            </div>
          )}

          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {vendor.description}
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-1 mb-3">
            {vendor.verified && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Verified
              </span>
            )}
            {vendor.social_proof?.recent_views > 10 && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Popular
              </span>
            )}
            {vendor.average_rating >= 4.5 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Top Rated
              </span>
            )}
          </div>

          {/* Action Button */}
          <button className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Wedding Vendors</h1>
          
          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Main Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors, services, or locations..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* Search Button */}
              <button
                onClick={() => handleSearch(0)}
                disabled={loading}
                className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.price_min}
                          onChange={(e) => handleFilterChange('price_min', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.price_max}
                          onChange={(e) => handleFilterChange('price_max', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>

                    {/* Availability Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Availability Date</label>
                      <input
                        type="date"
                        value={filters.availability_date}
                        onChange={(e) => handleFilterChange('availability_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    {/* Minimum Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                      <select
                        value={filters.rating_min}
                        onChange={(e) => handleFilterChange('rating_min', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Any Rating</option>
                        <option value="3">3+ Stars</option>
                        <option value="4">4+ Stars</option>
                        <option value="4.5">4.5+ Stars</option>
                      </select>
                    </div>

                    {/* Verified Only */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Verification</label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.verified_only}
                          onChange={(e) => handleFilterChange('verified_only', e.target.checked)}
                          className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Verified only</span>
                      </label>
                    </div>
                  </div>

                  {/* Style Tags */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Style Preferences</label>
                    <div className="flex flex-wrap gap-2">
                      {styleTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleFilterChange('style_tags', tag)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            filters.style_tags.includes(tag)
                              ? 'bg-pink-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex justify-between">
                    <button
                      onClick={clearFilters}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Clear all filters
                    </button>
                    <span className="text-sm text-gray-500">
                      {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v) 
                        ? 'Filters applied' 
                        : 'No filters applied'
                      }
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recently Viewed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {recentlyViewed.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    trackVendorView(item.vendor.id);
                    window.location.href = `/vendors/${item.vendor.id}`;
                  }}
                >
                  <img
                    src={item.vendor.image || '/placeholder-vendor.jpg'}
                    alt={item.vendor.business_name}
                    className="w-full h-24 object-cover"
                  />
                  <div className="p-3">
                    <h4 className="font-medium text-sm text-gray-900 truncate">
                      {item.vendor.business_name}
                    </h4>
                    <p className="text-xs text-gray-500">{item.vendor.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendations.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} showRecommendationBadge />
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Search Results {searchMetadata.total_count && `(${searchMetadata.total_count} found)`}
            </h2>
            
            {searchMetadata.filters_applied && Object.keys(searchMetadata.filters_applied).length > 0 && (
              <div className="text-sm text-gray-500">
                Filters applied: {Object.keys(searchMetadata.filters_applied).join(', ')}
              </div>
            )}
          </div>

          {loading && searchResults.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4 w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => handleSearch(offset + 12)}
                    disabled={loading}
                    className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load More Vendors'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No vendors found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
              <button
                onClick={clearFilters}
                className="text-pink-600 hover:text-pink-700"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Trending Vendors */}
        {trendingVendors.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Trending Now</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {trendingVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedSearchPage;