/**
 * Configurações reutilizáveis para gráficos
 * Utiliza a biblioteca Chart.js para configurações consistentes em toda a aplicação
 */

import { timeSeriesColors, categoryColors } from './colors';

// Opções de configuração básicas para gráficos
export const chartConfig = {
  // Configurações comuns
  common: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        align: 'center',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12,
        },
        padding: 12,
        cornerRadius: 4,
        boxPadding: 4,
      },
    },
  },

  // Escalas para gráficos com valores monetários
  moneyScales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        font: {
          size: 11,
        },
        callback: function(value: any) {
          if (typeof value === 'number') {
            // Formatar para valores monetários simplificados
            if (value >= 1000000) {
              return 'R$ ' + (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return 'R$ ' + (value / 1000).toFixed(1) + 'K';
            }
            return 'R$ ' + value;
          }
          return value;
        }
      },
    },
  },

  // Configuração para gráficos de pizza/donut
  pieOptions: {
    cutout: '0%',
  },
  
  doughnutOptions: {
    cutout: '60%',
  },
  
  // Configuração compacta (sem legenda)
  compact: {
    legend: {
      display: false,
    },
    tooltip: {
      titleFont: {
        family: "'Inter', sans-serif",
        size: 12,
        weight: 'bold',
      },
      bodyFont: {
        family: "'Inter', sans-serif",
        size: 11,
      },
      padding: 8,
    },
    maintainAspectRatio: true,
    aspectRatio: 1.5,
  },
};

// Funções auxiliares para criação de gráficos

// Função para gerar cores para datasets baseado em categorias
export function getCategoryColors(categories: string[]): string[] {
  return categories.map((category) => {
    // @ts-ignore - Ignorando erro de tipagem para acesso dinâmico
    return categoryColors[category] || '#CCCCCC';
  });
}

// Função para gerar datasets para gráficos de linha/barra com múltiplas séries
export function generateTimeSeriesDatasets(
  labels: string[],
  dataSeries: { label: string; data: number[] }[]
) {
  return {
    labels,
    datasets: dataSeries.map((series, index) => ({
      label: series.label,
      data: series.data,
      backgroundColor: timeSeriesColors[index % timeSeriesColors.length],
      borderColor: timeSeriesColors[index % timeSeriesColors.length],
      borderWidth: 2,
      tension: 0.3,
      fill: false,
    })),
  };
}

// Função para gerar dataset para gráfico de pizza/donut
export function generatePieDataset(
  labels: string[],
  data: number[],
  categories: string[] = []
) {
  // Usa as cores das categorias se fornecidas, senão usa as cores da série temporal
  const backgroundColor = categories.length > 0
    ? getCategoryColors(categories)
    : labels.map((_, i) => timeSeriesColors[i % timeSeriesColors.length]);
  
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderWidth: 1,
        borderColor: backgroundColor.map(color => color),
      },
    ],
  };
}

// Função para gerar tooltips personalizados com formatação de moeda
export function currencyTooltipCallback(tooltipItems: any) {
  if (!tooltipItems.raw) return '';
  
  const value = tooltipItems.raw;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Função para gerar tooltips personalizados com formatação percentual
export function percentTooltipCallback(tooltipItems: any) {
  if (!tooltipItems.raw) return '';
  
  const value = tooltipItems.raw;
  return value.toFixed(2) + '%';
}

// Função para criar um gráfico de linha com configuração compacta
export function createCompactLineChart(labels: string[], data: number[], label: string = '') {
  return {
    labels,
    datasets: [
      {
        label,
        data,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3B82F6',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 0,
      }
    ]
  };
}

// Função para criar um gráfico de linha com múltiplos datasets
export function createMultiLineChart(
  labels: string[],
  datasets: Array<{ label: string; data: number[]; color?: string }>
) {
  return {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset.color || timeSeriesColors[index % timeSeriesColors.length],
      borderColor: dataset.color || timeSeriesColors[index % timeSeriesColors.length],
      borderWidth: 2,
      tension: 0.3,
      fill: false,
    })),
  };
}

// Função para criar um gráfico de barras
export function createBarChart(
  labels: string[],
  data: number[],
  label: string = '',
  color: string = '#3B82F6'
) {
  return {
    labels,
    datasets: [
      {
        label,
        data,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
      }
    ]
  };
}

// Função para criar um gráfico de barras horizontal
export function createHorizontalBarChart(
  labels: string[],
  data: number[],
  label: string = '',
  colors?: string[]
) {
  return {
    labels,
    datasets: [
      {
        label,
        data,
        backgroundColor: colors || labels.map((_, i) => timeSeriesColors[i % timeSeriesColors.length]),
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
      }
    ]
  };
}

// Função para criar um gráfico de pizza
export function createPieChart(
  labels: string[],
  data: number[],
  categories: string[] = []
) {
  // Se fornecido categorias, usa as cores específicas de cada categoria
  const backgroundColor = categories.length > 0
    ? getCategoryColors(categories)
    : labels.map((_, i) => timeSeriesColors[i % timeSeriesColors.length]);
  
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
      }
    ]
  };
}
