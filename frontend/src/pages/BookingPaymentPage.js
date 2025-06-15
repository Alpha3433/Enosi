import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  DollarSign, 
  Shield, 
  CreditCard, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Clock,
  MapPin,
  User,
  Star,
  Lock
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function BookingPaymentPage() {
  return (
    <Elements stripe={stripePromise}>
      <BookingPaymentContent />
    </Elements>
  );
}

function BookingPaymentContent() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    amount: '',
    serviceDate: '',
    serviceDescription: '',
    guestCount: '',
    specialRequests: ''
  });

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (vendorId) {
      fetchVendorDetails();
    }
  }, [vendorId]);

  const fetchVendorDetails = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/vendors/${vendorId}`);
      if (response.ok) {
        const data = await response.json();
        setVendor(data);
      } else {
        setError('Vendor not found');
      }
    } catch (error) {
      setError('Failed to load vendor details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setBookingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateFees = (amount) => {
    const depositAmount = parseFloat(amount) || 0;
    const platformFee = depositAmount * 0.10;
    const vendorAmount = depositAmount * 0.90;
    return { depositAmount, platformFee, vendorAmount };
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;

    setPaymentProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      // Create booking deposit
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/bookings/deposit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_id: user.id,
          vendor_id: vendorId,
          amount: parseFloat(bookingDetails.amount),
          service_date: bookingDetails.serviceDate,
          service_description: bookingDetails.serviceDescription
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
          setSuccess(true);
          // Redirect to booking confirmation after 3 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Booking creation failed');
      }
    } catch (error) {
      setError('Network error during payment');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full mx-4"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your booking deposit has been processed. You'll receive a confirmation email shortly.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const fees = calculateFees(bookingDetails.amount);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendor
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Book Your Wedding Service</h1>
          <p className="text-gray-600 mt-2">Secure your booking with a deposit payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vendor Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Vendor Details</h2>
            
            {vendor && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{vendor.business_name}</h3>
                    <p className="text-gray-600 capitalize">{vendor.category}</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {vendor.average_rating?.toFixed(1) || '—'} ({vendor.review_count || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{vendor.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Quick Response</span>
                  </div>
                </div>

                {vendor.base_price && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Starting from</div>
                    <div className="text-2xl font-bold text-gray-900">${vendor.base_price}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Details</h2>

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

            <form onSubmit={handlePayment} className="space-y-6">
              {/* Service Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Date
                </label>
                <input
                  type="date"
                  value={bookingDetails.serviceDate}
                  onChange={(e) => handleInputChange('serviceDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Service Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Description
                </label>
                <input
                  type="text"
                  value={bookingDetails.serviceDescription}
                  onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
                  placeholder="e.g., Wedding Photography Package"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Deposit Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Amount (AUD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={bookingDetails.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="500.00"
                    min="1"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Typically 10-50% of total service cost
                </p>
              </div>

              {/* Fee Breakdown */}
              {bookingDetails.amount && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Payment Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deposit Amount:</span>
                      <span className="font-medium">${fees.depositAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform Fee (10%):</span>
                      <span className="font-medium">${fees.platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="text-gray-600">Vendor Receives:</span>
                      <span className="font-medium text-green-600">${fees.vendorAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="border border-gray-300 rounded-lg p-4">
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

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Secure Payment</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your payment is secured by Stripe. Funds are held in escrow until service completion.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={paymentProcessing || !stripe || !bookingDetails.amount}
                className="w-full bg-pink-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {paymentProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Pay Deposit ${fees.depositAmount.toFixed(2)}
                  </>
                )}
              </motion.button>
            </form>

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <Shield className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                <span className="text-xs text-gray-500">SSL Encrypted</span>
              </div>
              <div className="text-center">
                <CreditCard className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                <span className="text-xs text-gray-500">Stripe Secured</span>
              </div>
              <div className="text-center">
                <CheckCircle className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                <span className="text-xs text-gray-500">Money Back</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPaymentPage;