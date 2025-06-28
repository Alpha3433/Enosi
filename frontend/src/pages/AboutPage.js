import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart,
  Users,
  Award,
  Shield,
  Target,
  Star,
  CheckCircle,
  Globe,
  Phone,
  Mail,
  MapPin,
  ArrowRight
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

const AboutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const stats = [
    { number: '10,000+', label: 'Happy Couples', icon: Heart },
    { number: '2,500+', label: 'Trusted Vendors', icon: Users },
    { number: '50,000+', label: 'Successful Connections', icon: Award },
    { number: '99.5%', label: 'Customer Satisfaction', icon: Star }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Love-Centered',
      description: 'We believe every love story deserves to be celebrated beautifully and authentically.'
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'All our vendors are thoroughly vetted to ensure quality and reliability for your special day.'
    },
    {
      icon: Target,
      title: 'Perfect Matches',
      description: 'Our smart matching technology connects you with vendors that align with your vision and budget.'
    },
    {
      icon: Users,
      title: 'Community Focus',
      description: 'We foster a supportive community where couples and vendors collaborate to create magic.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&w=300&h=300&fit=crop&crop=face',
      bio: 'Former wedding planner with 15 years of experience helping couples create their dream weddings.'
    },
    {
      name: 'Michael Chen',
      role: 'Head of Vendor Relations',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=300&h=300&fit=crop&crop=face',
      bio: 'Passionate about building relationships with Australia\'s finest wedding professionals.'
    },
    {
      name: 'Emma Williams',
      role: 'Customer Experience Director',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=300&h=300&fit=crop&crop=face',
      bio: 'Dedicated to ensuring every couple has an exceptional experience from start to finish.'
    },
    {
      name: 'James Rodriguez',
      role: 'Technology Lead',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=300&h=300&fit=crop&crop=face',
      bio: 'Building innovative tools to make wedding planning easier and more enjoyable for everyone.'
    }
  ];

  const milestones = [
    {
      year: '2019',
      title: 'Enosi Founded',
      description: 'Started with a vision to revolutionize wedding planning in Australia'
    },
    {
      year: '2020',
      title: 'First 1,000 Couples',
      description: 'Helped our first thousand couples find their perfect wedding vendors'
    },
    {
      year: '2022',
      title: 'National Expansion',
      description: 'Expanded to cover all major cities across Australia'
    },
    {
      year: '2024',
      title: 'Award Recognition',
      description: 'Named "Best Wedding Platform" by Australian Wedding Industry Awards'
    }
  ];

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
            <button onClick={() => navigate('/inspiration')} className="text-sm hover:text-blue-500 transition-colors font-sans">
              Inspiration
            </button>
            <button onClick={() => navigate('/about')} className="text-sm text-blue-500 font-sans">
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
          src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=600&q=80"
          alt="About Enosi"
          className="w-full h-96 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-sans">About Enosi</h1>
          <p className="text-lg mb-6 font-sans max-w-2xl">
            Connecting Australian couples with exceptional wedding vendors since 2019
          </p>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="container mx-auto px-9 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 font-sans">Our Mission</h2>
          <p className="text-xl text-gray-600 leading-relaxed font-sans">
            At Enosi, we believe every couple deserves their perfect wedding day. We're passionate about connecting 
            engaged couples with Australia's most talented and trusted wedding professionals, making the journey 
            from "yes" to "I do" as seamless and joyful as possible.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-9 mb-16">
        <div 
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '20px',
            padding: '48px 32px'
          }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center font-sans">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <stat.icon className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2 font-sans">{stat.number}</h3>
                <p className="text-gray-600 font-sans">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="container mx-auto px-9 mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center font-sans">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                boxShadow: '0px 1px 12px rgba(3,3,3,0.08)',
                padding: '32px',
                textAlign: 'center'
              }}
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-50 rounded-full">
                  <value.icon className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 font-sans">{value.title}</h3>
              <p className="text-gray-600 font-sans">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="container mx-auto px-9 mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center font-sans">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                boxShadow: '0px 1px 12px rgba(3,3,3,0.08)',
                overflow: 'hidden'
              }}
            >
              <img 
                src={member.image}
                alt={member.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1 font-sans">{member.name}</h3>
                <p className="text-blue-500 font-medium mb-3 font-sans">{member.role}</p>
                <p className="text-gray-600 text-sm font-sans">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="container mx-auto px-9 mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center font-sans">Our Journey</h2>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-start space-x-6"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm font-sans">{milestone.year}</span>
                  </div>
                </div>
                <div 
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0px 1px 12px rgba(3,3,3,0.08)',
                    padding: '24px',
                    flex: 1
                  }}
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">{milestone.title}</h3>
                  <p className="text-gray-600 font-sans">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container mx-auto px-9 mb-16">
        <div 
          style={{
            backgroundColor: '#3b82f6',
            borderRadius: '20px',
            padding: '48px 32px'
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6 font-sans">Get in Touch</h2>
              <p className="text-white text-lg mb-6 font-sans opacity-90">
                Have questions about our platform or need help planning your wedding? 
                We're here to help make your special day perfect.
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-white">
                  <Mail className="w-5 h-5 mr-3" />
                  <span className="font-sans">hello@enosi.com.au</span>
                </div>
                <div className="flex items-center text-white">
                  <Phone className="w-5 h-5 mr-3" />
                  <span className="font-sans">1800 ENOSI (1800 366 741)</span>
                </div>
                <div className="flex items-center text-white">
                  <MapPin className="w-5 h-5 mr-3" />
                  <span className="font-sans">Sydney, Melbourne, Brisbane, Perth</span>
                </div>
              </div>
            </div>
            <div>
              <div 
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '32px'
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2 font-sans">Your Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white font-sans"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2 font-sans">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white font-sans"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2 font-sans">Message</label>
                    <textarea 
                      rows="4"
                      className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white font-sans resize-none"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  <button className="w-full bg-white text-blue-500 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-sans font-medium">
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-9 mb-12">
        <div 
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '20px',
            padding: '48px 32px',
            textAlign: 'center'
          }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-sans">
            Ready to Start Your Wedding Journey?
          </h2>
          <p className="text-gray-600 text-lg mb-8 font-sans">
            Join thousands of couples who have found their perfect wedding vendors through Enosi
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/search')}
              className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors font-sans font-medium"
            >
              Find Wedding Vendors
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="border-2 border-blue-500 text-blue-500 px-8 py-3 rounded-full hover:bg-blue-500 hover:text-white transition-colors font-sans font-medium"
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

export default AboutPage;