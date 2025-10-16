/**
 * Formatadores específicos para análise de FII
 * Utiliza as funções base do formatters.ts com adaptações para FII
 */

import { formatCurrency, formatPercentage } from './formatters';

/**
 * Formatar P/VP com precisão específica
 * @param value - Valor P/VP
 * @returns String formatada (ex: 0.7866 -> "0,79")
 */
export const formatPVP = (value: number | string | null | undefined): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (numValue === null || numValue === undefined || isNaN(numValue)) {
    return '0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

/**
 * Formatar volume diário
 * @param value - Valor do volume
 * @returns String formatada como "Volume Diário = R$ xxx.xxx,xx"
 */
export const formatDailyVolume = (value: number | string | null | undefined): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (numValue === null || numValue === undefined || isNaN(numValue)) {
    return 'Volume Diário = R$ 0,00';
  }
  return `Volume Diário = ${formatCurrency(numValue)}`;
};

/**
 * Formatar alavancagem como percentual
 * @param value - Valor da alavancagem (decimal)
 * @returns String formatada como percentual (ex: 0.2346 -> "23,5%")
 */
export const formatLeverage = (value: number | string | null | undefined): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (numValue === null || numValue === undefined || isNaN(numValue)) {
    return '0,0%';
  }
  return formatPercentage(numValue * 100, 'pt-BR', 1);
};

/**
 * Formatar dividend yield mensal
 * @param value - Valor do dividend yield (ex: 0.76 -> "0,76%")
 * @returns String formatada como percentual
 */
export const formatDividendYield = (value: number | string | null | undefined): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (numValue === null || numValue === undefined || isNaN(numValue)) {
    return '0,00%';
  }
  return formatPercentage(numValue, 'pt-BR', 2);
};

/**
 * Formatar número simples para exibição
 * @param value - Valor numérico
 * @param decimals - Número de casas decimais (padrão: 2)
 * @returns String formatada
 */
export const formatSimpleNumber = (
  value: number | string | null | undefined,
  decimals: number = 2
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (numValue === null || numValue === undefined || isNaN(numValue)) {
    return '0';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
};

/**
 * Formatar valores grandes com sufixos (K, M, B)
 * @param value - Valor numérico
 * @param decimals - Número de casas decimais (padrão: 1)
 * @returns String formatada com sufixo (ex: 1.2M, 500K, 2.1B)
 */
export const formatLargeNumber = (
  value: number | string | null | undefined,
  decimals: number = 1
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (numValue === null || numValue === undefined || isNaN(numValue)) {
    return '0';
  }

  const absValue = Math.abs(numValue);
  
  if (absValue >= 1000000000) {
    return `${formatSimpleNumber(numValue / 1000000000, decimals)}B`;
  } else if (absValue >= 1000000) {
    return `${formatSimpleNumber(numValue / 1000000, decimals)}M`;
  } else if (absValue >= 1000) {
    return `${formatSimpleNumber(numValue / 1000, decimals)}K`;
  }
  
  return formatSimpleNumber(numValue, decimals);
};

/**
 * Determinar cor baseada na variação
 * @param variation - Valor da variação
 * @returns Classe CSS para coloração
 */
export const getVariationColor = (variation: number | null | undefined): string => {
  if (variation === null || variation === undefined || variation === 0) {
    return 'text-gray-600';
  }
  return variation > 0 ? 'text-green-600' : 'text-red-600';
};

/**
 * Determinar ícone de tendência baseado na variação
 * @param variation - Valor da variação
 * @returns Nome do ícone Lucide
 */
export const getTrendIcon = (variation: number | null | undefined): string => {
  if (variation === null || variation === undefined || variation === 0) {
    return 'Minus';
  }
  return variation > 0 ? 'TrendingUp' : 'TrendingDown';
};

/**
 * Formatar data brasileira
 * @param dateString - String de data
 * @returns Data formatada no padrão brasileiro
 */
export const formatBrazilianDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    return dateString; // Retorna o valor original em caso de erro
  }
};

/**
 * Validar se um valor é válido para formatação
 * @param value - Valor a ser validado
 * @returns true se o valor é válido
 */
export const isValidValue = (value: any): boolean => {
  return value !== null && value !== undefined && !isNaN(Number(value));
};

/**
 * Formatar valores com contexto para tooltips
 * @param value - Valor a ser formatado
 * @param type - Tipo de formatação
 * @param context - Contexto adicional para o tooltip
 * @returns Objeto com valor formatado e tooltip
 */
export const formatWithTooltip = (
  value: number | string | null | undefined,
  type: 'currency' | 'percentage' | 'pvp' | 'leverage' | 'number',
  context?: string
): { formatted: string; tooltip: string } => {
  let formatted: string;
  let tooltip: string;

  switch (type) {
    case 'currency':
      const numVal = typeof value === 'string' ? parseFloat(value) : value;
      formatted = formatCurrency(numVal);
      tooltip = context || 'Valor monetário';
      break;
    case 'percentage':
      formatted = formatDividendYield(value);
      tooltip = context || 'Percentual';
      break;
    case 'pvp':
      formatted = formatPVP(value);
      tooltip = context || 'Relação Preço ÷ Valor Patrimonial por cota';
      break;
    case 'leverage':
      formatted = formatLeverage(value);
      tooltip = context || 'Índice de alavancagem (dívida/PL)';
      break;
    default:
      formatted = formatSimpleNumber(value);
      tooltip = context || 'Valor numérico';
  }

  return { formatted, tooltip };
};
