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
        className={`w-7 h-7 text-sm rounded-full hover:bg-blue-100 transition-colors ${
          isToday ? 'bg-blue-500 text-white' : 'text-gray-700'
        }`}
      >
        {day}
      </button>
    );
  }
  
  return (
    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-58">
      <div className="flex items-center justify-between mb-4">
        <button onClick={goToPreviousMonth} className="p-1 hover:bg-gray-100 rounded">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-medium text-gray-900 text-sm">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button onClick={goToNextMonth} className="p-1 hover:bg-gray-100 rounded">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
          <div key={day} className="w-7 h-7 text-xs text-gray-500 flex items-center justify-center font-medium">
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

// Email Capture Modal
const EmailCaptureModal = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onSubmit(email);
      setIsSuccess(true);
      setIsSubmitting(false);
      
      // Close modal after success message
      setTimeout(() => {
        setIsSuccess(false);
        setEmail('');
        onClose();
      }, 2000);
    }, 1000);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 font-sans">Join Our Travel Club!</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {isSuccess ? (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-green-600 font-medium font-sans">Thank you! You've been added to our mailing list.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-gray-600 mb-4 font-sans">
              Get exclusive access to secret offers, best prices, and amazing wedding vendor deals!
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white rounded-lg py-3 font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 font-sans"
            >
              {isSubmitting ? 'Signing up...' : 'Sign Up for Newsletter'}
            </button>
          </form>
        )}
      </div>
    </div>
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
          <a href="#inspiration" className="text-sm hover:text-blue-500 transition-colors font-sans">
            Inspiration
          </a>
          <a href="#about" className="text-sm hover:text-blue-500 transition-colors font-sans">
            About Us
          </a>
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
            <p className="text-lg font-sans">Your perfect florist, DJ, and venue are just a click away</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-9 relative -mt-7 mb-11 z-10">
        <div className="bg-white rounded-full shadow-2xl p-6 max-w-5xl mx-auto">
          <div className="flex items-end space-x-1">
            <div className="flex-1 px-4 py-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 font-sans">Location</label>
              <input
                type="text"
                placeholder="Search Destinations"
                value={searchLocation}
                onChange={(e) => {
                  setSearchLocation(e.target.value);
                  clearError('location');
                }}
                className={`w-full text-sm outline-none border-0 bg-transparent placeholder-gray-400 font-sans ${
                  errors.location ? 'text-red-500' : ''
                }`}
              />
              {errors.location && (
                <p className="text-xs text-red-500 mt-1 font-sans">{errors.location}</p>
              )}
            </div>

            <div className="w-px h-11 bg-gray-200"></div>

            <div className="flex-1 px-4 py-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 font-sans">Vendor</label>
              <select 
                value={searchCategory}
                onChange={(e) => {
                  setSearchCategory(e.target.value);
                  clearError('vendor');
                }}
                className={`w-full text-sm outline-none border-0 bg-transparent font-sans ${
                  errors.vendor ? 'text-red-500' : 'text-gray-900'
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

            <div className="w-px h-11 bg-gray-200"></div>

            <div className="flex-1 px-4 py-2 relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2 font-sans">When</label>
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={weddingDate}
                  onChange={(e) => {
                    setWeddingDate(e.target.value);
                    clearError('date');
                  }}
                  className={`w-full text-sm outline-none border-0 bg-transparent placeholder-gray-400 font-sans ${
                    errors.date ? 'text-red-500' : ''
                  }`}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
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

            <div className="w-px h-11 bg-gray-200"></div>

            <div className="flex-1 px-4 py-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 font-sans">Guests</label>
              <input
                type="text"
                placeholder="Number of guests"
                value={guestCount}
                onChange={(e) => {
                  setGuestCount(e.target.value);
                  clearError('guests');
                }}
                className={`w-full text-sm outline-none border-0 bg-transparent placeholder-gray-400 font-sans ${
                  errors.guests ? 'text-red-500' : ''
                }`}
              />
              {errors.guests && (
                <p className="text-xs text-red-500 mt-1 font-sans">{errors.guests}</p>
              )}
            </div>

            <div className="flex-shrink-0 ml-2">
              <button
                onClick={handleSearch}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 transition-colors shadow-lg"
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
      <h3 className="text-lg font-semibold mb-5 text-left font-sans">Popular Wedding destinations</h3>
      
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
              <h3 className="text-sm font-medium text-gray-900 text-center font-sans group-hover:text-blue-600 transition-colors">
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
  ];

  return (
    <section className="container mx-auto px-9 mt-9">
      <h3 className="text-lg font-semibold mb-5 text-left font-sans">Popular Wedding Vendors</h3>
      
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
                    backgroundColor: '#e1ffd7',
                    color: '#009d52',
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
                    backgroundColor: 'rgba(59, 130, 246, 0.9)',
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
                  color: '#030303',
                  fontSize: '14px',
                  lineHeight: '21px',
                }}
              >
                {vendor.name}
              </h4>
              <p 
                className="font-light font-sans"
                style={{
                  color: '#858585',
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
                    color: '#030303',
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
                    color: '#030303',
                    fill: '#030303',
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
  ];

  return (
    <section className="container mx-auto px-9 mt-9">
      <h3 className="text-lg font-semibold mb-5 text-left font-sans">Featured Wedding Venues</h3>
      
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
                    backgroundColor: '#e1ffd7',
                    color: '#009d52',
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
                    backgroundColor: 'rgba(147, 51, 234, 0.9)',
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
                  color: '#030303',
                  fontSize: '14px',
                  lineHeight: '21px',
                }}
              >
                {venue.name}
              </h4>
              <p 
                className="font-light font-sans"
                style={{
                  color: '#858585',
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
                    color: '#030303',
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
                    color: '#030303',
                    fill: '#030303',
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
  ];

  return (
    <section className="container mx-auto px-9 mt-9">
      <h3 className="text-lg font-semibold mb-5 text-left font-sans">Top Rated Services</h3>
      
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
                    backgroundColor: '#e1ffd7',
                    color: '#009d52',
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
                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
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
                  color: '#030303',
                  fontSize: '14px',
                  lineHeight: '21px',
                }}
              >
                {service.name}
              </h4>
              <p 
                className="font-light font-sans"
                style={{
                  color: '#858585',
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
                    color: '#030303',
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
                    color: '#030303',
                    fill: '#030303',
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
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Email submitted to mailing list:', email);
      setIsSuccess(true);
      setIsSubmitting(false);
      
      // Reset form after success
      setTimeout(() => {
        setIsSuccess(false);
        setEmail('');
      }, 3000);
    }, 1000);
  };

  return (
    <section className="container mx-auto px-9 mt-11 mb-9">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-6">
            <h3 className="text-2xl md:text-3xl font-bold mb-3 font-sans">
              Join Our Wedding Club! 💍
            </h3>
            <p className="text-lg opacity-90 mb-1 font-sans">
              Get exclusive access to secret offers, best prices, and amazing wedding vendor deals!
            </p>
          </div>
          
          {!isSuccess ? (
            <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2 font-sans opacity-90">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 outline-none font-sans"
                    required
                  />
                </div>
                <div className="flex-shrink-0 sm:self-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-white text-blue-600 rounded-lg px-6 py-3 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans whitespace-nowrap"
                  >
                    {isSubmitting ? 'Joining...' : 'Join Now'}
                  </button>
                </div>
              </div>
              <p className="text-xs opacity-75 mt-3 text-center font-sans">
                No spam, just exclusive wedding deals and inspiration. Unsubscribe anytime.
              </p>
            </form>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold mb-2 font-sans">Welcome to the Club!</h4>
              <p className="opacity-90 font-sans">
                You'll start receiving exclusive wedding deals and offers soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Footer
export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-11">
      <div className="container mx-auto px-9">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 mb-7">
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-4 text-gray-900 font-sans">Enosi</h3>
            <p className="text-sm text-gray-600 mb-2 font-sans">Your favorite hotel booking experience</p>
            <p className="text-sm text-gray-600 font-sans">since 1978</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 font-sans">Support</h4>
            <div className="space-y-3">
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-900 transition-colors font-sans">Help</a>
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-900 transition-colors font-sans">FAQ</a>
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-900 transition-colors font-sans">Customer service</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 font-sans">Company</h4>
            <div className="space-y-3">
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-900 transition-colors font-sans">About Us</a>
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-900 transition-colors font-sans">Careers</a>
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-900 transition-colors font-sans">Press</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 font-sans">Contact</h4>
            <div className="space-y-3">
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-900 transition-colors font-sans">How to guide</a>
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-900 transition-colors font-sans">Contact us</a>
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-900 transition-colors font-sans">Partnership</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-7">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0 font-sans">Enosi © 2025. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-sans">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-sans">Terms of Service</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-sans">Cookie Policy</a>
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