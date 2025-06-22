import React from 'react';

class RouterErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    
    // Set up global match object immediately
    if (typeof window !== 'undefined' && !window.match) {
      window.match = {
        params: {},
        isExact: true,
        path: window.location.pathname,
        url: window.location.pathname
      };
      console.log('Created global fallback match object on initialization');
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Router Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
    
    // Check if it's the specific match property error
    if (error.message && error.message.includes('match')) {
      console.error('This appears to be a React Router v5 to v7 compatibility issue');
      console.error('Error details:', error.stack);
      
      // Try to recover by setting up a global match object
      if (typeof window !== 'undefined') {
        window.match = {
          params: {},
          isExact: true,
          path: window.location.pathname,
          url: window.location.pathname
        };
        console.log('Created global fallback match object:', window.match);
        
        // Try to reload the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fee', 
          border: '1px solid #f00',
          margin: '20px',
          borderRadius: '8px'
        }}>
          <h2>Something went wrong with routing.</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>Error Details (click to expand)</summary>
            <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
            <p><strong>Stack:</strong> {this.state.errorInfo.componentStack}</p>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouterErrorBoundary;

export default RouterErrorBoundary;