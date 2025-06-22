// This script adds a global polyfill for React Router v5 match property
// It should be included before the main application code

(function() {
  // Create a global match object that will be available to all components
  if (typeof window !== 'undefined') {
    // Extract params from URL
    const getParamsFromPath = () => {
      const path = window.location.pathname;
      const segments = path.split('/').filter(Boolean);
      
      // Simple param extraction for common patterns
      const params = {};
      
      // Handle vendor ID in /vendors/:vendorId
      if (segments[0] === 'vendors' && segments.length > 1) {
        params.vendorId = segments[1];
      }
      
      // Handle booking payment in /booking/payment/:vendorId
      if (segments[0] === 'booking' && segments[1] === 'payment' && segments.length > 2) {
        params.vendorId = segments[2];
      }
      
      return params;
    };
    
    // Create the match object
    window.match = {
      params: getParamsFromPath(),
      isExact: true,
      path: window.location.pathname,
      url: window.location.pathname
    };
    
    console.log('React Router v5 compatibility layer initialized');
    console.log('Created global match object:', window.match);
    
    // Update match object on navigation
    const pushState = window.history.pushState;
    window.history.pushState = function() {
      pushState.apply(window.history, arguments);
      
      // Update match object after navigation
      window.match = {
        params: getParamsFromPath(),
        isExact: true,
        path: window.location.pathname,
        url: window.location.pathname
      };
      
      console.log('Updated global match object after navigation:', window.match);
    };
  }
})();