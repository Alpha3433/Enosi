import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  ChevronRight,
  ChevronDown,
  ChevronLeft
} from 'lucide-react';

// Calendar Component
const CalendarDropdown = ({ isOpen, onClose, onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const formatDate = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toLocaleDateString('en-AU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  if (!isOpen) return null;
  
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="w-7 h-7"></div>);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
    days.push(
      <button
        key={day}
        onClick={() => {
          const formattedDate = formatDate(day);
          onDateSelect(formattedDate);
          onClose();
        }}
        className={`w-7 h-7 text-sm rounded-full hover:bg-linen transition-colors ${
          isToday ? 'bg-cement text-white' : 'text-kabul'
        }`}
      >
        {day}
      </button>
    );
  }
  
  return (
    <div className="absolute top-full left-0 mt-2 bg-white border border-coral-reef rounded-lg shadow-lg z-50 p-4 w-58">
      <div className="flex items-center justify-between mb-4">
        <button onClick={goToPreviousMonth} className="p-1 hover:bg-linen rounded">
          <ChevronLeft className="w-4 h-4 text-cement" />
        </button>
        <h3 className="font-medium text-millbrook text-sm">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button onClick={goToNextMonth} className="p-1 hover:bg-linen rounded">
          <ChevronRight className="w-4 h-4 text-cement" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
          <div key={day} className="w-7 h-7 text-xs text-napa flex items-center justify-center font-medium">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
};

// Enhanced Wedding Newsletter Modal
const EmailCaptureModal = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    setHasError(false);
    
    // Simulate API call with potential error handling
    setTimeout(() => {
      // Simulate occasional failure for demo
      const shouldSucceed = Math.random() > 0.1; // 90% success rate
      
      if (shouldSucceed) {
        onSubmit(email);
        setIsSuccess(true);
        setIsSubmitting(false);
        
        // Close modal after success message
        setTimeout(() => {
          setIsSuccess(false);
          setEmail('');
          onClose();
        }, 3000);
      } else {
        setHasError(true);
        setIsSubmitting(false);
      }
    }, 1500);
  };
  
  const resetModal = () => {
    setEmail('');
    setIsSuccess(false);
    setHasError(false);
    setIsSubmitting(false);
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden"
      >
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-br from-linen via-white to-rodeo-dust px-8 pt-8 pb-6">
          <button 
            onClick={() => {
              resetModal();
              onClose();
            }} 
            className="absolute top-4 right-4 p-2 text-napa hover:text-kabul hover:bg-white rounded-full transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Wedding rings icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-cement to-millbrook rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-white fill-current" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-tallow rounded-full flex items-center justify-center">
                <Star className="w-3 h-3 text-white fill-current" />
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-millbrook text-center mb-2 font-sans">
            Your Dream Wedding Awaits! 💕
          </h3>
          <p className="text-kabul text-center text-sm font-sans leading-relaxed">
            Join over 10,000 couples planning their perfect day
          </p>
        </div>
        
        <div className="px-8 pb-8">
          {isSuccess ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2 font-sans">Welcome to the Family! 🎉</h4>
              <p className="text-gray-600 font-sans mb-4">
                You're all set! Check your inbox for exclusive wedding deals and inspiration.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Email sent successfully</span>
              </div>
            </motion.div>
          ) : hasError ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2 font-sans">Oops! Something went wrong</h4>
              <p className="text-gray-600 font-sans mb-4">
                We couldn't sign you up right now. Please try again in a moment.
              </p>
              <button
                onClick={() => setHasError(false)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-sans"
              >
                Try Again
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Benefits list */}
              <div className="bg-gradient-to-r from-linen to-coral-reef rounded-2xl p-6 space-y-3">
                <h4 className="font-semibold text-millbrook font-sans mb-3">
                  What you'll receive:
                </h4>
                <div className="space-y-2">
                  {[
                    { icon: '💰', text: 'Exclusive vendor discounts & early bird deals' },
                    { icon: '💡', text: 'Weekly wedding planning tips & inspiration' },
                    { icon: '🎯', text: 'Personalized vendor recommendations' },
                    { icon: '📅', text: 'Free wedding planning timeline & checklist' }
                  ].map((benefit, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <span className="text-lg">{benefit.icon}</span>
                      <span className="text-sm text-kabul font-sans">{benefit.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Email input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-millbrook font-sans">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 bg-linen border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 font-sans placeholder-napa text-kabul"
                    required
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-napa" />
                </div>
              </div>
              
              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full bg-gradient-to-r from-cement to-millbrook text-white rounded-xl py-4 font-semibold text-lg hover:from-millbrook hover:to-kabul transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-sans shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Joining the club...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Join the Wedding Club</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </button>
              
              {/* Trust indicators */}
              <div className="flex items-center justify-center space-x-4 pt-2">
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-napa font-sans">Spam-free</span>
                </div>
                <div className="w-1 h-1 bg-coral-reef rounded-full"></div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-napa font-sans">Unsubscribe anytime</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Header Component
export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white">
      <div className="container mx-auto px-9 py-5 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold font-sans">Enosi</h1>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <button onClick={() => navigate('/search')} className="text-sm hover:text-blue-500 transition-colors font-sans">
            Find Vendors
          </button>
          <button onClick={() => navigate('/inspiration')} className="text-sm hover:text-blue-500 transition-colors font-sans">
            Inspiration
          </button>
          <button onClick={() => navigate('/about')} className="text-sm hover:text-blue-500 transition-colors font-sans">
            About Us
          </button>
        </nav>

        <div className="flex space-x-2">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-sans">{user?.first_name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={() => navigate(user?.user_type === 'vendor' ? '/vendor-dashboard' : '/dashboard')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-sans"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-sans"
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
                onClick={() => navigate('/login')}
                className="border border-gray-300 text-gray-700 rounded-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors font-sans"
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-blue-500 text-white rounded-full px-4 py-2 text-sm hover:bg-blue-600 transition-colors font-sans"
              >
                Sign up
              </button>
            </>
          )}
        </div>

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

// Hero Section with Calendar
export const AirbnbHeroSection = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [errors, setErrors] = useState({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!searchLocation.trim()) {
      newErrors.location = 'Please enter a location';
    }
    
    if (!searchCategory) {
      newErrors.vendor = 'Please select a vendor type';
    }
    
    if (!weddingDate.trim()) {
      newErrors.date = 'Please enter your wedding date';
    }
    
    if (!guestCount.trim()) {
      newErrors.guests = 'Please enter number of guests';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = () => {
    if (validateForm()) {
      setErrors({});
      const params = new URLSearchParams();
      params.set('location', searchLocation);
      params.set('category', searchCategory);
      params.set('date', weddingDate);
      params.set('guests', guestCount);
      navigate(`/search?${params.toString()}`);
    }
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleDateSelect = (date) => {
    setWeddingDate(date);
    clearError('date');
  };

  return (
    <>
      <section className="container mx-auto px-9 mt-2">
        <div className="relative rounded-3xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Wedding scene with guests"
            className="w-full h-[264px] object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-sans">Find Wedding Vendors You'll Love</h2>
            <p className="text-lg font-sans">Plan your dream wedding in minutes – explore, message, and book top vendors instantly</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-9 relative -mt-7 mb-11 z-10">
        <div className="bg-white rounded-full shadow-2xl p-6 max-w-5xl mx-auto border border-coral-reef">
          <div className="flex items-end space-x-1">
            <div className="flex-1 px-4 py-2">
              <label className="block text-sm font-semibold text-millbrook mb-2 font-sans">Location</label>
              <input
                type="text"
                placeholder="Search Destinations"
                value={searchLocation}
                onChange={(e) => {
                  setSearchLocation(e.target.value);
                  clearError('location');
                }}
                className={`w-full text-sm outline-none border-0 bg-transparent placeholder-napa font-sans ${
                  errors.location ? 'text-red-500' : 'text-kabul'
                }`}
              />
              {errors.location && (
                <p className="text-xs text-red-500 mt-1 font-sans">{errors.location}</p>
              )}
            </div>

            <div className="w-px h-11 bg-coral-reef"></div>

            <div className="flex-1 px-4 py-2">
              <label className="block text-sm font-semibold text-millbrook mb-2 font-sans">Vendor</label>
              <select 
                value={searchCategory}
                onChange={(e) => {
                  setSearchCategory(e.target.value);
                  clearError('vendor');
                }}
                className={`w-full text-sm outline-none border-0 bg-transparent font-sans ${
                  errors.vendor ? 'text-red-500' : 'text-kabul'
                }`}
              >
                <option value="">All Vendors</option>
                <option value="venue">Venues</option>
                <option value="photographer">Photographers</option>
                <option value="catering">Catering</option>
                <option value="florist">Florists</option>
                <option value="music">Music & Entertainment</option>
                <option value="makeup">Hair & Makeup</option>
              </select>
              {errors.vendor && (
                <p className="text-xs text-red-500 mt-1 font-sans">{errors.vendor}</p>
              )}
            </div>

            <div className="w-px h-11 bg-coral-reef"></div>

            <div className="flex-1 px-4 py-2 relative">
              <label className="block text-sm font-semibold text-millbrook mb-2 font-sans">When</label>
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={weddingDate}
                  onChange={(e) => {
                    setWeddingDate(e.target.value);
                    clearError('date');
                  }}
                  className={`w-full text-sm outline-none border-0 bg-transparent placeholder-napa font-sans ${
                    errors.date ? 'text-red-500' : 'text-kabul'
                  }`}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="ml-2 text-napa hover:text-cement"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
              {errors.date && (
                <p className="text-xs text-red-500 mt-1 font-sans">{errors.date}</p>
              )}
              <CalendarDropdown
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                onDateSelect={handleDateSelect}
                selectedDate={weddingDate}
              />
            </div>

            <div className="w-px h-11 bg-coral-reef"></div>

            <div className="flex-1 px-4 py-2">
              <label className="block text-sm font-semibold text-millbrook mb-2 font-sans">Guests</label>
              <input
                type="text"
                placeholder="Number of guests"
                value={guestCount}
                onChange={(e) => {
                  setGuestCount(e.target.value);
                  clearError('guests');
                }}
                className={`w-full text-sm outline-none border-0 bg-transparent placeholder-napa font-sans ${
                  errors.guests ? 'text-red-500' : 'text-kabul'
                }`}
              />
              {errors.guests && (
                <p className="text-xs text-red-500 mt-1 font-sans">{errors.guests}</p>
              )}
            </div>

            <div className="flex-shrink-0 ml-2">
              <button
                onClick={handleSearch}
                className="bg-cement hover:bg-millbrook text-white rounded-full p-4 transition-colors shadow-lg"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-sans">
                Please fill in all required fields to search for vendors.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

// Popular Destinations - Australian States
export const PopularDestinations = () => {
  const navigate = useNavigate();
  
  const destinations = [
    {
      name: 'New South Wales',
      image: 'https://images.pexels.com/photos/5707611/pexels-photo-5707611.jpeg',
    },
    {
      name: 'Victoria',
      image: 'https://images.pexels.com/photos/3082776/pexels-photo-3082776.jpeg',
    },
    {
      name: 'Queensland',
      image: 'https://images.unsplash.com/photo-1664191401117-f399706b5bbf',
    },
    {
      name: 'Western Australia',
      image: 'https://images.pexels.com/photos/4319003/pexels-photo-4319003.jpeg',
    },
    {
      name: 'South Australia',
      image: 'https://images.unsplash.com/photo-1636682282083-fa6e79c85fce',
    },
    {
      name: 'Tasmania',
      image: 'https://images.pexels.com/photos/2265880/pexels-photo-2265880.jpeg',
    },
  ];

  const handleDestinationClick = (stateName) => {
    const params = new URLSearchParams();
    params.set('location', stateName);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="container mx-auto px-9 mt-7">
      <h3 className="text-lg font-semibold mb-5 text-left font-sans text-millbrook">Popular Wedding destinations</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {destinations.map((destination, index) => (
          <div 
            key={index} 
            onClick={() => handleDestinationClick(destination.name)}
            className="relative rounded-2xl overflow-hidden cursor-pointer group p-2 bg-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="aspect-square">
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-2">
              <h3 className="text-sm font-medium text-millbrook text-center font-sans group-hover:text-cement transition-colors">
                {destination.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Popular Wedding Vendors
export const HotelsLovedByGuests = () => {
  const vendors = [
    {
      name: 'Bella Vista Venues',
      location: 'Sydney',
      rating: 9.6,
      price: 4500,
      priceUnit: 'package',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Venue'
    },
    {
      name: 'Artisan Photography Co.',
      location: 'Melbourne',
      rating: 9.4,
      price: 2800,
      priceUnit: 'package',
      image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Photography'
    },
    {
      name: 'Gourmet Wedding Catering',
      location: 'Brisbane',
      rating: 9.2,
      price: 85,
      priceUnit: 'per person',
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Catering'
    },
    {
      name: 'Bloom & Co Florists',
      location: 'Perth',
      rating: 9.5,
      price: 1200,
      priceUnit: 'package',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Florist'
    },
    {
      name: 'Elite Wedding Band',
      location: 'Adelaide',
      rating: 8.9,
      price: 1800,
      priceUnit: 'night',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Music'
    },
    {
      name: 'Eternal Moments Studio',
      location: 'Gold Coast',
      rating: 9.3,
      price: 3200,
      priceUnit: 'package',
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Photography'
    },
  ];

  return (
    <section className="container mx-auto px-9 mt-9">
      <h3 className="text-lg font-semibold mb-5 text-left font-sans text-millbrook">Popular Wedding Vendors</h3>
      
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {vendors.map((vendor, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 group cursor-pointer"
            style={{
              width: '219px',
              height: '259px',
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              boxShadow: '0px 1px 11px rgba(3,3,3,0.08)',
              padding: '7px'
            }}
          >
            <div className="relative mb-3">
              <div
                className="w-full h-40 rounded-xl bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-300"
                style={{
                  height: '162px',
                  borderRadius: '14px',
                  backgroundImage: `url(${vendor.image})`,
                  backgroundPosition: 'center center',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              
              <div className="absolute top-2 left-2">
                <button
                  className="px-2 py-1 border-0 text-xs font-medium font-sans"
                  style={{
                    borderRadius: '88px',
                    backgroundColor: '#fbf3e7',
                    color: '#5a4730',
                    fontSize: '11px',
                    lineHeight: '14px',
                  }}
                >
                  {vendor.rating}
                </button>
              </div>
              
              <div className="absolute top-2 right-2">
                <span
                  className="px-2 py-1 text-xs font-medium font-sans"
                  style={{
                    borderRadius: '88px',
                    backgroundColor: 'rgba(137, 117, 96, 0.9)',
                    color: 'white',
                    fontSize: '10px',
                    lineHeight: '12px',
                  }}
                >
                  {vendor.category}
                </span>
              </div>
            </div>
            
            <div className="px-2 space-y-1">
              <h4 
                className="font-normal leading-5 font-sans"
                style={{
                  color: '#5a4730',
                  fontSize: '14px',
                  lineHeight: '21px',
                }}
              >
                {vendor.name}
              </h4>
              <p 
                className="font-light font-sans"
                style={{
                  color: '#b4a797',
                  fontSize: '12px',
                  fontWeight: 300,
                  lineHeight: '20px',
                }}
              >
                {vendor.location}
              </p>
              <div className="flex items-center justify-between pt-1">
                <span 
                  className="font-semibold font-sans"
                  style={{
                    color: '#5a4730',
                    fontSize: '14px',
                    fontWeight: 600,
                    lineHeight: '21px',
                  }}
                >
                  from ${vendor.price}/{vendor.priceUnit}
                </span>
                <ChevronRight 
                  className="w-4 h-4"
                  style={{
                    color: '#5a4730',
                    fill: '#5a4730',
                    fontSize: '12px',
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

// Featured Venues Section
export const FeaturedVenues = () => {
  const venues = [
    {
      name: 'Riverstone Estate',
      location: 'Yarra Valley, VIC',
      rating: 9.8,
      price: 8500,
      priceUnit: 'package',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Winery'
    },
    {
      name: 'Coastal Cliff Manor',
      location: 'Gold Coast, QLD',
      rating: 9.7,
      price: 12000,
      priceUnit: 'package',
      image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Beachfront'
    },
    {
      name: 'Garden Pavilion',
      location: 'Adelaide Hills, SA',
      rating: 9.5,
      price: 6500,
      priceUnit: 'package',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Garden'
    },
    {
      name: 'Heritage Ballroom',
      location: 'Perth, WA',
      rating: 9.4,
      price: 9200,
      priceUnit: 'package',
      image: 'https://images.unsplash.com/photo-1545479653-90e8e2f4ac82?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Historic'
    },
    {
      name: 'Mountain View Lodge',
      location: 'Blue Mountains, NSW',
      rating: 9.3,
      price: 7800,
      priceUnit: 'package',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Rustic'
    },
    {
      name: 'Crystal Bay Resort',
      location: 'Sunshine Coast, QLD',
      rating: 9.6,
      price: 10500,
      priceUnit: 'package',
      image: 'https://images.unsplash.com/photo-1587271636175-90d58cdad458?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Resort'
    },
  ];

  return (
    <section className="container mx-auto px-9 mt-9">
      <h3 className="text-lg font-semibold mb-5 text-left font-sans text-millbrook">Featured Wedding Venues</h3>
      
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {venues.map((venue, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 group cursor-pointer"
            style={{
              width: '219px',
              height: '259px',
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              boxShadow: '0px 1px 11px rgba(3,3,3,0.08)',
              padding: '7px'
            }}
          >
            <div className="relative mb-3">
              <div
                className="w-full h-40 rounded-xl bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-300"
                style={{
                  height: '162px',
                  borderRadius: '14px',
                  backgroundImage: `url(${venue.image})`,
                  backgroundPosition: 'center center',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              
              <div className="absolute top-2 left-2">
                <button
                  className="px-2 py-1 border-0 text-xs font-medium font-sans"
                  style={{
                    borderRadius: '88px',
                    backgroundColor: '#fbf3e7',
                    color: '#5a4730',
                    fontSize: '11px',
                    lineHeight: '14px',
                  }}
                >
                  {venue.rating}
                </button>
              </div>
              
              <div className="absolute top-2 right-2">
                <span
                  className="px-2 py-1 text-xs font-medium font-sans"
                  style={{
                    borderRadius: '88px',
                    backgroundColor: 'rgba(100, 76, 60, 0.9)',
                    color: 'white',
                    fontSize: '10px',
                    lineHeight: '12px',
                  }}
                >
                  {venue.category}
                </span>
              </div>
            </div>
            
            <div className="px-2 space-y-1">
              <h4 
                className="font-normal leading-5 font-sans"
                style={{
                  color: '#5a4730',
                  fontSize: '14px',
                  lineHeight: '21px',
                }}
              >
                {venue.name}
              </h4>
              <p 
                className="font-light font-sans"
                style={{
                  color: '#b4a797',
                  fontSize: '12px',
                  fontWeight: 300,
                  lineHeight: '20px',
                }}
              >
                {venue.location}
              </p>
              <div className="flex items-center justify-between pt-1">
                <span 
                  className="font-semibold font-sans"
                  style={{
                    color: '#5a4730',
                    fontSize: '14px',
                    fontWeight: 600,
                    lineHeight: '21px',
                  }}
                >
                  from ${venue.price}/{venue.priceUnit}
                </span>
                <ChevronRight 
                  className="w-4 h-4"
                  style={{
                    color: '#5a4730',
                    fill: '#5a4730',
                    fontSize: '12px',
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

// Top Rated Services Section
export const TopRatedServices = () => {
  const services = [
    {
      name: 'Luxury Bridal Beauty',
      location: 'Melbourne, VIC',
      rating: 9.9,
      price: 450,
      priceUnit: 'service',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Hair & Makeup'
    },
    {
      name: 'Elegant Wedding Films',
      location: 'Sydney, NSW',
      rating: 9.8,
      price: 3200,
      priceUnit: 'package',
      image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Videography'
    },
    {
      name: 'Premium Transport Co.',
      location: 'Brisbane, QLD',
      rating: 9.6,
      price: 280,
      priceUnit: 'hour',
      image: 'https://images.unsplash.com/photo-1563694983011-6f4d90358083?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Transport'
    },
    {
      name: 'Sweet Celebrations',
      location: 'Perth, WA',
      rating: 9.7,
      price: 650,
      priceUnit: 'cake',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Cakes'
    },
    {
      name: 'Formal Attire Boutique',
      location: 'Adelaide, SA',
      rating: 9.5,
      price: 2200,
      priceUnit: 'package',
      image: 'https://images.unsplash.com/photo-1594736797933-d0e501ba2fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Attire'
    },
    {
      name: 'Enchanted Wedding Decor',
      location: 'Canberra, ACT',
      rating: 9.4,
      price: 1500,
      priceUnit: 'package',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Decor'
    },
  ];

  return (
    <section className="container mx-auto px-9 mt-9">
      <h3 className="text-lg font-semibold mb-5 text-left font-sans text-millbrook">Top Rated Services</h3>
      
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {services.map((service, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 group cursor-pointer"
            style={{
              width: '219px',
              height: '259px',
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              boxShadow: '0px 1px 11px rgba(3,3,3,0.08)',
              padding: '7px'
            }}
          >
            <div className="relative mb-3">
              <div
                className="w-full h-40 rounded-xl bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-300"
                style={{
                  height: '162px',
                  borderRadius: '14px',
                  backgroundImage: `url(${service.image})`,
                  backgroundPosition: 'center center',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              
              <div className="absolute top-2 left-2">
                <button
                  className="px-2 py-1 border-0 text-xs font-medium font-sans"
                  style={{
                    borderRadius: '88px',
                    backgroundColor: '#fbf3e7',
                    color: '#5a4730',
                    fontSize: '11px',
                    lineHeight: '14px',
                  }}
                >
                  {service.rating}
                </button>
              </div>
              
              <div className="absolute top-2 right-2">
                <span
                  className="px-2 py-1 text-xs font-medium font-sans"
                  style={{
                    borderRadius: '88px',
                    backgroundColor: 'rgba(91, 77, 60, 0.9)',
                    color: 'white',
                    fontSize: '10px',
                    lineHeight: '12px',
                  }}
                >
                  {service.category}
                </span>
              </div>
            </div>
            
            <div className="px-2 space-y-1">
              <h4 
                className="font-normal leading-5 font-sans"
                style={{
                  color: '#5a4730',
                  fontSize: '14px',
                  lineHeight: '21px',
                }}
              >
                {service.name}
              </h4>
              <p 
                className="font-light font-sans"
                style={{
                  color: '#b4a797',
                  fontSize: '12px',
                  fontWeight: 300,
                  lineHeight: '20px',
                }}
              >
                {service.location}
              </p>
              <div className="flex items-center justify-between pt-1">
                <span 
                  className="font-semibold font-sans"
                  style={{
                    color: '#5a4730',
                    fontSize: '14px',
                    fontWeight: 600,
                    lineHeight: '21px',
                  }}
                >
                  from ${service.price}/{service.priceUnit}
                </span>
                <ChevronRight 
                  className="w-4 h-4"
                  style={{
                    color: '#5a4730',
                    fill: '#5a4730',
                    fontSize: '12px',
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

// Newsletter Section with Email Capture
export const NewsletterSection = () => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  
  const handleEmailSubmit = (email) => {
    console.log('Email submitted to wedding newsletter:', email);
    
    // Here you would typically send to your backend
    // Example API call:
    // api.post('/newsletter/subscribe', { email, source: 'homepage_banner' });
  };

  return (
    <>
      <section className="container mx-auto px-9 mt-11 mb-9">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between"
          style={{
            width: '100%',
            maxWidth: '1312px',
            minHeight: '92px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0px 1px 12px rgba(3,3,3,0.08)',
            padding: '24px 32px'
          }}
        >
          <div className="flex items-center mb-4 md:mb-0">
            <div className="mr-6 flex items-center justify-center flex-shrink-0">
              <div className="relative">
                <div 
                  className="flex items-center justify-center"
                  style={{
                    color: '#897560',
                    fontSize: '48px',
                    width: '48px',
                    height: '48px',
                  }}
                >
                  <Heart className="w-full h-full fill-current" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-tallow rounded-full flex items-center justify-center">
                  <Star className="w-2 h-2 text-white fill-current" />
                </div>
              </div>
            </div>
            <div className="text-left">
              <div 
                style={{
                  color: '#5a4730',
                  fontSize: '16px',
                  fontFamily: 'Prompt',
                  fontWeight: 600,
                  lineHeight: '24px',
                  marginBottom: '4px'
                }}
              >
                Planning your dream wedding? 💍
              </div>
              <div 
                style={{
                  color: '#5a4730',
                  fontSize: '14px',
                  fontFamily: 'Prompt',
                  fontWeight: 300,
                  lineHeight: '18px',
                }}
              >
                Get exclusive vendor deals, planning tips, and early access to new features!<br />
                <span className="text-cement font-medium">Join 10,000+ couples already planning their perfect day</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <motion.button 
              onClick={() => setIsEmailModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group"
              style={{
                cursor: 'pointer',
                width: '240px',
                height: '44px',
                padding: '0px 16px',
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(135deg, #897560, #5a4730)',
                boxSizing: 'border-box',
                borderRadius: '100px',
                color: 'white',
                fontSize: '14px',
                fontFamily: 'Prompt',
                fontWeight: 600,
                lineHeight: '18px',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(137, 117, 96, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              <span>Join Wedding Club</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </section>
      
      <EmailCaptureModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSubmit={handleEmailSubmit}
      />
    </>
  );
};

// Footer
export const Footer = () => {
  return (
    <footer className="bg-white border-t border-coral-reef py-11">
      <div className="container mx-auto px-9">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 mb-7">
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-4 text-millbrook font-sans">Enosi</h3>
            <p className="text-sm text-kabul mb-2 font-sans">Your favorite wedding planning experience</p>
            <p className="text-sm text-kabul font-sans">since 2024</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-millbrook mb-4 font-sans">Support</h4>
            <div className="space-y-3">
              <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Help</a>
              <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">FAQ</a>
              <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Customer service</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-millbrook mb-4 font-sans">Company</h4>
            <div className="space-y-3">
              <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">About Us</a>
              <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Careers</a>
              <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Press</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-millbrook mb-4 font-sans">Contact</h4>
            <div className="space-y-3">
              <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">How to guide</a>
              <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Contact us</a>
              <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Partnership</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-coral-reef pt-7">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-napa mb-4 md:mb-0 font-sans">Enosi © 2025. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-napa hover:text-cement transition-colors font-sans">Privacy Policy</a>
              <a href="#" className="text-sm text-napa hover:text-cement transition-colors font-sans">Terms of Service</a>
              <a href="#" className="text-sm text-napa hover:text-cement transition-colors font-sans">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Legacy components for backward compatibility
export const VendorTypeCards = () => <div></div>;
export const FeaturedDeals = () => <div></div>;
export const ExploreNearby = () => <div></div>;
export const RealWeddingStories = () => <div></div>;
export const WeddingInspiration = () => <div></div>;