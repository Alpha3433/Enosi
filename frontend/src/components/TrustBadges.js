import React from 'react';
import { Shield, Zap, Star, Award, Heart, CheckCircle } from 'lucide-react';

const TrustBadges = ({ vendor, trustScore }) => {
  const badgeConfig = {
    verified_business: {
      icon: Shield,
      label: 'Verified Business',
      color: 'bg-blue-100 text-blue-800',
      description: 'Business identity and credentials verified'
    },
    quick_responder: {
      icon: Zap,
      label: 'Quick Responder',
      color: 'bg-green-100 text-green-800',
      description: 'Responds to inquiries within 4 hours'
    },
    highly_rated: {
      icon: Star,
      label: 'Highly Rated',
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Maintains 4.8+ star rating'
    },
    wedding_specialist: {
      icon: Award,
      label: 'Wedding Specialist',
      color: 'bg-purple-100 text-purple-800',
      description: '50+ weddings completed'
    },
    customer_favorite: {
      icon: Heart,
      label: 'Customer Favorite',
      color: 'bg-pink-100 text-pink-800',
      description: 'High rebooking and referral rate'
    },
    platform_recommended: {
      icon: CheckCircle,
      label: 'Platform Recommended',
      color: 'bg-indigo-100 text-indigo-800',
      description: 'Top 10% performing vendor'
    }
  };

  const TrustScoreDisplay = ({ score, label, color }) => (
    <div className="text-center">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${color} mb-2`}>
        <span className="text-lg font-bold text-white">{score}</span>
      </div>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );

  const Badge = ({ type, config }) => {
    const IconComponent = config.icon;
    
    return (
      <div className="group relative">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
          <IconComponent className="h-3 w-3 mr-1" />
          {config.label}
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {config.description}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  };

  if (!vendor && !trustScore) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust & Verification</h3>
      
      {/* Trust Score Summary */}
      {trustScore && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-900">Trust Score</h4>
              <p className="text-sm text-gray-600">Based on verification, performance, and reviews</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{trustScore.overall_score}/100</div>
              <div className={`text-sm font-medium ${
                trustScore.overall_score >= 80 ? 'text-green-600' :
                trustScore.overall_score >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {trustScore.overall_score >= 80 ? 'Excellent' :
                 trustScore.overall_score >= 60 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <TrustScoreDisplay
              score={Math.round(trustScore.verification_score)}
              label="Verification"
              color="bg-blue-500"
            />
            <TrustScoreDisplay
              score={Math.round(trustScore.performance_score)}
              label="Performance"
              color="bg-green-500"
            />
            <TrustScoreDisplay
              score={Math.round(trustScore.customer_satisfaction_score)}
              label="Satisfaction"
              color="bg-purple-500"
            />
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Achievements & Verification</h4>
        
        {/* Earned Badges */}
        {trustScore?.badges && trustScore.badges.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {trustScore.badges.map((badgeType) => (
              <Badge
                key={badgeType}
                type={badgeType}
                config={badgeConfig[badgeType]}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No badges earned yet</p>
        )}

        {/* Basic Verification Status */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Business Verified</span>
            <div className="flex items-center">
              {vendor?.verified ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">Verified</span>
                </>
              ) : (
                <>
                  <div className="h-4 w-4 bg-gray-300 rounded-full mr-1"></div>
                  <span className="text-gray-500">Pending</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">ABN Validated</span>
            <div className="flex items-center">
              {vendor?.abn_validated ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">Validated</span>
                </>
              ) : (
                <>
                  <div className="h-4 w-4 bg-gray-300 rounded-full mr-1"></div>
                  <span className="text-gray-500">Not Validated</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Insurance Coverage</span>
            <div className="flex items-center">
              {vendor?.insurance_verified ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">Verified</span>
                </>
              ) : (
                <>
                  <div className="h-4 w-4 bg-gray-300 rounded-full mr-1"></div>
                  <span className="text-gray-500">Not Verified</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      {vendor && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Social Proof</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{vendor.total_reviews || 0}</div>
              <div className="text-gray-600">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {vendor.average_rating ? vendor.average_rating.toFixed(1) : '—'}
              </div>
              <div className="text-gray-600">Avg Rating</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustBadges;