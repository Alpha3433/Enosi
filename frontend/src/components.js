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

// Header Component
export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <motion.div 
              className="text-2xl font-bold text-rose-600"
              whileHover={{ scale: 1.05 }}
            >
              Enosi
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => navigate('/search')} className="text-gray-700 hover:text-rose-600 transition-colors">Find Vendors</button>
            <button onClick={() => navigate('/search/enhanced')} className="text-gray-700 hover:text-rose-600 transition-colors">Enhanced Search</button>
            <button onClick={() => navigate('/planning')} className="text-gray-700 hover:text-rose-600 transition-colors">Planning Tools</button>
            <a href="#inspiration" className="text-gray-700 hover:text-rose-600 transition-colors">Inspiration</a>
            <a href="#about" className="text-gray-700 hover:text-rose-600 transition-colors">About</a>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate('/dashboard')}
                  className="p-2 text-gray-600 hover:text-rose-600 transition-colors"
                >
                  <Heart className="h-5 w-5" />
                </motion.button>
                <div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-rose-600 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm">{user?.first_name}</span>
                  </motion.button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => navigate(user?.user_type === 'vendor' ? '/vendor-dashboard' : '/dashboard')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => navigate('/profile')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => navigate('/planning')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Planning Tools
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

// Hero Section Component
export const HeroSection = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCategory) params.set('category', searchCategory);
    if (searchLocation) params.set('location', searchLocation);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1606490194859-07c18c9f0968"
          alt="Elegant wedding couple"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Find Your Perfect
            <span className="block text-rose-300">Wedding Vendors</span>
          </h1>
          <p className="text-xl sm:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Connect with Australia's most trusted wedding professionals. From venues to photographers, make your dream wedding a reality.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">What do you need?</label>
              <select 
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-gray-700"
              >
                <option value="">Select category</option>
                <option value="venue">Venues</option>
                <option value="photographer">Photographers</option>
                <option value="catering">Catering</option>
                <option value="florist">Florists</option>
                <option value="music">Music & Entertainment</option>
                <option value="makeup">Hair & Makeup</option>
              </select>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Where?</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sydney, Melbourne, Brisbane..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-gray-700"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                className="w-full bg-rose-600 text-white py-3 px-6 rounded-lg hover:bg-rose-700 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <Search className="h-5 w-5" />
                <span>Search Vendors</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Vendor Category Cards
