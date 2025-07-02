import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../hooks/useOnboarding';
import CouplesOnboarding from './CouplesOnboarding';

const OnboardingWrapper = ({ children }) => {
  let navigate;
  
  try {
    navigate = useNavigate();
  } catch (error) {
    console.warn('useNavigate failed, using fallback navigation:', error);
    navigate = (path) => {
      window.location.href = path;
    };
  }

  let onboardingHookResult;
  try {
    onboardingHookResult = useOnboarding();
  } catch (error) {
    console.error('useOnboarding hook failed:', error);
    return children; // Return children without onboarding if hook fails
  }

  const { 
    shouldShowOnboarding, 
    completeOnboarding, 
    skipOnboarding,
    getPersonalizedFilters 
  } = onboardingHookResult;
  
  console.log('OnboardingWrapper rendered, shouldShowOnboarding:', shouldShowOnboarding);

  const handleOnboardingComplete = (data) => {
    console.log('Onboarding completed with data:', data);
    completeOnboarding(data);
    
    // Clear test user flags
    const testUserId = 'test-user-123';
    localStorage.setItem(`onboarding_completed_${testUserId}`, 'true');
    localStorage.removeItem(`new_user_${testUserId}`);
    
    // Redirect based on onboarding data
    try {
      const filters = getPersonalizedFilters();
      
      if (filters.preferredCategories && filters.preferredCategories.length > 0) {
        // Redirect to search with personalized filters
        const searchParams = new URLSearchParams();
        if (filters.location) searchParams.set('location', filters.location);
        if (filters.preferredCategories[0]) searchParams.set('category', filters.preferredCategories[0]);
        
        navigate(`/search?${searchParams.toString()}`);
      } else {
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error in redirect after onboarding:', error);
      // Fallback to home page
      navigate('/');
    }
  };

  const handleOnboardingSkip = () => {
    console.log('Onboarding skipped');
    skipOnboarding();
    
    // Clear test user flags
    const testUserId = 'test-user-123';
    localStorage.setItem(`onboarding_completed_${testUserId}`, 'true');
    localStorage.removeItem(`new_user_${testUserId}`);
    
    try {
      navigate('/dashboard');
    } catch (error) {
      console.error('Error in redirect after skip:', error);
      navigate('/');
    }
  };

  return (
    <>
      {children}
      {shouldShowOnboarding && (
        <CouplesOnboarding 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </>
  );
};

export default OnboardingWrapper;