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
    <div className="min-h-screen bg-linen font-sans flex" style={{ zoom: 0.9 }}>
      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Wedding scene with guests"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-8">
          <h1 className="text-3xl xl:text-4xl font-bold mb-3 font-sans">Welcome Back</h1>
          <p className="text-base xl:text-lg font-sans opacity-90">Continue planning your perfect wedding</p>
        </div>
      </div>

      {/* Right Side - Login Form Section */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center text-napa hover:text-cement mb-4 transition-colors font-sans">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to home
            </Link>
            <h2 className="text-xl font-bold text-millbrook mb-2 font-sans">Sign in to your account</h2>
            <p className="text-sm text-kabul font-sans">Enter your credentials to continue</p>
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

          {/* Login form */}
          <div className="bg-white border border-coral-reef rounded-2xl p-6 shadow-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-millbrook mb-1 font-sans">
                  Email address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-3 py-2.5 bg-linen border border-coral-reef rounded-lg focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md font-sans text-sm text-kabul"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 font-sans">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-millbrook mb-1 font-sans">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2.5 bg-linen border border-coral-reef rounded-lg focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md pr-10 font-sans text-sm text-kabul"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-napa hover:text-kabul transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 font-sans">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="h-3 w-3 text-cement focus:ring-cement border-coral-reef rounded" />
                  <span className="ml-2 text-xs text-kabul font-sans">Remember me</span>
                </label>
                <a href="#" className="text-xs text-cement hover:text-millbrook font-sans">
                  Forgot password?
                </a>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-cement text-white py-2.5 px-4 rounded-lg hover:bg-millbrook hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-sans text-sm"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-coral-reef"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-napa font-sans">Don't have an account?</span>
                </div>
              </div>
            </div>

            {/* Sign up link */}
            <div className="text-center">
              <Link
                to="/signup"
                className="text-cement hover:text-millbrook font-medium font-sans transition-colors text-sm"
              >
                Create your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;