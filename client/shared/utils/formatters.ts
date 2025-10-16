/**/**

 * Funções utilitárias para formatação de dados * Funções utilitárias para formatação de dados

 * Centraliza a lógica de formatação para manter consistência em toda a aplicação * Centraliza a lógica de formatação para manter consistência em toda a aplicação

 * PORTUGUÊS BRASILEIRO APENAS * PORTUGUÊS BRASILEIRO APENAS

 */ */



import { format, parseISO, isValid, Locale as DateFnsLocale } from 'date-fns';import { format, parseISO, isValid, Locale as DateFnsLocale } from 'date-fns';

import { ptBR } from 'date-fns/locale';import { ptBR } from 'date-fns/locale';



/**/**

 * Formata tamanho de arquivo em bytes * Formata tamanho de arquivo em bytes

 * @param bytes Tamanho em bytes * @param bytes Tamanho em bytes

 * @param decimals Número de casas decimais (padrão: 2) * @param decimals Número de casas decimais (padrão: 2)

 * @returns String formatada com unidade de tamanho * @returns String formatada com unidade de tamanho

 */ */

export const formatFileSize = (export const formatFileSize = (

  bytes: number | undefined | null,   bytes: number | undefined | null, 

  decimals: number = 2  decimals: number = 2

): string => {): string => {

  if (bytes === undefined || bytes === null || bytes === 0) return '0 Bytes';  if (bytes === undefined || bytes === null || bytes === 0) return '0 Bytes';

    

  const k = 1024;  const k = 1024;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));  const i = Math.floor(Math.log(bytes) / Math.log(k));

    

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;

};};



/**// ===== FORMATTERS ESPECÍFICOS PARA ANÁLISE DE FII =====

 * Formata número como moeda brasileira

 * @param value Valor numérico/**

 * @param showSymbol Se deve exibir o símbolo R$ (padrão: true) * Formatar P/VP com precisão específica

 * @returns String formatada como moeda brasileira * @param value - Valor P/VP

 */ * @returns String formatada (ex: 0.7866 -> "0,79")

