import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

function PaymentSuccess() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState('checking');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      checkPaymentStatus();
    }
  }, [sessionId]);

  const checkPaymentStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Poll payment status
      let attempts = 0;
      const maxAttempts = 5;
      
      const pollStatus = async () => {
        if (attempts >= maxAttempts) {
          setPaymentStatus('timeout');
          return;
        }

        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/payments/checkout/status/${sessionId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPaymentDetails(data);
          
          if (data.payment_status === 'paid') {
            setPaymentStatus('success');
          } else if (data.status === 'expired') {
            setPaymentStatus('expired');
          } else {
            // Continue polling
            attempts++;
            setTimeout(pollStatus, 2000);
          }
        } else {
          setPaymentStatus('error');
        }
      };

      pollStatus();
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('error');
    }
  };

  const renderContent = () => {
    switch (paymentStatus) {
      case 'checking':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for subscribing to our wedding marketplace!
            </p>
            
            {paymentDetails && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Details</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p>Amount: ${(paymentDetails.amount_total / 100).toFixed(2)} {paymentDetails.currency.toUpperCase()}</p>
                  <p>Status: {paymentDetails.payment_status}</p>
                  {paymentDetails.metadata?.plan_name && (
                    <p>Plan: {paymentDetails.metadata.plan_name}</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-gray-600">
                Your subscription is now active! You can start receiving quote requests and showcase your business on our platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/vendor-dashboard'}
                  className="bg-pink-600 text-white px-6 py-3 rounded-md hover:bg-pink-700 font-medium"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => window.location.href = '/profile'}
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 font-medium"
                >
                  Update Profile
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Session Expired</h2>
            <p className="text-gray-600 mb-6">
              Your payment session has expired. Please try again.
            </p>
            <button
              onClick={() => window.location.href = '/vendor-subscription'}
              className="bg-pink-600 text-white px-6 py-3 rounded-md hover:bg-pink-700 font-medium"
            >
              Try Again
            </button>
          </div>
        );

      case 'error':
      case 'timeout':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-6">
              {paymentStatus === 'timeout' 
                ? 'Payment status check timed out. Please check your email for confirmation.'
                : 'There was an error processing your payment. Please try again.'
              }
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.href = '/vendor-subscription'}
                className="bg-pink-600 text-white px-6 py-3 rounded-md hover:bg-pink-700 font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/vendor-dashboard'}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 font-medium"
              >
                Dashboard
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;