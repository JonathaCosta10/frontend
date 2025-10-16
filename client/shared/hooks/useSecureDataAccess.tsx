import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/core/auth/AuthContext';
import { localStorageManager } from '@/lib/localStorage';

/**
 * Sistema de isolamento de dados por usuário
 * Garante que cada usuário acesse apenas seus próprios dados
 */

interface UserContext {
  userId: string | null;
  email: string | null;
  premium: boolean;
  plano: string;
  isAuthenticated: boolean;
}

interface DataAccessConfig {
  requireAuth: boolean;
  requirePremium?: boolean;
  allowedPlans?: string[];
  userOwnership?: boolean; // Verificar se os dados pertencem ao usuário
}

/**
 * Hook para controle de acesso a dados
 */
export const useSecureDataAccess = (config: DataAccessConfig = { requireAuth: true }) => {
  const { user, isAuthenticated } = useAuth();
  const [userContext, setUserContext] = useState<UserContext>({
    userId: null,
    email: null,
    premium: false,
    plano: 'free',
    isAuthenticated: false
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      setUserContext({
        userId: user.id?.toString() || null,
        email: user.email || null,
        premium: user.premium || false,
        plano: user.plano || 'free',
        isAuthenticated: true
      });
    } else {
      setUserContext({
        userId: null,
        email: null,
        premium: false,
        plano: 'free',
        isAuthenticated: false
      });
    }
  }, [isAuthenticated, user]);

  /**
   * Verifica se o usuário tem acesso aos dados
   */
  const checkAccess = useCallback((dataOwnerUserId?: string): {
    hasAccess: boolean;
    reason?: string;
  } => {
    // Verificar autenticação
    if (config.requireAuth && !userContext.isAuthenticated) {
      return { hasAccess: false, reason: 'Usuário não autenticado' };
    }

    // Verificar premium
    if (config.requirePremium && !userContext.premium) {
      return { hasAccess: false, reason: 'Acesso premium requerido' };
    }

    // Verificar plano
    if (config.allowedPlans && !config.allowedPlans.includes(userContext.plano)) {
      return { hasAccess: false, reason: `Plano ${userContext.plano} não permitido` };
    }

    // Verificar ownership dos dados
    if (config.userOwnership && dataOwnerUserId && dataOwnerUserId !== userContext.userId) {
      return { hasAccess: false, reason: 'Dados não pertencem ao usuário' };
    }

    return { hasAccess: true };
  }, [userContext, config]);

  /**
   * Wrapper para chamadas de API com verificação de acesso
   */
  const secureApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    dataOwnerUserId?: string
  ): Promise<T> => {
    const accessCheck = checkAccess(dataOwnerUserId);
    
    if (!accessCheck.hasAccess) {
      throw new Error(`Acesso negado: ${accessCheck.reason}`);
    }

    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      console.error('🚨 Erro na chamada segura da API:', error);
      throw error;
    }
  }, [checkAccess]);

  /**
   * Cache isolado por usuário
   */
  const getUserCacheKey = useCallback((key: string): string => {
    if (!userContext.userId) {
      throw new Error('Usuário não autenticado para cache');
    }
    return `user_${userContext.userId}_${key}`;
  }, [userContext.userId]);

  /**
   * Storage isolado por usuário
   */
  const secureStorage = {
    get: (key: string) => {
      try {
        const userKey = getUserCacheKey(key);
        return localStorageManager.getItem(userKey);
      } catch (error) {
        console.warn('Erro ao acessar storage seguro:', error);
        return null;
      }
    },
    
    set: (key: string, value: any) => {
      try {
        const userKey = getUserCacheKey(key);
        localStorageManager.setItem(userKey, value);
      } catch (error) {
        console.warn('Erro ao salvar no storage seguro:', error);
      }
    },
    
    remove: (key: string) => {
      try {
        const userKey = getUserCacheKey(key);
        localStorageManager.removeItem(userKey);
      } catch (error) {
        console.warn('Erro ao remover do storage seguro:', error);
      }
    },
    
    clear: () => {
      try {
        if (userContext.userId) {
          const prefix = `user_${userContext.userId}_`;
          localStorageManager.clearUserData(prefix);
        }
      } catch (error) {
        console.warn('Erro ao limpar storage seguro:', error);
      }
    }
  };

  return {
    userContext,
    checkAccess,
    secureApiCall,
    secureStorage,
    isAuthenticated: userContext.isAuthenticated,
    isPremium: userContext.premium,
    userId: userContext.userId
  };
};

/**
 * Validador de dados para garantir integridade
 */
export const validateUserData = (data: any, expectedUserId: string): boolean => {
  if (!data) return false;
  
  // Verificar se os dados têm um campo de user_id ou similar
  const dataUserId = data.user_id || data.userId || data.owner_id;
  
  if (dataUserId && dataUserId.toString() !== expectedUserId) {
    console.error('🚨 Dados não pertencem ao usuário atual!', {
      expectedUserId,
      dataUserId,
      data: process.env.NODE_ENV === 'development' ? data : '[HIDDEN]'
    });
    return false;
  }
  
  return true;
};

/**
 * HOC para proteger componentes com verificação de acesso
 */
export function withSecureAccess<T extends {}>(
  WrappedComponent: React.ComponentType<T>,
  config: DataAccessConfig
) {
  return function SecureComponent(props: T) {
    const { checkAccess, userContext } = useSecureDataAccess(config);
    const [accessChecked, setAccessChecked] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const [accessReason, setAccessReason] = useState<string>('');

    useEffect(() => {
      const access = checkAccess();
      setHasAccess(access.hasAccess);
      setAccessReason(access.reason || '');
      setAccessChecked(true);
    }, [checkAccess]);

    if (!accessChecked) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Verificando acesso...</p>
          </div>
        </div>
      );
    }

    if (!hasAccess) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Restrito</h3>
            <p className="text-sm text-gray-600">{accessReason}</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

/**
 * Utilitário para limpar dados sensíveis do console em produção
 */
export const secureLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data);
  } else {
    // Em produção, log apenas a mensagem
    console.log(message);
  }
};