import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Camera, Heart, Download } from 'lucide-react';
import { Header, Footer } from '../components-airbnb';
import EnhancedPhotoGallery from '../components/EnhancedPhotoGallery';

const GalleryPage = () => {
  const params = useParams();
  const vendorId = params.vendorId;
  const [galleryStats, setGalleryStats] = useState({
    totalViews: 1247,
    totalLikes: 89,
    totalDownloads: 23
  });

  // Mock gallery data with enhanced features
  const mockGalleryData = {
    vendorName: "Eternal Moments Photography",
    description: "Explore our complete wedding photography portfolio featuring ceremonies, receptions, portraits, and detail shots from weddings across Sydney and beyond.",
    images: [
      // Regular images
      {
        src: "https://images.unsplash.com/photo-1606490194859-07c18c9f0968?w=800",
        thumbnail: "https://images.unsplash.com/photo-1606490194859-07c18c9f0968?w=400",
        caption: "Romantic ceremony moment under the autumn trees",
        category: "ceremony",
        id: 1
      },
      {
        src: "https://images.unsplash.com/photo-1578730169862-749bbdc763a8?w=800",
        thumbnail: "https://images.unsplash.com/photo-1578730169862-749bbdc763a8?w=400",
        caption: "First dance under romantic lighting",
        category: "reception",
        id: 2
      },
      {
        src: "https://images.unsplash.com/photo-1639259621742-90f4c0cf5a16?w=800",
        thumbnail: "https://images.unsplash.com/photo-1639259621742-90f4c0cf5a16?w=400",
        caption: "Beautiful bridal portrait with natural lighting",
        category: "portraits",
        id: 3
      },
      {
        src: "https://images.unsplash.com/photo-1495434224324-36812b391125?w=800",
        thumbnail: "https://images.unsplash.com/photo-1495434224324-36812b391125?w=400",
        caption: "Wedding ceremony in stunning garden setting",
        category: "ceremony",
        id: 4
      },
      {
        src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800",
        thumbnail: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400",
        caption: "Intimate couple moment during golden hour",
        category: "portraits",
        id: 5
      },
      {
        src: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800",
        thumbnail: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400",
        caption: "Elegant wedding rings and floral details",
        category: "details",
        id: 6
      },
      // Before/After makeup transformation examples
      {
        isBeforeAfter: true,
        beforeImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
        afterImage: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400",
        caption: "Bridal makeup transformation - Before & After",
        category: "details",
        id: 7
      },
      {
        src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
        thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400",
        caption: "Reception celebration and dancing",
        category: "reception",
        id: 8
      },
      {
        src: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800",
        thumbnail: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=400",
        caption: "Beautiful floral arrangements and table settings",
        category: "details",
        id: 9
      },
      {
        src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800",
        thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400",
        caption: "Romantic couple portrait in natural setting",
        category: "portraits",
        id: 10
      },
      {
        src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
        thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400",
        caption: "Outdoor ceremony with mountain backdrop",
        category: "ceremony",
        id: 11
      },
      {
        src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800",
        thumbnail: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400",
        caption: "Joyful reception moments with family",
        category: "reception",
        id: 12
      }
    ]
  };

  const handleImageClick = (image) => {
    console.log('Image clicked:', image);
    // You can track analytics here
    setGalleryStats(prev => ({
      ...prev,
      totalViews: prev.totalViews + 1
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to={`/vendors/${vendorId}`} 
            className="flex items-center text-gray-600 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to vendor profile
          </Link>
        </div>
      </div>

      {/* Gallery Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Camera className="h-8 w-8 text-rose-500 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">
                {mockGalleryData.vendorName} Gallery
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
              {mockGalleryData.description}
            </p>
            
            {/* Gallery Stats */}
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Camera className="h-4 w-4 mr-1" />
                {galleryStats.totalViews.toLocaleString()} views
              </div>
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                {galleryStats.totalLikes} likes
              </div>
              <div className="flex items-center">
                <Download className="h-4 w-4 mr-1" />
                {galleryStats.totalDownloads} downloads
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Photo Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EnhancedPhotoGallery
          images={mockGalleryData.images}
          vendorName={mockGalleryData.vendorName}
          showCategories={true}
          allowDownload={true}
          allowFavorite={true}
          onImageClick={handleImageClick}
        />
      </div>

      {/* Call to Action */}
      <div className="bg-rose-50 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Love What You See?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Let's create beautiful memories for your special day. Get in touch to discuss your wedding photography needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={`/vendors/${vendorId}`}
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-colors"
            >
              Request Quote
            </Link>
            <Link
              to={`/vendors/${vendorId}`}
              className="inline-flex items-center px-6 py-3 bg-white text-rose-600 font-medium rounded-lg border border-rose-600 hover:bg-rose-50 transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GalleryPage;