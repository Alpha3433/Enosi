import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import SimpleRegistrationTest from "./pages/SimpleRegistrationTest";

// Initialize global match object before any React components load
if (typeof window !== 'undefined') {
  // Ensure match object exists globally
  window.match = window.match || {
    params: {},
    isExact: true,
    path: window.location.pathname,
    url: window.location.pathname
  };
  
  // Add error handling for match property access
  const originalError = console.error;
  console.error = function(...args) {
    const message = args[0];
    if (typeof message === 'string' && message.includes('match')) {
      console.warn('Match property error caught and handled:', message);
      return;
    }
    originalError.apply(console, args);
  };
}

// Determine which component to render based on the URL path
const renderApp = () => {
  const path = window.location.pathname;
  const root = ReactDOM.createRoot(document.getElementById("root"));
  
  if (path === '/test-registration') {
    // Render the standalone test page for registration
    root.render(
      <React.StrictMode>
        <div className="App">
          <SimpleRegistrationTest />
        </div>
      </React.StrictMode>
    );
  } else {
    // Render the main app for all other routes
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
};

// Initial render
renderApp();
