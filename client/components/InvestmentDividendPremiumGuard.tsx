import React from 'react';
import { useProfileVerification } from "../hooks/useProfileVerification";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, TrendingUp, Sparkles, BarChart3 } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface InvestmentDividendPremiumGuardProps {
  children: React.ReactNode;
}

export default function InvestmentDividendPremiumGuard({ children }: InvestmentDividendPremiumGuardProps) {
  const { isPaidUser } = useProfileVerification();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isPremium = isPaidUser();
  
  // Log para debug
  console.log(`🔒 InvestmentDividendPremiumGuard:`, { 
    isPaidUser: isPremium
  });

  // Redirecionamento automático para página de pagamento se não for premium
  const redirectToPayment = () => {
    navigate('/pagamento');
  };

  const featureDetails = [
    {
      icon: <TrendingUp className="h-5 w-5 text-primary" />,
      title: "Histórico completo de dividendos",
      description: "Acesse o histórico detalhado de todos os seus dividendos recebidos"
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-primary" />,
      title: "Análise de desempenho",
      description: "Compare o rendimento dos seus ativos ao longo do tempo"
    }
  ];

  // Se não for premium, mostrar interface simplificada de upgrade
  if (!isPremium) {
    return (
      <div className="w-full">
        <Card className="border-2 border-dashed border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl">Histórico de Dividendos - Conteúdo Premium</CardTitle>
            <p className="text-muted-foreground mt-2">
              Acesse o histórico completo de dividendos e análises detalhadas dos seus ativos
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-6">
                {featureDetails.map((feature, index) => (
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
