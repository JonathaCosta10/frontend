import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingState {
  hasSeenOnboarding: boolean;
  isFirstLogin: boolean;
  shouldShowOnboarding: boolean;
}

export function useOnboarding() {
  const { user } = useAuth();
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    hasSeenOnboarding: false,
    isFirstLogin: false,
    shouldShowOnboarding: false
  });

  const ONBOARDING_KEY = 'organizesee_onboarding_completed';
  const FIRST_LOGIN_KEY = 'organizesee_first_login';

  useEffect(() => {
    if (!user) return;

    const hasSeenOnboarding = localStorage.getItem(`${ONBOARDING_KEY}_${user.id}`) === 'true';
    const isFirstLogin = localStorage.getItem(`${FIRST_LOGIN_KEY}_${user.id}`) !== 'false';
    
    // Check if user is truly new (no personal data, no previous onboarding)
    const shouldShowOnboarding = !hasSeenOnboarding && isFirstLogin;

    setOnboardingState({
      hasSeenOnboarding,
      isFirstLogin,
      shouldShowOnboarding
    });

    // Mark that user has logged in at least once
    if (isFirstLogin) {
      localStorage.setItem(`${FIRST_LOGIN_KEY}_${user.id}`, 'false');
    }
  }, [user]);

  const completeOnboarding = () => {
    if (!user) return;
    
    localStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, 'true');
    setOnboardingState(prev => ({
      ...prev,
      hasSeenOnboarding: true,
      shouldShowOnboarding: false
    }));
  };

  const resetOnboarding = () => {
    if (!user) return;
    
    localStorage.removeItem(`${ONBOARDING_KEY}_${user.id}`);
    localStorage.removeItem(`${FIRST_LOGIN_KEY}_${user.id}`);
    setOnboardingState({
      hasSeenOnboarding: false,
      isFirstLogin: true,
      shouldShowOnboarding: true
    });
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  return {
    ...onboardingState,
    completeOnboarding,
    resetOnboarding,
    skipOnboarding
  };
}
