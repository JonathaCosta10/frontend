/**
 * Formata um valor monetário para exibição compacta
 * Útil para gráficos e displays com espaço limitado
 * 
 * @param value Valor a ser formatado
 * @param locale Código do idioma (padrão: pt-BR) - PORTUGUÊS APENAS
 * @returns String formatada de forma compacta (ex: R$ 1,5M)
 */
export const formatCurrencyCompact = (
  value: number | undefined | null,
  locale: string = 'pt-BR'
): string => {
  if (value === undefined || value === null) return '-';

  // Define símbolos para português (Brasil)
  const symbols = {
    'pt-BR': { currency: 'R$', thousand: 'mil', million: 'M', billion: 'B' }
  };

  // Usa símbolos do português brasileiro
  const sym = symbols['pt-BR'];

  // Define casas decimais baseado na magnitude
  const abs = Math.abs(value);
  let formatted: string;

  if (abs >= 1000000000) {
    // Bilhões
    formatted = `${sym.currency} ${(value / 1000000000).toFixed(1).replace('.0', '')}${sym.billion}`;
  } else if (abs >= 1000000) {
    // Milhões
    formatted = `${sym.currency} ${(value / 1000000).toFixed(1).replace('.0', '')}${sym.million}`;
  } else if (abs >= 1000) {
    // Milhares
    formatted = `${sym.currency} ${(value / 1000).toFixed(1).replace('.0', '')}${sym.thousand}`;
  } else {
    // Valores menores que 1000
    formatted = `${sym.currency} ${value.toFixed(0)}`;
  }

  return formatted;
};
