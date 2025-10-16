import React, { Suspense } from 'react';
import { OptimizedSuspense } from '../OptimizedSuspense';

// Lazy loading específico para Chart.js
const ChartJS = React.lazy(() => 
  import('react-chartjs-2').then(module => ({
    default: module.Chart
  }))
);

const BarChart = React.lazy(() => 
  import('react-chartjs-2').then(module => ({
    default: module.Bar
  }))
);

const LineChart = React.lazy(() => 
  import('react-chartjs-2').then(module => ({
    default: module.Line
  }))
);

const PieChart = React.lazy(() => 
  import('react-chartjs-2').then(module => ({
    default: module.Pie
  }))
);

const DoughnutChart = React.lazy(() => 
  import('react-chartjs-2').then(module => ({
    default: module.Doughnut
  }))
);

// Lazy loading para Recharts
const RechartsLineChart = React.lazy(() => 
  import('recharts').then(module => ({
    default: module.LineChart
  }))
);

const RechartsAreaChart = React.lazy(() => 
  import('recharts').then(module => ({
    default: module.AreaChart
  }))
);

const RechartsBarChart = React.lazy(() => 
  import('recharts').then(module => ({
    default: module.BarChart
  }))
);

const RechartsPieChart = React.lazy(() => 
  import('recharts').then(module => ({
    default: module.PieChart
  }))
);

// Loading placeholder otimizado
const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 rounded-md mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
  </div>
);

// Wrapper genérico para gráficos
interface LazyChartWrapperProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  library: 'chartjs' | 'recharts';
  data: any;
  options?: any;
  children?: React.ReactNode;
  className?: string;
}

export const LazyChartWrapper: React.FC<LazyChartWrapperProps> = ({
  type,
  library,
  data,
  options,
  children,
  className = ''
}) => {
  // Função para selecionar o componente correto
  const getChartComponent = () => {
    if (library === 'chartjs') {
      switch (type) {
        case 'line':
          return LineChart;
        case 'bar':
          return BarChart;
        case 'pie':
          return PieChart;
        case 'doughnut':
          return DoughnutChart;
        default:
          return LineChart;
      }
    } else {
      switch (type) {
        case 'line':
          return RechartsLineChart;
        case 'bar':
          return RechartsBarChart;
        case 'pie':
          return RechartsPieChart;
        case 'area':
          return RechartsAreaChart;
        default:
          return RechartsLineChart;
      }
    }
  };

  const ChartComponent = getChartComponent();

  return (
    <div className={`chart-wrapper ${className}`}>
      <OptimizedSuspense fallback={<ChartSkeleton />}>
        <ChartComponent data={data} options={options}>
          {children}
        </ChartComponent>
      </OptimizedSuspense>
    </div>
  );
};

// Hooks específicos para cada tipo de gráfico
export const useLazyChart = (type: LazyChartWrapperProps['type']) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  
  const loadChart = React.useCallback(() => {
    setIsLoaded(true);
  }, []);

  return { isLoaded, loadChart };
};

// Preload específico para gráficos críticos
export const preloadCharts = {
  chartjs: () => import('react-chartjs-2'),
  recharts: () => import('recharts'),
  all: () => Promise.all([
    import('react-chartjs-2'),
    import('recharts')
  ])
};

export default LazyChartWrapper;
