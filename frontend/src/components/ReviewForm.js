import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Camera, Upload, X } from 'lucide-react';

function ReviewForm({ vendor, onSubmit, onCancel }) {
  const [overallRating, setOverallRating] = useState(0);
  const [detailedRatings, setDetailedRatings] = useState({
    quality: 0,
    communication: 0,
    value: 0,
    professionalism: 0
  });
  const [reviewText, setReviewText] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (type, rating) => {
    if (type === 'overall') {
      setOverallRating(rating);
    } else {
      setDetailedRatings(prev => ({
        ...prev,
        [type]: rating
      }));
    }
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target.result.split(',')[1];
          setPhotos(prev => [...prev, {
            id: Date.now() + Math.random(),
            base64,
            name: file.name,
            preview: e.target.result
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removePhoto = (photoId) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const reviewData = {
        vendor_id: vendor.id,
        wedding_date: new Date(weddingDate).toISOString(),
        overall_rating: overallRating,
        detailed_ratings: detailedRatings,
        review_text: reviewText,
        photos: photos.map(photo => photo.base64)
      };

      await onSubmit(reviewData);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, label }) => (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-700 w-24">{label}:</span>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-500">({rating}/5)</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
              <p className="text-gray-600">{vendor?.business_name}</p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Wedding Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wedding Date *
              </label>
              <input
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Overall Rating *
              </label>
              <StarRating
                rating={overallRating}
                onRatingChange={(rating) => handleRatingChange('overall', rating)}
                label="Overall"
              />
            </div>

            {/* Detailed Ratings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Detailed Ratings
              </label>
              <div className="space-y-3">
                <StarRating
                  rating={detailedRatings.quality}
                  onRatingChange={(rating) => handleRatingChange('quality', rating)}
                  label="Quality"
                />
                <StarRating
                  rating={detailedRatings.communication}
                  onRatingChange={(rating) => handleRatingChange('communication', rating)}
                  label="Communication"
                />
                <StarRating
                  rating={detailedRatings.value}
                  onRatingChange={(rating) => handleRatingChange('value', rating)}
                  label="Value"
                />
                <StarRating
                  rating={detailedRatings.professionalism}
                  onRatingChange={(rating) => handleRatingChange('professionalism', rating)}
                  label="Professionalism"
                />
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
                rows={5}
                placeholder="Share your experience with this vendor..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Photos
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2 text-gray-600 hover:text-gray-800"
                >
                  <Camera className="h-8 w-8" />
                  <span className="text-sm">Click to upload photos</span>
                </label>
              </div>

              {/* Photo Previews */}
              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative">
                      <img
                        src={photo.preview}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !overallRating || !reviewText || !weddingDate}
                className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default ReviewForm;