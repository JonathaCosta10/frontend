import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { localStorageManager } from '../lib/localStorage';

export interface UserProfile {
  id: number;
  email: string;
  nome: string;
  premium: boolean;
  plano: string;
  data_expiracao: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileVerificationResult {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isPaidUser: () => boolean;
  refreshProfile: () => Promise<void>;
}

// Cache global para evitar múltiplas chamadas simultâneas - REVERTIDO para estabilidade
let globalProfileData: UserProfile | null = null;
let globalPremiumStatus: boolean | null = null;
let lastProfileFetch = 0;
let isCurrentlyFetching = false;
const PROFILE_CACHE_TTL = 60000; // 1 minuto para reduzir requisições

export const useProfileVerification = (): ProfileVerificationResult => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(globalProfileData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Função para buscar perfil de forma controlada
  const fetchProfile = useCallback(async (force = false): Promise<UserProfile | null> => {
    if (!authUser?.email) {
      console.log('❌ [PROFILE] Usuário não autenticado');
      return null;
    }

    // Evitar múltiplas requisições simultâneas
    if (isCurrentlyFetching && !force) {
      console.log('⏳ [PROFILE] Requisição já em andamento, aguardando...');
      return globalProfileData;
    }

    // Verificar cache se não forçado
    if (!force && globalProfileData && Date.now() - lastProfileFetch < PROFILE_CACHE_TTL) {
      console.log('📦 [PROFILE] Cache global válido, usando dados existentes');
      return globalProfileData;
    }

    try {
      isCurrentlyFetching = true;
      if (mountedRef.current) {
        setIsLoading(true);
        setError(null);
      }
      
      console.log('🔄 [PROFILE] Buscando perfil do usuário:', authUser.email);
      
      const response = await api.get('/api/user/profile/');
      
      if (!response.data) {
        throw new Error('Dados do perfil não encontrados');
      }

      const profile: UserProfile = {
        id: response.data.id,
        email: response.data.email,
        nome: response.data.nome || response.data.name || authUser.email,
        premium: Boolean(response.data.premium),
        plano: response.data.plano || 'free',
        data_expiracao: response.data.data_expiracao,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at
      };

      // Atualizar cache global e localStorage
      globalProfileData = profile;
      globalPremiumStatus = profile.premium;
      lastProfileFetch = Date.now();
      
      localStorage.setItem('user', JSON.stringify(profile));
      localStorageManager.set("isPaidUser", profile.premium);
      
      if (mountedRef.current) {
        setUser(profile);
      }
      
      console.log('✅ [PROFILE] Perfil atualizado com sucesso');
      return profile;
      
    } catch (error) {
      console.error('❌ [PROFILE] Erro na API:', error);
      
      // Em caso de erro, tentar usar dados do localStorage como fallback
      const localUserData = localStorage.getItem('user');
      if (localUserData) {
        try {
          const localUser = JSON.parse(localUserData);
          console.log('🛟 [PROFILE] Usando dados do localStorage como fallback');
          
          globalProfileData = localUser;
          globalPremiumStatus = Boolean(localUser.premium);
          lastProfileFetch = Date.now() - (PROFILE_CACHE_TTL / 2); // Cache mais curto para dados locais
          
          if (mountedRef.current) {
            setUser(localUser);
            setError(null);
          }
          
          return localUser;
        } catch (parseError) {
          console.error('❌ [PROFILE] Erro ao parsear localStorage:', parseError);
        }
      }
      
      // Se chegou aqui, realmente há um erro
      if (mountedRef.current) {
        setError(error instanceof Error ? error.message : 'Erro ao carregar perfil');
      }
      
      return null;
    } finally {
      isCurrentlyFetching = false;
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [authUser?.email]);

  // FUNÇÃO CENTRALIZADA DE VERIFICAÇÃO PREMIUM OTIMIZADA - REVERTIDA
  const isPaidUser = useCallback((): boolean => {
    console.log("🔍 [PROFILE] Verificando status premium centralizado...");
    
    // 1. Verificar cache global primeiro (mais rápido)
    if (globalPremiumStatus !== null && Date.now() - lastProfileFetch < PROFILE_CACHE_TTL) {
      console.log(`📦 [PROFILE] Cache global hit: ${globalPremiumStatus ? "Premium" : "Gratuito"}`);
      return globalPremiumStatus;
    }
    
    // 2. Verificar dados do perfil atual
    if (user && typeof user.premium === 'boolean') {
      console.log(`👤 [PROFILE] Status do perfil atual: ${user.premium ? "Premium" : "Gratuito"}`);
      globalPremiumStatus = user.premium;
      return user.premium;
    }
    
    // 3. Verificar localStorage como fallback
    const premiumStatus = localStorageManager.get("isPaidUser");
    if (premiumStatus !== null && premiumStatus !== undefined) {
      const isPremium = Boolean(premiumStatus);
      console.log(`💾 [PROFILE] Status do localStorage: ${isPremium ? "Premium" : "Gratuito"}`);
      globalPremiumStatus = isPremium;
      return isPremium;
    }
    
    // 4. Verificar localStorage.user como último recurso
    const localUserData = localStorage.getItem('user');
    if (localUserData) {
      try {
        const localUser = JSON.parse(localUserData);
        if (localUser && typeof localUser.premium === 'boolean') {
          console.log(`🗂️ [PROFILE] Status do localStorage.user: ${localUser.premium ? "Premium" : "Gratuito"}`);
          globalPremiumStatus = localUser.premium;
          localStorageManager.set("isPaidUser", localUser.premium);
          return localUser.premium;
        }
      } catch (error) {
        console.warn('⚠️ [PROFILE] Erro ao parsear localStorage:', error);
      }
    }
    
    // 5. Por segurança, assumir não premium
    console.log('⚠️ [PROFILE] Nenhum dado encontrado, assumindo NÃO premium');
    globalPremiumStatus = false;
    return false;
  }, [user]);

  // Função para atualizar perfil (força refresh)
  const refreshProfile = useCallback(async () => {
    console.log('🔄 [PROFILE] Forçando refresh do perfil...');
    await fetchProfile(true);
  }, [fetchProfile]);

  // Buscar perfil na inicialização (apenas se não há cache válido)
  useEffect(() => {
    if (authUser?.email && !globalProfileData) {
      fetchProfile();
    } else if (globalProfileData && mountedRef.current) {
      setUser(globalProfileData);
    }
  }, [authUser?.email, fetchProfile]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    user,
    isLoading,
    error,
    isPaidUser,
    refreshProfile
  };
};
