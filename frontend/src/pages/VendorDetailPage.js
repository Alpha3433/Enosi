import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  X
} from 'lucide-react';
import { Header, Footer, QuoteRequestModal } from '../components';
import { vendorsAPI } from '../services/api';

const VendorDetailPage = () => {
  const { vendorId } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const { data: vendor, isLoading, error } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => vendorsAPI.getById(vendorId),
  });

  if (isLoading) {
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

  if (error || !vendor?.data) {
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

  const vendorData = vendor.data;
  const images = vendorData.gallery_images?.length > 0 ? vendorData.gallery_images : [
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
              {vendorData.business_name}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                <span className="font-medium">{vendorData.average_rating}</span>
                <span className="mx-1">·</span>
                <span>{vendorData.total_reviews} reviews</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-1" />
                {vendorData.location}
              </div>
              {vendorData.verified && (
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-96 lg:h-[500px]">
            {/* Main image */}
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={images[currentImageIndex]}
                alt={vendorData.business_name}
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
                    alt={`${vendorData.business_name} ${index + 2}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                      setCurrentImageIndex(index + 1);
                      setShowImageModal(true);
                    }}
                  />
                  {index === 3 && images.length > 5 && (
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-medium cursor-pointer"
                      onClick={() => setShowImageModal(true)}
                    >
                      +{images.length - 4} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About {vendorData.business_name}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {vendorData.description}
              </p>
            </section>

            {/* Services & Packages */}
            {vendorData.packages?.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Packages</h2>
                <div className="grid gap-4">
                  {vendorData.packages.map((pkg, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                        <span className="text-xl font-bold text-rose-600">${pkg.price}</span>
                      </div>
                      <p className="text-gray-600 mb-4">{pkg.description}</p>
                      {pkg.features && (
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
              <div className="space-y-6">
                {vendorData.reviews?.slice(0, 3).map((review, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-rose-600 font-medium">
                          {review.name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{review.name}</p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`} 
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
                
                {vendorData.total_reviews > 3 && (
                  <button className="text-rose-600 hover:text-rose-700 font-medium">
                    Show all {vendorData.total_reviews} reviews
                  </button>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Quote Request Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                <div className="mb-4">
                  {vendorData.pricing_type === 'from' && vendorData.pricing_from && (
                    <div className="text-2xl font-bold text-gray-900">
                      From ${vendorData.pricing_from}
                    </div>
                  )}
                  {vendorData.pricing_type === 'range' && vendorData.pricing_from && vendorData.pricing_to && (
                    <div className="text-2xl font-bold text-gray-900">
                      ${vendorData.pricing_from} - ${vendorData.pricing_to}
                    </div>
                  )}
                  {vendorData.pricing_type === 'enquire' && (
                    <div className="text-xl font-bold text-rose-600">
                      Contact for pricing
                    </div>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowQuoteModal(true)}
                  className="w-full bg-rose-600 text-white py-3 px-6 rounded-lg hover:bg-rose-700 transition-colors font-medium mb-4"
                >
                  Request Quote
                </motion.button>
                
                <p className="text-sm text-gray-600 text-center">
                  Free quotes • No commitment
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
                      <p className="font-medium">{vendorData.years_experience || 'Not specified'} years</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <span className="text-sm text-gray-600">Team Size</span>
                      <p className="font-medium">{vendorData.team_size || 'Not specified'} people</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <span className="text-sm text-gray-600">Service Areas</span>
                      <p className="font-medium">
                        {vendorData.service_areas?.join(', ') || vendorData.location}
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
                  {vendorData.website && (
                    <a
                      href={vendorData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-rose-600 transition-colors"
                    >
                      <Globe className="h-5 w-5 mr-3" />
                      Website
                    </a>
                  )}
                  
                  {vendorData.instagram && (
                    <a
                      href={vendorData.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-rose-600 transition-colors"
                    >
                      <Instagram className="h-5 w-5 mr-3" />
                      Instagram
                    </a>
                  )}
                  
                  {vendorData.facebook && (
                    <a
                      href={vendorData.facebook}
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
              alt={vendorData.business_name}
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

      <Footer />
    </div>
  );
};

export default VendorDetailPage;