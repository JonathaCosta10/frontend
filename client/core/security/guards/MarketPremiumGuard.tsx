import React from 'react';
import { useProfileVerification } from "@/shared/hooks/useProfileVerification";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Star, Gift, Sparkles, BarChart3, TrendingUp } from "lucide-react";
import { useTranslation } from '../../../contexts/TranslationContext';

interface MarketPremiumGuardProps {
  children: React.ReactNode;
  marketFeature: 'wishlist' | 'ticker-analysis' | 'financial-calculator';
}

export default function MarketPremiumGuard({ children, marketFeature }: MarketPremiumGuardProps) {
  const { isPaidUser } = useProfileVerification();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isPremium = isPaidUser();
  
  // Log para debug
  console.log(`🔒 MarketPremiumGuard (${marketFeature}):`, { 
    isPaidUser: isPremium,
    marketFeature
  });

  // Redirecionamento automático para página de pagamento se não for premium
  const redirectToPayment = () => {
    navigate('/pagamento');
  };

  const getFeatureTitle = () => {
    switch (marketFeature) {
      case 'wishlist':
        return "Lista de Desejos - Conteúdo Premium";
      case 'ticker-analysis':
        return "Análise de Ticker - Conteúdo Premium";
      case 'financial-calculator':
        return "Calculadora Financeira - Conteúdo Premium";
      default:
        return "Conteúdo Premium";
    }
  };

  const getFeatureDescription = () => {
    switch (marketFeature) {
      case 'wishlist':
        return "A lista de desejos está disponível apenas para assinantes Premium";
      case 'ticker-analysis':
        return "A análise avançada de tickers está disponível apenas para assinantes Premium";
      case 'financial-calculator':
        return "A calculadora financeira avançada está disponível apenas para assinantes Premium";
      default:
        return "Este conteúdo está disponível apenas para assinantes Premium";
    }
  };

  const getFeatureIcon = () => {
    switch (marketFeature) {
      case 'wishlist':
        return <Star className="h-8 w-8 text-white" />;
      case 'ticker-analysis':
        return <TrendingUp className="h-8 w-8 text-white" />;
      case 'financial-calculator':
        return <BarChart3 className="h-8 w-8 text-white" />;
      default:
        return <Crown className="h-8 w-8 text-white" />;
    }
  };

  const getFeatureDetails = () => {
    switch (marketFeature) {
      case 'wishlist':
        return [
          {
            icon: <Star className="h-5 w-5 text-primary" />,
            title: "Lista de desejos personalizada",
            description: "Acompanhe seus ativos favoritos em um só lugar"
          },
          {
            icon: <TrendingUp className="h-5 w-5 text-primary" />,
            title: "Alertas de preço",
            description: "Receba notificações quando ativos atingirem valores desejados"
          }
        ];
      case 'ticker-analysis':
        return [
          {
            icon: <TrendingUp className="h-5 w-5 text-primary" />,
            title: "Análise técnica avançada",
            description: "Indicadores e gráficos profissionais para tomada de decisão"
          },
          {
            icon: <BarChart3 className="h-5 w-5 text-primary" />,
            title: "Análise fundamentalista",
            description: "Dados financeiros detalhados de empresas e ativos"
          }
        ];
      case 'financial-calculator':
        return [
          {
            icon: <BarChart3 className="h-5 w-5 text-primary" />,
            title: "Calculadoras financeiras completas",
            description: "Simule investimentos, financiamentos e aposentadoria"
          },
          {
            icon: <Star className="h-5 w-5 text-primary" />,
            title: "Projeções avançadas",
            description: "Previsões personalizadas com base em dados reais do mercado"
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
                Assinar Premium por R$29,90/mês
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
