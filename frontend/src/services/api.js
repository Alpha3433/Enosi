import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL + '/api';

// Native cookie management function
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

const removeCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = getCookie('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      removeCookie('auth_token');
      removeCookie('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  getMe: () => 
    api.get('/users/me'),
};

// Vendors API
export const vendorsAPI = {
  search: (params) => 
    api.get('/vendors', { params }),
  
  getById: (vendorId) => 
    api.get(`/vendors/${vendorId}`),
  
  createProfile: (profileData) => 
    api.post('/vendors/profile', profileData),
  
  getProfile: () => 
    api.get('/vendors/profile'),
  
  updateProfile: (profileData) => 
    api.put('/vendors/profile', profileData),
};

// Couples API
export const couplesAPI = {
  getProfile: () => 
    api.get('/couples/profile'),
  
  updateProfile: (profileData) => 
    api.put('/couples/profile', profileData),
};

// Quotes API
export const quotesAPI = {
  createRequest: (quoteData) => 
    api.post('/quotes/request', quoteData),
  
  getRequests: () => 
    api.get('/quotes/requests'),
};

// Planning Tools API
export const planningAPI = {
  // Budget
  createBudgetItem: (itemData) => 
    api.post('/planning/budget', itemData),
  
  getBudgetItems: () => 
    api.get('/planning/budget'),
  
  // Checklist
  createChecklistItem: (itemData) => 
    api.post('/planning/checklist', itemData),
  
  getChecklistItems: () => 
    api.get('/planning/checklist'),
  
  updateChecklistItem: (itemId, itemData) => 
    api.put(`/planning/checklist/${itemId}`, itemData),
};

export default api;