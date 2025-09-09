import { useState, useEffect, useCallback } from 'react';
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

export const useProfileVerification = (): ProfileVerificationResult => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // FUNÇÃO CENTRALIZADA DE VERIFICAÇÃO PREMIUM
  // Esta função é o único ponto de verificação em toda a aplicação
  const isPaidUser = useCallback((): boolean => {
    console.log("🔍 Verificando status premium centralizado...");
    
    // SEMPRE verificar primeiro no localStorage (fonte primária de verdade)
    const premiumStatus = localStorageManager.get("isPaidUser");
    
    if (premiumStatus !== null && premiumStatus !== undefined) {
      // Converter explicitamente para boolean para garantir tipo consistente
      const isPremium = Boolean(premiumStatus);
      console.log(`🔍 Status premium do localStorage: ${isPremium ? "Premium" : "Gratuito"}`);
      return isPremium;
    }
    
    // Caso o localStorage não tenha a informação, verificar nos dados do usuário
    if (user && typeof user.premium === 'boolean') {
      console.log(`🔍 Status premium do perfil do usuário: ${user.premium ? "Premium" : "Gratuito"}`);
      return user.premium;
    }
    
    // Se não houver dados, verificar no AuthContext
    const localUserData = localStorage.getItem('user');
    if (localUserData) {
      try {
        const localUser = JSON.parse(localUserData);
        if (localUser && typeof localUser.premium === 'boolean') {
          console.log(`🔍 Status premium do localStorage.user: ${localUser.premium ? "Premium" : "Gratuito"}`);
          return localUser.premium;
        }
      } catch (error) {
        console.warn('⚠️ Erro ao parsear dados do localStorage:', error);
      }
    }
    
    // Por segurança, assumir que não é premium se não encontrar dados
    console.log('⚠️ Nenhum dado de premium encontrado, assumindo NÃO premium');
    return false;
  }, [user]);
  
  // Função para buscar perfil do usuário
  const fetchUserProfile = useCallback(async () => {
    if (!authUser?.email) {
      console.log('👤 Nenhum usuário autenticado');
      setUser(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Buscando perfil do usuário:', authUser.email);
      
      // Fazer requisição para verificar perfil
      const response = await api.get('/api/user/profile/');
      
      if (response.data) {
        const profileData: UserProfile = {
          id: response.data.id,
          email: response.data.email,
          nome: response.data.nome || response.data.name || authUser.email,
          premium: Boolean(response.data.premium),
          plano: response.data.plano || 'free',
          data_expiracao: response.data.data_expiracao,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at
        };

        console.log('✅ Perfil carregado:', profileData);
        setUser(profileData);

        // IMPORTANTE: Atualizar o localStorage com status premium atual
        // Esta é a fonte primária de verdade para todo o aplicativo
        localStorage.setItem('user', JSON.stringify(profileData));
        localStorageManager.set("isPaidUser", profileData.premium);
        console.log(`✅ Status premium atualizado no localStorage: ${profileData.premium ? "Premium" : "Gratuito"}`);
      } else {
        console.warn('⚠️ Resposta da API sem dados válidos');
        setError('Dados do perfil não encontrados');
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar perfil:', error);
      
      // Em caso de erro, tentar usar dados do localStorage
      const localUserData = localStorage.getItem('user');
      if (localUserData) {
        try {
          const localUser = JSON.parse(localUserData);
          console.log('🛟 Usando dados do localStorage após erro na API');
          setUser(localUser);
          
          // Verificar se temos status premium no localStorage
          if (localStorageManager.get("isPaidUser") === null && localUser.premium !== undefined) {
            localStorageManager.set("isPaidUser", Boolean(localUser.premium));
            console.log(`🛟 Recuperando status premium do localStorage.user: ${Boolean(localUser.premium) ? "Premium" : "Gratuito"}`);
          }
        } catch (parseError) {
          console.error('❌ Erro ao parsear localStorage:', parseError);
          setError('Erro ao carregar perfil do usuário');
        }
      } else {
        setError('Erro ao carregar perfil do usuário');
      }
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.email]);

  // Função para atualizar perfil
  const refreshProfile = useCallback(async () => {
    await fetchUserProfile();
  }, [fetchUserProfile]);

  // Efeito para carregar perfil quando usuário muda
  useEffect(() => {
    if (authUser?.email) {
      fetchUserProfile();
    } else {
      setUser(null);
      setError(null);
    }
  }, [authUser?.email, fetchUserProfile]);

  // Efeito para escutar mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Reação à mudança no user geral
      if (e.key === 'user' && e.newValue) {
        try {
          const newUser = JSON.parse(e.newValue);
          setUser(newUser);
          console.log('🔄 Perfil atualizado via localStorage:', newUser);
          
          // Verificar se precisamos atualizar o status premium
          if (newUser && typeof newUser.premium === 'boolean') {
            localStorageManager.set("isPaidUser", newUser.premium);
            console.log(`🔄 Status premium atualizado via localStorage.user: ${newUser.premium ? "Premium" : "Gratuito"}`);
          }
        } catch (error) {
          console.error('❌ Erro ao parsear dados do storage:', error);
        }
      }
      
      // Reação direta à mudança do status premium
      if (e.key === 'isPaidUser') {
        console.log('🔄 Status premium alterado via localStorage:', e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    user,
    isLoading,
    error,
    isPaidUser,
    refreshProfile
  };
};
