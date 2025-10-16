import { useCallback, useEffect, useState } from 'react';
import { useSessionIsolation } from '@/contexts/SessionIsolationContext';

interface SecureDataHookOptions {
  autoValidate?: boolean;
  clearOnUserChange?: boolean;
}

export function useSecureData<T extends { userId?: string }>(
  initialData: T[] = [],
  options: SecureDataHookOptions = {}
) {
  const { autoValidate = true, clearOnUserChange = true } = options;
  const { 
    currentUserId, 
    sanitizeUserData, 
    isUserDataValid,
    validateUserAccess 
  } = useSessionIsolation();
  
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setter seguro que valida os dados
  const setSecureData = useCallback((newData: T[]) => {
    try {
      setError(null);
      
      if (!Array.isArray(newData)) {
        throw new Error('Dados devem ser um array');
      }

      // Se autoValidate está ativo, sanitizar os dados
      if (autoValidate) {
        const sanitizedData = sanitizeUserData(newData);
        console.log('🔒 Dados sanitizados:', {
          original: newData.length,
          sanitized: sanitizedData.length,
          userId: currentUserId
        });
        setData(sanitizedData);
      } else {
        setData(newData);
      }
    } catch (err) {
      console.error('❌ Erro ao definir dados seguros:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setData([]);
    }
  }, [autoValidate, sanitizeUserData, currentUserId]);

  // Adicionar item com validação de segurança
  const addSecureItem = useCallback((item: T) => {
    if (!item.userId) {
      console.warn('⚠️ Item sem userId sendo adicionado');
    } else if (item.userId !== currentUserId) {
      console.error('❌ Tentativa de adicionar item de outro usuário:', {
        itemUserId: item.userId,
        currentUserId
      });
      setError('Não é possível adicionar dados de outro usuário');
      return false;
    }

    setData(prev => [...prev, item]);
    return true;
  }, [currentUserId]);

  // Remover item com validação
  const removeSecureItem = useCallback((itemId: string, itemUserId?: string) => {
    if (itemUserId && !validateUserAccess(itemUserId)) {
      console.error('❌ Tentativa de remover item de outro usuário');
      setError('Não é possível remover dados de outro usuário');
      return false;
    }

    setData(prev => prev.filter((item: any) => item.id !== itemId));
    return true;
  }, [validateUserAccess]);

  // Atualizar item com validação
  const updateSecureItem = useCallback((itemId: string, updates: Partial<T>) => {
    setData(prev => prev.map(item => {
      if ((item as any).id === itemId) {
        // Validar se pode atualizar
        if (item.userId && !validateUserAccess(item.userId)) {
          console.error('❌ Tentativa de atualizar item de outro usuário');
          setError('Não é possível atualizar dados de outro usuário');
          return item;
        }
        return { ...item, ...updates };
      }
      return item;
    }));
  }, [validateUserAccess]);

  // Validar todos os dados atuais
  const validateCurrentData = useCallback(() => {
    const validData = data.filter(item => isUserDataValid(item));
    const invalidCount = data.length - validData.length;
    
    if (invalidCount > 0) {
      console.warn(`⚠️ ${invalidCount} itens inválidos encontrados e removidos`);
      setData(validData);
    }
    
    return validData;
  }, [data, isUserDataValid]);

  // Limpar dados quando usuário muda
  useEffect(() => {
    if (clearOnUserChange && currentUserId) {
      console.log('🔄 Limpando dados devido à mudança de usuário');
      setData([]);
      setError(null);
    }
  }, [currentUserId, clearOnUserChange]);

  // Função para buscar dados de forma segura
  const fetchSecureData = useCallback(async (
    fetchFn: () => Promise<T[]>,
    validateOwnership = true
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedData = await fetchFn();
      
      if (validateOwnership) {
        setSecureData(fetchedData);
      } else {
        setData(fetchedData);
      }
    } catch (err) {
      console.error('❌ Erro ao buscar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [setSecureData]);

  return {
    data,
    setSecureData,
    addSecureItem,
    removeSecureItem,
    updateSecureItem,
    validateCurrentData,
    fetchSecureData,
    isLoading,
    error,
    currentUserId,
    dataCount: data.length
  };
}