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
  Twitter,
  ChevronRight
} from 'lucide-react';

import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Header Component - Updated design
export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white">
      <div className="container mx-auto px-10 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Enosi</h1>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <button onClick={() => navigate('/search')} className="text-sm hover:text-blue-500 transition-colors">
            Find Vendors
          </button>
          <a href="#inspiration" className="text-sm hover:text-blue-500 transition-colors">
            Inspiration
          </a>
          <a href="#about" className="text-sm hover:text-blue-500 transition-colors">
            About Us
          </a>
        </nav>

        <div className="flex space-x-2">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user?.first_name}</span>
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
            <>
              <button
                onClick={() => navigate('/signup')}
                className="border border-blue-500 text-blue-500 rounded-full px-4 py-1 text-sm hover:bg-blue-50 transition-colors"
              >
                Sign up
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-500 text-white rounded-full px-4 py-1 text-sm hover:bg-blue-600 transition-colors"
              >
                Log in
              </button>
            </>
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
    </header>
  );
};

// Hero Section with Separate Search Bar
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
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-10 mt-2">
        <div className="relative rounded-3xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Wedding scene with guests"
            className="w-full h-[300px] object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Find Wedding Vendors You'll Love</h2>
            <p className="text-lg">Your perfect florist, DJ, and venue are just a click away</p>
          </div>
        </div>
      </section>

      {/* Floating Search Bar */}
      <section className="container mx-auto px-10 relative -mt-8 mb-12 z-10">
        <div className="bg-white rounded-full shadow-2xl p-6 max-w-5xl mx-auto">
          <div className="flex items-end space-x-1">
            {/* Location */}
            <div className="flex-1 px-4 py-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Location</label>
              <input
                type="text"
                placeholder="Search Destinations"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full text-sm outline-none border-0 bg-transparent placeholder-gray-400"
              />
            </div>

            {/* Divider */}
            <div className="w-px h-12 bg-gray-200"></div>

            {/* Vendor */}
            <div className="flex-1 px-4 py-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Vendor</label>
              <select 
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-full text-sm outline-none border-0 bg-transparent text-gray-900"
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

            {/* Divider */}
            <div className="w-px h-12 bg-gray-200"></div>

            {/* When */}
            <div className="flex-1 px-4 py-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2">When</label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                className="w-full text-sm outline-none border-0 bg-transparent placeholder-gray-400"
              />
            </div>

            {/* Divider */}
            <div className="w-px h-12 bg-gray-200"></div>

            {/* Guests */}
            <div className="flex-1 px-4 py-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Guests</label>
              <input
                type="text"
                placeholder="Number of guests"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="w-full text-sm outline-none border-0 bg-transparent placeholder-gray-400"
              />
            </div>

            {/* Search Button */}
            <div className="flex-shrink-0 ml-2">
              <button
                onClick={handleSearch}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 transition-colors shadow-lg"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// Popular Destinations with 6-card grid layout
