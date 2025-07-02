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
    completeOnboarding(data);
    
    // Redirect based on onboarding data
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
  };

  const handleOnboardingSkip = () => {
    skipOnboarding();
    navigate('/dashboard');
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