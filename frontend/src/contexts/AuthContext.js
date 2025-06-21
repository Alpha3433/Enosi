import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

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
    const storedToken = Cookies.get('auth_token');
    const storedUser = Cookies.get('user_data');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    Cookies.set('auth_token', authToken, { expires: 1 }); // 1 day
    Cookies.set('user_data', JSON.stringify(userData), { expires: 1 });
  };

  const updateUserProfileStatus = (profileComplete) => {
    if (user) {
      const updatedUser = { ...user, profile_setup_complete: profileComplete };
      setUser(updatedUser);
      Cookies.set('user_data', JSON.stringify(updatedUser), { expires: 1 });
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
    Cookies.remove('auth_token');
    Cookies.remove('user_data');
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