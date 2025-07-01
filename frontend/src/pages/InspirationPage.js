import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from '../components/NotificationDropdown';

const InspirationPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-linen font-sans" style={{ zoom: 0.9 }}>
      {/* Header - Same as landing page */}
      <header className="bg-white">
        <div className="container mx-auto px-9 py-5 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="text-xl font-bold font-sans text-millbrook"
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
          
          <nav className="hidden md:flex space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <button onClick={() => navigate('/search')} className="text-sm hover:text-cement transition-colors font-sans text-millbrook font-medium">
              Find Vendors
            </button>
            <button onClick={() => navigate('/inspiration')} className="text-sm text-cement font-sans font-medium">
              Inspiration
            </button>
            <button onClick={() => navigate('/about')} className="text-sm hover:text-cement transition-colors font-sans text-millbrook font-medium">
              About Us
            </button>
          </nav>

          <div className="flex space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <NotificationDropdown />
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-kabul hover:text-millbrook transition-colors">
                    <span className="text-sm font-sans">{user?.first_name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-coral-reef opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
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

      {/* Main Content */}
      <div className="container mx-auto px-9 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 font-sans">Wedding Inspiration</h1>
          <p className="text-lg text-gray-600 mb-8 font-sans">
            Discover beautiful ideas and real weddings to inspire your special day
          </p>
          <button 
            onClick={() => navigate('/search')}
            className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors font-sans"
          >
            Find Wedding Vendors
          </button>
        </div>
      </div>

      {/* Footer - Simple version */}
      <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-9">
          <div className="text-center">
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