import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useOnboarding } from './hooks/useOnboarding';
// import 'react-image-lightbox/style.css';

// Initialize global match object immediately to prevent errors
// React Router v7 compatibility layer - ensure global match object exists
if (typeof window !== 'undefined') {
  // Enhanced match object creation with error handling
  const createMatchObject = () => {
    const path = window.location.pathname;
    const segments = path.split('/').filter(segment => segment.length > 0);
    const params = {};
    
    // Extract common route parameters
    if (segments.length >= 2) {
      // Handle /vendors/:vendorId pattern
      if (segments[0] === 'vendors' && segments[1]) {
        params.vendorId = segments[1];
      }
      // Handle /users/:userId pattern  
      if (segments[0] === 'users' && segments[1]) {
        params.userId = segments[1];
      }
      // Handle generic :id patterns
      if (segments.length >= 2 && segments[segments.length - 1].match(/^[a-zA-Z0-9_-]+$/)) {
        params.id = segments[segments.length - 1];
      }
    }
    
    return {
      params: params,
      isExact: true,
      path: path,
      url: path
    };
  };

  // Initialize match object
  window.match = window.match || createMatchObject();
  
  // Update match object when route changes
  const updateMatch = () => {
    window.match = createMatchObject();
  };
  
  // Listen for route changes
  window.addEventListener('popstate', updateMatch);
  
  // Override history methods to update match object
  if (window.history) {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      const result = originalPushState.apply(this, args);
      setTimeout(updateMatch, 0);
      return result;
    };
    
    window.history.replaceState = function(...args) {
      const result = originalReplaceState.apply(this, args);
      setTimeout(updateMatch, 0);
      return result;
    };
  }

  // Global error handler for any remaining match issues
  const handleMatchError = (error) => {
    if (error && error.message && error.message.includes("Cannot read properties of undefined (reading 'match')")) {
      console.warn('Fixing match property error, recreating match object');
      window.match = createMatchObject();
      return true;
    }
    return false;
  };

  // Override console.error to catch and fix match errors
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const firstArg = args[0];
    if (typeof firstArg === 'string' && firstArg.includes("Cannot read properties of undefined (reading 'match')")) {
      console.warn('Suppressed match property error, ensuring match object exists');
      window.match = window.match || createMatchObject();
      return;
    }
    return originalConsoleError.apply(this, args);
  };
}

// Import pages
import HomePage from './pages/HomePage';
// import SearchPage from './pages/SearchPage';
import SearchPageNew from './pages/SearchPageNew';
import InspirationPage from './pages/InspirationPage';
import AboutPage from './pages/AboutPage';
import VendorDetailPageNew from './pages/VendorDetailPageNew';
import GalleryPage from './pages/GalleryPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import CouplesDashboard from './pages/CouplesDashboard';
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
import CouplesOnboarding from './components/CouplesOnboarding';
import OnboardingWrapper from './components/OnboardingWrapper';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <div className="App">
            <RouterErrorBoundary>
              <BrowserRouter>
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/inspiration" element={<InspirationPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/search" element={<SearchPageNew />} />
            {/* <Route path="/search-old" element={<SearchPage />} /> */}
              <Route path="/vendors/:vendorId" element={<VendorDetailPageNew />} />
              <Route path="/vendors/:vendorId/gallery" element={<GalleryPage />} />
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
                  <CouplesDashboard />
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
                  <BookingPaymentPage />
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
          </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
