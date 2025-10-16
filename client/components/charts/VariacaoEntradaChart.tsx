import React from "react";
import { budgetApi, VariacaoEntrada } from "@/services/api/budget";
import { Badge } from '@/components/ui/badge';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { TrendingUp, TrendingDown, DollarSign, EyeOff } from "lucide-react";
import { useBudgetCache } from '@/shared/hooks/useApiCache';
import { useTranslation } from '@/contexts/TranslationContext';
import { usePrivacy } from '@/contexts/PrivacyContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface VariacaoEntradaChartProps {
  mes: number;
  ano: number;
}

const VariacaoEntradaChart: React.FC<VariacaoEntradaChartProps> = ({ mes, ano }) => {
  const { formatCurrency } = useTranslation();
  const { formatValue, shouldHideCharts } = usePrivacy();
  
  // Usar cache inteligente para evitar múltiplas chamadas
  const { 
    data, 
    loading, 
    error,
    isStale 
  } = useBudgetCache(
    (mes: number, ano: number) => budgetApi.getVariacaoEntrada(mes, ano),
    mes,
    ano,
    {
      ttl: 2 * 60 * 1000, // 2 minutos para dados de variação
      staleWhileRevalidate: true
    }
  );

  const calcularEstatisticas = (dados: VariacaoEntrada[]) => {
    if (!dados || dados.length === 0) return null;
    
    const valores = dados.map(d => d.valor_total);
    const total = valores.reduce((sum, val) => sum + val, 0);
    const media = total / valores.length;
    const maximo = Math.max(...valores);
    const minimo = Math.min(...valores);
    
    // Calcular tendência (últimos 3 meses vs primeiros 3 meses)
    const primeirosTres = valores.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
    const ultimosTres = valores.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
    const tendencia = ultimosTres - primeirosTres;
    const percentualTendencia = primeirosTres > 0 ? (tendencia / primeirosTres) * 100 : 0;
    
    return { total, media, maximo, minimo, tendencia, percentualTendencia };
  };

  const gerarConfigGrafico = (dados: VariacaoEntrada[]) => {
    const labels = dados.map(item => {
      const nomeMes = new Date(item.ano, item.mes - 1).toLocaleString('pt-BR', { month: 'short' });
      return nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
    });
    
    const valores = dados.map(item => item.valor_total);
    
    return {
      labels,
      datasets: [
        {
          label: 'Entradas Mensais',
          data: valores,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: 'rgb(34, 197, 94)',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.4,
          fill: true,
        }
      ]
    };
  };

  const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            // Debug: log para verificar se o valor está correto
            console.log('Tooltip value:', value, 'Formatted:', formatCurrency(value));
            return `Entradas: ${shouldHideCharts() ? 'R$ ****' : formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 12,
          }
        }
      },
      y: {
        grid: {
          color: 'hsl(var(--border))',
          borderDash: [5, 5],
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          callback: function (value: any) {
            return shouldHideCharts() ? '****' : formatCurrency(value);
          },
          font: {
            size: 12,
          }
        },
        beginAtZero: true,
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          {isStale ? "Atualizando dados..." : "Carregando..."}
        </div>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center text-center space-y-4">
        <DollarSign className="h-12 w-12 text-muted-foreground" />
        <div>
          <h3 className="text-lg font-semibold">Nenhum dado disponível</h3>
          <p className="text-muted-foreground">Cadastre entradas para visualizar o gráfico</p>
          {isStale && (
            <p className="text-xs text-orange-500 mt-2">
              ⚠️ Exibindo dados em cache - falha ao atualizar
            </p>
          )}
        </div>
      </div>
    );
  }

  const estatisticas = calcularEstatisticas(data);
  const configGrafico = gerarConfigGrafico(data);

  return (
    <div>
      {/* Estatísticas resumidas */}
      {estatisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-sm text-muted-foreground">Faturamento Anual</div>
              <div className="text-lg font-bold text-green-700 dark:text-green-400">
                {formatValue(estatisticas.total)}
              </div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-sm text-muted-foreground">Média Mensal</div>
              <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                {formatValue(estatisticas.media)}
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-sm text-muted-foreground">Melhor Mês</div>
              <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                {formatValue(estatisticas.maximo)}
              </div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="text-sm text-muted-foreground">Pior Mês</div>
              <div className="text-lg font-bold text-orange-700 dark:text-orange-400">
                {formatValue(estatisticas.minimo)}
              </div>
            </div>
          </div>
        )}

        {/* Gráfico */}
        <div className="h-64 mb-6">
          {shouldHideCharts() ? (
            <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="text-center space-y-2">
                <EyeOff className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="text-gray-500 text-sm">Gráfico oculto</p>
              </div>
            </div>
          ) : (
            <Line data={configGrafico} options={opcoes} />
          )}
        </div>

        {/* Insights */}
        {estatisticas && !shouldHideCharts() && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm">Insights</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Faturamento anual: {formatValue(estatisticas.total)}</div>
              <div>• Média mensal: {formatValue(estatisticas.media)}</div>
              <div>• Melhor performance: {formatValue(estatisticas.maximo)}</div>
              <div>• Menor entrada: {formatValue(estatisticas.minimo)}</div>
              <div>• Total de meses com dados: {data.length}</div>
            </div>
          </div>
        )}
      </div>
    );
};

export default VariacaoEntradaChart;
