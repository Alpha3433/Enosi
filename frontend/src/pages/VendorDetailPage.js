import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Star, 
  MapPin, 
  Heart, 
  Share,
  Calendar,
  Users,
  Award,
  Shield,
  Globe,
  Instagram,
  Facebook,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Mail,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Initialize match object for this component
if (typeof window !== 'undefined' && !window.match) {
  window.match = {
    params: {},
    isExact: true,
    path: window.location.pathname,
    url: window.location.pathname
  };
}

const VendorDetailPage = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Mock vendor data - in real app this would come from API
  const vendor = {
    id: vendorId,
    name: "Elegant Garden Venues",
    location: "Sydney, NSW",
    rating: 4.8,
    reviewCount: "124 reviews",
    ratingText: "Excellent",
    price: 2500,
    priceUnit: "event",
    category: "Venue",
    description: "Stunning garden venue perfect for outdoor weddings with panoramic city views and professional event coordination.",
    longDescription: "Located in the heart of Sydney, Elegant Garden Venues offers breathtaking outdoor spaces surrounded by lush gardens and panoramic city views. Our venue specializes in creating unforgettable wedding experiences with our team of professional event coordinators who handle every detail of your special day.",
    images: [
      "https://images.unsplash.com/photo-1519167758481-83f29c7c3d6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    ],
    features: [
      "Outdoor ceremony space",
      "Professional coordination",
      "Catering services available",
      "Full bar service",
      "Photography packages",
      "Flexible seating arrangements"
    ],
    packages: [
      {
        name: "Essential Package",
        price: 2500,
        features: ["4-hour venue rental", "Basic setup", "Coordinator on-site", "Tables and chairs"]
      },
      {
        name: "Premium Package", 
        price: 4200,
        features: ["8-hour venue rental", "Full setup & styling", "Wedding coordinator", "Tables, chairs & linens", "Sound system", "Bridal suite access"]
      },
      {
        name: "Luxury Package",
        price: 6800,
        features: ["Full day venue access", "Complete styling service", "Dedicated coordinator team", "Premium furniture", "Professional sound/lighting", "Bridal & groom suites", "Welcome drinks"]
      }
    ],
    contact: {
      phone: "+61 2 9876 5432",
      email: "bookings@elegantgardens.com.au",
      website: "www.elegantgardens.com.au"
    },
    socialMedia: {
      instagram: "@elegantgardens",
      facebook: "ElegantGardenVenues"
    },
    availability: "Available most weekends",
    responseTime: "Usually responds within 2 hours"
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header - Same as landing page */}
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

      {/* Back Button */}
      <div className="container mx-auto px-9 py-4">
        <button 
          onClick={() => navigate('/search')}
          className="flex items-center text-gray-600 hover:text-blue-500 transition-colors font-sans"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to search results
        </button>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-9 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={vendor.images[currentImageIndex]}
                alt={vendor.name}
                className="w-full h-96 object-cover rounded-2xl cursor-pointer"
                onClick={() => setShowImageModal(true)}
              />
              <button 
                onClick={() => setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : vendor.images.length - 1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-lg hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentImageIndex(currentImageIndex < vendor.images.length - 1 ? currentImageIndex + 1 : 0)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-lg hover:bg-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {vendor.images.map((image, index) => (
                <img 
                  key={index}
                  src={image}
                  alt={`${vendor.name} ${index + 1}`}
                  className={`w-full h-20 object-cover rounded-lg cursor-pointer border-2 ${index === currentImageIndex ? 'border-blue-500' : 'border-transparent'}`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </div>

          {/* Vendor Information */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 font-sans mb-2">{vendor.name}</h1>
                  <p className="text-lg text-gray-600 flex items-center font-sans">
                    <MapPin className="w-5 h-5 mr-2" />
                    {vendor.location}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setIsFavorited(!isFavorited)}
                    className={`p-3 rounded-full border transition-colors ${isFavorited ? 'bg-red-50 border-red-200 text-red-500' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-3 rounded-full bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors">
                    <Share className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold ml-1 font-sans">{vendor.rating}</span>
                  <span className="text-gray-600 ml-1 font-sans">({vendor.reviewCount})</span>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium font-sans">
                  {vendor.ratingText}
                </span>
              </div>

              <p className="text-gray-700 mb-6 font-sans leading-relaxed">{vendor.longDescription}</p>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 font-sans">What's included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {vendor.features.map((feature, index) => (
                    <div key={index} className="flex items-center font-sans">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-gray-900 font-sans">
                    ${vendor.price.toLocaleString()}
                  </span>
                  <span className="text-gray-600 font-sans">/{vendor.priceUnit}</span>
                  <p className="text-sm text-gray-500 mt-1 font-sans">Starting price</p>
                </div>
                <button 
                  onClick={() => setShowQuoteModal(true)}
                  className="w-full bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 transition-colors font-sans"
                >
                  Request Quote
                </button>
                <p className="text-xs text-gray-500 text-center mt-2 font-sans">{vendor.responseTime}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      business_name: 'Eternal Moments Photography',
      category: 'photographer',
      description: 'Capturing love stories with artistic vision and professional excellence. We specialize in romantic, candid, and traditional wedding photography that tells your unique story. Our team combines technical expertise with creative flair to deliver stunning images that will be treasured for generations.',
      location: 'Sydney, NSW',
      service_areas: ['Sydney', 'Blue Mountains', 'Central Coast'],
      pricing_from: 1200,
      pricing_to: 3500,
      pricing_type: 'range',
      gallery_images: [
        'https://images.unsplash.com/photo-1606490194859-07c18c9f0968',
        'https://images.unsplash.com/photo-1578730169862-749bbdc763a8',
        'https://images.unsplash.com/photo-1639259621742-90f4c0cf5a16',
        'https://images.unsplash.com/photo-1495434224324-36812b391125'
      ],
      average_rating: 4.9,
      total_reviews: 156,
      verified: true,
      featured: true,
      years_experience: 8,
      team_size: 2,
      website: 'https://eternalmoments.com.au',
      instagram: '@eternalmomentsphotography',
      packages: [
        {
          name: 'Essential Package',
          price: 1200,
          description: 'Perfect for intimate weddings',
          features: ['4 hours coverage', '200+ edited photos', 'Online gallery', 'Print release']
        },
        {
          name: 'Premium Package',
          price: 2500,
          description: 'Our most popular package',
          features: ['8 hours coverage', '500+ edited photos', 'Engagement session', 'Wedding album', 'USB drive']
        },
        {
          name: 'Luxury Package',
          price: 3500,
          description: 'Complete wedding photography experience',
          features: ['Full day coverage', '800+ edited photos', 'Second photographer', 'Premium album', 'Canvas prints']
        }
      ],
      reviews: [
        {
          name: 'Sarah & Michael',
          rating: 5,
          date: '2024-02-15',
          comment: 'Absolutely amazing! They captured every special moment perfectly. The photos are stunning and we couldn\'t be happier.'
        },
        {
          name: 'Emma & James',
          rating: 5,
          date: '2024-01-20',
          comment: 'Professional, friendly, and incredibly talented. They made us feel so comfortable and the results exceeded our expectations.'
        },
        {
          name: 'Rachel & David',
          rating: 5,
          date: '2023-12-10',
          comment: 'The best decision we made for our wedding! Every photo tells a story and captures the emotion of our special day.'
        }
      ]
    },
    'mock-2': {
      id: 'mock-2',
      business_name: 'Garden Grove Venues',
      category: 'venue',
      description: 'Stunning outdoor and indoor wedding venues with lush gardens, elegant pavilions, and breathtaking views. Our venues offer the perfect backdrop for your dream wedding.',
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
      team_size: 8,
      packages: [
        {
          name: 'Garden Ceremony',
          price: 2500,
          description: 'Outdoor ceremony in our beautiful gardens',
          features: ['Garden ceremony space', 'Chairs for 100 guests', 'Bridal suite', 'Basic decorations']
        }
      ],
      reviews: [
        {
          name: 'Lisa & Tom',
          rating: 5,
          date: '2024-01-15',
          comment: 'The most beautiful venue! Our guests are still talking about how magical it was.'
        }
      ]
    }
  };

  // Use mock data if vendor ID starts with 'mock-' or if API returns no data
  const vendorData = vendorId.startsWith('mock-') ? 
    { data: mockVendorData[vendorId] } : 
    vendor || { data: mockVendorData['mock-1'] };

  useEffect(() => {
    if (vendor) {
      fetchReviewsAndTrustScore();
    }
  }, [vendor]);

  const fetchReviewsAndTrustScore = async () => {
    try {
      // Fetch reviews
      const reviewsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/vendors/${vendorId}/reviews`);
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);
      }

      // Fetch trust score
      const trustResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/vendors/${vendorId}/trust-score`);
      if (trustResponse.ok) {
        const trustData = await trustResponse.json();
        setTrustScore(trustData);
      }
    } catch (error) {
      console.error('Error fetching reviews and trust score:', error);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });

      if (response.ok) {
        const newReview = await response.json();
        setReviews(prev => [newReview, ...prev]);
        setShowReviewForm(false);
        alert('Review submitted successfully!');
        
        // Refresh trust score
        fetchReviewsAndTrustScore();
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  // Don't show loading for mock vendors
  const isActuallyLoading = isLoading && !vendorId.startsWith('mock-');

  if (isActuallyLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendorData?.data) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor not found</h1>
            <Link to="/search" className="text-rose-600 hover:text-rose-700">
              Browse all vendors
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = vendorData.data.gallery_images?.length > 0 ? vendorData.data.gallery_images : [
    'https://images.unsplash.com/photo-1606490194859-07c18c9f0968',
    'https://images.unsplash.com/photo-1578730169862-749bbdc763a8',
    'https://images.unsplash.com/photo-1639259621742-90f4c0cf5a16'
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b">
        <Link to="/search" className="flex items-center text-gray-600 hover:text-rose-600">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to search results
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {vendorData.data.business_name}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                <span className="font-medium">{vendorData.data.average_rating}</span>
                <span className="mx-1">·</span>
                <span>{vendorData.data.total_reviews} reviews</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-1" />
                {vendorData.data.location}
              </div>
              {vendorData.data.verified && (
                <div className="flex items-center text-green-600">
                  <Shield className="h-5 w-5 mr-1" />
                  Verified
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Heart className={`h-5 w-5 mr-2 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
              Save
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Share className="h-5 w-5 mr-2 text-gray-600" />
              Share
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Photo Gallery</h2>
            <Link
              to={`/vendors/${vendorId}/gallery`}
              className="flex items-center text-rose-600 hover:text-rose-700 font-medium transition-colors"
            >
              View Full Gallery
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-96 lg:h-[500px]">
            {/* Main image */}
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={images[currentImageIndex]}
                alt={vendorData.data.business_name}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setShowImageModal(true)}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </button>
                </>
              )}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Thumbnail grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {images.slice(1, 5).map((image, index) => (
                <div key={index} className="relative overflow-hidden rounded-xl">
                  <img
                    src={image}
                    alt={`${vendorData.data.business_name} ${index + 2}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                      setCurrentImageIndex(index + 1);
                      setShowImageModal(true);
                    }}
                  />
                  {index === 3 && images.length > 5 && (
                    <Link 
                      to={`/vendors/${vendorId}/gallery`}
                      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-medium cursor-pointer hover:bg-opacity-60 transition-all"
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold">+{images.length - 4}</div>
                        <div className="text-sm">View Gallery</div>
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative h-96">
                <img
                  src={vendorData.data.gallery_images?.[currentImageIndex] || vendorData.data.image}
                  alt={vendorData.data.business_name}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation arrows */}
                {vendorData.data.gallery_images?.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                
                {/* Image counter */}
                {vendorData.data.gallery_images?.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {vendorData.data.gallery_images.length}
                  </div>
                )}
              </div>
              
              {/* Thumbnail strip */}
              {vendorData.data.gallery_images?.length > 1 && (
                <div className="p-4 bg-gray-50">
                  <div className="flex space-x-2 overflow-x-auto">
                    {vendorData.data.gallery_images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                          index === currentImageIndex ? 'border-rose-500' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {vendorData.data.business_name}</h2>
              <p className="text-gray-700 leading-relaxed">
                {vendorData.data.description}
              </p>
            </div>

            {/* Services & Packages */}
            {vendorData.data.packages && vendorData.data.packages.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Packages</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vendorData.data.packages.map((pkg, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="border border-gray-200 rounded-lg p-4 hover:border-rose-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                        <span className="text-2xl font-bold text-rose-600">${pkg.price}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>
                      <ul className="space-y-1">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center">
                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <ReviewDisplay
              reviews={reviews}
              vendor={vendorData.data}
              onWriteReview={() => setShowReviewForm(true)}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Quote Request Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                <div className="mb-4">
                  {vendorData.data.pricing_type === 'from' && vendorData.data.pricing_from && (
                    <div className="text-2xl font-bold text-gray-900">
                      From ${vendorData.data.pricing_from}
                    </div>
                  )}
                  {vendorData.data.pricing_type === 'range' && vendorData.data.pricing_from && vendorData.data.pricing_to && (
                    <div className="text-2xl font-bold text-gray-900">
                      ${vendorData.data.pricing_from} - ${vendorData.data.pricing_to}
                    </div>
                  )}
                  {vendorData.data.pricing_type === 'enquire' && (
                    <div className="text-xl font-bold text-rose-600">
                      Contact for pricing
                    </div>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowQuoteModal(true)}
                  className="w-full bg-rose-600 text-white py-3 px-6 rounded-lg hover:bg-rose-700 transition-colors font-medium mb-3"
                >
                  Request Quote
                </motion.button>
                
                {/* Chat Button */}
                <ChatButton 
                  vendorId={vendorId}
                  vendorName={vendorData?.data?.business_name}
                  className="w-full mb-3"
                />
                
                <Link
                  to={`/booking/payment/${vendorId}`}
                  className="block"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg hover:bg-pink-700 transition-colors font-medium mb-4"
                  >
                    Book with Deposit
                  </motion.button>
                </Link>
                
                <p className="text-sm text-gray-600 text-center">
                  Free quotes • Secure deposits • No commitment
                </p>
              </div>

              {/* Vendor Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vendor Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <span className="text-sm text-gray-600">Experience</span>
                      <p className="font-medium">{vendorData.data.years_experience || 'Not specified'} years</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <span className="text-sm text-gray-600">Team Size</span>
                      <p className="font-medium">{vendorData.data.team_size || 'Not specified'} people</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <span className="text-sm text-gray-600">Service Areas</span>
                      <p className="font-medium">
                        {vendorData.data.service_areas?.join(', ') || vendorData.data.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Links */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Connect
                </h3>
                <div className="space-y-3">
                  {vendorData.data.website && (
                    <a
                      href={vendorData.data.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-rose-600 transition-colors"
                    >
                      <Globe className="h-5 w-5 mr-3" />
                      Website
                    </a>
                  )}
                  
                  {vendorData.data.instagram && (
                    <a
                      href={vendorData.data.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-rose-600 transition-colors"
                    >
                      <Instagram className="h-5 w-5 mr-3" />
                      Instagram
                    </a>
                  )}
                  
                  {vendorData.data.facebook && (
                    <a
                      href={vendorData.data.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-rose-600 transition-colors"
                    >
                      <Facebook className="h-5 w-5 mr-3" />
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>
            
            <img
              src={images[currentImageIndex]}
              alt={vendorData.data.business_name}
              className="max-w-full max-h-full object-contain"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <ChevronLeft className="h-12 w-12" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <ChevronRight className="h-12 w-12" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quote Request Modal */}
      <QuoteRequestModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        vendor={vendorData}
      />

      {showReviewForm && (
        <ReviewForm
          vendor={vendorData.data}
          onSubmit={handleReviewSubmit}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default VendorDetailPage;