import React from 'react';
import { useProfileVerification } from "../hooks/useProfileVerification";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Users, Star, Sparkles } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface DailyInfoPremiumGuardProps {
  children: React.ReactNode;
  featureType: 'especialistas' | 'lista-desejos';
}

export default function DailyInfoPremiumGuard({ children, featureType }: DailyInfoPremiumGuardProps) {
  const { isPaidUser } = useProfileVerification();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isPremium = isPaidUser();
  
  // Log para debug
  console.log(`🔒 DailyInfoPremiumGuard (${featureType}):`, { 
    isPaidUser: isPremium,
    featureType
  });

  // Redirecionamento automático para página de pagamento se não for premium
  const redirectToPayment = () => {
    navigate('/pagamento');
  };

  const getFeatureTitle = () => {
    switch (featureType) {
      case 'especialistas':
        return "Especialistas - Conteúdo Premium";
      case 'lista-desejos':
        return "Lista de Desejos - Conteúdo Premium";
      default:
        return "Conteúdo Premium";
    }
  };

  const getFeatureDescription = () => {
    switch (featureType) {
      case 'especialistas':
        return "Acesse conselhos e recomendações de especialistas do mercado financeiro";
      case 'lista-desejos':
        return "Acompanhe seus ativos favoritos e receba alertas de oportunidades";
      default:
        return "Este conteúdo está disponível apenas para assinantes Premium";
    }
  };

  const getFeatureIcon = () => {
    switch (featureType) {
      case 'especialistas':
        return <Users className="h-8 w-8 text-white" />;
      case 'lista-desejos':
        return <Star className="h-8 w-8 text-white" />;
      default:
        return <Crown className="h-8 w-8 text-white" />;
    }
  };

  const getFeatureDetails = () => {
    switch (featureType) {
      case 'especialistas':
        return [
          {
            icon: <Users className="h-5 w-5 text-primary" />,
            title: "Recomendações de especialistas",
            description: "Receba orientações personalizadas de especialistas certificados"
          },
          {
            icon: <Star className="h-5 w-5 text-primary" />,
            title: "Acesso a consultores financeiros",
            description: "Contato direto com consultores para tirar suas dúvidas"
          }
        ];
      case 'lista-desejos':
        return [
          {
            icon: <Star className="h-5 w-5 text-primary" />,
            title: "Lista de ativos personalizada",
            description: "Acompanhe os ativos que mais interessam a você"
          },
          {
            icon: <Users className="h-5 w-5 text-primary" />,
            title: "Alertas de preços",
            description: "Receba notificações quando os preços atingirem seus alvos"
          }
        ];
      default:
        return [];
    }
  };

  // Se não for premium, mostrar interface simplificada de upgrade
  if (!isPremium) {
    return (
      <div className="w-full">
        <Card className="border-2 border-dashed border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
              {getFeatureIcon()}
            </div>
            <CardTitle className="text-xl">{getFeatureTitle()}</CardTitle>
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
