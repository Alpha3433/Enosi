import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Standalone component that doesn't rely on React Router
const SimpleRegistrationTest = () => {
  const [formData, setFormData] = useState({
    email: 'simple-test@example.com',
    password: 'Password123!',
    first_name: 'Simple',
    last_name: 'Test',
    phone: '1234567890',
    user_type: 'vendor'
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendUrl, setBackendUrl] = useState('');

  useEffect(() => {
    // Get the backend URL from environment variables
    const apiBaseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
    setBackendUrl(apiBaseUrl);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('Submitting registration to:', `${backendUrl}/api/auth/register`);
      console.log('Form data:', formData);
      
      const response = await axios.post(`${backendUrl}/api/auth/register`, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Registration response:', response.data);
      setMessage(`Registration successful! User ID: ${response.data.id}`);
      
      // Try to login
      console.log('Attempting login with:', formData.email);
      const loginResponse = await axios.post(`${backendUrl}/api/auth/login`, {
        email: formData.email,
        password: formData.password
      });
      
      console.log('Login response:', loginResponse.data);
      setMessage(prev => prev + `\nLogin successful! Token: ${loginResponse.data.access_token.substring(0, 20)}...`);
      
    } catch (error) {
      console.error('Registration/login error:', error);
      setMessage(`Error: ${error.response?.data?.detail || error.message || 'Registration failed'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Simple Registration Test</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ padding: '8px', border: '1px solid #ccc' }}
        />
        
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ padding: '8px', border: '1px solid #ccc' }}
        />
        
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
          style={{ padding: '8px', border: '1px solid #ccc' }}
        />
        
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          required
          style={{ padding: '8px', border: '1px solid #ccc' }}
        />
        
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          style={{ padding: '8px', border: '1px solid #ccc' }}
        />
        
        <select
          name="user_type"
          value={formData.user_type}
          onChange={handleChange}
          style={{ padding: '8px', border: '1px solid #ccc' }}
        >
          <option value="couple">Couple</option>
          <option value="vendor">Vendor</option>
        </select>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px', 
            backgroundColor: '#e11d48', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      {message && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          border: '1px solid #ccc', 
          backgroundColor: message.includes('Error') ? '#fee' : '#efe',
          whiteSpace: 'pre-line'
        }}>
          {message}
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>Backend URL: {backendUrl}</p>
        <p>This is a simple test page to verify registration functionality works.</p>
      </div>
    </div>
  );
};

export default SimpleRegistrationTest;