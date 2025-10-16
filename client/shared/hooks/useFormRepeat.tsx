/**
 * Hook personalizado para gerenciar repetição de formulários
 * Permite salvar e recuperar valores de formulário do localStorage facilmente
 */

import { useState, useCallback } from 'react';
import { setLastFormData, getLastFormData } from '@/utils/formRepeat';

/**
 * Hook para gerenciar repetição de formulários
 * @param storageKey Chave para armazenar os dados no localStorage
 * @param initialValues Valores iniciais do formulário (opcional)
 */
function useFormRepeat<T>(storageKey: string, initialValues?: T) {
  // Estado para armazenar os valores do formulário
  const [formValues, setFormValues] = useState<T | undefined>(initialValues);

  /**
   * Função para aplicar os últimos valores salvos
   * @returns Valores recuperados ou undefined se não houver dados salvos
   */
  const applyLastValues = useCallback((): T | undefined => {
    const lastValues = getLastFormData<T>(storageKey);
    if (lastValues) {
      setFormValues(lastValues);
      return lastValues;
    }
    return undefined;
  }, [storageKey]);

  /**
   * Função para salvar os valores atuais
   * @param values Valores a serem salvos
   */
  const saveValues = useCallback((values: T): void => {
    setLastFormData<T>(storageKey, values);
    setFormValues(values);
  }, [storageKey]);

  /**
   * Função para limpar os valores salvos
   */
  const clearSavedValues = useCallback((): void => {
    localStorage.removeItem(storageKey);
    setFormValues(initialValues);
  }, [storageKey, initialValues]);

  return {
    formValues,
    lastValues: getLastFormData<T>(storageKey),
    applyLastValues,
    saveValues,
    clearSavedValues,
  };
}

export default useFormRepeat;
