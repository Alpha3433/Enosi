import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Heart, ArrowLeft, Users, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const schema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirm_password: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  user_type: yup.string().oneOf(['couple', 'vendor']).required('User type is required'),
  phone: yup.string(),
  business_name: yup.string().when('user_type', {
    is: 'vendor',
    then: (schema) => schema.required('Business name is required for vendor accounts'),
    otherwise: (schema) => schema
  }),
});

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  
  const { login, getDefaultRedirectPath } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      user_type: 'couple'
    }
  });

  const userType = watch('user_type');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      const userData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        user_type: data.user_type,
        phone: data.phone,
        business_name: data.business_name
      };
      
      console.log('Attempting registration with:', userData);
      
      const response = await authAPI.register(userData);
      console.log('Registration response:', response);
      
      // Check if this is a vendor account that needs approval
      if (data.user_type === 'vendor' && !response.data.is_approved) {
        // Show approval pending modal instead of logging in
        setShowApprovalModal(true);
        return;
      }
      
      // Auto login after registration for approved accounts
      const loginResponse = await authAPI.login(data.email, data.password);
      console.log('Login response:', loginResponse);
      
      login(loginResponse.data.user, loginResponse.data.access_token);
      
      // For new vendors, always redirect to profile setup
      // For other user types, use default redirect logic
      if (data.user_type === 'vendor') {
        navigate('/vendor-profile-setup');
      } else {
        const redirectPath = getDefaultRedirectPath();
        navigate(redirectPath);
      }
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1578730169862-749bbdc763a8"
          alt="Wedding venue"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl font-bold mb-4">Join Enosi Today</h1>
              <p className="text-xl">Connect with Australia's best wedding professionals</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-rose-600 mb-6">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to home
            </Link>
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-8 w-8 text-rose-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">Enosi</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
            <p className="text-gray-600">Join thousands of couples and vendors</p>
          </div>

          {/* User type selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I am signing up as:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                userType === 'couple' ? 'border-rose-500 bg-rose-50' : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  {...register('user_type')}
                  type="radio"
                  value="couple"
                  className="sr-only"
                />
                <Users className="h-5 w-5 text-rose-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Couple</div>
                  <div className="text-sm text-gray-600">Planning a wedding</div>
                </div>
              </label>
              
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                userType === 'vendor' ? 'border-rose-500 bg-rose-50' : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  {...register('user_type')}
                  type="radio"
                  value="vendor"
                  className="sr-only"
                />
                <Building className="h-5 w-5 text-rose-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Vendor</div>
                  <div className="text-sm text-gray-600">Wedding professional</div>
                </div>
              </label>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Signup form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First name
                </label>
                <input
                  {...register('first_name')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                  placeholder="First name"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last name
                </label>
                <input
                  {...register('last_name')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                  placeholder="Last name"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone number (optional)
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Business name field for vendors */}
            {userType === 'vendor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business name *
                </label>
                <input
                  {...register('business_name')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                  placeholder="Enter your business name"
                />
                {errors.business_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.business_name.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors pr-10"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  {...register('confirm_password')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="mt-2 text-sm text-red-600">{errors.confirm_password.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                required
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-rose-600 hover:text-rose-700">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-rose-600 hover:text-rose-700">Privacy Policy</a>
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-rose-600 text-white py-3 px-4 rounded-lg hover:bg-rose-700 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Already have an account?</span>
              </div>
            </div>
          </div>

          {/* Sign in link */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-rose-600 hover:text-rose-700 font-medium"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>

      {/* Vendor Approval Pending Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
          >
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <svg
                  className="h-8 w-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Account Under Review
              </h3>
              <p className="text-gray-600 mb-4">
                Thank you for registering your vendor account! Your application is currently being manually reviewed by our team.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>What happens next?</strong>
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1 text-left">
                  <li>• Our team will review your business details</li>
                  <li>• You'll receive an email notification within 24-48 hours</li>
                  <li>• Once approved, you can access your vendor dashboard</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">
                If you have any questions, contact us at{' '}
                <a href="mailto:enosiaustralia@gmail.com" className="text-rose-600 hover:text-rose-700">
                  enosiaustralia@gmail.com
                </a>
              </p>
            </div>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="w-full px-6 py-3 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-colors"
              >
                Understand
              </button>
              <Link
                to="/"
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SignUpPage;