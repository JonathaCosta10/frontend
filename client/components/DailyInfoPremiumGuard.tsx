import React from 'react';
import { useProfileVerification } from "../hooks/useProfileVerification";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Activity, Users, Lock, Star, TrendingUp } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface DailyInfoPremiumGuardProps {
  children: React.ReactNode;
  feature?: 'market_insights' | 'specialists' | 'advanced_analysis';
}

export default function DailyInfoPremiumGuard({ 
  children, 
  feature = 'market_insights' 
}: DailyInfoPremiumGuardProps) {
  const { isPaidUser } = useProfileVerification();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Usar React.useMemo para evitar recálculos desnecessários e centralizar verificação premium
  const isPremium = React.useMemo(() => isPaidUser(), [isPaidUser]);
  
  // Log para debug (otimizado para prevenir loops)
  React.useEffect(() => {
    console.log(`🔒 DailyInfoPremiumGuard (${feature}):`, { 
      isPaidUser: isPremium,
      feature
    });
  }, [feature, isPremium]);

  // Redirecionamento automático para página de pagamento se não for premium
  const redirectToPayment = () => {
    // Salvar a página atual para voltar depois
    sessionStorage.setItem('returnUrlAfterPayment', window.location.pathname);
    navigate('/pagamento');
  };

  // Se não for premium, mostrar interface de upgrade baseada no tipo de feature
  if (!isPremium) {
    // Para insights de mercado
    if (feature === 'market_insights') {
      return (
        <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl">Insights de Mercado Premium</CardTitle>
            <p className="text-muted-foreground mt-2">
              Acesse análises avançadas e tendências do mercado em tempo real
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-6">
                <div className="flex items-center border rounded-lg p-4">
                  <div className="mr-4 bg-blue-100 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">Análises de Mercado</h4>
                    <p className="text-sm text-muted-foreground">Insights em tempo real sobre tendências</p>
                  </div>
                </div>
                <div className="flex items-center border rounded-lg p-4">
                  <div className="mr-4 bg-blue-100 p-2 rounded-full">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">Dados Avançados</h4>
                    <p className="text-sm text-muted-foreground">Volume, preços e variações detalhadas</p>
                  </div>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="w-full md:w-auto md:px-8 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                onClick={redirectToPayment}
              >
                <Crown className="h-4 w-4 mr-2" />
                {t('subscribe_premium')}
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Desbloqueie análises completas do mercado financeiro
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Para especialistas
    if (feature === 'specialists') {
      return (
        <Card className="border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl">Especialistas Premium</CardTitle>
            <p className="text-muted-foreground mt-2">
              Conecte-se com influencers e consultores financeiros especializados
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-6">
                <div className="flex items-center border rounded-lg p-4">
                  <div className="mr-4 bg-purple-100 p-2 rounded-full">
                    <Star className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">Influencers Top</h4>
                    <p className="text-sm text-muted-foreground">Acesso aos melhores influencers</p>
                  </div>
                </div>
                <div className="flex items-center border rounded-lg p-4">
                  <div className="mr-4 bg-purple-100 p-2 rounded-full">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">Consultores Certificados</h4>
                    <p className="text-sm text-muted-foreground">Profissionais qualificados</p>
                  </div>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="w-full md:w-auto md:px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={redirectToPayment}
              >
                <Crown className="h-4 w-4 mr-2" />
                {t('subscribe_premium')}
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Acesso exclusivo à rede de especialistas
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Para análises avançadas - versão minimalista
    return (
      <div className="p-4 border-2 border-dashed border-indigo-200 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 text-center">
        <Lock className="h-6 w-6 mx-auto text-indigo-600 mb-2" />
        <p className="text-sm text-muted-foreground mb-3">
          Análises avançadas disponíveis apenas para assinantes Premium
        </p>
        <Button 
          size="sm" 
          variant="outline" 
          className="border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white"
          onClick={redirectToPayment}
        >
          {t('unlock_premium')}
        </Button>
      </div>
    );
  }

  // Se for premium, mostrar o conteúdo normal
  return <>{children}</>;
}