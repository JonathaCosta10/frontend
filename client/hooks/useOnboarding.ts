import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Importando o tipo do componente Onboarding
import { OnboardingType } from '../components/Onboarding';

interface OnboardingState {
  hasSeenOnboarding: boolean;
  isFirstLogin: boolean;
  shouldShowOnboarding: boolean;
  completedTutorials: Record<string, boolean>;
}

export function useOnboarding() {
  const { user } = useAuth();
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    hasSeenOnboarding: false,
    isFirstLogin: false,
    shouldShowOnboarding: false,
    completedTutorials: {}
  });
  
  // Chaves para armazenamento localStorage
  const ONBOARDING_KEY = 'organizesee_onboarding_completed';
  const FIRST_LOGIN_KEY = 'organizesee_first_login';
  const COMPLETED_TUTORIALS_KEY = 'organizesee_completed_tutorials';
  
  // Lista de tutoriais disponíveis
  const AVAILABLE_TUTORIALS = ['general', 'dailyInfo', 'budget', 'variableIncome'];

  useEffect(() => {
    if (!user) return;

    const hasSeenOnboarding = localStorage.getItem(`${ONBOARDING_KEY}_${user.id}`) === 'true';
    const firstLoginValue = localStorage.getItem(`${FIRST_LOGIN_KEY}_${user.id}`);
    
    // User is considered first-time if they've never had the first_login flag set, or it's explicitly null
    // This ensures Google OAuth users (who may not have this flag initially) are treated as new users
    const isFirstLogin = firstLoginValue === null || firstLoginValue !== 'false';
    
    // Check if user is truly new (no previous onboarding completion)
    const shouldShowOnboarding = !hasSeenOnboarding && isFirstLogin;

    // Carregar tutoriais completados
    let completedTutorials: Record<string, boolean> = {};
    try {
      const savedTutorials = localStorage.getItem(`${COMPLETED_TUTORIALS_KEY}_${user.id}`);
      completedTutorials = savedTutorials ? JSON.parse(savedTutorials) : {};
    } catch (error) {
      console.error('Erro ao carregar tutoriais completados:', error);
      completedTutorials = {};
    }

    console.log(`🔍 Onboarding Debug for user ${user.id}:`, {
      hasSeenOnboarding,
      firstLoginValue,
      isFirstLogin,
      shouldShowOnboarding,
      completedTutorials
    });

    setOnboardingState({
      hasSeenOnboarding,
      isFirstLogin,
      shouldShowOnboarding,
      completedTutorials
    });
  }, [user]);

  // Marca um tutorial específico como concluído
  const completeTutorial = (tutorialType: OnboardingType) => {
    if (!user) return;
    
    const updatedTutorials = { 
      ...onboardingState.completedTutorials, 
      [tutorialType]: true 
    };
    
    localStorage.setItem(
      `${COMPLETED_TUTORIALS_KEY}_${user.id}`, 
      JSON.stringify(updatedTutorials)
    );
    
    // Se for o tutorial geral/principal, marcar o onboarding como concluído
    if (tutorialType === 'general') {
      localStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, 'true');
      localStorage.setItem(`${FIRST_LOGIN_KEY}_${user.id}`, 'false');
    }
    
    setOnboardingState(prev => ({
      ...prev,
      hasSeenOnboarding: prev.hasSeenOnboarding || tutorialType === 'general',
      isFirstLogin: tutorialType === 'general' ? false : prev.isFirstLogin,
      shouldShowOnboarding: tutorialType === 'general' ? false : prev.shouldShowOnboarding,
      completedTutorials: updatedTutorials
    }));
  };

  // Completa o onboarding principal
  const completeOnboarding = () => {
    if (!user) return;
    
    // Mark onboarding as completed
    localStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, 'true');
    // Mark first login as completed (user has now seen the onboarding)
    localStorage.setItem(`${FIRST_LOGIN_KEY}_${user.id}`, 'false');
    
    // Marca o tutorial geral como concluído
    const updatedTutorials = { 
      ...onboardingState.completedTutorials, 
      general: true 
    };
    
    localStorage.setItem(
      `${COMPLETED_TUTORIALS_KEY}_${user.id}`, 
      JSON.stringify(updatedTutorials)
    );
    
    setOnboardingState(prev => ({
      ...prev,
      hasSeenOnboarding: true,
      isFirstLogin: false,
      shouldShowOnboarding: false,
      completedTutorials: updatedTutorials
    }));
  };

  // Reseta todas as configurações de onboarding
  const resetOnboarding = () => {
    if (!user) return;
    
    localStorage.removeItem(`${ONBOARDING_KEY}_${user.id}`);
    localStorage.removeItem(`${FIRST_LOGIN_KEY}_${user.id}`);
    localStorage.removeItem(`${COMPLETED_TUTORIALS_KEY}_${user.id}`);
    
    setOnboardingState({
      hasSeenOnboarding: false,
      isFirstLogin: true,
      shouldShowOnboarding: true,
      completedTutorials: {}
    });
  };

  // Reseta um tutorial específico
  const resetTutorial = (tutorialType: OnboardingType) => {
    if (!user) return;
    
    const updatedTutorials = { ...onboardingState.completedTutorials };
    delete updatedTutorials[tutorialType];
    
    localStorage.setItem(
      `${COMPLETED_TUTORIALS_KEY}_${user.id}`, 
      JSON.stringify(updatedTutorials)
    );
    
    // Se for o tutorial geral, atualizar também o status de onboarding
    if (tutorialType === 'general') {
      localStorage.removeItem(`${ONBOARDING_KEY}_${user.id}`);
      localStorage.removeItem(`${FIRST_LOGIN_KEY}_${user.id}`);
      
      setOnboardingState(prev => ({
        ...prev,
        hasSeenOnboarding: false,
        isFirstLogin: true,
        shouldShowOnboarding: true,
        completedTutorials: updatedTutorials
      }));
    } else {
      setOnboardingState(prev => ({
        ...prev,
        completedTutorials: updatedTutorials
      }));
    }
  };

  // Verifica se um tutorial específico já foi concluído
  const hasTutorialBeenCompleted = (tutorialType: OnboardingType): boolean => {
    return !!onboardingState.completedTutorials[tutorialType];
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  return {
    ...onboardingState,
    completeOnboarding,
    resetOnboarding,
    skipOnboarding,
    completeTutorial,
    resetTutorial,
    hasTutorialBeenCompleted,
    availableTutorials: AVAILABLE_TUTORIALS
  };
}
