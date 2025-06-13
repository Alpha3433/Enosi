import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

function VendorSubscription() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [vendorProfile, setVendorProfile] = useState(null);

  useEffect(() => {
    if (user?.user_type !== 'vendor') {
      window.location.href = '/';
      return;
    }
    
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch subscription plans
      const plansResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/plans`);
      const plansData = await plansResponse.json();
      setPlans(plansData.plans);

      // Fetch vendor profile
      const profileResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/vendors/profile`, { headers });
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setVendorProfile(profileData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    setProcessingPayment(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const checkoutRequest = {
        amount: plan.price,
        currency: plan.currency.toLowerCase(),
        metadata: {
          plan_id: plan.id,
          plan_name: plan.name,
          vendor_id: user.id
        }
      };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/checkout/session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkoutRequest)
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start payment process. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Subscription Plan
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Select the perfect plan to grow your wedding business on our marketplace
          </p>
        </div>

        {/* Current Subscription Status */}
        {vendorProfile && (
          <div className="mt-8 max-w-3xl mx-auto">
            <div className={`rounded-lg p-4 ${
              vendorProfile.subscription_active 
                ? 'bg-green-100 border border-green-200' 
                : 'bg-yellow-100 border border-yellow-200'
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {vendorProfile.subscription_active ? (
                    <div className="text-green-600 text-xl">✅</div>
                  ) : (
                    <div className="text-yellow-600 text-xl">⚠️</div>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    vendorProfile.subscription_active ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {vendorProfile.subscription_active ? 'Active Subscription' : 'No Active Subscription'}
                  </h3>
                  <p className={`text-sm ${
                    vendorProfile.subscription_active ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {vendorProfile.subscription_active 
                      ? `Your subscription is active until ${new Date(vendorProfile.subscription_expires).toLocaleDateString()}`
                      : 'Subscribe to start receiving quote requests and showcase your business'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
                  plan.id === 'professional' ? 'ring-2 ring-pink-500' : ''
                }`}
              >
                {plan.id === 'professional' && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-pink-500 text-white px-4 py-1 text-sm font-medium rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="px-6 py-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                    <div className="mt-4">
                      <span className="text-4xl font-extrabold text-gray-900">
                        ${plan.price}
                      </span>
                      <span className="text-base font-medium text-gray-500">/{plan.currency}/month</span>
                    </div>
                  </div>
                  
                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-8">
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={processingPayment}
                      className={`w-full py-3 px-4 rounded-md font-medium text-center transition-colors ${
                        plan.id === 'professional'
                          ? 'bg-pink-600 text-white hover:bg-pink-700 disabled:bg-pink-400'
                          : 'bg-gray-800 text-white hover:bg-gray-900 disabled:bg-gray-400'
                      } ${processingPayment ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {processingPayment ? 'Processing...' : `Subscribe to ${plan.name}`}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Frequently Asked Questions
            </h3>
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I change my plan later?
                </h4>
                <p className="text-gray-600">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  What happens if I exceed my quote limit?
                </h4>
                <p className="text-gray-600">
                  If you reach your monthly quote limit, you can either upgrade your plan or wait until the next billing cycle. We'll notify you when you're approaching your limit.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Is there a setup fee?
                </h4>
                <p className="text-gray-600">
                  No setup fees! You only pay the monthly subscription fee. We also offer a 14-day free trial for new vendors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorSubscription;