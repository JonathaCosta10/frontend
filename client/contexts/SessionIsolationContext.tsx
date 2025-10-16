import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface SessionIsolationContextType {
  currentUserId: string | null;
  sessionId: string | null;
  validateUserAccess: (resourceUserId: string) => boolean;
  clearUserSession: () => void;
  isUserDataValid: (data: any) => boolean;
  sanitizeUserData: <T extends { userId?: string }>(data: T[]) => T[];
}

const SessionIsolationContext = createContext<SessionIsolationContextType | null>(null);

export const useSessionIsolation = () => {
  const context = useContext(SessionIsolationContext);
  if (!context) {
    throw new Error('useSessionIsolation must be used within SessionIsolationProvider');
  }
  return context;
};

interface SessionIsolationProviderProps {
  children: React.ReactNode;
}

export const SessionIsolationProvider: React.FC<SessionIsolationProviderProps> = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Gerar session ID único
  useEffect(() => {
    const generateSessionId = () => {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
    
    setSessionId(generateSessionId());
  }, [currentUserId]);

  // Validar se o usuário atual pode acessar um recurso
  const validateUserAccess = useCallback((resourceUserId: string): boolean => {
    if (!currentUserId) {
      return false;
    }
    return currentUserId === resourceUserId;
  }, [currentUserId]);

  // Limpar toda a sessão do usuário
  const clearUserSession = useCallback(() => {
    console.log('🔒 Limpando sessão do usuário:', currentUserId);
    
    // Limpar localStorage apenas de dados do usuário atual
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes(currentUserId || '') || key.includes('user_data'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Limpar sessionStorage
    sessionStorage.clear();

    // Reset do estado
    setCurrentUserId(null);
    setSessionId(null);
  }, [currentUserId]);

  // Validar se dados pertencem ao usuário atual
  const isUserDataValid = useCallback((data: any): boolean => {
    if (!data || !currentUserId) {
      return false;
    }

    // Se é um objeto com userId
    if (data.userId) {
      return data.userId === currentUserId;
    }

    // Se é um array, verificar todos os itens
    if (Array.isArray(data)) {
      return data.every(item => !item.userId || item.userId === currentUserId);
    }

    // Se não tem userId, assumir que é válido (dados públicos)
    return true;
  }, [currentUserId]);

  // Sanitizar dados removendo informações de outros usuários
  const sanitizeUserData = useCallback(<T extends { userId?: string }>(data: T[]): T[] => {
    if (!currentUserId) {
      return [];
    }

    return data.filter(item => {
      // Se não tem userId, assumir que é público
      if (!item.userId) {
        return true;
      }
      // Só retornar dados do usuário atual
      return item.userId === currentUserId;
    });
  }, [currentUserId]);

  // Listener para mudanças de autenticação
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_user_id') {
        const newUserId = e.newValue;
        if (newUserId !== currentUserId) {
          console.log('🔄 Mudança de usuário detectada:', currentUserId, '->', newUserId);
          clearUserSession();
          setCurrentUserId(newUserId);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUserId, clearUserSession]);

  // Inicializar com usuário atual do localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('auth_user_id');
    if (storedUserId && storedUserId !== currentUserId) {
      setCurrentUserId(storedUserId);
    }
  }, []);

  const value: SessionIsolationContextType = {
    currentUserId,
    sessionId,
    validateUserAccess,
    clearUserSession,
    isUserDataValid,
    sanitizeUserData
  };

  return (
    <SessionIsolationContext.Provider value={value}>
      {children}
    </SessionIsolationContext.Provider>
  );
};