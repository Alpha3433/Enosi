import React, { useState } from 'react';
import CouplesOnboarding from '../components/CouplesOnboarding';

const TestOnboardingPage = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);

  const handleTriggerOnboarding = () => {
    // Set test flags in localStorage
    const testUserId = 'test-user-123';
    localStorage.setItem(`new_user_${testUserId}`, 'true');
    localStorage.removeItem(`onboarding_completed_${testUserId}`);
    
    // Show the onboarding modal
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = (data) => {
    console.log('Onboarding completed with data:', data);
    setOnboardingData(data);
    setShowOnboarding(false);
    
    // Store completed flag
    const testUserId = 'test-user-123';
    localStorage.setItem(`onboarding_completed_${testUserId}`, 'true');
    localStorage.setItem(`onboarding_data_${testUserId}`, JSON.stringify(data));
  };

  const handleOnboardingSkip = () => {
    console.log('Onboarding skipped');
    setShowOnboarding(false);
    
    // Store completed flag even for skip
    const testUserId = 'test-user-123';
    localStorage.setItem(`onboarding_completed_${testUserId}`, 'true');
  };

  const clearData = () => {
    const testUserId = 'test-user-123';
    localStorage.removeItem(`new_user_${testUserId}`);
    localStorage.removeItem(`onboarding_completed_${testUserId}`);
    localStorage.removeItem(`onboarding_data_${testUserId}`);
    setOnboardingData(null);
    alert('All onboarding data cleared!');
  };

  const testUserId = 'test-user-123';
  const isNewUser = localStorage.getItem(`new_user_${testUserId}`);
  const isCompleted = localStorage.getItem(`onboarding_completed_${testUserId}`);
  const storedData = localStorage.getItem(`onboarding_data_${testUserId}`);

  return (
    <div className="min-h-screen bg-linen p-8" style={{ zoom: 0.9 }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-millbrook mb-6 font-sans">
            Onboarding Test Page
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-linen rounded-lg p-6">
              <h2 className="text-xl font-semibold text-millbrook mb-4 font-sans">
                Test Controls
              </h2>
              
              <div className="space-y-3">
                <button 
                  onClick={handleTriggerOnboarding}
                  className="w-full bg-cement text-white px-4 py-3 rounded-lg hover:bg-millbrook transition-colors font-sans font-medium"
                >
                  Trigger Onboarding Modal
                </button>
                
                <button 
                  onClick={clearData}
                  className="w-full bg-coral-reef text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-sans font-medium"
                >
                  Clear All Data
                </button>
              </div>
            </div>
            
            <div className="bg-linen rounded-lg p-6">
              <h2 className="text-xl font-semibold text-millbrook mb-4 font-sans">
                LocalStorage Status
              </h2>
              
              <div className="space-y-2 text-sm font-sans">
                <div className="flex justify-between">
                  <span className="text-kabul">New User Flag:</span>
                  <span className={`font-medium ${isNewUser ? 'text-green-600' : 'text-red-600'}`}>
                    {isNewUser || 'false'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-kabul">Completed Flag:</span>
                  <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-red-600'}`}>
                    {isCompleted || 'false'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-kabul">Has Data:</span>
                  <span className={`font-medium ${storedData ? 'text-green-600' : 'text-red-600'}`}>
                    {storedData ? 'true' : 'false'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {(onboardingData || storedData) && (
            <div className="bg-white border border-coral-reef rounded-lg p-6">
              <h2 className="text-xl font-semibold text-millbrook mb-4 font-sans">
                Submitted Onboarding Data
              </h2>
              
              <pre className="bg-linen p-4 rounded-lg text-sm overflow-auto text-kabul font-mono">
                {JSON.stringify(onboardingData || JSON.parse(storedData), null, 2)}
              </pre>
            </div>
          )}
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2 font-sans">
              Testing Instructions:
            </h3>
            <ul className="text-sm text-yellow-700 font-sans space-y-1">
              <li>1. Click "Trigger Onboarding Modal" to show the onboarding flow</li>
              <li>2. Complete all 5 steps of the onboarding process</li>
              <li>3. Check that data is saved and displayed below</li>
              <li>4. Use "Clear All Data" to reset for testing</li>
              <li>5. Try the "Skip for now" option to test skipping</li>
            </ul>
          </div>
        </div>
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

export default TestOnboardingPage;