export const PopularDestinations = () => {
  const destinations = [
    {
      name: 'Sydney',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'London',
      image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    },
    {
      name: 'Lisbon',
      image: 'https://images.unsplash.com/photo-1518132006340-7c31de9a7544?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    },
    {
      name: 'Croatia',
      image: 'https://images.unsplash.com/photo-1555990577-78d9a50b2b6a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80',
    },
    {
      name: 'Bratislava',
      image: 'https://images.unsplash.com/photo-1592906209472-a36b1f3782ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    },
    {
      name: 'Copenhagen',
      image: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    },
  ];

  return (
    <section className="container mx-auto px-10 mt-8">
      <h3 className="text-lg font-semibold mb-5">Popular Wedding destinations</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {destinations.map((destination, index) => (
          <div key={index} className="relative rounded-2xl overflow-hidden cursor-pointer group p-2 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="aspect-square">
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-2">
              <h3 className="text-sm font-medium text-gray-900 text-center">
                {destination.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Hotels Section - Based on provided component design
export const HotelsLovedByGuests = () => {
  const hotels = [
    {
      name: 'Soho Hotel London',
      location: 'London',
      rating: 9.6,
      price: 130,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
    },
    {
      name: 'Hotel Nørrebro',
      location: 'Copenhagen',
      rating: 9.6,
      price: 180,
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
    },
    {
      name: 'Sunset Plaza Hotel',
      location: 'Barcelona',
      rating: 9.0,
      price: 210,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    },
    {
      name: 'Three Quarters Hotel',
      location: 'Stockholm',
      rating: 9.5,
      price: 130,
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    },
    {
      name: "Surf'n'Turf Suites",
      location: 'Lisbon',
      rating: 8.4,
      price: 70,
      image: 'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    },
  ];

  return (
    <section className="container mx-auto px-10 mt-10">
      <h3 className="text-lg font-semibold mb-5">Hotels loved by guests</h3>
      
      {/* Horizontal scrollable container */}
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {hotels.map((hotel, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 group cursor-pointer"
            style={{
              width: '249px',
              height: '294px',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0px 1px 12px rgba(3,3,3,0.08)',
              padding: '8px'
            }}
          >
            {/* Image container */}
            <div className="relative mb-3">
              <div
                className="w-full h-46 rounded-2xl bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-300"
                style={{
                  height: '184px',
                  borderRadius: '16px',
                  backgroundImage: `url(${hotel.image})`,
                  backgroundPosition: 'center center',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              
              {/* Rating badge - top left */}
              <div className="absolute top-2 left-2">
                <button
                  className="px-2 py-1 border-0 text-xs font-medium"
                  style={{
                    borderRadius: '100px',
                    backgroundColor: '#e1ffd7',
                    color: '#009d52',
                    fontSize: '12px',
                    lineHeight: '16px',
                  }}
                >
                  {hotel.rating}
                </button>
              </div>
              
              {/* Heart icon - top right */}
              <button 
                className="absolute top-2 right-2 flex items-center justify-center border-0"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '100px',
                  backgroundColor: 'rgba(255,255,255,0.5)',
                }}
              >
                <Heart className="w-3.5 h-3.5 text-white fill-white" />
              </button>
            </div>
            
            {/* Hotel details */}
            <div className="px-2 space-y-1">
              <h4 
                className="font-normal leading-6"
                style={{
                  color: '#030303',
                  fontSize: '16px',
                  lineHeight: '24px',
                }}
              >
                {hotel.name}
              </h4>
              <p 
                className="font-light"
                style={{
                  color: '#858585',
                  fontSize: '14px',
                  fontWeight: 300,
                  lineHeight: '22px',
                }}
              >
                {hotel.location}
              </p>
              <div className="flex items-center justify-between pt-1">
                <span 
                  className="font-semibold"
                  style={{
                    color: '#030303',
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '24px',
                  }}
                >
                  from ${hotel.price}/night
                </span>
                <ChevronRight 
                  className="w-3.5 h-3.5"
                  style={{
                    color: '#030303',
                    fill: '#030303',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Newsletter Section - Updated design with icon
export const NewsletterSection = () => {
  return (
    <section className="container mx-auto px-10 mt-12 mb-10">
      <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 rounded-2xl p-8">
        <div className="flex items-center mb-6 md:mb-0">
          <div className="text-4xl mr-6 flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full">
            💰
          </div>
          <div>
            <h4 className="font-bold text-lg text-gray-900 mb-2">Pssst!</h4>
            <p className="text-sm text-gray-600 mb-1">Do you want to get secret offers and best prices for amazing stays?</p>
            <p className="text-sm text-gray-600">Sign up to join our Travel Club!</p>
          </div>
        </div>
        <button className="border border-blue-500 text-blue-500 rounded-full px-6 py-3 text-sm hover:bg-blue-50 transition-colors whitespace-nowrap font-medium">
          Sign up for newsletter
        </button>
      </div>
    </section>
  );
};

// Footer
export const Footer = () => {
  return (
    <footer className="container mx-auto px-10 py-6 border-t">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <h3 className="text-lg font-bold mb-2">Enosi</h3>
          <p className="text-sm text-gray-600">Your favorite hotel booking experience since 1978</p>
          <p className="text-sm text-gray-400 mt-4">Enosi © 2025</p>
        </div>
        <div className="lg:col-span-2 flex justify-end">
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1 hover:text-gray-800 cursor-pointer transition-colors">Help</p>
            <p className="text-sm text-gray-600 mb-1 hover:text-gray-800 cursor-pointer transition-colors">FAQ</p>
            <p className="text-sm text-gray-600 mb-1 hover:text-gray-800 cursor-pointer transition-colors">Customer service</p>
            <p className="text-sm text-gray-600 mb-1 hover:text-gray-800 cursor-pointer transition-colors">How to guide</p>
            <p className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer transition-colors">Contact us</p>
          </div>
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