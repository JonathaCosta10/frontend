import React from 'react';
import { useProfileVerification } from "../hooks/useProfileVerification";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, DollarSign, TrendingUp, Lock } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface InvestmentDividendPremiumGuardProps {
  children: React.ReactNode;
  feature?: 'dividends_card' | 'dividends_history' | 'dividends_insights';
}

export default function InvestmentDividendPremiumGuard({ 
  children, 
  feature = 'dividends_card' 
}: InvestmentDividendPremiumGuardProps) {
  const { isPaidUser } = useProfileVerification();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isPremium = isPaidUser();
  
  // Log para debug
  console.log(`🔒 InvestmentDividendPremiumGuard (${feature}):`, { 
    isPaidUser: isPremium,
    feature
  });

  // Redirecionamento automático para página de pagamento se não for premium
  const redirectToPayment = () => {
    navigate('/pagamento');
  };

  // Se não for premium, mostrar interface de upgrade baseada no tipo de feature
  if (!isPremium) {
    // Para o card de dividendos - versão compacta
    if (feature === 'dividends_card') {
      return (
        <Card className="border-2 border-dashed border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Dividendos - Premium</span>
              </div>
            </CardTitle>
            <Crown className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center space-y-2">
              <DollarSign className="h-8 w-8 mx-auto text-amber-600" />
              <p className="text-sm text-muted-foreground">
                Acompanhe seus dividendos e rendimentos
              </p>
              <Button 
                size="sm" 
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={redirectToPayment}
              >
                Desbloquear
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Para o histórico de dividendos - versão expandida
    if (feature === 'dividends_history') {
      return (
        <Card className="border-2 border-dashed border-amber-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl">Histórico de Dividendos Premium</CardTitle>
            <p className="text-muted-foreground mt-2">
              Acompanhe a evolução dos seus dividendos ao longo do tempo
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-6">
                <div className="flex items-center border rounded-lg p-4">
                  <div className="mr-4 bg-amber-100 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">Gráficos avançados</h4>
                    <p className="text-sm text-muted-foreground">Evolução temporal dos dividendos</p>
                  </div>
                </div>
                <div className="flex items-center border rounded-lg p-4">
                  <div className="mr-4 bg-amber-100 p-2 rounded-full">
                    <DollarSign className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">Análise de rendimento</h4>
                    <p className="text-sm text-muted-foreground">Projeções e insights personalizados</p>
                  </div>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="w-full md:w-auto md:px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                onClick={redirectToPayment}
              >
                <Crown className="h-4 w-4 mr-2" />
                Assinar Premium por R$29,90/mês
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Acesso completo às ferramentas de análise de dividendos
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Para insights de dividendos - versão minimalista
    return (
      <div className="p-4 border-2 border-dashed border-amber-200 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 text-center">
        <Lock className="h-6 w-6 mx-auto text-amber-600 mb-2" />
        <p className="text-sm text-muted-foreground mb-3">
          Insights sobre dividendos disponíveis apenas para assinantes Premium
        </p>
        <Button 
          size="sm" 
          variant="outline" 
          className="border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white"
          onClick={redirectToPayment}
        >
          Desbloquear Premium
        </Button>
      </div>
    );
  }

  // Se for premium, mostrar o conteúdo normal
  return <>{children}</>;
}