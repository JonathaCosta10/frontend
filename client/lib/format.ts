/**
 * Funções auxiliares para formatação de valores
 */

/**
 * Formata um valor para moeda
 * 
 * @param value - O valor a ser formatado
 * @param currency - A moeda (padrão: BRL)
 * @param options - Opções de formatação adicionais
 * @returns String formatada como moeda
 */
export function formatCurrency(
  value: number, 
  currency: string = 'BRL', 
  options: Intl.NumberFormatOptions = {}
): string {
  // Valores inválidos retornam placeholder
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(value);
  } catch (error) {
    console.error('Erro ao formatar moeda:', error);
    return value.toFixed(2);
  }
}

/**
 * Formata um valor para percentual
 * 
 * @param value - O valor a ser formatado
 * @param includeSign - Incluir sinal de + para valores positivos
 * @param digits - Número de casas decimais
 * @returns String formatada como percentual
 */
export function formatPercent(
  value: number, 
  includeSign: boolean = false, 
  digits: number = 2
): string {
  // Valores inválidos retornam placeholder
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  try {
    let formatted = new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value / 100);

    // Adicionar sinal de + se necessário
    if (includeSign && value > 0) {
      formatted = '+' + formatted;
    }

    return formatted;
  } catch (error) {
    console.error('Erro ao formatar percentual:', error);
    return `${value.toFixed(digits)}%`;
  }
}

/**
 * Formata um valor numérico com separadores de milhar
 * 
 * @param value - O valor a ser formatado
 * @param digits - Número de casas decimais
 * @returns String formatada com separador de milhar
 */
export function formatNumber(value: number, digits: number = 0): string {
  // Valores inválidos retornam placeholder
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  try {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  } catch (error) {
    console.error('Erro ao formatar número:', error);
    return value.toFixed(digits);
  }
}

/**
 * Formata um valor grande em formato mais legível (K, M, B, T)
 * 
 * @param value - O valor a ser formatado
 * @param digits - Número de casas decimais
 * @param currency - Moeda (opcional)
 * @returns String formatada com sufixos K, M, B ou T
 */
export function formatCompactNumber(
  value: number, 
  digits: number = 1,
  currency?: string
): string {
  // Valores inválidos retornam placeholder
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  
  const prefix = currency ? `${currency} ` : '';
  
  try {
    if (value >= 1e12) return `${prefix}${(value / 1e12).toFixed(digits)}T`;
    if (value >= 1e9) return `${prefix}${(value / 1e9).toFixed(digits)}B`;
    if (value >= 1e6) return `${prefix}${(value / 1e6).toFixed(digits)}M`;
    if (value >= 1e3) return `${prefix}${(value / 1e3).toFixed(digits)}K`;
    return `${prefix}${value.toFixed(digits)}`;
  } catch (error) {
    console.error('Erro ao formatar número compacto:', error);
    return `${prefix}${value.toFixed(digits)}`;
  }
}
