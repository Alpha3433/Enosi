import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, getDefaultRedirectPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('LoginPage: Attempting login...');
      const response = await authAPI.login(data.email, data.password);
      console.log('LoginPage: Login API response:', response.data);
      
      const userData = response.data.user;
      login(userData, response.data.access_token);
      console.log('LoginPage: Called login function');
      
      // Calculate redirect path based on user data from response
      let redirectPath = from;
      
      if (!redirectPath) {
        // For vendors, check if profile setup is complete
        if (userData.user_type === 'vendor') {
          if (!userData.profile_setup_complete) {
            redirectPath = '/vendor-profile-setup';
          } else {
            redirectPath = '/vendor-dashboard';
          }
        }
        // For couples
        else if (userData.user_type === 'couple') {
          redirectPath = '/dashboard';
        }
        // For admin
        else if (userData.user_type === 'admin') {
          redirectPath = '/admin';
        }
        // Default fallback
        else {
          redirectPath = '/';
        }
      }
      
      console.log('LoginPage: Redirecting to:', redirectPath);
      
      // Small delay to ensure state update completes
      setTimeout(() => {
        navigate(redirectPath);
      }, 100);
      
    } catch (err) {
      console.error('LoginPage: Login error:', err);
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section with matching design */}
      <section className="relative">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Wedding scene with guests"
          className="w-full h-[300px] object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-sans">Welcome Back</h1>
          <p className="text-lg font-sans">Continue planning your perfect wedding</p>
        </div>
      </section>

      {/* Login Form Section */}
      <section className="container mx-auto px-9 py-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-blue-500 mb-6 transition-colors font-sans">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to home
            </Link>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-sans">Sign in to your account</h2>
            <p className="text-gray-600 font-sans">Enter your credentials to continue</p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 font-sans"
            >
              {error}
            </motion.div>
          )}

          {/* Login form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 font-sans">
                  Email address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md font-sans"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 font-sans">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 font-sans">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md pr-12 font-sans"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 font-sans">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-600 font-sans">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-500 hover:text-blue-600 font-sans">
                  Forgot password?
                </a>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-sans">Don't have an account?</span>
                </div>
              </div>
            </div>

            {/* Sign up link */}
            <div className="text-center">
              <Link
                to="/signup"
                className="text-blue-500 hover:text-blue-600 font-medium font-sans transition-colors"
              >
                Create your account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;