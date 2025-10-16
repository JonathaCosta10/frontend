/**
 * Utilitário para gerenciar repetição de formulários
 * Armazena e recupera valores de formulário do localStorage para reutilização
 */

// Função para salvar os dados do último formulário enviado no localStorage
export const setLastFormData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar dados do formulário:', error);
  }
};

// Função para obter os dados do último formulário enviado do localStorage
export const getLastFormData = <T>(key: string): T | null => {
  try {
    const savedData = localStorage.getItem(key);
    if (savedData) {
      return JSON.parse(savedData) as T;
    }
  } catch (error) {
    console.error('Erro ao recuperar dados do formulário:', error);
  }
  return null;
};

// Chaves padrão para armazenar os formulários
export const FORM_STORAGE_KEYS = {
  DIVIDAS: 'debts_last_form',
  CUSTOS: 'costs_last_form',
  ENTRADAS: 'entradas_last_form',
  INVESTIMENTOS: 'investments_last_form',
  ATIVOS: 'assets_last_form',
  CARTEIRAS: 'portfolios_last_form',
  TRANSACOES: 'transactions_last_form',
  DIVIDENDOS: 'dividends_last_form',
};