export const formatCurrency = ( */

  value: number | string | undefined | null,export const formatPVP = (value: number | string | null | undefined): string => {

  showSymbol: boolean = true  const numValue = typeof value === 'string' ? parseFloat(value) : value;

): string => {  if (numValue === null || numValue === undefined || isNaN(numValue)) {

  if (value === undefined || value === null) return showSymbol ? 'R$ 0,00' : '0,00';    return '0,00';

    }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;  return new Intl.NumberFormat('pt-BR', {

  if (isNaN(numValue)) return showSymbol ? 'R$ 0,00' : '0,00';    minimumFractionDigits: 2,

      maximumFractionDigits: 2,

  const formatted = new Intl.NumberFormat('pt-BR', {  }).format(numValue);

    style: 'currency',};

    currency: 'BRL',

    minimumFractionDigits: 2,/**

    maximumFractionDigits: 2 * Formatar volume diário

  }).format(numValue); * @param value - Valor do volume

   * @returns String formatada como "Volume Diário = R$ xxx.xxx,xx"

  return showSymbol ? formatted : formatted.replace('R$', '').trim(); */

};export const formatDailyVolume = (value: number | string | null | undefined): string => {

  return `Volume Diário = ${formatCurrency(value)}`;

/**};

 * Formata número como percentual

 * @param value Valor numérico (decimal: 0.15 = 15%)/**

 * @param decimals Número de casas decimais (padrão: 2) * Formatar alavancagem como percentual

 * @returns String formatada como percentual * @param value - Valor da alavancagem (decimal)

 */ * @returns String formatada como percentual (ex: 0.2346 -> "23,5%")

export const formatPercentage = ( */

  value: number | string | undefined | null,export const formatLeverage = (value: number | string | null | undefined): string => {

  decimals: number = 2  const numValue = typeof value === 'string' ? parseFloat(value) : value;

): string => {  if (numValue === null || numValue === undefined || isNaN(numValue)) {

  if (value === undefined || value === null) return '0,00%';    return '0,0%';

    }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;  return formatPercentage(numValue * 100, 'pt-BR', 1);

  if (isNaN(numValue)) return '0,00%';};

  

  return new Intl.NumberFormat('pt-BR', {/**

    style: 'percent', * Formatar dividend yield mensal

    minimumFractionDigits: decimals, * @param value - Valor do dividend yield

    maximumFractionDigits: decimals * @returns String formatada como percentual

  }).format(numValue); */

};export const formatDividendYield = (value: number | string | null | undefined): string => {

  const formatted = formatPercentage(value, 'pt-BR', 2);

/**  return `${formatted}`;

 * Formata número com separadores de milhares};

 * @param value Valor numérico

 * @param decimals Número de casas decimais (padrão: 2)/**

 * @returns String formatada com separadores * Determinar cor baseada na variação

 */ * @param variation - Valor da variação

export const formatNumber = ( * @returns Classe CSS para coloração

  value: number | string | undefined | null, */

  decimals: number = 2export const getVariationColor = (variation: number | null | undefined): string => {

): string => {  if (variation === null || variation === undefined || variation === 0) {

  if (value === undefined || value === null) return '0';    return 'text-gray-600';

    }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;  return variation > 0 ? 'text-green-600' : 'text-red-600';

  if (isNaN(numValue)) return '0';};

  

  return new Intl.NumberFormat('pt-BR', {/**

    minimumFractionDigits: decimals, * Determinar ícone de tendência baseado na variação

    maximumFractionDigits: decimals * @param variation - Valor da variação

  }).format(numValue); * @returns Nome do ícone Lucide

}; */

export const getTrendIcon = (variation: number | null | undefined): string => {

/**  if (variation === null || variation === undefined || variation === 0) {

 * Formata data no padrão brasileiro    return 'Minus';

 * @param date Data como string ISO ou objeto Date  }

 * @param formatStr Formato da data (padrão: 'dd/MM/yyyy')  return variation > 0 ? 'TrendingUp' : 'TrendingDown';

 * @returns String formatada da data};

 */

export const formatDate = (/**

  date: string | Date | undefined | null, * Formatar valores para tooltips com contexto adicional

  formatStr: string = 'dd/MM/yyyy' * @param value - Valor a ser formatado

): string => { * @param type - Tipo de formatação

  if (!date) return ''; * @param context - Contexto adicional para o tooltip

   * @returns Objeto com valor formatado e tooltip

  try { */

    const dateObj = typeof date === 'string' ? parseISO(date) : date;export const formatWithTooltip = (

    if (!isValid(dateObj)) return '';  value: number | string | null | undefined,

      type: 'currency' | 'percentage' | 'number' | 'pvp' | 'leverage',

    return format(dateObj, formatStr, { locale: ptBR });  context?: string

  } catch (error) {): { formatted: string; tooltip: string } => {

    return '';  let formatted: string;

  }  let tooltip: string;

};

  switch (type) {

/**    case 'currency':

 * Formata data e hora no padrão brasileiro      formatted = formatCurrency(value);

 * @param date Data como string ISO ou objeto Date      tooltip = context || 'Valor monetário';

 * @returns String formatada da data e hora      break;

 */    case 'percentage':

export const formatDateTime = (      formatted = formatPercentage(value);

  date: string | Date | undefined | null      tooltip = context || 'Percentual';

): string => {      break;

  return formatDate(date, 'dd/MM/yyyy HH:mm');    case 'pvp':

};      formatted = formatPVP(value);

      tooltip = context || 'Relação Preço ÷ Valor Patrimonial por cota';

/**      break;

 * Formata volume de negociação    case 'leverage':

 * @param value Valor do volume      formatted = formatLeverage(value);

 * @returns String formatada do volume      tooltip = context || 'Índice de alavancagem (dívida/PL)';

 */      break;

export const formatVolume = (    default:

  value: number | string | undefined | null      formatted = formatNumber(value);

): string => {      tooltip = context || 'Valor numérico';

  if (value === undefined || value === null) return 'R$ 0,00';  }

  

  const numValue = typeof value === 'string' ? parseFloat(value) : value;  return { formatted, tooltip };

  if (isNaN(numValue)) return 'R$ 0,00';};

  

  return `Volume Diário = ${formatCurrency(numValue)}`;/**

}; * Validar se um valor é válido para formatação

 * @param value - Valor a ser validado

/** * @returns true se o valor é válido

 * Formata P/L ratio */

 * @param value Valor do P/Lexport const isValidValue = (value: any): boolean => {

 * @returns String formatada do P/L  return value !== null && value !== undefined && !isNaN(Number(value));

 */};cale as DateFnsLocale } from 'date-fns';

export const formatPL = (import { ptBR } from 'date-fns/locale';

  value: number | string | undefined | nullimport { currencyFormatMap, dateFormatMap } from './mappings';

): string => {

  if (value === undefined || value === null) return 'P/L: N/A';// Map de locales do date-fns - apenas português brasileiro

  const localeMap: Record<string, DateFnsLocale> = {

  const numValue = typeof value === 'string' ? parseFloat(value) : value;  'pt-BR': ptBR

  if (isNaN(numValue)) return 'P/L: N/A';};

  

  const formatted = formatPercentage(numValue, 2);/**

  return `P/L = ${formatted}`; * Formata um valor para moeda

}; * @param value Valor a ser formatado

 * @param locale Código do idioma (padrão: pt-BR) - PORTUGUÊS APENAS

/** * @param hideCents Ocultar os centavos (padrão: false)

 * Formata automaticamente baseado no tipo de valor * @returns String formatada em moeda

 * @param value Valor a ser formatado */

 * @param type Tipo de formataçãoexport const formatCurrency = (

 * @returns String formatada  value: number | undefined | null,

 */  locale: string = 'pt-BR',

export const formatValue = (  hideCents: boolean = false

  value: string | number | undefined | null,): string => {

  type: 'currency' | 'percentage' | 'number' | 'date' | 'datetime' = 'number'  if (value === undefined || value === null) return '-';

): string => {

  if (value === undefined || value === null) return '';  const formatConfig = currencyFormatMap[locale] || currencyFormatMap['pt-BR'];

    

  let formatted = '';  return new Intl.NumberFormat(formatConfig.locale, {

      style: 'currency',

  switch (type) {    currency: formatConfig.currency,

    case 'currency':    minimumFractionDigits: hideCents ? 0 : 2,

      formatted = formatCurrency(typeof value === 'string' ? parseFloat(value) : value);    maximumFractionDigits: hideCents ? 0 : 2

      break;  }).format(value);

    case 'percentage':};

      formatted = formatPercentage(typeof value === 'string' ? parseFloat(value) : value);

      break;/**

    case 'date': * Formata um valor percentual

      formatted = formatDate(value as string); * @param value Valor a ser formatado (0-100 ou 0-1)

      break; * @param locale Código do idioma (padrão: pt-BR)

    case 'datetime': * @param decimals Número de casas decimais (padrão: 2)

      formatted = formatDateTime(value as string); * @param convertFromDecimal Se true, converte de decimal (0-1) para percentual (0-100)

      break; * @returns String formatada em percentual

    case 'number': */

    default:export const formatPercentage = (

      formatted = formatNumber(typeof value === 'string' ? parseFloat(value) : value);  value: number | undefined | null,

      break;  locale: string = 'pt-BR',

  }  decimals: number = 2,

    convertFromDecimal: boolean = false

  return formatted;): string => {

};  if (value === undefined || value === null) return '-';



/**  // Se o valor é decimal (entre 0-1) e a conversão está habilitada

 * Validar se um valor é válido para formatação  if (convertFromDecimal && value >= 0 && value <= 1) {

 * @param value - Valor a ser validado    value = value * 100;

 * @returns true se o valor é válido  }

 */  

export const isValidValue = (value: any): boolean => {  return new Intl.NumberFormat(locale, {

  return value !== null && value !== undefined && !isNaN(Number(value));    style: 'percent',

};    minimumFractionDigits: decimals,

    maximumFractionDigits: decimals

/**  }).format(value / 100);

 * Truncar string com reticências};

 * @param str String a ser truncada

 * @param length Comprimento máximo/**

 * @returns String truncada * Formata um valor numérico com separador de milhares

 */ * @param value Valor a ser formatado

export const truncateString = (str: string, length: number): string => { * @param locale Código do idioma (padrão: pt-BR)

  if (!str || str.length <= length) return str || ''; * @param decimals Número de casas decimais (padrão: 0)

  return str.substring(0, length) + '...'; * @returns String formatada com separador de milhares

}; */

export const formatNumber = (

/**  value: number | undefined | null,

 * Formatar número de telefone brasileiro  locale: string = 'pt-BR',

 * @param phone Número do telefone  decimals: number = 0

 * @returns Telefone formatado): string => {

 */  if (value === undefined || value === null) return '-';

export const formatPhone = (phone: string): string => {  

  if (!phone) return '';  return new Intl.NumberFormat(locale, {

      minimumFractionDigits: decimals,

  const cleaned = phone.replace(/\D/g, '');    maximumFractionDigits: decimals

    }).format(value);

  if (cleaned.length === 11) {};

    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');

  } else if (cleaned.length === 10) {/**

    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3'); * Formata uma data para o formato padrão do idioma

  } * @param date Data a ser formatada (string ISO, objeto Date ou timestamp)

   * @param locale Código do idioma (padrão: pt-BR)

  return phone; * @param customFormat Formato personalizado (opcional)

}; * @returns String formatada com a data

 */

/**export const formatDate = (

 * Formatar CPF  date: string | Date | number | undefined | null,

 * @param cpf Número do CPF  locale: string = 'pt-BR',

 * @returns CPF formatado  customFormat?: string

 */): string => {

export const formatCPF = (cpf: string): string => {  if (!date) return '-';

  if (!cpf) return '';

    let dateObj: Date;

  const cleaned = cpf.replace(/\D/g, '');  

    if (typeof date === 'string') {

  if (cleaned.length === 11) {    dateObj = parseISO(date);

    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');  } else if (date instanceof Date) {

  }    dateObj = date;

    } else if (typeof date === 'number') {

  return cpf;    dateObj = new Date(date);

};  } else {

    return '-';

/**  }

 * Formatar CNPJ  

 * @param cnpj Número do CNPJ  if (!isValid(dateObj)) return '-';

 * @returns CNPJ formatado  

 */  const dateFormat = customFormat || dateFormatMap[locale] || 'dd/MM/yyyy';

export const formatCNPJ = (cnpj: string): string => {  const dateLocale = localeMap[locale] || ptBR;

  if (!cnpj) return '';  

    return format(dateObj, dateFormat, { locale: dateLocale });

  const cleaned = cnpj.replace(/\D/g, '');};

  

  if (cleaned.length === 14) {/**

    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'); * Formata um nome para exibição (capitaliza primeira letra de cada palavra)

  } * @param name Nome a ser formatado

   * @returns String formatada com nome capitalizado

  return cnpj; */

};export const formatName = (name: string | undefined | null): string => {

  if (!name) return '-';

export default {  

  formatFileSize,  return name

  formatCurrency,    .toLowerCase()

  formatPercentage,    .split(' ')

  formatNumber,    .map(word => word.charAt(0).toUpperCase() + word.slice(1))

  formatDate,    .join(' ');

  formatDateTime,};

  formatVolume,

  formatPL,/**

  formatValue, * Formata um CPF/CNPJ

  isValidValue, * @param value CPF ou CNPJ a ser formatado

  truncateString, * @returns String formatada com CPF/CNPJ

  formatPhone, */

  formatCPF,export const formatDocument = (value: string | undefined | null): string => {

  formatCNPJ  if (!value) return '-';

};  
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
