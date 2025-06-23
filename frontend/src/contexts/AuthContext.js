import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Native cookie management functions
const cookieUtils = {
  set: (name, value, days = 1) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  },
  
  get: (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  },
  
  remove: (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = cookieUtils.get('auth_token');
    const storedUser = cookieUtils.get('user_data');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        cookieUtils.remove('auth_token');
        cookieUtils.remove('user_data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData, authToken) => {
    console.log('AuthContext: Storing authentication data', { userData, authToken });
    setUser(userData);
    setToken(authToken);
    cookieUtils.set('auth_token', authToken, 1); // 1 day
    cookieUtils.set('user_data', JSON.stringify(userData), 1);
    console.log('AuthContext: Authentication data stored successfully');
  };

  const updateUserProfileStatus = (profileComplete) => {
    if (user) {
      const updatedUser = { ...user, profile_setup_complete: profileComplete };
      setUser(updatedUser);
      cookieUtils.set('user_data', JSON.stringify(updatedUser), 1);
    }
  };

  const getDefaultRedirectPath = () => {
    if (!user) return '/';
    
    // For vendors, check if profile setup is complete
    if (user.user_type === 'vendor') {
      if (!user.profile_setup_complete) {
        return '/vendor-profile-setup';
      }
      return '/vendor-dashboard';
    }
    
    // For couples
    if (user.user_type === 'couple') {
      return '/dashboard';
    }
    
    // For admin
    if (user.user_type === 'admin') {
      return '/admin';
    }
    
    return '/';
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    cookieUtils.remove('auth_token');
    cookieUtils.remove('user_data');
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    updateUserProfileStatus,
    getDefaultRedirectPath,
    isAuthenticated: !!user,
    isCouple: user?.user_type === 'couple',
    isVendor: user?.user_type === 'vendor',
    isAdmin: user?.user_type === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};