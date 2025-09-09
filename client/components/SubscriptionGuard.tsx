import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Crown,
  Lock,
  Zap,
  Star,
  TrendingUp,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProfileVerification } from "../hooks/useProfileVerification";
import { useTranslation } from "../contexts/TranslationContext";
import { eventEmitter, EVENTS } from "../lib/eventEmitter";

interface SubscriptionGuardProps {
  feature?:
    | "cryptoAccess"
    | "advancedCharts"
    | "exportData"
    | "prioritySupport";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const getFeatureLabels = (t: (key: string) => string) => ({
  cryptoAccess: t("crypto_access"),
  advancedCharts: t("advanced_charts"),
  exportData: t("export_data"),
  prioritySupport: t("priority_support"),
});

const getFeatureDescriptions = (t: (key: string) => string) => ({
  cryptoAccess: t("crypto_access_desc"),
  advancedCharts: t("advanced_charts_desc"),
  exportData: t("export_data_desc"),
  prioritySupport: t("priority_support_desc"),
});

const featureIcons = {
  cryptoAccess: Crown,
  advancedCharts: TrendingUp,
  exportData: Shield,
  prioritySupport: Star,
};

export default function SubscriptionGuard({
  feature,
  children,
  fallback,
}: SubscriptionGuardProps) {
  const {
    user: profile,
    isLoading,
    isPaidUser,
    refreshProfile,
  } = useProfileVerification();
  const { t } = useTranslation();
  
  // Funções auxiliares já que algumas estão faltando no hook
  const hasFeatureAccess = (feature: string) => {
    return isPaidUser();
  };
  
  const isTrialUser = () => {
    return false; // Simplificado para este fix
  };
  
  const getSubscriptionStatusText = () => {
    return isPaidUser() ? t("premium_plan") : t("free_plan");
  };
  
  const getDaysUntilExpiration = () => {
    if (!profile?.data_expiracao) return null;
    try {
      const expDate = new Date(profile.data_expiracao);
      const today = new Date();
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch (e) {
      return null;
    }
  };

  // Debug logs para verificar atualizações
  console.log("🛡️ SubscriptionGuard - Status atual:", {
    feature,
    isPaidUser: isPaidUser(),
    hasFeatureAccess: feature ? hasFeatureAccess(feature) : "N/A",
    plano: profile?.plano,
    isLoading
  });

  // Escutar mudanças de status premium e forçar refresh
  React.useEffect(() => {
    const handlePremiumStatusChange = (data: any) => {
      console.log("🛡️ SubscriptionGuard recebeu mudança de status premium:", data);
      // Forçar refresh do perfil
      if (refreshProfile) {
        refreshProfile();
      }
    };

    // Registrar listener
    eventEmitter.on(EVENTS.PREMIUM_STATUS_CHANGED, handlePremiumStatusChange);
    
    return () => {
      // Limpar listener
      eventEmitter.off(EVENTS.PREMIUM_STATUS_CHANGED, handlePremiumStatusChange);
    };
  }, [refreshProfile]);

  // Check if premium authentication is disabled globally
  const isPremiumAuthEnabled =
    import.meta.env.VITE_ENABLE_PREMIUM_AUTH !== "false";

  // If premium auth is disabled, always allow access
  if (!isPremiumAuthEnabled) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (feature && hasFeatureAccess(feature)) {
    return <>{children}</>;
  }

  // If no specific feature is defined, check if user has any paid access
  if (!feature && isPaidUser()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const featureLabels = getFeatureLabels(t);
  const featureDescriptions = getFeatureDescriptions(t);

  const FeatureIcon = feature ? featureIcons[feature] : Crown;
  const featureLabel = feature ? featureLabels[feature] : t("premium_feature");
  const featureDescription = feature
    ? featureDescriptions[feature]
    : t("premium_feature_desc");
  const daysUntilExpiration = getDaysUntilExpiration();

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {profile && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <div className="flex items-center justify-between">
              <span>
                {t("current_plan")}{" "}
                <strong>{getSubscriptionStatusText()}</strong>
              </span>
              {daysUntilExpiration && daysUntilExpiration > 0 && (
                <Badge variant="outline" className="ml-2">
                  {t("days_remaining", { days: daysUntilExpiration })}
                </Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Feature Lock Screen */}
      <Card className="border-2 border-dashed border-muted-foreground/20">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FeatureIcon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl flex items-center justify-center space-x-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <span>{featureLabel}</span>
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700"
            >
              <Crown className="h-3 w-3 mr-1" />
              {t("premium")}
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">{featureDescription}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Trial/Free User Upgrade Options */}
          {(!isPaidUser() || isTrialUser()) && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold mb-2">
                  {t("unlock_this_feature")}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("upgrade_for_premium")}
                </p>
              </div>

              <div className="max-w-md mx-auto">
                {/* Premium Plan */}
                <Card className="border-2 border-primary/20 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {t("most_popular")}
                    </Badge>
                  </div>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-blue-500" />
                      <span>{t("premium")}</span>
                    </CardTitle>
                    <div className="text-2xl font-bold">
                      R$ 29,90
                      <span className="text-sm font-normal text-muted-foreground">
                        {t("per_month")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      {[
                        t("complete_crypto_access"),
                        t("advanced_charts_reports"),
                        t("data_export"),
                        t("unlimited_budgets"),
                        t("unlimited_investments"),
                      ].map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                      {t("choose_premium")}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Expired Subscription */}
          {isPaidUser() &&
            getDaysUntilExpiration() !== null &&
            getDaysUntilExpiration()! <= 0 && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <div className="space-y-2">
                    <p className="font-medium">{t("subscription_expired")}</p>
                    <p className="text-sm">{t("renew_subscription_message")}</p>
                    <Button size="sm" className="mt-2">
                      {t("renew_subscription")}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" asChild>
              <Link to="/dashboard/perfil">
                <Crown className="h-4 w-4 mr-2" />
                {t("view_plans")}
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link to="/dashboard">{t("back_to_dashboard")}</Link>
            </Button>
          </div>

          {/* Contact Support */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              {t("need_help_choosing_plan")}
            </p>
            <Button variant="link" size="sm" asChild>
              <Link to="/dashboard/configuracoes">
                <Shield className="h-4 w-4 mr-1" />
                {t("contact_support")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
