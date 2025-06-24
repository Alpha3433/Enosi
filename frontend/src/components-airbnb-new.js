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
      name: 'Surf n Turf Suites',
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