export const VendorCategories = () => {
  const navigate = useNavigate();
  
  const categories = [
    {
      title: 'Photographers',
      category: 'photographer',
      icon: Camera,
      image: 'https://images.unsplash.com/photo-1495434224324-36812b391125',
      vendorCount: '250+ verified',
      priceRange: 'From $800'
    },
    {
      title: 'Venues',
      category: 'venue',
      icon: Building,
      image: 'https://images.unsplash.com/photo-1578730169862-749bbdc763a8',
      vendorCount: '180+ verified',
      priceRange: 'From $2,500'
    },
    {
      title: 'Catering',
      category: 'catering',
      icon: Utensils,
      image: 'https://images.unsplash.com/photo-1552617911-83473ac6204b',
      vendorCount: '320+ verified',
      priceRange: 'From $45/person'
    },
    {
      title: 'Florists',
      category: 'florist',
      icon: Flower,
      image: 'https://images.unsplash.com/photo-1593471682521-5354d03150da',
      vendorCount: '150+ verified',
      priceRange: 'From $200'
    },
    {
      title: 'Music & Entertainment',
      category: 'music',
      icon: Music,
      image: 'https://images.unsplash.com/photo-1635612445702-1891217d4a30',
      vendorCount: '200+ verified',
      priceRange: 'From $400'
    },
    {
      title: 'Hair & Makeup',
      category: 'makeup',
      icon: Heart,
      image: 'https://images.pexels.com/photos/3434997/pexels-photo-3434997.jpeg',
      vendorCount: '130+ verified',
      priceRange: 'From $300'
    }
  ];

  const handleCategoryClick = (category) => {
    navigate(`/search?category=${category}`);
  };

  return (
    <section className="py-16 bg-gray-50" id="vendors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover Australia's most trusted wedding professionals, carefully vetted for quality and reliability.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={() => handleCategoryClick(category.category)}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.title}
                </h3>
                <p className="text-gray-600 mb-3">{category.vendorCount}</p>
                <div className="flex justify-between items-center">
                  <span className="text-rose-600 font-semibold">{category.priceRange}</span>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Featured Vendors Section
export const FeaturedVendors = () => {
  const vendors = [
    {
      name: 'Eternal Moments Photography',
      category: 'Wedding Photography',
      location: 'Sydney, NSW',
      rating: 4.9,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1708134128471-5dffccea53f5',
      price: 'From $1,200',
      featured: true
    },
    {
      name: 'Garden Grove Venues',
      category: 'Wedding Venues',
      location: 'Melbourne, VIC',
      rating: 4.8,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1639259621742-90f4c0cf5a16',
      price: 'From $3,500',
      featured: true
    },
    {
      name: 'Bloom & Blossom Florists',
      category: 'Wedding Flowers',
      location: 'Brisbane, QLD',
      rating: 4.9,
      reviews: 124,
      image: 'https://images.pexels.com/photos/9017644/pexels-photo-9017644.jpeg',
      price: 'From $350',
      featured: true
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Featured Wedding Vendors
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hand-picked professionals who consistently deliver exceptional experiences for couples across Australia.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vendors.map((vendor, index) => (
            <motion.div
              key={vendor.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={vendor.image}
                  alt={vendor.name}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                />
                {vendor.featured && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                >
                  <Heart className="h-5 w-5 text-white" />
                </motion.button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <div className="flex items-center text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(vendor.rating) ? 'fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600 text-sm">
                    {vendor.rating} ({vendor.reviews} reviews)
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {vendor.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{vendor.category}</p>
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  {vendor.location}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-rose-600 font-semibold">{vendor.price}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium"
                  >
                    Get Quote
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Planning Tools Section
export const PlanningTools = () => {
  const navigate = useNavigate();
  
  const tools = [
    {
      title: 'Budget Tracker',
      description: 'Track your wedding expenses and stay within budget with our smart calculator.',
      icon: DollarSign,
      color: 'bg-green-500',
      users: '15,000+ couples',
      link: '/planning/budget'
    },
    {
      title: 'Wedding Checklist',
      description: 'Never miss a detail with our comprehensive wedding planning checklist.',
      icon: CheckCircle,
      color: 'bg-blue-500',
      users: '22,000+ couples',
      link: '/planning/checklist'
    },
    {
      title: 'Timeline Creator',
      description: 'Plan your perfect day with our customizable wedding day timeline tool.',
      icon: Calendar,
      color: 'bg-purple-500',
      users: '18,000+ couples',
      link: '/planning/timeline'
    },
    {
      title: 'Guest List Manager',
      description: 'Organize your guest list, track RSVPs, and manage seating arrangements.',
      icon: Users,
      color: 'bg-orange-500',
      users: '20,000+ couples',
      link: '/planning/guests'
    }
  ];

  return (
    <section className="py-16 bg-gray-50" id="planning-tools">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Free Planning Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to plan your perfect wedding, all in one place. Our tools are trusted by thousands of Australian couples.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className={`${tool.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <tool.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {tool.title}
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                {tool.description}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Used by {tool.users}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(tool.link)}
                className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Try Free
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Trust Signals Section
export const TrustSignals = () => {
  const trustFeatures = [
    {
      icon: Shield,
      title: 'Verified Vendors Only',
      description: 'Every vendor is thoroughly vetted and verified before joining our platform.'
    },
    {
      icon: Award,
      title: 'Quality Guarantee',
      description: 'We stand behind our vendors with our satisfaction guarantee and support.'
    },
    {
      icon: Star,
      title: 'Real Reviews',
      description: 'Authentic reviews from real couples who\'ve used our vendors.'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Couples Trust Enosi
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're committed to helping you find the perfect vendors for your special day.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          <div>
            <div className="text-3xl font-bold text-rose-600 mb-2">50,000+</div>
            <div className="text-gray-600">Happy Couples</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-rose-600 mb-2">1,200+</div>
            <div className="text-gray-600">Verified Vendors</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-rose-600 mb-2">4.9★</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-rose-600 mb-2">24/7</div>
            <div className="text-gray-600">Customer Support</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Testimonials Section
export const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah & Michael',
      location: 'Sydney, NSW',
      text: 'Enosi made finding our wedding vendors so easy! We found our photographer, venue, and caterer all through the platform. Everything was seamless.',
      image: 'https://images.pexels.com/photos/4087576/pexels-photo-4087576.jpeg',
      rating: 5
    },
    {
      name: 'Emma & James',
      location: 'Melbourne, VIC',
      text: 'The planning tools were incredible. The budget tracker saved us thousands, and the timeline creator kept us organized throughout the entire process.',
      image: 'https://images.unsplash.com/photo-1656354961825-581617b020bc',
      rating: 5
    },
    {
      name: 'Rachel & David',
      location: 'Brisbane, QLD',
      text: 'All our vendors were absolutely amazing. The verification process really shows - every professional we worked with exceeded our expectations.',
      image: 'https://images.pexels.com/photos/7629856/pexels-photo-7629856.jpeg',
      rating: 5
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What Couples Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Read reviews from real couples who planned their perfect wedding with Enosi.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "{testimonial.text}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mr-4">
                  <Heart className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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

// Quote Request Modal
export const QuoteRequestModal = ({ isOpen, onClose, vendor }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    weddingDate: '',
    guestCount: '',
    budget: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Quote request submitted:', formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Request Quote from {vendor?.name}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wedding Date
                </label>
                <input
                  type="date"
                  value={formData.weddingDate}
                  onChange={(e) => setFormData({...formData, weddingDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest Count
                </label>
                <select
                  value={formData.guestCount}
                  onChange={(e) => setFormData({...formData, guestCount: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="">Select guest count</option>
                  <option value="under-50">Under 50</option>
                  <option value="50-100">50-100</option>
                  <option value="100-150">100-150</option>
                  <option value="150-200">150-200</option>
                  <option value="over-200">Over 200</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range
                </label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="">Select budget</option>
                  <option value="under-1000">Under $1,000</option>
                  <option value="1000-2500">$1,000 - $2,500</option>
                  <option value="2500-5000">$2,500 - $5,000</option>
                  <option value="5000-10000">$5,000 - $10,000</option>
                  <option value="over-10000">Over $10,000</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tell us about your wedding
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Share details about your vision, specific requirements, or any questions you have..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 bg-rose-600 text-white py-3 px-6 rounded-lg hover:bg-rose-700 transition-colors font-medium"
              >
                Send Quote Request
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
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