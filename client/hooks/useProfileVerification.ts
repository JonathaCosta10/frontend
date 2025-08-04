import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { localStorageManager } from "../lib/localStorage";
import { eventEmitter, EVENTS } from "../lib/eventEmitter";

export interface UserProfile {
  subscriptionType: "free" | "premium" | "enterprise";
  subscriptionStatus: "active" | "expired" | "trial" | "cancelled";
  subscriptionEndDate?: string;
  features: {
    maxBudgets: number;
    maxInvestments: number;
    cryptoAccess: boolean;
    advancedCharts: boolean;
    exportData: boolean;
    prioritySupport: boolean;
  };
  limits: {
    currentBudgets: number;
    currentInvestments: number;
  };
}

export function useProfileVerification() {
  const { user, premiumStatusVersion } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      // If no user, set loading to false and profile to null
      setIsLoading(false);
      setProfile(null);
    }
  }, [user, premiumStatusVersion]); // Reagir a mudanças no status premium

  // Escutar eventos de mudança de status premium
  useEffect(() => {
    const handlePremiumStatusChange = () => {
      console.log("🔔 useProfileVerification recebeu mudança de status premium");
      fetchUserProfile();
    };

    const handleUserDataUpdate = (data: any) => {
      if (data.premiumStatusChanged) {
        console.log("🔔 useProfileVerification detectou mudança de status premium via user data update");
        fetchUserProfile();
      }
    };

    // Registrar listeners
    eventEmitter.on(EVENTS.PREMIUM_STATUS_CHANGED, handlePremiumStatusChange);
    eventEmitter.on(EVENTS.USER_DATA_UPDATED, handleUserDataUpdate);
    
    return () => {
      // Limpar listeners
      eventEmitter.off(EVENTS.PREMIUM_STATUS_CHANGED, handlePremiumStatusChange);
      eventEmitter.off(EVENTS.USER_DATA_UPDATED, handleUserDataUpdate);
    };
  }, []);

  const fetchUserProfile = async () => {
    setIsLoading(true);

    try {
      // Buscar informação premium do localStorage (vem do backend no login/refresh)
      const isPaidUserFromStorage = localStorageManager.get("isPaidUser");
      const userData = localStorageManager.getUserData();
      
      // Usar dados reais do backend
      const isPaidUser = isPaidUserFromStorage || userData?.isPaidUser || false;
      
      console.log("🔍 Verificando status premium:", {
        fromStorage: isPaidUserFromStorage,
        fromUserData: userData?.isPaidUser,
        finalStatus: isPaidUser
      });

      // Check if it's the premium developer user (fallback para desenvolvimento)
      const isPremiumDeveloper = localStorage.getItem("isPremiumDeveloper") === "true";

      // Criar perfil baseado nos dados reais do backend
      const realProfile: UserProfile = {
        subscriptionType: isPremiumDeveloper ? "enterprise" : 
                         isPaidUser ? "premium" : "free",
        subscriptionStatus: "active",
        subscriptionEndDate: isPaidUser ? 
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : 
          undefined,
        features: {
          maxBudgets: isPremiumDeveloper ? -1 : isPaidUser ? 10 : 3, // -1 = unlimited
          maxInvestments: isPremiumDeveloper ? -1 : isPaidUser ? 50 : 10,
          cryptoAccess: isPremiumDeveloper || isPaidUser,
          advancedCharts: isPremiumDeveloper || isPaidUser,
          exportData: isPremiumDeveloper || isPaidUser,
          prioritySupport: isPremiumDeveloper || isPaidUser,
        },
        limits: {
          currentBudgets: 2,
          currentInvestments: 5,
        }
      };

      setProfile(realProfile);
      setIsLoading(false);
      
      console.log("✅ Perfil premium configurado:", {
        subscriptionType: realProfile.subscriptionType,
        cryptoAccess: realProfile.features.cryptoAccess,
        advancedCharts: realProfile.features.advancedCharts
      });
      
    } catch (error) {
      console.error("❌ Erro ao verificar perfil premium:", error);
      setIsLoading(false);
      setProfile(null);
    }
  };

  const hasFeatureAccess = (feature: keyof UserProfile['features']): boolean => {
    if (!profile) return false;
    return profile.features[feature] as boolean;
  };

  const canCreateMoreBudgets = (): boolean => {
    if (!profile) return false;
    if (profile.features.maxBudgets === -1) return true; // unlimited
    return profile.limits.currentBudgets < profile.features.maxBudgets;
  };

  const canCreateMoreInvestments = (): boolean => {
    if (!profile) return false;
    if (profile.features.maxInvestments === -1) return true; // unlimited
    return profile.limits.currentInvestments < profile.features.maxInvestments;
  };

  const getRemainingBudgets = (): number => {
    if (!profile) return 0;
    if (profile.features.maxBudgets === -1) return Infinity;
    return Math.max(0, profile.features.maxBudgets - profile.limits.currentBudgets);
  };

  const getRemainingInvestments = (): number => {
    if (!profile) return 0;
    if (profile.features.maxInvestments === -1) return Infinity;
    return Math.max(0, profile.features.maxInvestments - profile.limits.currentInvestments);
  };

  const isPaidUser = (): boolean => {
    if (!profile) return false;
    return profile.subscriptionType !== "free" && profile.subscriptionStatus === "active";
  };

  const isTrialUser = (): boolean => {
    if (!profile) return false;
    return profile.subscriptionStatus === "trial";
  };

  const isSubscriptionExpired = (): boolean => {
    if (!profile) return false;
    if (!profile.subscriptionEndDate) return false;
    return new Date(profile.subscriptionEndDate) < new Date();
  };

  const getSubscriptionStatusText = (): string => {
    if (!profile) return "Carregando...";
    
    switch (profile.subscriptionStatus) {
      case "active":
        return profile.subscriptionType === "free" ? "Gratuito" : 
               `${profile.subscriptionType.charAt(0).toUpperCase() + profile.subscriptionType.slice(1)} Ativo`;
      case "trial":
        return "Período de Teste";
      case "expired":
        return "Expirado";
      case "cancelled":
        return "Cancelado";
      default:
        return "Desconhecido";
    }
  };

  const getDaysUntilExpiration = (): number | null => {
    if (!profile?.subscriptionEndDate) return null;
    const endDate = new Date(profile.subscriptionEndDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return {
    profile,
    isLoading,
    hasFeatureAccess,
    canCreateMoreBudgets,
    canCreateMoreInvestments,
    getRemainingBudgets,
    getRemainingInvestments,
    isPaidUser,
    isTrialUser,
    isSubscriptionExpired,
    getSubscriptionStatusText,
    getDaysUntilExpiration,
    refreshProfile: fetchUserProfile,
  };
}
