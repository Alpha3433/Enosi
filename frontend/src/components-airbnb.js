import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Star, 
  MapPin, 
  Camera, 
  Music, 
  Utensils, 
  Flower,
  Building, 
  Heart,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Menu,
  X,
  User,
  ShoppingCart,
  ArrowRight,
  Award,
  Shield,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react';

import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Header Component - Exact match to screenshot
export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-semibold text-gray-900">
              Enosi
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => navigate('/search')} className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Find Vendors</button>
            <a href="#inspiration" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Inspiration</a>
            <a href="#about" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">About Us</a>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium">{user?.first_name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => navigate(user?.user_type === 'vendor' ? '/vendor-dashboard' : '/dashboard')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/signup')}
                  className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
                >
                  Sign up
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Log in
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </header>
  );
};

// Hero Section - Exact match to screenshot
export const AirbnbHeroSection = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCategory) params.set('category', searchCategory);
    if (searchLocation) params.set('location', searchLocation);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section 
      className="relative h-[600px] bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80)',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-25"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full px-6">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Find Wedding Vendors You'll Love
          </h1>
          <p className="text-xl text-white">
            Your perfect florist, DJ, and venue are just a click away
          </p>
        </div>

        {/* Search Form */}
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  placeholder="Search Destinations"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Vendor */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Vendor</label>
                <select 
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">All Vendors</option>
                  <option value="venue">Venues</option>
                  <option value="photographer">Photographers</option>
                  <option value="catering">Catering</option>
                  <option value="florist">Florists</option>
                  <option value="music">Music & Entertainment</option>
                  <option value="makeup">Hair & Makeup</option>
                </select>
              </div>

              {/* When */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">When</label>
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Guests */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Guests</label>
                <input
                  type="text"
                  placeholder="Number of guests"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
              >
                <Search className="w-5 h-5 mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Popular Wedding Destinations - Exact match to screenshot
export const PopularDestinations = () => {
  const destinations = [
    {
      name: 'Sydney',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'London',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Lisbon',
      image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Croatia',
      image: 'https://images.unsplash.com/photo-1555634712-2166c5041a85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Bratislava',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Copenhagen',
      image: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Popular Wedding destinations</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {destinations.map((destination, index) => (
            <div key={index} className="relative rounded-xl overflow-hidden cursor-pointer group">
              <div className="aspect-square">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white font-semibold text-lg drop-shadow-lg">
                  {destination.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Hotels loved by guests section - Exact match to screenshot
export const HotelsLovedByGuests = () => {
  const hotels = [
    {
      name: 'Soho Hotel London',
      location: 'London',
      rating: 9.6,
      price: 130,
      image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Hotel Nørrebro',
      location: 'Copenhagen',
      rating: 9.6,
      price: 180,
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Sunset Plaza Hotel',
      location: 'Barcelona',
      rating: 8.5,
      price: 210,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Three Quarters Hotel',
      location: 'Stockholm',
      rating: 9.5,
      price: 130,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Surf'n'Turf Suites',
      location: 'Lisbon',
      rating: 8.4,
      price: 70,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Hotels loved by guests</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {hotels.map((hotel, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="relative mb-3">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-64 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <div className="bg-white px-2 py-1 rounded-lg flex items-center space-x-1">
                    <span className="text-green-600 font-semibold text-sm">{hotel.rating}</span>
                  </div>
                </div>
                <button className="absolute top-3 right-3 p-2 rounded-full bg-white hover:bg-gray-100 transition-colors">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
                <p className="text-gray-600 text-sm">{hotel.location}</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">from ${hotel.price}/night</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Newsletter section - Bottom of page
export const NewsletterSection = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">🎭</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Psst!</h3>
              <p className="text-gray-600">Do you want to get secret offers and best prices for amazing stays?</p>
              <p className="text-gray-600">Sign up to join our Travel Club!</p>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Sign up for newsletter
          </button>
        </div>
      </div>
    </section>
  );
};

// Footer - Simple footer
export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold text-gray-900 mb-2">Enosi</div>
            <p className="text-gray-600 text-sm">Your favorite hotel booking experience</p>
            <p className="text-gray-600 text-sm">since 1992</p>
          </div>
          
          <div className="flex items-center space-x-8 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">Help</a>
            <a href="#" className="hover:text-gray-900">FAQ</a>
            <a href="#" className="hover:text-gray-900">Customer service</a>
            <a href="#" className="hover:text-gray-900">How to guide</a>
            <a href="#" className="hover:text-gray-900">Contact us</a>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          Enosi © 2025
        </div>
      </div>
    </footer>
  );
};

// Export legacy components for backward compatibility
export const VendorTypeCards = () => <div></div>;
export const FeaturedDeals = () => <div></div>;
export const ExploreNearby = () => <div></div>;
export const RealWeddingStories = () => <div></div>;
export const WeddingInspiration = () => <div></div>;
                      </button>
                      <button
                        onClick={() => navigate('/wishlist')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Wishlist
                      </button>
                      <button
                        onClick={() => navigate('/media')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Media Manager
                      </button>
                      <button
                        onClick={() => navigate('/chat')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Messages
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => navigate('/login')}
                  className="text-gray-700 hover:text-rose-600 transition-colors"
                >
                  Sign In
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/signup')}
                  className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
                >
                  Sign Up
                </motion.button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden py-4 border-t border-gray-100"
          >
            <div className="space-y-4">
              <button onClick={() => navigate('/search')} className="block text-gray-700 hover:text-rose-600">Find Vendors</button>
              <button onClick={() => navigate('/planning')} className="block text-gray-700 hover:text-rose-600">Planning Tools</button>
              <a href="#inspiration" className="block text-gray-700 hover:text-rose-600">Inspiration</a>
              <a href="#about" className="block text-gray-700 hover:text-rose-600">About</a>
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <button onClick={() => navigate('/login')} className="block w-full text-left text-gray-700">Sign In</button>
                <button onClick={() => navigate('/signup')} className="block w-full text-left bg-rose-600 text-white px-4 py-2 rounded-lg">Sign Up</button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

// Airbnb-style Hero Section (Bookings.com layout)
export const AirbnbHeroSection = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCategory) params.set('category', searchCategory);
    if (searchLocation) params.set('location', searchLocation);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="bg-white pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Content */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6 leading-tight">
              Find wedding vendors
              <br />
              <span className="text-pink-500">you'll love</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover and book amazing wedding vendors with the world's largest selection of venues, photographers, and services.
            </p>
          </motion.div>
        </div>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Where</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search destinations"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-gray-50"
                  />
                </div>
              </div>

              {/* Vendor Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">What</label>
                <select 
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-gray-50"
                >
                  <option value="">All vendors</option>
                  <option value="venue">Venues</option>
                  <option value="photographer">Photographers</option>
                  <option value="catering">Catering</option>
                  <option value="florist">Florists</option>
                  <option value="music">Music & Entertainment</option>
                  <option value="makeup">Hair & Makeup</option>
                </select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">When</label>
                <input
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-gray-50"
                />
              </div>

              {/* Guests */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Guests</label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-gray-50"
                >
                  <option value="">Add guests</option>
                  <option value="1-50">1-50 guests</option>
                  <option value="51-100">51-100 guests</option>
                  <option value="101-200">101-200 guests</option>
                  <option value="200+">200+ guests</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 px-8 rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all duration-200 font-semibold text-lg shadow-lg"
              >
                <Search className="inline-block w-5 h-5 mr-2" />
                Search
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Popular Destinations (like Bookings.com)
export const PopularDestinations = () => {
  const destinations = [
    {
      name: 'Sydney',
      properties: '1,247 venues',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    },
    {
      name: 'Melbourne',
      properties: '896 venues',
      image: 'https://images.unsplash.com/photo-1545044846-351ba102b6d5',
    },
    {
      name: 'Brisbane',
      properties: '654 venues',
      image: 'https://images.unsplash.com/photo-1549180030-48bf079fb38a',
    },
    {
      name: 'Perth',
      properties: '423 venues',
      image: 'https://images.unsplash.com/photo-1570214476695-26ac65d51d02',
    },
    {
      name: 'Adelaide',
      properties: '312 venues',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    },
    {
      name: 'Gold Coast',
      properties: '278 venues',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-semibold text-gray-900 mb-8">
            Popular wedding destinations
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {destinations.map((destination, index) => (
              <motion.div
                key={destination.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity"></div>
                </div>
                <div className="mt-3">
                  <h3 className="font-medium text-gray-900">{destination.name}</h3>
                  <p className="text-sm text-gray-600">{destination.properties}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Vendor Type Cards (like Bookings.com property types)
export const VendorTypeCards = () => {
  const navigate = useNavigate();
  
  const vendorTypes = [
    {
      name: 'Venues',
      description: 'Beautiful spaces for your celebration',
      image: 'https://images.unsplash.com/photo-1578730169862-749bbdc763a8',
      category: 'venue'
    },
    {
      name: 'Photographers',
      description: 'Capture your precious moments',
      image: 'https://images.unsplash.com/photo-1606490194859-07c18c9f0968',
      category: 'photographer'
    },
    {
      name: 'Catering',
      description: 'Delicious food for your guests',
      image: 'https://images.unsplash.com/photo-1552617911-83473ac6204b',
      category: 'catering'
    },
    {
      name: 'Flowers',
      description: 'Stunning floral arrangements',
      image: 'https://images.unsplash.com/photo-1593471682521-5354d03150da',
      category: 'florist'
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-semibold text-gray-900 mb-8">
            Browse by vendor type
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vendorTypes.map((type, index) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/search?category=${type.category}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={type.image}
                    alt={type.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{type.name}</h3>
                  <p className="text-gray-600">{type.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Featured Deals (like Bookings.com deals section)
export const FeaturedDeals = () => {
  const deals = [
    {
      vendor: 'Eternal Moments Photography',
      discount: '20% off',
      originalPrice: '$2,500',
      salePrice: '$2,000',
      image: 'https://images.unsplash.com/photo-1708134128471-5dffccea53f5',
      location: 'Sydney, NSW',
      rating: 4.9,
      reviews: 156,
      badge: 'Limited Time'
    },
    {
      vendor: 'Garden Grove Venues',
      discount: '15% off',
      originalPrice: '$5,000',
      salePrice: '$4,250',
      image: 'https://images.unsplash.com/photo-1578730169862-749bbdc763a8',
      location: 'Melbourne, VIC',
      rating: 4.8,
      reviews: 89,
      badge: 'Popular'
    },
    {
      vendor: 'Bloom & Blossom Florists',
      discount: '25% off',
      originalPrice: '$800',
      salePrice: '$600',
      image: 'https://images.unsplash.com/photo-1593471682521-5354d03150da',
      location: 'Brisbane, QLD',
      rating: 4.9,
      reviews: 124,
      badge: 'Best Deal'
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-semibold text-gray-900">
              Deals & offers
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="text-pink-600 font-medium hover:text-pink-700"
            >
              View all deals
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal, index) => (
              <motion.div
                key={deal.vendor}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={deal.image}
                    alt={deal.vendor}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {deal.badge}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {deal.discount}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                  >
                    <Heart className="h-5 w-5 text-white" />
                  </motion.button>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(deal.rating) ? 'fill-current' : 'text-gray-300'}`} />
                      ))}
                      <span className="ml-2 text-gray-600 text-sm">
                        {deal.rating} ({deal.reviews})
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {deal.vendor}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    {deal.location}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-500 line-through text-sm">{deal.originalPrice}</span>
                      <span className="text-xl font-semibold text-gray-900 ml-2">{deal.salePrice}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Explore Nearby (like Bookings.com nearby section)
export const ExploreNearby = () => {
  const nearbyPlaces = [
    { name: 'Bondi Beach', distance: '15 min drive', vendors: '45 venues', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4' },
    { name: 'Blue Mountains', distance: '1.5 hour drive', vendors: '67 venues', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05' },
    { name: 'Hunter Valley', distance: '2 hour drive', vendors: '89 venues', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4' },
    { name: 'Southern Highlands', distance: '1.5 hour drive', vendors: '54 venues', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e' },
    { name: 'Central Coast', distance: '1 hour drive', vendors: '32 venues', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4' },
    { name: 'Hawkesbury', distance: '1 hour drive', vendors: '28 venues', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e' },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-semibold text-gray-900 mb-8">
            Explore nearby wedding venues
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyPlaces.map((place, index) => (
              <motion.div
                key={place.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className="flex">
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{place.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{place.distance}</p>
                    <p className="text-sm text-gray-500">{place.vendors}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Real Wedding Stories (testimonials with Airbnb style)
export const RealWeddingStories = () => {
  const stories = [
    {
      couple: 'Sarah & Michael',
      location: 'Bondi Beach, Sydney',
      story: 'Finding our perfect venue through Enosi was incredible. The platform made it so easy to compare options and communicate with vendors. Our wedding day was absolutely magical!',
      image: 'https://images.unsplash.com/photo-1606490194859-07c18c9f0968',
      avatar: 'https://images.pexels.com/photos/4087576/pexels-photo-4087576.jpeg',
      rating: 5,
      date: 'March 2024'
    },
    {
      couple: 'Emma & James',
      location: 'Yarra Valley, Melbourne',
      story: 'The planning tools were game-changers for us. We stayed organized and on budget throughout the entire process. Highly recommend Enosi to any couple planning their wedding.',
      image: 'https://images.unsplash.com/photo-1578730169862-749bbdc763a8',
      avatar: 'https://images.unsplash.com/photo-1656354961825-581617b020bc',
      rating: 5,
      date: 'January 2024'
    },
    {
      couple: 'Rachel & David',
      location: 'Gold Coast Hinterland',
      story: 'Every vendor we found on Enosi exceeded our expectations. The verification process really shows - the quality was outstanding and our day was perfect.',
      image: 'https://images.unsplash.com/photo-1639259621742-90f4c0cf5a16',
      avatar: 'https://images.pexels.com/photos/7629856/pexels-photo-7629856.jpeg',
      rating: 5,
      date: 'February 2024'
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">
            Real wedding stories
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            See how couples created their perfect day with Enosi
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stories.map((story, index) => (
              <motion.div
                key={story.couple}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <img
                    src={story.image}
                    alt={`${story.couple} wedding`}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-semibold">{story.couple}</h3>
                    <p className="text-sm">{story.location}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{story.date}</span>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">{story.story}</p>
                  
                  <div className="flex items-center space-x-3">
                    <img
                      src={story.avatar}
                      alt={story.couple}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{story.couple}</div>
                      <div className="text-sm text-gray-600">Verified couple</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Wedding Inspiration (like travel articles)
export const WeddingInspiration = () => {
  const articles = [
    {
      title: 'Ultimate Guide to Beach Weddings in Australia',
      description: 'Everything you need to know about planning the perfect beachside celebration',
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed',
      category: 'Planning Guide',
      readTime: '8 min read'
    },
    {
      title: '2024 Wedding Color Trends',
      description: 'The hottest color palettes for modern Australian weddings',
      image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a',
      category: 'Trends',
      readTime: '5 min read'
    },
    {
      title: 'How to Choose Your Wedding Photographer',
      description: 'Expert tips for finding the perfect photographer for your style',
      image: 'https://images.unsplash.com/photo-1708134128471-5dffccea53f5',
      category: 'Vendor Guide',
      readTime: '6 min read'
    },
    {
      title: 'Budget-Friendly Wedding Ideas',
      description: 'Create your dream wedding without breaking the bank',
      image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8',
      category: 'Budget Tips',
      readTime: '7 min read'
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-2">
                Wedding inspiration & guides
              </h2>
              <p className="text-xl text-gray-600">
                Get inspired and learn from wedding experts
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="text-pink-600 font-medium hover:text-pink-700"
            >
              View all articles
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map((article, index) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-medium">
                      {article.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {article.description}
                  </p>
                  <p className="text-xs text-gray-500">{article.readTime}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Footer Component
export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="text-2xl font-bold text-rose-400 mb-4">Enosi</div>
            <p className="text-gray-400 mb-4">
              Australia's most trusted wedding vendor marketplace, helping couples create their perfect day.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-rose-400 cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-rose-400 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-rose-400 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-rose-400 transition-colors">Find Vendors</a></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">Planning Tools</a></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">Wedding Inspiration</a></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">Real Weddings</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-rose-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">Vendor Sign Up</a></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>1800 ENOSI (1800 366 741)</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>hello@enosi.com.au</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Enosi. All rights reserved. ABN: 12 345 678 901</p>
        </div>
      </div>
    </footer>
  );
};