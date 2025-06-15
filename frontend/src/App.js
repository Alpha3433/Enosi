import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';

// Import pages
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import EnhancedSearchPage from './pages/EnhancedSearchPage';
import VendorDetailPage from './pages/VendorDetailPage';
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
import AdminDashboard from './pages/AdminDashboard';
import VendorSubscription from './pages/VendorSubscription';
import PaymentSuccess from './pages/PaymentSuccess';
import AdvancedPlanningPage from './pages/AdvancedPlanningPage';
import VendorCalendarPage from './pages/VendorCalendarPage';
import WishlistPage from './pages/WishlistPage';
import MediaManagerPage from './pages/MediaManagerPage';
import ChatPage from './pages/ChatPage';
import VendorSubscriptionPage from './pages/VendorSubscriptionPage';
import BookingPaymentPage from './pages/BookingPaymentPage';
import ProtectedRoute from './components/ProtectedRoute';

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
        <div className="App">
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/search/enhanced" element={<EnhancedSearchPage />} />
              <Route path="/vendors/:vendorId" element={<VendorDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              
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
              <Route path="/vendor-subscription" element={
                <ProtectedRoute userType="vendor">
                  <VendorSubscription />
                </ProtectedRoute>
              } />
              <Route path="/vendor-calendar" element={
                <ProtectedRoute userType="vendor">
                  <VendorCalendarPage />
                </ProtectedRoute>
              } />
              
              {/* Protected routes for admins */}
              <Route path="/admin" element={
                <ProtectedRoute userType="admin">
                  <AdminDashboard />
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
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;