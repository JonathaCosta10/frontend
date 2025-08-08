import React from 'react';
import { useProfileVerification } from "../hooks/useProfileVerification";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Star, Gift, Sparkles, Bitcoin } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface CryptoPremiumGuardProps {
  children: React.ReactNode;
}

export default function CryptoPremiumGuard({ children }: CryptoPremiumGuardProps) {
  const { isPaidUser } = useProfileVerification();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isPremium = isPaidUser();
  
  // Log para debug
  console.log(`🔒 CryptoPremiumGuard:`, { 
    isPaidUser: isPremium
  });

  // Redirecionamento automático para página de pagamento se não for premium
  const redirectToPayment = () => {
    navigate('/pagamento');
  };

  // Se não for premium, mostrar interface simplificada de upgrade
  if (!isPremium) {
    return (
      <div className="max-w-3xl mx-auto my-8 px-4">
        <Card className="border-2 border-dashed border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <Bitcoin className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Análise de Criptomoedas - Conteúdo Premium</CardTitle>
            <p className="text-muted-foreground mt-2">
              O dashboard de criptomoedas está disponível apenas para assinantes Premium
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-6">
                <div className="flex items-center border rounded-lg p-4">
                  <div className="mr-4 bg-primary/10 p-2 rounded-full">
                    <Bitcoin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">Análise completa de criptomoedas</h4>
                    <p className="text-sm text-muted-foreground">Acompanhe o mercado de crypto em tempo real</p>
                  </div>
                </div>
                <div className="flex items-center border rounded-lg p-4">
                  <div className="mr-4 bg-primary/10 p-2 rounded-full">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">Portfólio de criptomoedas</h4>
                    <p className="text-sm text-muted-foreground">Gerencie seus investimentos em crypto</p>
                  </div>
                </div>
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
