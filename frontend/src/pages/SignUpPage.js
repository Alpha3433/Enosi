import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, ArrowLeft, Users, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { useOnboarding } from '../hooks/useOnboarding';

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
  const { markAsNewUser } = useOnboarding();
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
      
      // Mark as new user for onboarding trigger (only for couples)
      if (data.user_type === 'couple') {
        markAsNewUser(loginResponse.data.user.id);
      }
      
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
    <div className="min-h-screen bg-linen font-sans flex" style={{ zoom: 0.9 }}>
      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative">
        <img
          src="https://images.unsplash.com/photo-1583939411023-14783179e581?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Elegant outdoor wedding celebration"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-8">
          <h1 className="text-3xl xl:text-4xl font-bold mb-3 font-sans">Join Enosi Today</h1>
          <p className="text-base xl:text-lg font-sans opacity-90">Connect with Australia's best wedding professionals</p>
        </div>
      </div>

      {/* Right Side - Signup Form Section */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 max-h-screen overflow-y-auto bg-linen">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-4">
            <Link to="/" className="inline-flex items-center text-napa hover:text-cement mb-3 transition-colors font-sans">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to home
            </Link>
            <h2 className="text-xl font-bold text-millbrook mb-1 font-sans">Create your account</h2>
            <p className="text-sm text-kabul font-sans">Join thousands of couples and vendors</p>
          </div>

          {/* Signup form */}
          <div className="bg-white border border-coral-reef rounded-2xl p-5 shadow-lg">
            {/* User type selection */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-millbrook mb-2 font-sans">
                I am signing up as:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                  userType === 'couple' ? 'border-cement bg-linen shadow-md' : 'border-coral-reef hover:border-napa hover:shadow-sm'
                }`}>
                  <input
                    {...register('user_type')}
                    type="radio"
                    value="couple"
                    className="sr-only"
                  />
                  <Users className="h-4 w-4 text-cement mr-2" />
                  <div>
                    <div className="font-medium text-millbrook font-sans text-sm">Couple</div>
                    <div className="text-xs text-kabul font-sans">Planning a wedding</div>
                  </div>
                </label>
                
                <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                  userType === 'vendor' ? 'border-cement bg-linen shadow-md' : 'border-coral-reef hover:border-napa hover:shadow-sm'
                }`}>
                  <input
                    {...register('user_type')}
                    type="radio"
                    value="vendor"
                    className="sr-only"
                  />
                  <Building className="h-4 w-4 text-cement mr-2" />
                  <div>
                    <div className="font-medium text-millbrook font-sans text-sm">Vendor</div>
                    <div className="text-xs text-kabul font-sans">Wedding professional</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-4 font-sans text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-millbrook mb-1 font-sans">
                    First name
                  </label>
                  <input
                    {...register('first_name')}
                    type="text"
                    className="w-full px-3 py-2 bg-linen border border-coral-reef rounded-lg focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md font-sans text-sm text-kabul"
                    placeholder="First name"
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-xs text-red-600 font-sans">{errors.first_name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-millbrook mb-1 font-sans">
                    Last name
                  </label>
                  <input
                    {...register('last_name')}
                    type="text"
                    className="w-full px-3 py-2 bg-linen border border-coral-reef rounded-lg focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md font-sans text-sm text-kabul"
                    placeholder="Last name"
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-xs text-red-600 font-sans">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-millbrook mb-1 font-sans">
                  Email address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md font-sans text-sm"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 font-sans">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-sans">
                  Phone number (optional)
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md font-sans text-sm"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Business name field for vendors */}
              {userType === 'vendor' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 font-sans">
                    Business name *
                  </label>
                  <input
                    {...register('business_name')}
                    type="text"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md font-sans text-sm"
                    placeholder="Enter your business name"
                  />
                  {errors.business_name && (
                    <p className="mt-1 text-xs text-red-600 font-sans">{errors.business_name.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-sans">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md pr-10 font-sans text-sm"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 font-sans">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-sans">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    {...register('confirm_password')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md pr-10 font-sans text-sm"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="mt-1 text-xs text-red-600 font-sans">{errors.confirm_password.message}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  required
                  className="h-3 w-3 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-xs text-gray-600 font-sans">
                  I agree to the{' '}
                  <a href="#" className="text-blue-500 hover:text-blue-600">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-500 hover:text-blue-600">Privacy Policy</a>
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-lg hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-sans text-sm"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-500 font-sans">Already have an account?</span>
                </div>
              </div>
            </div>

            {/* Sign in link */}
            <div className="text-center">
              <Link
                to="/login"
                className="text-blue-500 hover:text-blue-600 font-medium font-sans transition-colors text-sm"
              >
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Approval Pending Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full text-center shadow-2xl"
          >
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-3">
                <svg
                  className="h-6 w-6 text-yellow-600"
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
              <h3 className="text-lg font-bold text-gray-900 mb-2 font-sans">
                Account Under Review
              </h3>
              <p className="text-gray-600 mb-3 font-sans text-sm">
                Thank you for registering your vendor account! Your application is currently being manually reviewed by our team.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700 font-sans">
                  <strong>What happens next?</strong>
                </p>
                <ul className="text-xs text-gray-600 mt-2 space-y-1 text-left font-sans">
                  <li>• Our team will review your business details</li>
                  <li>• You'll receive an email notification within 24-48 hours</li>
                  <li>• Once approved, you can access your vendor dashboard</li>
                </ul>
              </div>
              <p className="text-xs text-gray-500 font-sans">
                If you have any questions, contact us at{' '}
                <a href="mailto:enosiaustralia@gmail.com" className="text-blue-500 hover:text-blue-600">
                  enosiaustralia@gmail.com
                </a>
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors font-sans text-sm"
              >
                Understand
              </button>
              <Link
                to="/"
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors font-sans text-sm"
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