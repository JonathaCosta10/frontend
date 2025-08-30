import React from 'react';
import { useProfileVerification } from "../hooks/useProfileVerification";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, BarChart3, TrendingUp, Sparkles, PieChart as ChartPieIcon, Trophy, Star } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface InvestmentPremiumGuardProps {
  children: React.ReactNode;
  featureType: 'patrimonio' | 'comparativos' | 'ranking';
}

export default function InvestmentPremiumGuard({ children, featureType }: InvestmentPremiumGuardProps) {
  const { isPaidUser } = useProfileVerification();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Verificação dupla para garantir consistência
  const isPremiumFromHook = isPaidUser();
  const isPremiumFromStorage = JSON.parse(localStorage.getItem('isPaidUser') || 'false');
  const isPremium = isPremiumFromHook || isPremiumFromStorage;
  
  // Log para debug
  console.log(`🔒 InvestmentPremiumGuard (${featureType}):`, { 
    fromHook: isPremiumFromHook,
    fromStorage: isPremiumFromStorage,
    final: isPremium,
    featureType
  });

  // Redirecionamento automático para página de pagamento se não for premium
  const redirectToPayment = () => {
    navigate('/pagamento');
  };

  const getFeatureTitle = () => {
    switch (featureType) {
      case 'patrimonio':
        return "Patrimônio Detalhado - Conteúdo Premium";
      case 'comparativos':
        return "Comparativos Avançados - Conteúdo Premium";
      case 'ranking':
        return "Ranking de Investimentos - Conteúdo Premium";
      default:
        return "Conteúdo Premium";
    }
  };

  const getFeatureDescription = () => {
    switch (featureType) {
      case 'patrimonio':
        return "A análise detalhada do patrimônio está disponível apenas para assinantes Premium";
      case 'comparativos':
        return "Os comparativos avançados estão disponíveis apenas para assinantes Premium";
      case 'ranking':
        return "O ranking completo de investimentos está disponível apenas para assinantes Premium";
      default:
        return "Este conteúdo está disponível apenas para assinantes Premium";
    }
  };

  const getFeatureIcon = () => {
    switch (featureType) {
      case 'patrimonio':
        return <ChartPieIcon className="h-8 w-8 text-white" />;
      case 'comparativos':
        return <BarChart3 className="h-8 w-8 text-white" />;
      case 'ranking':
        return <Trophy className="h-8 w-8 text-white" />;
      default:
        return <Crown className="h-8 w-8 text-white" />;
    }
  };

  const getFeatureDetails = () => {
    switch (featureType) {
      case 'patrimonio':
        return [
          {
            icon: <ChartPieIcon className="h-5 w-5 text-primary" />,
            title: "Análise completa de patrimônio",
            description: "Visualize a composição detalhada de seus investimentos"
          },
          {
            icon: <TrendingUp className="h-5 w-5 text-primary" />,
            title: "Histórico de evolução patrimonial",
            description: "Acompanhe o crescimento do seu patrimônio ao longo do tempo"
          }
        ];
      case 'comparativos':
        return [
          {
            icon: <BarChart3 className="h-5 w-5 text-primary" />,
            title: "Comparativos entre investimentos",
            description: "Compare rendimentos e desempenho entre diferentes ativos"
          },
          {
            icon: <TrendingUp className="h-5 w-5 text-primary" />,
            title: "Benchmarks profissionais",
            description: "Compare seus investimentos com índices de mercado"
          }
        ];
      case 'ranking':
        return [
          {
            icon: <Trophy className="h-5 w-5 text-primary" />,
            title: "Ranking completo de ativos",
            description: "Descubra os melhores investimentos por múltiplos critérios"
          },
          {
            icon: <Star className="h-5 w-5 text-primary" />,
            title: "Insights personalizados",
            description: "Análises detalhadas e oportunidades no mercado"
          }
        ];
      default:
        return [];
    }
  };

  // Se não for premium, mostrar interface simplificada de upgrade
  if (!isPremium) {
    return (
      <div className="max-w-3xl mx-auto my-8 px-4">
        <Card className="border-2 border-dashed border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
              {getFeatureIcon()}
            </div>
            <CardTitle className="text-2xl">{getFeatureTitle()}</CardTitle>
            <p className="text-muted-foreground mt-2">
              {getFeatureDescription()}
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-6">
                {getFeatureDetails().map((feature, index) => (
                  <div key={index} className="flex items-center border rounded-lg p-4">
                    <div className="mr-4 bg-primary/10 p-2 rounded-full">
                      {feature.icon}
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                size="lg" 
                className="w-full md:w-auto md:px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                onClick={redirectToPayment}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {t('subscribe_premium')}
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Cancele quando quiser. Acesso imediato após a confirmação do pagamento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se for premium, mostrar o conteúdo normal
  return <>{children}</>;
}
