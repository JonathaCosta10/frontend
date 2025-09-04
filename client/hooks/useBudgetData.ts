import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDataCache } from '../contexts/DataCacheContext';

interface UseBudgetDataProps {
  initialMes?: string;
  initialAno?: string;
}

interface BudgetDataState {
  mes: string;
  ano: string;
  data: any;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook otimizado para gerenciar dados de orçamento com cache e navegação de datas
 * Evita chamadas desnecessárias à API quando o usuário navega entre meses
 */
export function useBudgetData({ initialMes, initialAno }: UseBudgetDataProps = {}) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  const { getDistribuicaoGastos, loadingStates } = useDataCache();
  
  // Estado local para controle da navegação
  const [mes, setMes] = useState(initialMes || String(currentMonth));
  const [ano, setAno] = useState(initialAno || String(currentYear));
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Verificar se está carregando dados específicos
  const isLoading = useMemo(() => {
    const cacheKey = `distribuicao_${ano}`;
    return loadingStates[cacheKey] || false;
  }, [loadingStates, ano]);

  // Função para carregar dados com debounce e cache
  const loadData = useCallback(async (targetAno: string, force: boolean = false) => {
    try {
      setError(null);
      console.log('📊 Carregando dados para ano:', targetAno);
      
      const response = await getDistribuicaoGastos(parseInt(targetAno), force);
      setData(response);
      
      console.log('✅ Dados carregados com sucesso para:', targetAno);
      return response;
    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do orçamento');
      setData(null);
      throw err;
    }
  }, [getDistribuicaoGastos]);

  // Carregar dados quando o ano mudar
  useEffect(() => {
    loadData(ano);
  }, [ano, loadData]);

  // Funções otimizadas para mudança de mês/ano
  const handleMesChange = useCallback((newMes: string) => {
    console.log('📅 Mudando mês:', mes, '->', newMes);
    setMes(newMes);
    // Não precisa recarregar dados, apenas mudar o estado local
  }, [mes]);

  const handleAnoChange = useCallback((newAno: string) => {
    console.log('📅 Mudando ano:', ano, '->', newAno);
    if (newAno !== ano) {
      setAno(newAno);
      // Dados serão recarregados automaticamente pelo useEffect
    }
  }, [ano]);

  // Função para forçar refresh dos dados
  const refreshData = useCallback(async () => {
    console.log('🔄 Forçando refresh dos dados');
    return await loadData(ano, true);
  }, [loadData, ano]);

  // Dados filtrados para o mês atual selecionado
  const currentMonthData = useMemo(() => {
    if (!data || !data.dados_mensais) return null;
    
    const monthKey = mes.padStart(2, '0'); // Garantir formato MM
    return data.dados_mensais[monthKey] || null;
  }, [data, mes]);

  // Verificar se o mês selecionado tem dados
  const hasDataForSelectedMonth = useMemo(() => {
    if (!data || !data.meses_disponeis) return false;
    return data.meses_disponeis.includes(mes);
  }, [data, mes]);

  // Verificar se é o mês/ano atual
  const isCurrentMonthYear = useMemo(() => {
    return parseInt(mes) === currentMonth && parseInt(ano) === currentYear;
  }, [mes, ano, currentMonth, currentYear]);

  // Retornar estado e funções
  return {
    // Estado atual
    mes,
    ano,
    data,
    currentMonthData,
    isLoading,
    error,
    
    // Estados derivados
    hasDataForSelectedMonth,
    isCurrentMonthYear,
    mesesDisponiveis: data?.meses_disponeis || [],
    histData: data?.hist_data || null,
    
    // Funções de controle
    handleMesChange,
    handleAnoChange,
    refreshData,
    
    // Função auxiliar para carregar dados de outros anos
    loadDataForYear: loadData
  };
}
