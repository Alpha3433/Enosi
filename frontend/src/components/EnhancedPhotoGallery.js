import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lightbox from 'react-image-lightbox';
import Masonry from 'react-masonry-css';
import ReactCompareImage from 'react-compare-image';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Download,
  Heart,
  Share2,
  Filter,
  Grid,
  Image as ImageIcon
} from 'lucide-react';
import 'react-image-lightbox/style.css';

const EnhancedPhotoGallery = ({ 
  images = [], 
  vendorName = "Vendor", 
  showCategories = true,
  allowDownload = false,
  allowFavorite = true,
  onImageClick 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
  const [viewMode, setViewMode] = useState('masonry'); // masonry, grid
  const [showFilters, setShowFilters] = useState(false);

  // Sample categories - in real app, this would come from image metadata
  const categories = [
    { id: 'all', name: 'All Photos', count: images.length },
    { id: 'ceremony', name: 'Ceremony', count: Math.floor(images.length * 0.3) },
    { id: 'reception', name: 'Reception', count: Math.floor(images.length * 0.4) },
    { id: 'details', name: 'Details', count: Math.floor(images.length * 0.2) },
    { id: 'portraits', name: 'Portraits', count: Math.floor(images.length * 0.1) }
  ];

  // Enhanced image data with metadata
  const enhancedImages = images.map((img, index) => ({
    src: typeof img === 'string' ? img : img.src,
    thumbnail: typeof img === 'string' ? img : img.thumbnail || img.src,
    caption: typeof img === 'string' ? `${vendorName} - Photo ${index + 1}` : img.caption,
    category: typeof img === 'string' ? categories[Math.floor(Math.random() * (categories.length - 1)) + 1].id : img.category || 'ceremony',
    isBeforeAfter: typeof img === 'object' && img.beforeAfter,
    beforeImage: typeof img === 'object' ? img.beforeImage : null,
    afterImage: typeof img === 'object' ? img.afterImage : null,
    id: index
  }));

  // Filter images based on selected category
  const filteredImages = selectedCategory === 'all' 
    ? enhancedImages 
    : enhancedImages.filter(img => img.category === selectedCategory);

  // Masonry breakpoints
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          setIsOpen(false);
          break;
        case '+':
        case '=':
          setZoomLevel(prev => Math.min(prev * 1.2, 3));
          break;
        case '-':
          setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
          break;
        case 'r':
          setRotation(prev => (prev + 90) % 360);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, photoIndex]);

  const handlePrevious = useCallback(() => {
    setPhotoIndex((prevIndex) => 
      prevIndex === 0 ? filteredImages.length - 1 : prevIndex - 1
    );
    resetImageState();
  }, [filteredImages.length]);

  const handleNext = useCallback(() => {
    setPhotoIndex((prevIndex) => 
      prevIndex === filteredImages.length - 1 ? 0 : prevIndex + 1
    );
    resetImageState();
  }, [filteredImages.length]);

  const resetImageState = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const openLightbox = (index) => {
    setPhotoIndex(index);
    setIsOpen(true);
    resetImageState();
    onImageClick?.(filteredImages[index]);
  };

  const toggleFavorite = (imageId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(imageId)) {
        newFavorites.delete(imageId);
      } else {
        newFavorites.add(imageId);
      }
      return newFavorites;
    });
  };

  const downloadImage = async (imageSrc, fileName) => {
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'wedding-photo.jpg';
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const shareImage = async (imageSrc, caption) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: caption,
          text: `Check out this photo from ${vendorName}`,
          url: imageSrc
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(imageSrc);
      alert('Image URL copied to clipboard!');
    }
  };

  const currentImage = filteredImages[photoIndex];

  return (
    <div className="w-full">
      {/* Header with filters and view controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Photo Gallery
          </h2>
          <span className="text-gray-500">
            ({filteredImages.length} photos)
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View mode toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('masonry')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'masonry' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Filter toggle */}
          {showCategories && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          )}
        </div>
      </div>

      {/* Category filters */}
      {showCategories && showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Photo Grid */}
      {viewMode === 'masonry' ? (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex w-auto -ml-4"
          columnClassName="pl-4 bg-clip-padding"
        >
          {filteredImages.map((image, index) => (
            <PhotoCard
              key={image.id}
              image={image}
              index={index}
              onImageClick={() => openLightbox(index)}
              onToggleFavorite={allowFavorite ? () => toggleFavorite(image.id) : null}
              isFavorited={favorites.has(image.id)}
            />
          ))}
        </Masonry>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((image, index) => (
            <PhotoCard
              key={image.id}
              image={image}
              index={index}
              onImageClick={() => openLightbox(index)}
              onToggleFavorite={allowFavorite ? () => toggleFavorite(image.id) : null}
              isFavorited={favorites.has(image.id)}
              isGrid={true}
            />
          ))}
        </div>
      )}

      {/* Enhanced Lightbox */}
      {isOpen && currentImage && (
        <Lightbox
          mainSrc={currentImage.src}
          nextSrc={filteredImages[(photoIndex + 1) % filteredImages.length]?.src}
          prevSrc={filteredImages[(photoIndex + filteredImages.length - 1) % filteredImages.length]?.src}
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={handlePrevious}
          onMoveNextRequest={handleNext}
          imageCaption={currentImage.caption}
          imageTitle={`${photoIndex + 1} of ${filteredImages.length}`}
          
          // Custom toolbar
          toolbarButtons={[
            // Zoom controls
            <button
              key="zoom-out"
              onClick={() => setZoomLevel(prev => Math.max(prev / 1.2, 0.5))}
              className="ril__toolbarItemChild ril__builtinButton"
              title="Zoom Out (-)"
            >
              <ZoomOut className="h-5 w-5" />
            </button>,
            
            <button
              key="zoom-in"
              onClick={() => setZoomLevel(prev => Math.min(prev * 1.2, 3))}
              className="ril__toolbarItemChild ril__builtinButton"
              title="Zoom In (+)"
            >
              <ZoomIn className="h-5 w-5" />
            </button>,

            // Rotate
            <button
              key="rotate"
              onClick={() => setRotation(prev => (prev + 90) % 360)}
              className="ril__toolbarItemChild ril__builtinButton"
              title="Rotate (R)"
            >
              <RotateCw className="h-5 w-5" />
            </button>,

            // Favorite
            ...(allowFavorite ? [
              <button
                key="favorite"
                onClick={() => toggleFavorite(currentImage.id)}
                className="ril__toolbarItemChild ril__builtinButton"
                title="Add to Favorites"
              >
                <Heart 
                  className={`h-5 w-5 ${
                    favorites.has(currentImage.id) 
                      ? 'text-red-500 fill-current' 
                      : 'text-white'
                  }`} 
                />
              </button>
            ] : []),

            // Share
            <button
              key="share"
              onClick={() => shareImage(currentImage.src, currentImage.caption)}
              className="ril__toolbarItemChild ril__builtinButton"
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>,

            // Download
            ...(allowDownload ? [
              <button
                key="download"
                onClick={() => downloadImage(currentImage.src, `${vendorName}-photo-${photoIndex + 1}.jpg`)}
                className="ril__toolbarItemChild ril__builtinButton"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </button>
            ] : [])
          ]}

          // Apply zoom and rotation
          imageTransform={`scale(${zoomLevel}) rotate(${rotation}deg)`}
          
          // Enable wheel zoom
          enableZoom={true}
        />
      )}
    </div>
  );
};

