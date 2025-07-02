import React, { useState, useEffect } from 'react';
import CouplesOnboarding from '../components/CouplesOnboarding';

const TestOnboardingPage = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);
  const [userId, setUserId] = useState('test-user-123');
  
  // Set up test localStorage values
  useEffect(() => {
    console.log('Setting up test localStorage values');
    localStorage.setItem(`new_user_${userId}`, 'true');
    console.log('new_user flag set:', localStorage.getItem(`new_user_${userId}`));
    
    // Check if onboarding is already completed
    const onboardingCompleted = localStorage.getItem(`onboarding_completed_${userId}`);
    console.log('onboarding_completed flag:', onboardingCompleted);
    
    if (!onboardingCompleted) {
      console.log('Showing onboarding modal');
      setShowOnboarding(true);
    }
  }, [userId]);
  
  const handleComplete = (data) => {
    console.log('Onboarding completed with data:', data);
    setOnboardingData(data);
    setShowOnboarding(false);
    localStorage.setItem(`onboarding_completed_${userId}`, 'true');
    localStorage.setItem(`onboarding_data_${userId}`, JSON.stringify(data));
  };
  
  const handleSkip = () => {
    console.log('Onboarding skipped');
    setShowOnboarding(false);
    localStorage.setItem(`onboarding_completed_${userId}`, 'true');
  };
  
  const resetOnboarding = () => {
    console.log('Resetting onboarding');
    localStorage.removeItem(`onboarding_completed_${userId}`);
    localStorage.removeItem(`onboarding_data_${userId}`);
    localStorage.setItem(`new_user_${userId}`, 'true');
    setShowOnboarding(true);
  };
  
  return (
    <div className="min-h-screen bg-linen p-8">
      <h1 className="text-3xl font-bold mb-6">Test Onboarding Page</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Onboarding Test Controls</h2>
        <button 
          onClick={() => setShowOnboarding(true)} 
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
        >
          Show Onboarding Modal
        </button>
        
        <button 
          onClick={resetOnboarding} 
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Reset Onboarding State
        </button>
        
        <div className="mt-4">
          <h3 className="font-bold">LocalStorage Values:</h3>
          <pre className="bg-gray-100 p-3 rounded mt-2 text-sm overflow-auto">
            {JSON.stringify({
              userId,
              new_user: localStorage.getItem(`new_user_${userId}`),
              onboarding_completed: localStorage.getItem(`onboarding_completed_${userId}`),
              onboarding_data: localStorage.getItem(`onboarding_data_${userId}`)
            }, null, 2)}
          </pre>
        </div>
      </div>
      
      {onboardingData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Submitted Onboarding Data</h2>
          <pre className="bg-gray-100 p-3 rounded mt-2 text-sm overflow-auto">
            {JSON.stringify(onboardingData, null, 2)}
          </pre>
        </div>
      )}
      
      {showOnboarding && (
        <CouplesOnboarding 
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      )}
    </div>
  );
};

export default TestOnboardingPage;