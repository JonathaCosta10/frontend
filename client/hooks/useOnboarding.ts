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
    const firstLoginValue = localStorage.getItem(`${FIRST_LOGIN_KEY}_${user.id}`);
    
    // User is considered first-time if they've never had the first_login flag set, or it's explicitly null
    // This ensures Google OAuth users (who may not have this flag initially) are treated as new users
    const isFirstLogin = firstLoginValue === null || firstLoginValue !== 'false';
    
    // Check if user is truly new (no previous onboarding completion)
    const shouldShowOnboarding = !hasSeenOnboarding && isFirstLogin;

    console.log(`🔍 Onboarding Debug for user ${user.id}:`, {
      hasSeenOnboarding,
      firstLoginValue,
      isFirstLogin,
      shouldShowOnboarding
    });

    setOnboardingState({
      hasSeenOnboarding,
      isFirstLogin,
      shouldShowOnboarding
    });

    // Only mark first login as completed when onboarding is actually completed
    // This prevents immediate marking that could interfere with onboarding display
  }, [user]);

  const completeOnboarding = () => {
    if (!user) return;
    
    // Mark onboarding as completed
    localStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, 'true');
    // Mark first login as completed (user has now seen the onboarding)
    localStorage.setItem(`${FIRST_LOGIN_KEY}_${user.id}`, 'false');
    
    setOnboardingState(prev => ({
      ...prev,
      hasSeenOnboarding: true,
      isFirstLogin: false,
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
