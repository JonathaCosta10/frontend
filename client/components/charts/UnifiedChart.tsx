import React from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartContainer from './ChartContainer';
import { useChart, UseChartOptions, ChartConfig } from '@/hooks/useChart';

// Register all Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface UnifiedChartProps extends UseChartOptions {
  title?: string;
  apiCall: () => Promise<any>;
  emptyStateConfig?: {
    title: string;
    description: string;
    actions?: Array<{
      label: string;
      href: string;
      variant?: 'default' | 'outline';
    }>;
  };
  className?: string;
  height?: string;
  children?: React.ReactNode; // For additional content below chart
}

const renderChart = (type: ChartConfig['type'], data: any, options: any) => {
  const chartProps = { data, options };
  
  switch (type) {
    case 'pie':
      return <Pie {...chartProps} />;
    case 'bar':
      return <Bar {...chartProps} />;
    case 'line':
      return <Line {...chartProps} />;
    case 'area':
      return <Line {...chartProps} />; // Area chart is line chart with fill
    default:
      return <div>Tipo de gráfico não suportado</div>;
  }
};

export const UnifiedChart: React.FC<UnifiedChartProps> = ({
  title,
  apiCall,
  emptyStateConfig,
  className = '',
  height = 'h-[300px]',
  children,
  ...chartOptions
}) => {
  const { 
    chartData, 
    chartConfig, 
    loading, 
    error, 
    refetch, 
    isEmpty 
  } = useChart(apiCall, chartOptions);

  const chartContent = () => {
    if (!chartData || !chartConfig) return null;
    
    return (
      <div className="space-y-4">
        <div className={`w-full ${height}`}>
          {renderChart(chartConfig.type, chartData, chartConfig.options)}
        </div>
        {children}
      </div>
    );
  };

  return (
    <ChartContainer
      title={title}
      loading={loading}
      error={error}
      isEmpty={isEmpty}
      emptyStateConfig={emptyStateConfig}
      onRefresh={refetch}
      className={className}
    >
      {chartContent()}
    </ChartContainer>
  );
};

export default UnifiedChart;
