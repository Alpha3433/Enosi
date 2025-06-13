import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, Calendar, Verified, ChevronDown, ChevronUp } from 'lucide-react';

function ReviewDisplay({ reviews, vendor, onWriteReview }) {
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [sortBy, setSortBy] = useState('newest');

  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'highest':
        return b.overall_rating - a.overall_rating;
      case 'lowest':
        return a.overall_rating - b.overall_rating;
      default:
        return 0;
    }
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.overall_rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(review => Math.floor(review.overall_rating) === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(review => Math.floor(review.overall_rating) === rating).length / reviews.length) * 100 
      : 0
  }));

  const StarRating = ({ rating, showNumber = true, size = "small" }) => {
    const starSize = size === "large" ? "h-6 w-6" : "h-4 w-4";
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        {showNumber && (
          <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
        )}
      </div>
    );
  };

  const DetailedRatings = ({ ratings }) => (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Quality:</span>
        <StarRating rating={ratings.quality} showNumber={false} />
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Communication:</span>
        <StarRating rating={ratings.communication} showNumber={false} />
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Value:</span>
        <StarRating rating={ratings.value} showNumber={false} />
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Professionalism:</span>
        <StarRating rating={ratings.professionalism} showNumber={false} />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Reviews & Ratings ({reviews.length})
        </h3>
        <button
          onClick={onWriteReview}
          className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
        >
          Write a Review
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h4>
          <p className="text-gray-600 mb-4">Be the first to review this vendor!</p>
          <button
            onClick={onWriteReview}
            className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition-colors"
          >
            Write First Review
          </button>
        </div>
      ) : (
        <>
          {/* Rating Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <StarRating rating={averageRating} size="large" showNumber={false} />
              <p className="text-gray-600 mt-2">Based on {reviews.length} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="text-sm w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-gray-900">Customer Reviews</h4>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {sortedReviews.map((review) => {
              const isExpanded = expandedReviews.has(review.id);
              const reviewText = review.review_text;
              const shouldTruncate = reviewText.length > 300;

              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {review.couple_name ? review.couple_name.charAt(0) : 'A'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {review.couple_name || 'Anonymous'}
                          </span>
                          {review.verified && (
                            <Verified className="h-4 w-4 text-blue-500" title="Verified Review" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>Wedding: {new Date(review.wedding_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <StarRating rating={review.overall_rating} />
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">
                      {shouldTruncate && !isExpanded
                        ? `${reviewText.substring(0, 300)}...`
                        : reviewText
                      }
                    </p>
                    
                    {shouldTruncate && (
                      <button
                        onClick={() => toggleReviewExpansion(review.id)}
                        className="text-pink-600 hover:text-pink-700 text-sm mt-2 flex items-center"
                      >
                        {isExpanded ? (
                          <>Show less <ChevronUp className="h-4 w-4 ml-1" /></>
                        ) : (
                          <>Read more <ChevronDown className="h-4 w-4 ml-1" /></>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Detailed Ratings */}
                  <div className="mb-4">
                    <DetailedRatings ratings={review.detailed_ratings} />
                  </div>

                  {/* Review Photos */}
                  {review.photos && review.photos.length > 0 && (
                    <div className="mb-4">
                      <div className="grid grid-cols-3 gap-2">
                        {review.photos.slice(0, 6).map((photo, index) => (
                          <img
                            key={index}
                            src={photo.url}
                            alt={`Review photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vendor Response */}
                  {review.vendor_response && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">Response from {vendor?.business_name}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(review.vendor_response_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.vendor_response}</p>
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">Helpful ({review.helpful_votes || 0})</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default ReviewDisplay;