import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart,
  MapPin,
  Calendar,
  Users,
  Camera,
  Palette,
  Flower,
  Music,
  ChevronRight,
  Star,
  ArrowRight,
  Play
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Initialize match object for this component
if (typeof window !== 'undefined' && !window.match) {
  window.match = {
    params: {},
    isExact: true,
    path: window.location.pathname,
    url: window.location.pathname
  };
}

const InspirationPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const inspirationCategories = [
    { id: 'all', name: 'All Inspiration', icon: Heart },
    { id: 'venues', name: 'Venues', icon: MapPin },
    { id: 'photography', name: 'Photography', icon: Camera },
    { id: 'decor', name: 'Decor & Styling', icon: Palette },
    { id: 'flowers', name: 'Flowers', icon: Flower },
    { id: 'music', name: 'Music & Entertainment', icon: Music }
  ];

  const featuredStories = [
    {
      id: 1,
      title: "Sarah & Michael's Garden Romance",
      location: "Sydney, NSW",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
      description: "A breathtaking outdoor ceremony surrounded by blooming gardens and twinkling lights.",
      tags: ["Garden Wedding", "Outdoor", "Romantic"],
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "Emma & James' Coastal Celebration",
      location: "Byron Bay, NSW",
      image: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
      description: "An elegant beachside wedding with stunning ocean views and bohemian touches.",
      tags: ["Beach Wedding", "Boho", "Coastal"],
      readTime: "4 min read"
    },
    {
      id: 3,
      title: "Lisa & David's Urban Elegance",
      location: "Melbourne, VIC",
      image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
      description: "A sophisticated city wedding with modern decor and stunning skyline views.",
      tags: ["City Wedding", "Modern", "Elegant"],
      readTime: "6 min read"
    }
  ];

  const inspirationGallery = [
    {
      id: 1,
      category: 'venues',
      image: "https://images.unsplash.com/photo-1519167758481-83f29c7c3d6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      title: "Elegant Outdoor Venues",
      description: "Garden ceremonies with natural beauty"
    },
    {
      id: 2,
      category: 'photography',
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      title: "Romantic Photography Styles",
      description: "Capturing your perfect moments"
    },
    {
      id: 3,
      category: 'decor',
      image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      title: "Rustic Decor Ideas",
      description: "Natural and cozy styling"
    },
    {
      id: 4,
      category: 'flowers',
      image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      title: "Bridal Bouquet Inspiration",
      description: "Beautiful floral arrangements"
    },
    {
      id: 5,
      category: 'venues',
      image: "https://images.unsplash.com/photo-1525258461801-936b8ceaf711?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      title: "Beach Wedding Venues",
      description: "Coastal ceremony locations"
    },
    {
      id: 6,
      category: 'photography',
      image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      title: "Candid Wedding Moments",
      description: "Natural and spontaneous shots"
    }
  ];

  const trendingIdeas = [
    {
      title: "Micro Weddings",
      description: "Intimate celebrations with close family and friends",
      popularity: "95% popular"
    },
    {
      title: "Sustainable Weddings",
      description: "Eco-friendly choices for conscious couples",
      popularity: "88% popular"
    },
    {
      title: "Vintage Themes",
      description: "Classic elegance with timeless appeal",
      popularity: "82% popular"
    },
    {
      title: "Outdoor Ceremonies",
      description: "Natural settings for romantic celebrations",
      popularity: "91% popular"
    }
  ];

  const filteredGallery = selectedCategory === 'all' 
    ? inspirationGallery 
    : inspirationGallery.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header - Same as landing page */}
      <header className="bg-white">
        <div className="container mx-auto px-9 py-5 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="text-xl font-bold font-sans"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              Enosi
            </button>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <button onClick={() => navigate('/search')} className="text-sm hover:text-blue-500 transition-colors font-sans">
              Find Vendors
            </button>
            <button onClick={() => navigate('/inspiration')} className="text-sm text-blue-500 font-sans">
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
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=800&q=80"
          alt="Wedding inspiration"
          className="w-full h-96 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-sans">Wedding Inspiration</h1>
          <p className="text-lg mb-6 font-sans max-w-2xl">
            Discover beautiful ideas, real weddings, and creative inspiration to make your special day unforgettable
          </p>
          <button 
            onClick={() => navigate('/search')}
            className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors font-sans"
          >
            Start Planning Your Wedding
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="container mx-auto px-9 py-8">
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {inspirationCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-6 py-3 rounded-full transition-colors font-sans ${
                selectedCategory === category.id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <category.icon className="w-4 h-4 mr-2" />
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Stories */}
      <div className="container mx-auto px-9 mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 font-sans" style={{ textAlign: 'left' }}>
          Featured Real Weddings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredStories.map((story) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: story.id * 0.1 }}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                boxShadow: '0px 1px 12px rgba(3,3,3,0.08)',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              className="group hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img 
                  src={story.image}
                  alt={story.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-white rounded-full p-2">
                  <Heart className="w-4 h-4 text-gray-600" />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2 font-sans">
                  <MapPin className="w-3 h-3 mr-1" />
                  {story.location}
                  <span className="ml-auto">{story.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">{story.title}</h3>
                <p className="text-gray-600 text-sm mb-4 font-sans">{story.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {story.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-sans">
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="flex items-center text-blue-500 hover:text-blue-600 font-sans text-sm">
                  Read Full Story
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Inspiration Gallery */}
      <div className="container mx-auto px-9 mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 font-sans" style={{ textAlign: 'left' }}>
          Inspiration Gallery
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0px 1px 12px rgba(3,3,3,0.08)',
                overflow: 'hidden'
              }}
              className="group hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="relative">
                <img 
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 font-sans">{item.title}</h3>
                <p className="text-sm text-gray-600 font-sans">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Ideas */}
      <div className="container mx-auto px-9 mb-12">
        <div 
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '20px',
            padding: '48px 32px'
          }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center font-sans">
            Trending Wedding Ideas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingIdeas.map((idea, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0px 1px 12px rgba(3,3,3,0.08)',
                  padding: '24px',
                  textAlign: 'center'
                }}
              >
                <h3 className="font-bold text-gray-900 mb-2 font-sans">{idea.title}</h3>
                <p className="text-sm text-gray-600 mb-3 font-sans">{idea.description}</p>
                <div className="flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-xs text-blue-600 font-sans">{idea.popularity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-9 mb-12">
        <div 
          style={{
            backgroundColor: '#3b82f6',
            borderRadius: '20px',
            padding: '48px 32px',
            textAlign: 'center'
          }}
        >
          <h2 className="text-3xl font-bold text-white mb-4 font-sans">
            Ready to Start Planning?
          </h2>
          <p className="text-white text-lg mb-6 font-sans opacity-90">
            Connect with Australia's best wedding vendors and bring your vision to life
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/search')}
              className="bg-white text-blue-500 px-8 py-3 rounded-full hover:bg-gray-50 transition-colors font-sans font-medium"
            >
              Find Wedding Vendors
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="border-2 border-white text-white px-8 py-3 rounded-full hover:bg-white hover:text-blue-500 transition-colors font-sans font-medium"
            >
              Create Your Account
            </button>
          </div>
        </div>
      </div>

      {/* Footer - Same as landing page */}
      <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-9">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 font-sans">Enosi</h3>
              <p className="text-gray-600 text-sm font-sans">
                Australia's premier wedding vendor marketplace, connecting couples with the perfect professionals for their special day.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-sans">For Couples</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 font-sans">Find Vendors</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Wedding Planning</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Budget Calculator</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Inspiration</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-sans">For Vendors</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 font-sans">Join as Vendor</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Vendor Dashboard</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Resources</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-sans">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 font-sans">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Terms of Service</a></li>
                <li><a href="#" className="hover:text-gray-900 font-sans">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-600 text-sm font-sans">
              © 2025 Enosi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InspirationPage;