import React from 'react';
import ReactDOM from 'react-dom/client';
import SimpleRegistrationTest from './pages/SimpleRegistrationTest';
import './index.css';

// Create a standalone test page that doesn't use React Router
const TestApp = () => {
  return (
    <div className="App">
      <SimpleRegistrationTest />
    </div>
  );
};

// Only render the test page if we're on the test-registration route
if (window.location.pathname === '/test-registration') {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <TestApp />
    </React.StrictMode>
  );
}