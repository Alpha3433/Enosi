import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

// Compatibility wrapper for React Router v7
// This component provides React Router v5-style props for backward compatibility
const withRouterCompat = (Component) => {
  return (props) => {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Create a match-like object for backward compatibility
    const match = {
      params,
      isExact: true,
      path: location.pathname,
      url: location.pathname
    };
    
    // Create history-like object for backward compatibility
    const history = {
      push: (path) => navigate(path),
      replace: (path) => navigate(path, { replace: true }),
      go: (delta) => window.history.go(delta),
      goBack: () => window.history.back(),
      goForward: () => window.history.forward(),
      location
    };
    
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