import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  User, 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  Bitcoin,
  Star,
  Settings,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetPath: string;
  highlightSelector?: string;
  position: 'center' | 'left' | 'right' | 'top' | 'bottom';
  action?: 'navigate' | 'highlight' | 'info';
}

interface OnboardingProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export default function Onboarding({ isVisible, onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao Organizesee! 🎉',
      description: 'Vamos começar uma jornada para organizar suas finanças de forma inteligente e moderna.',
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      targetPath: '/dashboard',
      position: 'center',
      action: 'info'
    },
    {
      id: 'profile',
      title: 'Complete seu Perfil',
      description: 'Primeiro, vamos completar seus dados básicos para personalizar sua experiência.',
      icon: <User className="h-8 w-8 text-blue-500" />,
      targetPath: '/dashboard/perfil',
      position: 'center',
      action: 'navigate'
    },
    {
      id: 'budget',
      title: 'Orçamento Doméstico',
      description: 'Controle seus gastos mensais, categorize despesas e mantenha suas finanças organizadas.',
      icon: <Calculator className="h-8 w-8 text-green-500" />,
      targetPath: '/dashboard/orcamento',
      position: 'left',
      action: 'highlight'
    },
    {
      id: 'investments',
      title: 'Investimentos',
      description: 'Acompanhe seus investimentos e monitore o crescimento do seu patrimônio.',
      icon: <TrendingUp className="h-8 w-8 text-purple-500" />,
      targetPath: '/dashboard/investimentos',
      position: 'left',
      action: 'highlight'
    },
    {
      id: 'market',
      title: 'Análise de Mercado',
      description: 'Fique por dentro das principais informações do mercado financeiro.',
      icon: <BarChart3 className="h-8 w-8 text-orange-500" />,
      targetPath: '/dashboard/mercado',
      position: 'left',
      action: 'highlight'
    },
    {
      id: 'crypto',
      title: 'Criptomoedas (Premium)',
      description: 'Monitore o mundo das criptomoedas com nossa versão premium.',
      icon: <Bitcoin className="h-8 w-8 text-yellow-600" />,
      targetPath: '/dashboard/cripto',
      position: 'left',
      action: 'highlight'
    },
    {
      id: 'settings',
      title: 'Configurações',
      description: 'Personalize sua experiência, idioma e preferências do sistema.',
      icon: <Settings className="h-8 w-8 text-gray-500" />,
      targetPath: '/dashboard/configuracoes',
      position: 'left',
      action: 'highlight'
    },
    {
      id: 'complete',
      title: 'Tudo Pronto! ✨',
      description: 'Agora você está pronto para começar a usar o Organizesee. Comece completando seu perfil!',
      icon: <CheckCircle className="h-8 w-8 text-green-600" />,
      targetPath: '/dashboard/perfil',
      position: 'center',
      action: 'navigate'
    }
  ];

  const currentStepData = onboardingSteps[currentStep];

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleComplete = () => {
    // Navigate to profile if it's the completion step
    if (currentStepData.action === 'navigate') {
      navigate(currentStepData.targetPath);
    }
    onComplete();
  };

  const handleStepAction = () => {
    if (currentStepData.action === 'navigate') {
      navigate(currentStepData.targetPath);
      onComplete();
    } else {
      nextStep();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      {/* Overlay */}
      <div className="absolute inset-0" />
      
      {/* Onboarding Card */}
      <div className={`
        absolute inset-4 flex items-center justify-center
        ${currentStepData.position === 'center' ? 'items-center justify-center' : ''}
        ${currentStepData.position === 'left' ? 'items-center justify-start ml-8' : ''}
        ${currentStepData.position === 'right' ? 'items-center justify-end mr-8' : ''}
        ${currentStepData.position === 'top' ? 'items-start justify-center mt-8' : ''}
        ${currentStepData.position === 'bottom' ? 'items-end justify-center mb-8' : ''}
      `}>
        <Card className={`
          w-full max-w-md mx-4 shadow-2xl border-2 border-primary/20
          transform transition-all duration-300 ease-in-out
          ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}
          bg-white/95 backdrop-blur-sm dark:bg-gray-900/95
          animate-in fade-in-0 zoom-in-95 duration-300
        `}>
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-xs">
                {currentStep + 1} de {onboardingSteps.length}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSkip}
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex justify-center mb-4 animate-pulse">
              {currentStepData.icon}
            </div>
            
            <CardTitle className="text-xl font-bold text-center">
              {currentStepData.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-3">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>

              {currentStep === onboardingSteps.length - 1 ? (
                <Button
                  onClick={handleStepAction}
                  className="flex-1 bg-green-600 hover:bg-green-700 animate-pulse"
                >
                  Começar
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleStepAction}
                  className="flex-1"
                >
                  {currentStepData.action === 'navigate' ? 'Ir para Perfil' : 'Próximo'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>

            {/* Skip Button */}
            {currentStep < onboardingSteps.length - 1 && (
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Pular apresentação
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
