import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Check, 
  Star, 
  Crown, 
  Zap, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  ExternalLink,
  Shield,
  Users,
  BarChart3,
  MessageCircle,
  Camera,
  Search,
  Settings
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function VendorSubscriptionPage() {
  return (
    <Elements stripe={stripePromise}>
      <VendorSubscriptionContent />
    </Elements>
  );
}

function VendorSubscriptionContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionTiers, setSubscriptionTiers] = useState({});
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [error, setError] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (user) {
      fetchSubscriptionTiers();
      fetchCurrentSubscription();
      checkOnboardingStatus();
    }
  }, [user]);

  const fetchSubscriptionTiers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/subscription-tiers`);
      if (response.ok) {
        const data = await response.json();
        setSubscriptionTiers(data.tiers);
      }
    } catch (error) {
      console.error('Error fetching subscription tiers:', error);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/subscriptions/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching current subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkOnboardingStatus = async () => {
    // This would be implemented to check if vendor is onboarded to Stripe
    // For now, we'll assume they need onboarding if they don't have a subscription
  };

  const handleOnboarding = async () => {
    try {
      setPaymentProcessing(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/vendor/onboard`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vendor_id: user.id,
          business_name: user.business_name || `${user.first_name} ${user.last_name}`,
          email: user.email
        })
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.onboarding_url;
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Onboarding failed');
      }
    } catch (error) {
      setError('Network error during onboarding');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleSubscribe = async (tier) => {
    setSelectedTier(tier);
    setShowPaymentForm(true);
  };

  const handlePayment = async () => {
    if (!stripe || !elements || !selectedTier) return;

    setPaymentProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      // Create subscription
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/subscriptions/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vendor_id: user.id,
          tier: selectedTier
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Confirm payment
        const result = await stripe.confirmCardPayment(data.client_secret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: `${user.first_name} ${user.last_name}`,
              email: user.email
            }
          }
        });

        if (result.error) {
          setError(result.error.message);
        } else {
          // Payment successful
          setShowPaymentForm(false);
          setSelectedTier(null);
          fetchCurrentSubscription();
          alert('Subscription created successfully!');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Subscription creation failed');
      }
    } catch (error) {
      setError('Network error during payment');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const openCustomerPortal = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/customer-portal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        window.open(data.portal_url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'basic': return <Star className="h-8 w-8" />;
      case 'premium': return <Crown className="h-8 w-8" />;
      case 'pro': return <Zap className="h-8 w-8" />;
      default: return <Star className="h-8 w-8" />;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'basic': return 'from-blue-500 to-blue-600';
      case 'premium': return 'from-purple-500 to-purple-600';
      case 'pro': return 'from-gradient-to-r from-pink-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Vendor Subscription Plans
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan to grow your wedding business and reach more couples
            </p>
          </motion.div>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Plan</h3>
                <div className="flex items-center space-x-3">
                  <div className="text-pink-600">
                    {getTierIcon(currentSubscription.tier)}
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-gray-900 capitalize">
                      {currentSubscription.tier}
                    </span>
                    <span className="text-gray-600 ml-2">
                      ${subscriptionTiers[currentSubscription.tier]?.price}/month
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Status: <span className="capitalize text-green-600">{currentSubscription.status}</span>
                </p>
              </div>
              <button
                onClick={openCustomerPortal}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Subscription
                <ExternalLink className="h-4 w-4 ml-2" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Subscription Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(subscriptionTiers).map(([tier, config], index) => (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                tier === 'premium' ? 'border-purple-200 ring-2 ring-purple-100' : 'border-gray-200'
              }`}
            >
              {tier === 'premium' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Tier Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${getTierColor(tier)} text-white mb-4`}>
                    {getTierIcon(tier)}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 capitalize">{tier}</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-gray-900">${config.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {config.features?.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <div className="text-center">
                  {currentSubscription?.tier === tier ? (
                    <button
                      disabled
                      className="w-full bg-gray-100 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSubscribe(tier)}
                      className={`w-full bg-gradient-to-r ${getTierColor(tier)} text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center`}
                    >
                      {currentSubscription ? 'Upgrade Plan' : 'Get Started'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Payment Modal */}
        <AnimatePresence>
          {showPaymentForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowPaymentForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Subscribe to {selectedTier && subscriptionTiers[selectedTier]?.name}
                </h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="border border-gray-300 rounded-lg p-3">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPaymentForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={paymentProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={paymentProcessing || !stripe}
                    className="flex-1 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {paymentProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Subscribe'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Comparison */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Compare Features
          </h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
              <div className="font-semibold text-gray-900">Features</div>
              <div className="text-center font-semibold text-gray-900">Basic</div>
              <div className="text-center font-semibold text-gray-900">Premium</div>
              <div className="text-center font-semibold text-gray-900">Pro</div>
            </div>
            
            {[
              ['Portfolio Images', '5', 'Unlimited', 'Unlimited'],
              ['Search Visibility', 'Basic', 'Priority', 'Top Placement'],
              ['Analytics', '✗', '✓', 'Advanced'],
              ['Chat Support', '✗', '✓', 'Priority'],
              ['Featured Badge', '✗', '✓', 'Premium'],
              ['Lead Tools', '✗', '✗', '✓'],
              ['Custom Forms', '✗', '✗', '✓']
            ].map(([feature, basic, premium, pro], index) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-6 border-b border-gray-100 last:border-b-0">
                <div className="font-medium text-gray-900">{feature}</div>
                <div className="text-center text-gray-600">{basic}</div>
                <div className="text-center text-gray-600">{premium}</div>
                <div className="text-center text-gray-600">{pro}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <Shield className="h-12 w-12 text-pink-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600">SSL encrypted payments powered by Stripe</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-12 w-12 text-pink-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Trusted by 1000+ Vendors</h3>
              <p className="text-gray-600">Join Australia's leading wedding marketplace</p>
            </div>
            <div className="flex flex-col items-center">
              <MessageCircle className="h-12 w-12 text-pink-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Get help whenever you need it</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorSubscriptionPage;