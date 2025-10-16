import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { 
  LiquidezData, 
  ComposicaoAtivoData, 
  RecebiveisData, 
  PassivoData, 
  HistoricoMensalItem,
  PriceHistory 
} from '@/types/fii-analysis';
import { formatBrazilianDate, formatLeverage, formatSimpleNumber } from '@/utils/fii-formatters';
import { formatCurrency } from '@/utils/formatters';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Chart colors theme
const chartColors = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0891b2',
  light: '#f8fafc',
  muted: '#64748b'
};

interface ChartWrapperProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({ title, children, className = "" }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-64 w-full">
        {children}
      </div>
    </CardContent>
  </Card>
);

interface GapLiquidezChartProps {
  historico: HistoricoMensalItem[];
}

export const GapLiquidezChart: React.FC<GapLiquidezChartProps> = ({ historico }) => {
  const data = {
    labels: historico.map(item => formatBrazilianDate(item.data_referencia)),
    datasets: [
      {
        label: 'Gap de Liquidez',
        data: historico.map(item => item.gap_liquidez * 100), // Convert to percentage
        borderColor: chartColors.primary,
        backgroundColor: `${chartColors.primary}20`,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Gap: ${context.parsed.y.toFixed(4)}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  return (
    <ChartWrapper title="Gap de Liquidez (Mensal)">
      <Line data={data} options={options} />
    </ChartWrapper>
  );
};

interface ComposicaoAtivoChartProps {
  composicao: ComposicaoAtivoData;
}

export const ComposicaoAtivoChart: React.FC<ComposicaoAtivoChartProps> = ({ composicao }) => {
  const { raw } = composicao;
  
  const data = {
    labels: [
      'Imóveis Renda Acabados',
      'Terrenos',
      'FII',
      'Ações Sociedades',
      'Imóveis em Construção'
    ],
    datasets: [
      {
        data: [
          raw.imoveis_renda_acabados,
          raw.terrenos,
          raw.fii,
          raw.acoes_sociedades_atividades_fii,
          raw.imoveis_renda_construcao
        ],
        backgroundColor: [
          chartColors.primary,
          chartColors.success,
          chartColors.warning,
          chartColors.info,
          chartColors.secondary
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed;
            const percentage = ((value / raw.total_investido) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <ChartWrapper title="Composição do Portfólio">
      <Pie data={data} options={options} />
    </ChartWrapper>
  );
};

interface RecebiveisChartProps {
  historico: HistoricoMensalItem[];
}

export const RecebiveisChart: React.FC<RecebiveisChartProps> = ({ historico }) => {
  const data = {
    labels: historico.map(item => formatBrazilianDate(item.data_referencia)),
    datasets: [
      {
        label: 'Aluguéis',
        data: historico.map(item => item.valores_receber * item.percent_aluguel),
        backgroundColor: chartColors.success,
      },
      {
        label: 'Outros Recebíveis',
        data: historico.map(item => item.valores_receber * item.percent_outros),
        backgroundColor: chartColors.warning,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        ticks: {
          callback: (value: any) => formatCurrency(value),
        },
      },
    },
  };

  return (
    <ChartWrapper title="Aluguéis vs Outros Recebíveis (Mensal)">
      <Bar data={data} options={options} />
    </ChartWrapper>
  );
};

interface AlavancagemChartProps {
  historico: HistoricoMensalItem[];
}

export const AlavancagemChart: React.FC<AlavancagemChartProps> = ({ historico }) => {
  const data = {
    labels: historico.map(item => formatBrazilianDate(item.data_referencia)),
    datasets: [
      {
        label: 'Alavancagem',
        data: historico.map(item => item.alavancagem * 100), // Convert to percentage
        borderColor: chartColors.danger,
        backgroundColor: `${chartColors.danger}20`,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Alavancagem: ${context.parsed.y.toFixed(1)}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  return (
    <ChartWrapper title="Evolução da Alavancagem">
      <Line data={data} options={options} />
    </ChartWrapper>
  );
};

interface PriceHistoryChartProps {
  priceHistory: PriceHistory[];
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ priceHistory }) => {
  const data = {
    labels: priceHistory.map(item => formatBrazilianDate(item.data)),
    datasets: [
      {
        label: 'Preço',
        data: priceHistory.map(item => item.preco),
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primary,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Preço: ${formatCurrency(context.parsed.y)}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: any) => formatCurrency(value),
        },
      },
    },
  };

  return (
    <ChartWrapper title="Histórico de Preços (Última Semana)" className="lg:col-span-2">
      <Line data={data} options={options} />
    </ChartWrapper>
  );
};

// Export all charts as a single object for easier importing
export const FIICharts = {
  GapLiquidezChart,
  ComposicaoAtivoChart,
  RecebiveisChart,
  AlavancagemChart,
  PriceHistoryChart,
};
