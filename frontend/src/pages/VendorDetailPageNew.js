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
      },
      {
        name: "Ultimate Package",
        price: 9500,
        features: ["Multi-day venue access", "Complete event management", "Personal wedding planner", "Luxury amenities", "Professional photography", "Catering included", "Transportation service", "Spa services"]
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
    responseTime: "Usually responds within 2 hours",
    reviews: [
      {
        id: 1,
        name: "Sarah & Michael",
        rating: 5,
        date: "November 2024",
        comment: "Absolutely perfect venue for our wedding! The gardens were stunning and the coordination team made everything seamless.",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face"
      },
      {
        id: 2,
        name: "Emma & James",
        rating: 5,
        date: "October 2024", 
        comment: "The most beautiful venue with incredible service. Our guests are still talking about how magical the day was!",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face"
      },
      {
        id: 3,
        name: "Lisa & David",
        rating: 4,
        date: "September 2024",
        comment: "Great venue with beautiful outdoor spaces. The only minor issue was parking, but everything else was perfect.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face"
      }
    ]
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

              <p className="text-gray-700 mb-6 font-sans leading-relaxed" style={{ textAlign: 'left' }}>{vendor.longDescription}</p>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 font-sans" style={{ textAlign: 'left' }}>What's included</h3>
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

      {/* Packages Section */}
      <div className="container mx-auto px-9 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 font-sans" style={{ textAlign: 'left' }}>Packages & Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vendor.packages.map((pkg, index) => {
            // Define images for each package
            const packageImages = [
              "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80", // Essential - simple setup
              "https://images.unsplash.com/photo-1519167758481-83f29c7c3d6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80", // Premium - elegant venue
              "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80", // Luxury - grand setup
              "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80"  // Ultimate - luxury outdoor ceremony
            ];

            return (
              <div 
                key={index} 
                style={{
                  width: '316px',
                  height: '326px',
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  boxShadow: '0px 1px 12px rgba(3,3,3,0.08)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Package Image */}
                <div style={{ height: '120px', overflow: 'hidden' }}>
                  <img 
                    src={packageImages[index]}
                    alt={pkg.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>

                {/* Package Content */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 font-sans" style={{ textAlign: 'left' }}>
                      {pkg.name}
                    </h3>
                    <div className="mb-3" style={{ textAlign: 'left' }}>
                      <span className="text-xl font-bold text-blue-500 font-sans">${pkg.price.toLocaleString()}</span>
                    </div>
                    <ul className="space-y-1 mb-4" style={{ textAlign: 'left' }}>
                      {pkg.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center font-sans">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-xs text-gray-700">{feature}</span>
                        </li>
                      ))}
                      {pkg.features.length > 3 && (
                        <li className="text-xs text-gray-500 font-sans" style={{ textAlign: 'left' }}>
                          +{pkg.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>
                  <button className="w-full border border-blue-500 text-blue-500 py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors font-sans text-sm">
                    Select Package
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container mx-auto px-9 mb-12">
        <h2 className="font-bold text-lg mb-6" style={{ textAlign: 'left' }}>Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Rating Summary */}
          <div className="md:col-span-3">
            <div className="flex items-center mb-6">
              <div className="text-3xl font-bold mr-2">9.6</div>
              <div className="text-lg">/10</div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Service Quality</span>
                  <span>10/10</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div className="bg-blue-500 h-2 rounded-full w-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Venue/Equipment</span>
                  <span>7/10</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div className="bg-blue-500 h-2 rounded-full w-[70%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Location</span>
                  <span>9/10</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div className="bg-blue-500 h-2 rounded-full w-[90%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Experience</span>
                  <span>8/10</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div className="bg-blue-500 h-2 rounded-full w-[80%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Communication</span>
                  <span>9/10</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div className="bg-blue-500 h-2 rounded-full w-[90%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Review List */}
          <div className="md:col-span-9">
            <div className="border-b pb-6 mb-6">
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="font-medium">Perfect venue for our dream wedding!</h3>
                  <p className="text-sm text-gray-600">Sarah & Michael</p>
                </div>
                <div className="flex items-center">
                  <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs mr-2">
                    Excellent
                  </div>
                  <span className="font-bold">10</span>
                </div>
              </div>
              <p className="text-sm mb-3" style={{ textAlign: 'left' }}>
                Absolutely stunning venue with incredible service. Our wedding day was magical thanks to their amazing team!
              </p>
              <ul className="text-sm space-y-1 mb-3">
                <li className="flex items-start">
                  <span className="text-green-500 text-sm mr-1">+</span>
                  <span>Beautiful garden setting</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 text-sm mr-1">+</span>
                  <span>Professional coordination</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 text-sm mr-1">+</span>
                  <span>Excellent catering service</span>
                </li>
              </ul>
              <p className="text-xs text-gray-500 text-right">
                Reviewed on 20 November 2024
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="font-medium">Good venue but limited parking</h3>
                  <p className="text-sm text-gray-600">Emma & James</p>
                </div>
                <div className="flex items-center">
                  <div className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md text-xs mr-2">
                    Good
                  </div>
                  <span className="font-bold">7.2</span>
                </div>
              </div>
              <p className="text-sm mb-3" style={{ textAlign: 'left' }}>
                Beautiful venue with great service, but parking was challenging for our guests. Would recommend arranging transport.
              </p>
              <ul className="text-sm space-y-1 mb-3">
                <li className="flex items-start">
                  <span className="text-red-500 text-sm mr-1">-</span>
                  <span>Limited parking spaces</span>
                </li>
              </ul>
              <p className="text-xs text-gray-500 text-right">
                Reviewed on 15 October 2024
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container mx-auto px-9 mb-12">
        <div 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0px 1px 12px rgba(3,3,3,0.08)',
            padding: '32px'
          }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-sans" style={{ textAlign: 'left' }}>Get in Touch</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center" style={{ justifyContent: 'flex-start' }}>
                <div 
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#eff6ff',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px'
                  }}
                >
                  <Phone className="w-5 h-5 text-blue-500" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p className="text-sm text-gray-500 font-sans">Phone</p>
                  <p className="font-medium text-gray-900 font-sans">{vendor.contact.phone}</p>
                </div>
              </div>

              <div className="flex items-center" style={{ justifyContent: 'flex-start' }}>
                <div 
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#eff6ff',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px'
                  }}
                >
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p className="text-sm text-gray-500 font-sans">Email</p>
                  <p className="font-medium text-gray-900 font-sans">{vendor.contact.email}</p>
                </div>
              </div>

              <div className="flex items-center" style={{ justifyContent: 'flex-start' }}>
                <div 
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#eff6ff',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px'
                  }}
                >
                  <Globe className="w-5 h-5 text-blue-500" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p className="text-sm text-gray-500 font-sans">Website</p>
                  <p className="font-medium text-gray-900 font-sans">{vendor.contact.website}</p>
                </div>
              </div>

              {/* Social Media */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3 font-sans" style={{ textAlign: 'left' }}>Follow us</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Instagram className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="font-sans text-sm text-gray-700">{vendor.socialMedia.instagram}</span>
                  </div>
                  <div className="flex items-center">
                    <Facebook className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="font-sans text-sm text-gray-700">{vendor.socialMedia.facebook}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <p className="text-gray-700 mb-6 font-sans leading-relaxed" style={{ textAlign: 'left' }}>
                Ready to make your wedding dreams come true? Contact us today to check availability and discuss your special day.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-sans" style={{ textAlign: 'left' }}>
                    Your Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-sans" style={{ textAlign: 'left' }}>
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-sans" style={{ textAlign: 'left' }}>
                    Message
                  </label>
                  <textarea 
                    rows="4"
                    placeholder="Tell us about your wedding plans..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans resize-none"
                  ></textarea>
                </div>
                
                <button 
                  style={{
                    width: '100%',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                  className="font-sans"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Same as landing page */}
      <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-9">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 font-sans">Enosi</h3>
              <p className="text-gray-600 text-sm font-sans">
                Australia's premier wedding vendor marketplace, connecting couples with the perfect professionals for their special day.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-sans">For Couples</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 font-sans">Find Vendors</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Wedding Planning</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Budget Calculator</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Inspiration</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-sans">For Vendors</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 font-sans">Join as Vendor</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Vendor Dashboard</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Resources</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-sans">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 font-sans">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Terms of Service</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-600 text-sm font-sans">
              © 2025 Enosi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 font-sans">Request Quote</h3>
              <button 
                onClick={() => setShowQuoteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Wedding Date</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 font-sans" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Guest Count</label>
                <input type="number" placeholder="Number of guests" className="w-full border border-gray-300 rounded-lg px-3 py-2 font-sans" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Message</label>
                <textarea 
                  placeholder="Tell us about your wedding plans..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-sans"
                ></textarea>
              </div>
              <button className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-sans">
                Send Quote Request
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <button 
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={vendor.images[currentImageIndex]}
              alt={vendor.name}
              className="max-w-full max-h-full object-contain"
            />
            <button 
              onClick={() => setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : vendor.images.length - 1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button 
              onClick={() => setCurrentImageIndex(currentImageIndex < vendor.images.length - 1 ? currentImageIndex + 1 : 0)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDetailPage;