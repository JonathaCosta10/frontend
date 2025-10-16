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
  ArrowRight,
  PieChart,
  Home,
  LineChart,
  BarChart,
  Clock,
  Target,
  Menu,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../contexts/TranslationContext';
import { useAuth } from '@/core/auth/AuthContext';

// Tipos de tutoriais disponíveis
export type OnboardingType = 'general' | 'dailyInfo' | 'budget' | 'variableIncome';

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
  type?: OnboardingType;
}

export default function Onboarding({ isVisible, onComplete, onSkip, type = 'general' }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Tutorial Geral (Visão Geral + Barra Lateral)
  const generalSteps: OnboardingStep[] = [
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
      id: 'system-overview',
      title: 'Visão Geral do Sistema',
      description: 'O Organizesee foi desenvolvido para dar total controle sobre suas finanças pessoais em uma plataforma integrada e intuitiva.',
      icon: <PieChart className="h-8 w-8 text-indigo-600" />,
      targetPath: '/dashboard',
      position: 'center',
      action: 'info'
    },
    {
      id: 'dailyinfo-intro',
      title: 'Resumo Diário',
      description: 'Esta é sua página principal onde você encontra um panorama completo da sua saúde financeira em tempo real.',
      icon: <Home className="h-8 w-8 text-blue-600" />,
      targetPath: '/dashboard',
      position: 'center',
      action: 'info'
    },
    {
      id: 'budget-intro',
      title: 'Gestão de Orçamento',
      description: 'É essencial cadastrar seus valores de entrada, gastos e dívidas para receber relatórios precisos. Defina metas para um planejamento eficiente.',
      icon: <Calculator className="h-8 w-8 text-green-600" />,
      targetPath: '/dashboard',
      position: 'center',
      action: 'info'
    },
    {
      id: 'investments-intro',
      title: 'Renda Variável',
      description: 'Cadastre e acompanhe seus investimentos por setor e % de alocação. Tenha uma visão clara sobre o que está comprando e em qual setor.',
      icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
      targetPath: '/dashboard',
      position: 'center',
      action: 'info'
    },
    {
      id: 'sidebar-navigation',
      title: 'Navegação pela Barra Lateral',
      description: 'Explore as diversas funções disponíveis para garantir que sua vida financeira completa esteja sob seu controle.',
      icon: <Menu className="h-8 w-8 text-slate-700" />,
      targetPath: '/dashboard',
      position: 'left',
      action: 'highlight'
    },
    {
      id: 'profile-setup',
      title: 'Complete seu Perfil',
      description: 'Agora vamos completar seus dados básicos para personalizar sua experiência no sistema.',
      icon: <User className="h-8 w-8 text-blue-500" />,
      targetPath: '/dashboard/perfil',
      position: 'center',
      action: 'navigate'
    },
    {
      id: 'complete',
      title: 'Comece sua Jornada! ✨',
      description: 'Comece completando seus dados para aproveitar ao máximo todas as funcionalidades do sistema.',
      icon: <CheckCircle className="h-8 w-8 text-green-600" />,
      targetPath: '/dashboard/perfil',
      position: 'center',
      action: 'navigate'
    }
  ];

  // Tutorial InfoDiária (Dashboard Principal)
  const dailyInfoSteps: OnboardingStep[] = [
    {
      id: 'dailyinfo-welcome',
      title: 'Resumo Diário',
      description: 'Essa é sua página principal onde você encontra um panorama completo da sua saúde financeira em tempo real.',
      icon: <Home className="h-8 w-8 text-blue-600" />,
      targetPath: '/dashboard',
      position: 'center',
      action: 'info'
    },
    {
      id: 'dailyinfo-indicators',
      title: 'Indicadores Financeiros',
      description: 'Acompanhe sua receita, gastos e saldo atual diretamente no painel principal. Tome decisões baseadas em dados atualizados.',
      icon: <LineChart className="h-8 w-8 text-emerald-600" />,
      targetPath: '/dashboard',
      position: 'center',
      action: 'highlight'
    },
    {
      id: 'dailyinfo-goals',
      title: 'Acompanhamento de Metas',
      description: 'Visualize o progresso das suas metas financeiras e mantenha o foco nos seus objetivos de curto e longo prazo.',
      icon: <Target className="h-8 w-8 text-purple-600" />,
      targetPath: '/dashboard',
      position: 'right',
      action: 'highlight'
    },
    {
      id: 'dailyinfo-next-steps',
      title: 'Próximos Passos',
      description: 'Para ter um resumo diário completo, cadastre seus dados no módulo de Gestão de Orçamento e acompanhe seus investimentos.',
      icon: <ArrowRight className="h-8 w-8 text-indigo-600" />,
      targetPath: '/dashboard',
      position: 'center',
      action: 'info'
    }
  ];

  // Tutorial Gestão de Orçamento
  const budgetSteps: OnboardingStep[] = [
    {
      id: 'budget-welcome',
      title: 'Gestão de Orçamento',
      description: 'Aqui você pode cadastrar e gerenciar todos os seus ganhos e gastos para um controle financeiro eficiente.',
      icon: <Calculator className="h-8 w-8 text-green-600" />,
      targetPath: '/dashboard/orcamento',
      position: 'center',
      action: 'info'
    },
    {
      id: 'budget-income',
      title: 'Cadastre suas Receitas',
      description: 'Informe todas suas fontes de renda: salário, freelance, aluguel, dividendos. Quanto mais detalhado, mais preciso será seu planejamento.',
      icon: <TrendingUp className="h-8 w-8 text-emerald-600" />,
      targetPath: '/dashboard/orcamento/receitas',
      position: 'left',
      action: 'highlight'
    },
    {
      id: 'budget-expenses',
      title: 'Organize seus Gastos',
      description: 'Categorize suas despesas para identificar onde seu dinheiro está sendo gasto e encontrar oportunidades de economia.',
      icon: <BarChart className="h-8 w-8 text-red-500" />,
      targetPath: '/dashboard/orcamento/despesas',
      position: 'center',
      action: 'highlight'
    },
    {
      id: 'budget-goals',
      title: 'Defina suas Metas',
      description: 'Estabeleça metas financeiras claras e específicas para guiar seu planejamento e economias para objetivos importantes.',
      icon: <Target className="h-8 w-8 text-blue-600" />,
      targetPath: '/dashboard/orcamento/metas',
      position: 'center',
      action: 'highlight'
    },
    {
      id: 'budget-next-steps',
      title: 'Comprometa-se com a Atualização',
      description: 'Para resultados precisos, mantenha seus dados atualizados regularmente. Isso garantirá relatórios e análises confiáveis.',
      icon: <Clock className="h-8 w-8 text-indigo-600" />,
      targetPath: '/dashboard/orcamento',
      position: 'center',
      action: 'info'
    }
  ];

  // Tutorial Renda Variável (Investimentos)
  const variableIncomeSteps: OnboardingStep[] = [
    {
      id: 'varincome-welcome',
      title: 'Renda Variável',
      description: 'Acompanhe e analise seus investimentos em ações, FIIs e outros ativos de renda variável.',
      icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
      targetPath: '/dashboard/investimentos',
      position: 'center',
      action: 'info'
    },
    {
      id: 'varincome-portfolio',
      title: 'Cadastre seu Portfólio',
      description: 'Adicione todos seus ativos para ter uma visão completa da sua carteira e acompanhar seu desempenho.',
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      targetPath: '/dashboard/investimentos/carteira',
      position: 'center',
      action: 'highlight'
    },
    {
      id: 'varincome-sectors',
      title: 'Análise por Setores',
      description: 'Visualize a distribuição dos seus investimentos por setor e avalie se sua carteira está bem diversificada.',
      icon: <PieChart className="h-8 w-8 text-amber-600" />,
      targetPath: '/dashboard/investimentos/setores',
      position: 'center',
      action: 'highlight'
    },
    {
      id: 'varincome-strategy',
      title: 'Estratégia e Alocação',
      description: 'O acompanhamento por setor ajudará a tomar decisões melhores sobre como equilibrar seus investimentos conforme seus objetivos.',
      icon: <Sparkles className="h-8 w-8 text-emerald-600" />,
      targetPath: '/dashboard/investimentos',
      position: 'center',
      action: 'info'
    }
  ];

  // Seleciona o conjunto de passos de acordo com o tipo
  const selectTutorialSteps = (): OnboardingStep[] => {
    switch(type) {
      case 'dailyInfo':
        return dailyInfoSteps;
      case 'budget':
        return budgetSteps;
      case 'variableIncome':
        return variableIncomeSteps;
      case 'general':
      default:
        return generalSteps;
    }
  };

  const onboardingSteps = selectTutorialSteps();

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
