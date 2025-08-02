import { useTranslation } from '@/contexts/TranslationContext';

/**
 * Hook customizado para formatação consistente baseada no idioma e moeda
 * Substitui formatação hardcoded em todo o projeto
 */
export const useLocale = () => {
  const { language, currency } = useTranslation();
  
  // Mapeia idiomas para locales apropriados
  const getLocale = () => {
    switch (language) {
      case 'pt-BR':
        return 'pt-BR';
      case 'en-US':
        return 'en-US';
      case 'es-ES':
        return 'es-ES';
      default:
        return 'pt-BR';
    }
  };

  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return getCurrencySymbol() + ' 0,00';
    }

    const locale = getLocale();
    
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch (error) {
      console.warn(`Error formatting currency: ${error}`);
      // Fallback para formato padrão
      return `${getCurrencySymbol()} ${value.toFixed(2)}`;
    }
  };

  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }

    const locale = getLocale();
    
    try {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);
    } catch (error) {
      console.warn(`Error formatting number: ${error}`);
      return value.toString();
    }
  };

  const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0%';
    }

    const locale = getLocale();
    
    try {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
      }).format(value / 100);
    } catch (error) {
      console.warn(`Error formatting percentage: ${error}`);
      return `${value.toFixed(1)}%`;
    }
  };

  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const locale = getLocale();
    
    try {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(dateObj);
    } catch (error) {
      console.warn(`Error formatting date: ${error}`);
      return dateObj.toLocaleDateString();
    }
  };

  const formatDatetime = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const locale = getLocale();
    
    try {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(dateObj);
    } catch (error) {
      console.warn(`Error formatting datetime: ${error}`);
      return dateObj.toLocaleString();
    }
  };

  const getCurrencySymbol = (): string => {
    switch (currency) {
      case 'BRL':
        return 'R$';
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      default:
        return 'R$';
    }
  };

  const getCurrencyName = (): string => {
    switch (currency) {
      case 'BRL':
        return 'Real Brasileiro';
      case 'USD':
        return 'Dólar Americano';
      case 'EUR':
        return 'Euro';
      default:
        return 'Real Brasileiro';
    }
  };

  // Helper para formatação compacta de números grandes
  const formatCompactNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }

    const locale = getLocale();
    
    try {
      return new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value);
    } catch (error) {
      // Fallback manual para números grandes
      if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`;
      }
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toString();
    }
  };

  return {
    locale: getLocale(),
    language,
    currency,
    formatCurrency,
    formatNumber,
    formatPercentage,
    formatDate,
    formatDatetime,
    formatCompactNumber,
    getCurrencySymbol,
    getCurrencyName,
  };
};

export default useLocale;
