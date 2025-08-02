import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

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
  const { user } = useAuth();
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
  }, [user]);

  const fetchUserProfile = async () => {
    setIsLoading(true);

    // Simulate API call - replace with real API
    setTimeout(() => {
      // Check if it's the premium developer user
      const isPremiumDeveloper = localStorage.getItem("isPremiumDeveloper") === "true";

      // Mock user profile based on user data
      const mockProfile: UserProfile = {
        subscriptionType: isPremiumDeveloper ? "enterprise" :
                         user?.email?.includes("premium") ? "premium" :
                         user?.email?.includes("enterprise") ? "enterprise" : "free",
        subscriptionStatus: "active",
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year for dev user
        features: {
          maxBudgets: isPremiumDeveloper ? -1 :
                    user?.email?.includes("premium") ? 10 :
                    user?.email?.includes("enterprise") ? -1 : 3, // -1 = unlimited
          maxInvestments: isPremiumDeveloper ? -1 :
                         user?.email?.includes("premium") ? 50 :
                         user?.email?.includes("enterprise") ? -1 : 10,
          cryptoAccess: isPremiumDeveloper || user?.email?.includes("premium") || user?.email?.includes("enterprise") || false,
          advancedCharts: isPremiumDeveloper || user?.email?.includes("premium") || user?.email?.includes("enterprise") || false,
          exportData: isPremiumDeveloper || user?.email?.includes("premium") || user?.email?.includes("enterprise") || false,
          prioritySupport: isPremiumDeveloper || user?.email?.includes("enterprise") || false,
        },
        limits: {
          currentBudgets: 2,
          currentInvestments: 5,
        }
      };

      setProfile(mockProfile);
      setIsLoading(false);
    }, 1000);
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
