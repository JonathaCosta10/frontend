import React from "react";
import { budgetApi, VariacaoEntrada } from "@/services/api/budget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useApiData } from "@/hooks/useApiData";
import { useTranslation } from "@/contexts/TranslationContext";

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
  
  const { data, loading, error } = useApiData(
    () => budgetApi.getVariacaoEntrada(mes, ano),
    { dependencies: [mes, ano] }
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
            return `${formatCurrency(context.parsed.y)}`;
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
            return formatCurrency(value);
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
      <Card>
        <CardHeader>
          <CardTitle>Variação de Entradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Variação de Entradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex flex-col items-center justify-center text-center space-y-4">
            <DollarSign className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Nenhum dado disponível</h3>
              <p className="text-muted-foreground">Cadastre entradas para visualizar o gráfico</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const estatisticas = calcularEstatisticas(data);
  const configGrafico = gerarConfigGrafico(data);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Variação de Entradas - {ano}</span>
          </CardTitle>
          {estatisticas && (
            <Badge 
              variant={estatisticas.tendencia >= 0 ? "default" : "destructive"}
              className={estatisticas.tendencia >= 0 ? "bg-green-100 text-green-800" : ""}
            >
              {estatisticas.tendencia >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {estatisticas.percentualTendencia.toFixed(1)}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Estatísticas resumidas */}
        {estatisticas && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-lg font-bold text-green-700 dark:text-green-400">
                {formatCurrency(estatisticas.total)}
              </div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-sm text-muted-foreground">Média</div>
              <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                {formatCurrency(estatisticas.media)}
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-sm text-muted-foreground">Máximo</div>
              <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                {formatCurrency(estatisticas.maximo)}
              </div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="text-sm text-muted-foreground">Mínimo</div>
              <div className="text-lg font-bold text-orange-700 dark:text-orange-400">
                {formatCurrency(estatisticas.minimo)}
              </div>
            </div>
          </div>
        )}

        {/* Gráfico */}
        <div className="h-64">
          <Line data={configGrafico} options={opcoes} />
        </div>
      </CardContent>
    </Card>
  );
};

export default VariacaoEntradaChart;
