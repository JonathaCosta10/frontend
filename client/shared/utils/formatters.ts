/**
 * Funções utilitárias para formatação de dados
 * Centraliza a lógica de formatação para manter consistência em toda a aplicação
 * PORTUGUÊS BRASILEIRO APENAS
 */

import { format, par/**
 * Formata tamanho de arquivo em bytes
 * @param bytes Tamanho em bytes
 * @param decimals Número de casas decimais (padrão: 2)
 * @returns String formatada com unidade de tamanho
 */
export const formatFileSize = (
  bytes: number | undefined | null, 
  decimals: number = 2
): string => {
  if (bytes === undefined || bytes === null || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

// ===== FORMATTERS ESPECÍFICOS PARA ANÁLISE DE FII =====

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
  return `Volume Diário = ${formatCurrency(value)}`;
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
 * @param value - Valor do dividend yield
 * @returns String formatada como percentual
 */
export const formatDividendYield = (value: number | string | null | undefined): string => {
  const formatted = formatPercentage(value, 'pt-BR', 2);
  return `${formatted}`;
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
 * Formatar valores para tooltips com contexto adicional
 * @param value - Valor a ser formatado
 * @param type - Tipo de formatação
 * @param context - Contexto adicional para o tooltip
 * @returns Objeto com valor formatado e tooltip
 */
export const formatWithTooltip = (
  value: number | string | null | undefined,
  type: 'currency' | 'percentage' | 'number' | 'pvp' | 'leverage',
  context?: string
): { formatted: string; tooltip: string } => {
  let formatted: string;
  let tooltip: string;

  switch (type) {
    case 'currency':
      formatted = formatCurrency(value);
      tooltip = context || 'Valor monetário';
      break;
    case 'percentage':
      formatted = formatPercentage(value);
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
      formatted = formatNumber(value);
      tooltip = context || 'Valor numérico';
  }

  return { formatted, tooltip };
};

/**
 * Validar se um valor é válido para formatação
 * @param value - Valor a ser validado
 * @returns true se o valor é válido
 */
export const isValidValue = (value: any): boolean => {
  return value !== null && value !== undefined && !isNaN(Number(value));
};cale as DateFnsLocale } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { currencyFormatMap, dateFormatMap } from './mappings';

// Map de locales do date-fns - apenas português brasileiro
const localeMap: Record<string, DateFnsLocale> = {
  'pt-BR': ptBR
};

/**
 * Formata um valor para moeda
 * @param value Valor a ser formatado
 * @param locale Código do idioma (padrão: pt-BR) - PORTUGUÊS APENAS
 * @param hideCents Ocultar os centavos (padrão: false)
 * @returns String formatada em moeda
 */
export const formatCurrency = (
  value: number | undefined | null,
  locale: string = 'pt-BR',
  hideCents: boolean = false
): string => {
  if (value === undefined || value === null) return '-';

  const formatConfig = currencyFormatMap[locale] || currencyFormatMap['pt-BR'];
  
  return new Intl.NumberFormat(formatConfig.locale, {
    style: 'currency',
    currency: formatConfig.currency,
    minimumFractionDigits: hideCents ? 0 : 2,
    maximumFractionDigits: hideCents ? 0 : 2
  }).format(value);
};

/**
 * Formata um valor percentual
 * @param value Valor a ser formatado (0-100 ou 0-1)
 * @param locale Código do idioma (padrão: pt-BR)
 * @param decimals Número de casas decimais (padrão: 2)
 * @param convertFromDecimal Se true, converte de decimal (0-1) para percentual (0-100)
 * @returns String formatada em percentual
 */
export const formatPercentage = (
  value: number | undefined | null,
  locale: string = 'pt-BR',
  decimals: number = 2,
  convertFromDecimal: boolean = false
): string => {
  if (value === undefined || value === null) return '-';

  // Se o valor é decimal (entre 0-1) e a conversão está habilitada
  if (convertFromDecimal && value >= 0 && value <= 1) {
    value = value * 100;
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
};

/**
 * Formata um valor numérico com separador de milhares
 * @param value Valor a ser formatado
 * @param locale Código do idioma (padrão: pt-BR)
 * @param decimals Número de casas decimais (padrão: 0)
 * @returns String formatada com separador de milhares
 */
export const formatNumber = (
  value: number | undefined | null,
  locale: string = 'pt-BR',
  decimals: number = 0
): string => {
  if (value === undefined || value === null) return '-';
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Formata uma data para o formato padrão do idioma
 * @param date Data a ser formatada (string ISO, objeto Date ou timestamp)
 * @param locale Código do idioma (padrão: pt-BR)
 * @param customFormat Formato personalizado (opcional)
 * @returns String formatada com a data
 */
export const formatDate = (
  date: string | Date | number | undefined | null,
  locale: string = 'pt-BR',
  customFormat?: string
): string => {
  if (!date) return '-';

  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return '-';
  }
  
  if (!isValid(dateObj)) return '-';
  
  const dateFormat = customFormat || dateFormatMap[locale] || 'dd/MM/yyyy';
  const dateLocale = localeMap[locale] || ptBR;
  
  return format(dateObj, dateFormat, { locale: dateLocale });
};

/**
 * Formata um nome para exibição (capitaliza primeira letra de cada palavra)
 * @param name Nome a ser formatado
 * @returns String formatada com nome capitalizado
 */
export const formatName = (name: string | undefined | null): string => {
  if (!name) return '-';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formata um CPF/CNPJ
 * @param value CPF ou CNPJ a ser formatado
 * @returns String formatada com CPF/CNPJ
 */
export const formatDocument = (value: string | undefined | null): string => {
  if (!value) return '-';
  
  // Remove caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 11) {
    // CPF: 000.000.000-00
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (numbers.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return value;
};

/**
 * Trunca um texto longo adicionando reticências
 * @param text Texto a ser truncado
 * @param maxLength Comprimento máximo (padrão: 50)
 * @returns Texto truncado com reticências se necessário
 */
export const truncateText = (
  text: string | undefined | null, 
  maxLength: number = 50
): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Converte um valor de string para número
 * @param value String a ser convertida
 * @param defaultValue Valor padrão se a conversão falhar
 * @returns Número convertido ou valor padrão
 */
export const parseNumberValue = (
  value: string | undefined | null, 
  defaultValue: number = 0
): number => {
  if (!value) return defaultValue;
  
  // Remove caracteres não numéricos, mantendo ponto e vírgula
  const sanitized = value
    .replace(/[^\d.,]/g, '')
    .replace(',', '.');
  
  const number = parseFloat(sanitized);
  
  return isNaN(number) ? defaultValue : number;
};

/**
 * Formata bytes para unidades legíveis (KB, MB, GB)
 * @param bytes Tamanho em bytes
 * @param decimals Número de casas decimais (padrão: 2)
 * @returns String formatada com unidade de tamanho
 */
export const formatFileSize = (
  bytes: number | undefined | null, 
  decimals: number = 2
): string => {
  if (bytes === undefined || bytes === null || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};
