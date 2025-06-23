import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

// Compatibility wrapper for React Router v7
// This component provides React Router v5-style props for backward compatibility
const withRouterCompat = (Component) => {
  return (props) => {
    let params = {};
    try {
      params = useParams();
      // Store params in window for global access if needed
      if (typeof window !== 'undefined') {
        window.mockParams = params;
      }
    } catch (error) {
      console.error('Error using useParams:', error);
      // Use global mockParams as fallback
      if (typeof window !== 'undefined' && window.mockParams) {
        params = window.mockParams;
      }
    }
    
    let location = {};
    try {
      location = useLocation();
    } catch (error) {
      console.error('Error using useLocation:', error);
      location = {
        pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
        search: typeof window !== 'undefined' ? window.location.search : '',
        hash: typeof window !== 'undefined' ? window.location.hash : ''
      };
    }
    
    let navigate = () => {};
    try {
      navigate = useNavigate();
    } catch (error) {
      console.error('Error using useNavigate:', error);
      navigate = (path) => {
        if (typeof window !== 'undefined') {
          window.location.href = path;
        }
      };
    }
    
    // Create a match-like object for backward compatibility
    const match = {
      params,
      isExact: true,
      path: location.pathname,
      url: location.pathname
    };
    
    // Create history-like object for backward compatibility
    const history = {
      push: (path) => {
        try {
          navigate(path);
        } catch (error) {
          console.error('Error navigating:', error);
          if (typeof window !== 'undefined') {
            window.location.href = path;
          }
        }
      },
      replace: (path) => {
        try {
          navigate(path, { replace: true });
        } catch (error) {
          console.error('Error navigating (replace):', error);
          if (typeof window !== 'undefined') {
            window.location.replace(path);
          }
        }
      },
      go: (delta) => {
        if (typeof window !== 'undefined') {
          window.history.go(delta);
        }
      },
      goBack: () => {
        if (typeof window !== 'undefined') {
          window.history.back();
        }
      },
      goForward: () => {
        if (typeof window !== 'undefined') {
          window.history.forward();
        }
      },
      location
    };
    
    // Set global match object for compatibility
    if (typeof window !== 'undefined') {
      window.match = match;
    }
    
    return (
      <Component 
        {...props} 
        match={match} 
        history={history} 
        location={location}
        params={params}
      />
    );
  };
};

export default withRouterCompat;