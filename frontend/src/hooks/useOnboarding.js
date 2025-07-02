import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useOnboarding = () => {
  let authHookResult;
  
  try {
    authHookResult = useAuth();
  } catch (error) {
    console.error('useAuth failed in useOnboarding:', error);
    // Return a default state if auth hook fails
    return {
      shouldShowOnboarding: false,
      onboardingData: null,
      completeOnboarding: () => {},
      skipOnboarding: () => {},
      markAsNewUser: () => {},
      getPersonalizedFilters: () => ({}),
      getPersonalizedMessage: () => null,
      getRecommendedActions: () => []
    };
  }

  const { user, isAuthenticated } = authHookResult;
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);

  useEffect(() => {
    try {
      if (isAuthenticated && user && user.user_type === 'couple') {
        console.log('useOnboarding useEffect triggered for couple user:', user.id);
        checkOnboardingStatus();
      }
    } catch (error) {
      console.error('Error in useOnboarding useEffect:', error);
    }
  }, [isAuthenticated, user]);

  const checkOnboardingStatus = () => {
    try {
      if (!user?.id) return;

      console.log('Checking onboarding status for user:', user.id);
      
      // Check if onboarding has been completed
      const onboardingCompleted = localStorage.getItem(`onboarding_completed_${user.id}`);
      console.log('onboarding_completed flag:', onboardingCompleted);
      
      // Check if this is a new user (just signed up)
      const isNewUser = localStorage.getItem(`new_user_${user.id}`);
      console.log('new_user flag:', isNewUser);
      
      if (!onboardingCompleted && isNewUser) {
        console.log('Setting shouldShowOnboarding to true');
        setShouldShowOnboarding(true);
        // Clear the new user flag after checking
        localStorage.removeItem(`new_user_${user.id}`);
        console.log('Cleared new_user flag');
      } else {
        console.log('Not showing onboarding modal. onboardingCompleted:', onboardingCompleted, 'isNewUser:', isNewUser);
      }

      // Load existing onboarding data if available
      const existingData = localStorage.getItem(`onboarding_data_${user.id}`);
      if (existingData) {
        setOnboardingData(JSON.parse(existingData));
      }
    } catch (error) {
      console.error('Error in checkOnboardingStatus:', error);
    }
  };

  const markAsNewUser = (userId) => {
    // This should be called when a new couple account is created
    console.log('useOnboarding.markAsNewUser called with userId:', userId);
    localStorage.setItem(`new_user_${userId}`, 'true');
    console.log('new_user flag set in localStorage:', localStorage.getItem(`new_user_${userId}`));
  };

  const completeOnboarding = (data) => {
    setShouldShowOnboarding(false);
    setOnboardingData(data);
    
    // Mark onboarding as completed
    if (user?.id) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
      localStorage.setItem(`onboarding_data_${user.id}`, JSON.stringify(data));
    }
  };

  const skipOnboarding = () => {
    setShouldShowOnboarding(false);
    
    // Mark onboarding as completed even if skipped
    if (user?.id) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
  };

  const getPersonalizedFilters = () => {
    if (!onboardingData) return {};

    const filters = {};

    // Set location filter
    if (onboardingData.wedding_location) {
      filters.location = onboardingData.wedding_location;
    }

    // Set vendor type filter based on needs
    if (onboardingData.vendor_categories && onboardingData.vendor_categories.length > 0) {
      filters.preferredCategories = onboardingData.vendor_categories;
    }

    // Set budget filter
    if (onboardingData.budget_range) {
      filters.budgetRange = onboardingData.budget_range;
      filters.budgetType = onboardingData.budget_type;
    }

    return filters;
  };

  const getPersonalizedMessage = () => {
    if (!onboardingData) return null;

    const { partner1_name, partner2_name, wedding_location, vendor_categories, budget_range } = onboardingData;
    
    const names = [partner1_name, partner2_name].filter(Boolean).join(' & ');
    
    if (vendor_categories && vendor_categories.length > 0 && wedding_location && budget_range) {
      const vendorText = vendor_categories.length === 1 
        ? `a ${vendor_categories[0]}`
        : `vendors like ${vendor_categories.slice(0, 2).join(' and ')}`;
      
      return `Hi ${names}! Looking for ${vendorText} in ${wedding_location} within your ${budget_range} budget?`;
    }

    if (names && wedding_location) {
      return `Welcome back ${names}! Ready to find amazing vendors for your ${wedding_location} wedding?`;
    }

    return `Welcome back! Ready to continue planning your dream wedding?`;
  };

  const getRecommendedActions = () => {
    if (!onboardingData) return [];

    const actions = [];
    const { vendor_categories, planning_progress, wedding_date, wedding_timeframe } = onboardingData;

    // Suggest based on planning progress
    if (planning_progress === 'just_browsing') {
      actions.push({
        title: 'Start with venue search',
        description: 'Find the perfect setting for your special day',
        action: 'search',
        filter: { vendorType: 'venue' }
      });
    }

    // Suggest based on needed vendors
    if (vendor_categories && vendor_categories.length > 0) {
      const priority = ['venue', 'photographer', 'catering', 'florist'];
      const nextVendor = priority.find(p => vendor_categories.includes(p));
      
      if (nextVendor) {
        actions.push({
          title: `Find your ${nextVendor}`,
          description: 'Browse top-rated vendors in your area',
          action: 'search',
          filter: { vendorType: nextVendor }
        });
      }
    }

    // Time-sensitive suggestions
    if (wedding_date || wedding_timeframe === 'Next 3 months') {
      actions.push({
        title: 'Create your timeline',
        description: 'Stay organized with our wedding checklist',
        action: 'checklist'
      });
    }

    return actions.slice(0, 3); // Return top 3 recommendations
  };

  return {
    shouldShowOnboarding,
    onboardingData,
    completeOnboarding,
    skipOnboarding,
    markAsNewUser,
    getPersonalizedFilters,
    getPersonalizedMessage,
    getRecommendedActions
  };
};

export default useOnboarding;