// Individual photo card component
const PhotoCard = ({ image, index, onImageClick, onToggleFavorite, isFavorited, isGrid = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 mb-4 ${
        isGrid ? 'aspect-square' : ''
      }`}
      onClick={onImageClick}
    >
      {/* Before/After slider for makeup/venue transformations */}
      {image.isBeforeAfter && image.beforeImage && image.afterImage ? (
        <div 
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          <ReactCompareImage
            leftImage={image.beforeImage}
            rightImage={image.afterImage}
            leftImageLabel="Before"
            rightImageLabel="After"
            leftImageCss={{ borderRadius: '8px' }}
            rightImageCss={{ borderRadius: '8px' }}
            sliderLineColor="#ec4899"
            sliderPositionPercentage={0.5}
            hover={true}
          />
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            Before/After
          </div>
        </div>
      ) : (
        <>
          {/* Loading placeholder */}
          {!isLoaded && !hasError && (
            <div className="w-full h-64 bg-gray-200 animate-pulse flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}

          {/* Error state */}
          {hasError && (
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Failed to load image</p>
              </div>
            </div>
          )}

          {/* Main image */}
          <img
            src={image.thumbnail || image.src}
            alt={image.caption}
            className={`w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            loading="lazy"
          />
        </>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />

      {/* Hover controls */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="bg-white bg-opacity-90 rounded-full p-3">
          <ZoomIn className="h-6 w-6 text-gray-700" />
        </div>
      </div>

      {/* Top-right controls */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200"
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'
              }`}
            />
          </button>
        )}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-white text-sm font-medium">{image.caption}</p>
        {image.category && (
          <p className="text-white text-xs opacity-80 capitalize">{image.category}</p>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedPhotoGallery;