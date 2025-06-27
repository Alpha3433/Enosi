import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, MapPin, Calendar, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    min_rating: '',
    featured_only: false,
    price_range: ''
  });

  const { data: vendors, isLoading, error } = useQuery({
    queryKey: ['vendors', filters],
    queryFn: () => vendorsAPI.search(filters),
  });

  // Mock vendor data for demonstration when no real vendors exist
  const mockVendors = [
    {
      id: 'mock-1',
      business_name: 'Eternal Moments Photography',
      category: 'photographer',
      description: 'Capturing love stories with artistic vision and professional excellence. Specializing in romantic, candid, and traditional wedding photography.',
      location: 'Sydney, NSW',
      service_areas: ['Sydney', 'Blue Mountains', 'Central Coast'],
      pricing_from: 1200,
      pricing_to: 3500,
      pricing_type: 'range',
      gallery_images: [
        'https://images.unsplash.com/photo-1606490194859-07c18c9f0968',
        'https://images.unsplash.com/photo-1578730169862-749bbdc763a8',
        'https://images.unsplash.com/photo-1639259621742-90f4c0cf5a16'
      ],
      average_rating: 4.9,
      total_reviews: 156,
      verified: true,
      featured: true,
      years_experience: 8,
      team_size: 2,
      website: 'https://eternalmoments.com.au',
      instagram: '@eternalmomentsphotography'
    },
    {
      id: 'mock-2',
      business_name: 'Garden Grove Venues',
      category: 'venue',
      description: 'Stunning outdoor and indoor wedding venues with lush gardens, elegant pavilions, and breathtaking views.',
      location: 'Melbourne, VIC',
      service_areas: ['Melbourne', 'Yarra Valley', 'Mornington Peninsula'],
      pricing_from: 2500,
      pricing_to: 8000,
      pricing_type: 'range',
      gallery_images: [
        'https://images.unsplash.com/photo-1578730169862-749bbdc763a8',
        'https://images.unsplash.com/photo-1606490194859-07c18c9f0968'
      ],
      average_rating: 4.8,
      total_reviews: 89,
      verified: true,
      featured: true,
      years_experience: 12,
      team_size: 8
    },
    {
      id: 'mock-3',
      business_name: 'Bloom & Blossom Florists',
      category: 'florist',
      description: 'Creating magical floral designs for your special day. From bridal bouquets to ceremony decorations.',
      location: 'Brisbane, QLD',
      service_areas: ['Brisbane', 'Gold Coast', 'Sunshine Coast'],
      pricing_from: 350,
      pricing_to: 1500,
      pricing_type: 'range',
      gallery_images: [
        'https://images.unsplash.com/photo-1593471682521-5354d03150da'
      ],
      average_rating: 4.9,
      total_reviews: 124,
      verified: true,
      featured: false,
      years_experience: 6,
      team_size: 3
    },
    {
      id: 'mock-4',
      business_name: 'Harmony Strings Music',
      category: 'music',
      description: 'Professional musicians providing elegant ceremony and reception music. String quartets, solo artists, and bands.',
      location: 'Perth, WA',
      service_areas: ['Perth', 'Fremantle', 'Swan Valley'],
      pricing_from: 400,
      pricing_to: 1200,
      pricing_type: 'range',
      gallery_images: [
        'https://images.unsplash.com/photo-1635612445702-1891217d4a30'
      ],
      average_rating: 4.7,
      total_reviews: 67,
      verified: true,
      featured: false,
      years_experience: 10,
      team_size: 4
    },
    {
      id: 'mock-5',
      business_name: 'Gourmet Catering Co',
      category: 'catering',
      description: 'Exquisite wedding catering with fresh, local ingredients. Custom menus for every taste and dietary requirement.',
      location: 'Adelaide, SA',
      service_areas: ['Adelaide', 'Barossa Valley', 'Adelaide Hills'],
      pricing_from: 45,
      pricing_to: 120,
      pricing_type: 'range',
      gallery_images: [
        'https://images.unsplash.com/photo-1552617911-83473ac6204b'
      ],
      average_rating: 4.8,
      total_reviews: 203,
      verified: true,
      featured: true,
      years_experience: 15,
      team_size: 12
    },
    {
      id: 'mock-6',
      business_name: 'Glamour Beauty Studio',
      category: 'makeup',
      description: 'Professional bridal hair and makeup services. Creating stunning looks for your special day.',
      location: 'Gold Coast, QLD',
      service_areas: ['Gold Coast', 'Brisbane', 'Byron Bay'],
      pricing_from: 300,
      pricing_to: 800,
      pricing_type: 'range',
      gallery_images: [
        'https://images.pexels.com/photos/3434997/pexels-photo-3434997.jpeg'
      ],
      average_rating: 4.9,
      total_reviews: 98,
      verified: true,
      featured: false,
      years_experience: 7,
      team_size: 5
    }
  ];

  // Use mock data if no real vendors are returned
  const displayVendors = vendors?.data?.length > 0 ? vendors.data : 
    mockVendors.filter(vendor => {
      const matchesCategory = !filters.category || vendor.category === filters.category;
      const matchesLocation = !filters.location || 
        vendor.location.toLowerCase().includes(filters.location.toLowerCase()) ||
        vendor.service_areas.some(area => area.toLowerCase().includes(filters.location.toLowerCase()));
      const matchesRating = !filters.min_rating || vendor.average_rating >= parseFloat(filters.min_rating);
      const matchesFeatured = !filters.featured_only || vendor.featured;
      
      return matchesCategory && matchesLocation && matchesRating && matchesFeatured;
    });

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      min_rating: '',
      featured_only: false,
      price_range: ''
    });
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Search Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center text-gray-600 hover:text-rose-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to home
            </Link>
            
            {/* Search bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={filters.location}
                  onChange={(e) => updateFilters({ location: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* View controls */}
            <div className="flex items-center space-x-2">

              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </button>
              
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white border-b"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilters({ category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">All categories</option>
                  <option value="photographer">Photographers</option>
                  <option value="venue">Venues</option>
                  <option value="catering">Catering</option>
                  <option value="florist">Florists</option>
                  <option value="music">Music & Entertainment</option>
                  <option value="makeup">Hair & Makeup</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                <select
                  value={filters.min_rating}
                  onChange={(e) => updateFilters({ min_rating: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Any rating</option>
                  <option value="4.5">4.5+ stars</option>
                  <option value="4.0">4.0+ stars</option>
                  <option value="3.5">3.5+ stars</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select
                  value={filters.price_range}
                  onChange={(e) => updateFilters({ price_range: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Any price</option>
                  <option value="0-500">Under $500</option>
                  <option value="500-1500">$500 - $1,500</option>
                  <option value="1500-3000">$1,500 - $3,000</option>
                  <option value="3000+">$3,000+</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.featured_only}
                    onChange={(e) => updateFilters({ featured_only: e.target.checked })}
                    className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured only</span>
                </label>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {filters.category ? `${filters.category} vendors` : 'Wedding vendors'}
              {filters.location && ` in ${filters.location}`}
            </h1>
            <p className="text-gray-600 mt-1">
              {displayVendors?.length || 0} vendors found
            </p>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <p className="text-gray-600">Something went wrong. Please try again.</p>
          </div>
        )}

        {/* Vendors grid */}
        {displayVendors && displayVendors.length > 0 && (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-6'
          }>
            {displayVendors.map((vendor) => (
              <VendorCard 
                key={vendor.id} 
                vendor={vendor} 
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {displayVendors?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
            <button
              onClick={clearFilters}
              className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

const VendorCard = ({ vendor, viewMode }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
      >
        <div className="flex">
          <div className="w-80 h-60 relative">
            <img
              src={vendor.gallery_images[0] || 'https://images.unsplash.com/photo-1606490194859-07c18c9f0968'}
              alt={vendor.business_name}
              className="w-full h-full object-cover"
            />
            {vendor.featured && (
              <span className="absolute top-3 left-3 bg-rose-600 text-white px-2 py-1 rounded text-sm font-medium">
                Featured
              </span>
            )}
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <Heart className={`h-5 w-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-white'}`} />
            </button>
          </div>
          
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(vendor.average_rating) ? 'fill-current' : 'text-gray-300'}`} />
                ))}
                <span className="ml-2 text-gray-600 text-sm">
                  {vendor.average_rating} ({vendor.total_reviews} reviews)
                </span>
              </div>
              {vendor.verified && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Verified
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {vendor.business_name}
            </h3>
            <p className="text-gray-600 text-sm mb-2 capitalize">{vendor.category}</p>
            <div className="flex items-center text-gray-500 text-sm mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              {vendor.location}
            </div>
            
            <p className="text-gray-700 mb-4 line-clamp-2">{vendor.description}</p>
            
            <div className="flex items-center justify-between">
              <div>
                {vendor.pricing_type === 'from' && vendor.pricing_from && (
                  <span className="text-lg font-semibold text-gray-900">
                    From ${vendor.pricing_from}
                  </span>
                )}
                {vendor.pricing_type === 'range' && vendor.pricing_from && vendor.pricing_to && (
                  <span className="text-lg font-semibold text-gray-900">
                    ${vendor.pricing_from} - ${vendor.pricing_to}
                  </span>
                )}
                {vendor.pricing_type === 'enquire' && (
                  <span className="text-lg font-semibold text-rose-600">
                    Enquire for pricing
                  </span>
                )}
              </div>
              <Link
                to={`/vendors/${vendor.id}`}
                className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative h-48">
        <img
          src={vendor.gallery_images[0] || 'https://images.unsplash.com/photo-1606490194859-07c18c9f0968'}
          alt={vendor.business_name}
          className="w-full h-full object-cover"
        />
        {vendor.featured && (
          <span className="absolute top-3 left-3 bg-rose-600 text-white px-2 py-1 rounded text-sm font-medium">
            Featured
          </span>
        )}
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
        >
          <Heart className={`h-5 w-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-white'}`} />
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.floor(vendor.average_rating) ? 'fill-current' : 'text-gray-300'}`} />
            ))}
            <span className="ml-2 text-gray-600 text-sm">
              {vendor.average_rating} ({vendor.total_reviews})
            </span>
          </div>
          {vendor.verified && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              Verified
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {vendor.business_name}
        </h3>
        <p className="text-gray-600 text-sm mb-2 capitalize">{vendor.category}</p>
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin className="h-4 w-4 mr-1" />
          {vendor.location}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            {vendor.pricing_type === 'from' && vendor.pricing_from && (
              <span className="text-lg font-semibold text-gray-900">
                From ${vendor.pricing_from}
              </span>
            )}
            {vendor.pricing_type === 'range' && vendor.pricing_from && vendor.pricing_to && (
              <span className="text-lg font-semibold text-gray-900">
                ${vendor.pricing_from} - ${vendor.pricing_to}
              </span>
            )}
            {vendor.pricing_type === 'enquire' && (
              <span className="text-lg font-semibold text-rose-600">
                Enquire for pricing
              </span>
            )}
          </div>
          <Link
            to={`/vendors/${vendor.id}`}
            className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchPage;