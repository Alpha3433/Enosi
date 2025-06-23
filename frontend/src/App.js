import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
// import 'react-image-lightbox/style.css';

// Import pages
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import VendorDetailPage from './pages/VendorDetailPage';
import GalleryPage from './pages/GalleryPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import PlanningToolsPage from './pages/PlanningToolsPage';
import BudgetTrackerPage from './pages/BudgetTrackerPage';
import ChecklistPage from './pages/ChecklistPage';
import TimelinePage from './pages/TimelinePage';
import GuestListPage from './pages/GuestListPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboard';
import VendorSubscription from './pages/VendorSubscription';
import PaymentSuccess from './pages/PaymentSuccess';
import AdvancedPlanningPage from './pages/AdvancedPlanningPage';
import VendorCalendarPage from './pages/VendorCalendarPage';
import WishlistPage from './pages/WishlistPage';
import MediaManagerPage from './pages/MediaManagerPage';
import ChatPage from './pages/ChatPage';
import VendorSubscriptionPage from './pages/VendorSubscriptionPage';
import BookingPaymentPage from './pages/BookingPaymentPage';
import SimpleRegistrationTest from './pages/SimpleRegistrationTest';
import BudgetPlannerPage from './pages/BudgetPlannerPage';
import WeddingChecklistPage from './pages/WeddingChecklistPage';
import GuestListManagerPage from './pages/GuestListManagerPage';
import TestBudgetPage from './pages/TestBudgetPage';

import RouterErrorBoundary from './components/RouterErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import withRouterCompat from './utils/routerCompat';

// Wrap components that might use match with the compatibility wrapper
const WrappedVendorDetailPage = withRouterCompat(VendorDetailPage);
const WrappedGalleryPage = withRouterCompat(GalleryPage);
const WrappedBookingPaymentPage = withRouterCompat(BookingPaymentPage);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Global match object for compatibility
if (typeof window !== 'undefined') {
  window.match = {
    params: {},
    isExact: true,
    path: window.location.pathname,
    url: window.location.pathname
  };
  
  // Monkey patch initStripe to handle missing match
  const originalInitStripe = window.initStripe;
  if (typeof originalInitStripe === 'function') {
    window.initStripe = function(...args) {
      try {
        return originalInitStripe(...args);
      } catch (error) {
        console.error('Error in initStripe:', error);
        return null;
      }
    };
  }
  
  // Create a global useParams mock for compatibility
  window.mockParams = {};
}

function App() {
  // Set up global match object on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.match = {
        params: {},
        isExact: true,
        path: window.location.pathname,
        url: window.location.pathname
      };
      console.log('Created global match object in App component');
      
      // Set up mock params for useParams compatibility
      window.mockParams = {};
      console.log('Created mockParams for useParams compatibility');
      
      // Monkey patch initStripe to handle missing match
      const originalInitStripe = window.initStripe;
      if (typeof originalInitStripe === 'function') {
        window.initStripe = function(...args) {
          try {
            // Create a mock match object if needed
            if (!window.match) {
              window.match = {
                params: {},
                isExact: true,
                path: window.location.pathname,
                url: window.location.pathname
              };
            }
            return originalInitStripe(...args);
          } catch (error) {
            console.error('Error in initStripe:', error);
            return null;
          }
        };
        console.log('Monkey patched initStripe function');
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="App">
          <RouterErrorBoundary>
            <BrowserRouter>
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/vendors/:vendorId" element={<WrappedVendorDetailPage />} />
              <Route path="/vendors/:vendorId/gallery" element={<WrappedGalleryPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/test-registration" element={<SimpleRegistrationTest />} />

              <Route path="/test-budget" element={<TestBudgetPage />} />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute userType="admin">
                  <AdminDashboardPage />
                </ProtectedRoute>
              } />
              
              {/* Protected routes for couples */}
              <Route path="/dashboard" element={
                <ProtectedRoute userType="couple">
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/planning" element={
                <ProtectedRoute userType="couple">
                  <PlanningToolsPage />
                </ProtectedRoute>
              } />
              <Route path="/planning/budget" element={
                <ProtectedRoute userType="couple">
                  <BudgetPlannerPage />
                </ProtectedRoute>
              } />
              <Route path="/planning/checklist" element={
                <ProtectedRoute userType="couple">
                  <WeddingChecklistPage />
                </ProtectedRoute>
              } />
              <Route path="/planning/guest-list" element={
                <ProtectedRoute userType="couple">
                  <GuestListManagerPage />
                </ProtectedRoute>
              } />
              <Route path="/planning/advanced" element={
                <ProtectedRoute userType="couple">
                  <AdvancedPlanningPage />
                </ProtectedRoute>
              } />
              <Route path="/planning/budget" element={
                <ProtectedRoute userType="couple">
                  <BudgetTrackerPage />
                </ProtectedRoute>
              } />
              <Route path="/planning/checklist" element={
                <ProtectedRoute userType="couple">
                  <ChecklistPage />
                </ProtectedRoute>
              } />
              <Route path="/planning/timeline" element={
                <ProtectedRoute userType="couple">
                  <TimelinePage />
                </ProtectedRoute>
              } />
              <Route path="/planning/guests" element={
                <ProtectedRoute userType="couple">
                  <GuestListPage />
                </ProtectedRoute>
              } />
              <Route path="/wishlist" element={
                <ProtectedRoute userType="couple">
                  <WishlistPage />
                </ProtectedRoute>
              } />
              <Route path="/media" element={
                <ProtectedRoute>
                  <MediaManagerPage />
                </ProtectedRoute>
              } />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />
              <Route path="/vendor/subscription" element={
                <ProtectedRoute userType="vendor">
                  <VendorSubscriptionPage />
                </ProtectedRoute>
              } />
              <Route path="/booking/payment/:vendorId" element={
                <ProtectedRoute userType="couple">
                  <WrappedBookingPaymentPage />
                </ProtectedRoute>
              } />
              
              {/* Protected routes for vendors */}
              <Route path="/vendor-dashboard" element={
                <ProtectedRoute userType="vendor">
                  <VendorDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/vendor-calendar" element={
                <ProtectedRoute userType="vendor">
                  <VendorCalendarPage />
                </ProtectedRoute>
              } />
              <Route path="/vendor-subscription" element={
                <ProtectedRoute userType="vendor">
                  <VendorSubscriptionPage />
                </ProtectedRoute>
              } />
              
              {/* Protected routes for admins */}
              <Route path="/admin" element={
                <ProtectedRoute userType="admin">
                  <AdminDashboardPage />
                </ProtectedRoute>
              } />
              
              {/* Payment success page */}
              <Route path="/payment-success" element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              } />
              
              {/* Protected routes for all users */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          </RouterErrorBoundary>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
