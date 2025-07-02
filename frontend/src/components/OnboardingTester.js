import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CouplesOnboarding from '../components/CouplesOnboarding';

const OnboardingTester = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useAuth();

  const handleTriggerOnboarding = () => {
    // Simulate a new user
    if (user?.id) {
      localStorage.setItem(`new_user_${user.id}`, 'true');
      localStorage.removeItem(`onboarding_completed_${user.id}`);
    }
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = (data) => {
    console.log('Onboarding completed with data:', data);
    setShowOnboarding(false);
    
    // Store data
    if (user?.id) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
      localStorage.setItem(`onboarding_data_${user.id}`, JSON.stringify(data));
    }
  };

  const handleOnboardingSkip = () => {
    console.log('Onboarding skipped');
    setShowOnboarding(false);
    
    if (user?.id) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
  };

  const clearOnboardingData = () => {
    if (user?.id) {
      localStorage.removeItem(`new_user_${user.id}`);
      localStorage.removeItem(`onboarding_completed_${user.id}`);
      localStorage.removeItem(`onboarding_data_${user.id}`);
    }
    alert('Onboarding data cleared!');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Onboarding Tester</h2>
      
      <div className="space-y-3">
        <button 
          onClick={handleTriggerOnboarding}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Trigger Onboarding
        </button>
        
        <button 
          onClick={clearOnboardingData}
          className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear Onboarding Data
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <h3 className="font-semibold">LocalStorage Status:</h3>
        {user?.id ? (
          <ul className="mt-2 space-y-1">
            <li>New User: {localStorage.getItem(`new_user_${user.id}`) || 'false'}</li>
            <li>Completed: {localStorage.getItem(`onboarding_completed_${user.id}`) || 'false'}</li>
            <li>Has Data: {localStorage.getItem(`onboarding_data_${user.id}`) ? 'true' : 'false'}</li>
          </ul>
        ) : (
          <p>No user logged in</p>
        )}
      </div>

      {showOnboarding && (
        <CouplesOnboarding 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </div>
  );
};

export default OnboardingTester;