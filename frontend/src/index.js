import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import SimpleRegistrationTest from "./pages/SimpleRegistrationTest";

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
