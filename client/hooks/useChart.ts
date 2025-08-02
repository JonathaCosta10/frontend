import { useState, useEffect, useCallback } from 'react';
import { useApiData } from './useApiData';

export interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: any;
}

export interface ChartConfig {
  type: 'pie' | 'bar' | 'line' | 'area';
  colors?: string[];
  labels?: string[];
  datasets?: any[];
  options?: any;
}

export interface UseChartOptions {
  refreshInterval?: number;
  dependencies?: any[];
  dataTransformer?: (data: any) => ChartDataPoint[];
  chartConfigGenerator?: (data: ChartDataPoint[]) => ChartConfig;
}

const defaultColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
  '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
];

const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: 'currentColor',
        usePointStyle: true,
        padding: 20,
      },
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const value = context.parsed.y ?? context.parsed;
          // Note: This is a generic formatter. Components should override with useLocale formatting
          return `${context.label}: ${value.toLocaleString(undefined, {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2
          })}`;
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: 'currentColor',
      },
      grid: {
        color: 'hsl(var(--border))',
      }
    },
    y: {
      ticks: {
        color: 'currentColor',
        callback: function (value: any) {
          // Note: This is a generic formatter. Components should override with useLocale formatting
          return value.toLocaleString(undefined, {
            style: 'currency',
            currency: 'BRL'
          });
        },
      },
      grid: {
        color: 'hsl(var(--border))',
      }
    }
  }
};

export const useChart = <T = any>(
  apiCall: () => Promise<T>,
  options: UseChartOptions = {}
) => {
  const {
    refreshInterval,
    dependencies = [],
    dataTransformer,
    chartConfigGenerator
  } = options;

  const { data: rawData, loading, error, refetch } = useApiData(
    apiCall,
    { 
      refreshInterval,
      dependencies 
    }
  );

  const [chartData, setChartData] = useState<any>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);

  const processData = useCallback(() => {
    if (!rawData) return;

    let processedData: ChartDataPoint[];
    
    if (dataTransformer) {
      processedData = dataTransformer(rawData);
    } else {
      // Default transformer - assumes data is already in correct format
      processedData = Array.isArray(rawData) ? rawData : [];
    }

    let config: ChartConfig;
    
    if (chartConfigGenerator) {
      config = chartConfigGenerator(processedData);
    } else {
      // Default config generation
      config = generateDefaultConfig(processedData);
    }

    setChartData(generateChartJSData(processedData, config));
    setChartConfig(config);
  }, [rawData, dataTransformer, chartConfigGenerator]);

  useEffect(() => {
    processData();
  }, [processData]);

  const generateDefaultConfig = (data: ChartDataPoint[]): ChartConfig => {
    return {
      type: 'pie',
      colors: defaultColors.slice(0, data.length),
      options: defaultChartOptions
    };
  };

  const generateChartJSData = (data: ChartDataPoint[], config: ChartConfig) => {
    // If config has custom datasets, use them directly
    if (config.datasets) {
      return {
        labels: config.labels || data.map(item => item.label),
        datasets: config.datasets
      };
    }

    const labels = data.map(item => item.label);
    const values = data.map(item => item.value);

    const baseDataset = {
      data: values,
      backgroundColor: config.colors || defaultColors.slice(0, data.length),
      borderColor: (config.colors || defaultColors).slice(0, data.length).map(color => color + '80'),
      borderWidth: 2,
    };

    if (config.type === 'pie') {
      return {
        labels,
        datasets: [baseDataset]
      };
    }

    if (config.type === 'bar') {
      return {
        labels,
        datasets: [{
          ...baseDataset,
          borderRadius: 4,
        }]
      };
    }

    if (config.type === 'line') {
      return {
        labels,
        datasets: [{
          ...baseDataset,
          borderColor: baseDataset.backgroundColor[0],
          backgroundColor: `${baseDataset.backgroundColor[0]}20`,
          borderWidth: 3,
          pointBackgroundColor: baseDataset.backgroundColor[0],
          pointBorderColor: 'hsl(var(--background))',
          pointBorderWidth: 2,
          pointRadius: 6,
          tension: 0.4,
          fill: true,
        }]
      };
    }

    return {
      labels,
      datasets: [baseDataset]
    };
  };

  return {
    chartData,
    chartConfig,
    loading,
    error,
    refetch,
    isEmpty: !rawData || (Array.isArray(rawData) && rawData.length === 0)
  };
};

// Utility functions for common chart transformations
export const chartTransformers = {
  // For budget distribution charts
  distribuicaoGastos: (data: any[]): ChartDataPoint[] => 
    data.map(item => ({
      label: item.categoria,
      value: item.valor,
      percentual: item.percentual
    })),

  // For investment allocation charts  
  alocacaoTipo: (data: any): ChartDataPoint[] => {
    const alocacao = data.porcentagem_alocacao;
    const ordemTipos = ['Acoes', 'Fundos Imobiliários', 'Renda Fixa'];
    
    return ordemTipos
      .filter(tipo => alocacao.hasOwnProperty(tipo))
      .map(tipo => ({
        label: tipo,
        value: alocacao[tipo]
      }));
  },

  // For monthly variation charts
  variacaoMensal: (data: any[]): ChartDataPoint[] =>
    data.map(item => {
      const nomeMes = new Date(item.ano, item.mes - 1).toLocaleString('pt-BR', { month: 'long' });
      return {
        label: nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1),
        value: item.valor_total
      };
    }),

  // For goal vs actual spending
  metasCategoria: (data: any[]): ChartDataPoint[] =>
    data.map(item => ({
      label: item.categoria,
      value: item.valor_gasto,
      meta: item.valor_meta,
      percentual: item.percentual_utilizado
    }))
};

// Pre-configured chart generators
export const chartConfigs = {
  pieChart: (colors?: string[]): ChartConfig => ({
    type: 'pie',
    colors: colors || defaultColors,
    options: {
      ...defaultChartOptions,
      plugins: {
        ...defaultChartOptions.plugins,
        legend: {
          position: 'right' as const,
          labels: {
            color: 'currentColor',
            usePointStyle: true,
            padding: 20,
          },
        },
      },
    }
  }),

  barChart: (colors?: string[]): ChartConfig => ({
    type: 'bar',
    colors: colors || defaultColors,
    options: defaultChartOptions
  }),

  lineChart: (color: string = '#36A2EB'): ChartConfig => ({
    type: 'line',
    colors: [color],
    options: defaultChartOptions
  }),

  goalComparisonChart: (): ChartConfig => ({
    type: 'bar',
    colors: ['hsl(220, 91%, 75%)', 'hsl(348, 86%, 75%)'],
    options: {
      ...defaultChartOptions,
      plugins: {
        ...defaultChartOptions.plugins,
        legend: {
          labels: {
            color: 'currentColor',
          },
        },
      }
    }
  })
};
