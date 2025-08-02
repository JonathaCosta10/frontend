import React from "react";
import { budgetApi, DistribuicaoGastosResponse } from "@/services/api/budget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { CreditCard, TrendingDown, Info } from "lucide-react";
import { useApiData } from "@/hooks/useApiData";
import { useTranslation } from "@/contexts/TranslationContext";

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, Legend);

interface DistribuicaoGastosChartProps {
  mes: number;
  ano: number;
}

const DistribuicaoGastosChart: React.FC<DistribuicaoGastosChartProps> = ({ mes, ano }) => {
  const { formatCurrency } = useTranslation();
  
  // Buscar dados completos do ano inteiro
  const { data: distribuicaoData, loading, error } = useApiData(
    () => budgetApi.getDistribuicaoGastosCompleta(mes, ano)
  );

  const cores = [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#eab308', // yellow-500
    '#22c55e', // green-500
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#6b7280', // gray-500
  ];

  const gerarConfigGrafico = (data: DistribuicaoGastosResponse) => {
    if (!data?.dados_mensais) return { labels: [], datasets: [], totalCustosAnual: 0 };

    // Agregar dados de todos os meses disponíveis
    const agregacaoCategorias: { [categoria: string]: number } = {};
    let totalCustosAnual = 0;

    Object.values(data.dados_mensais).forEach(dadosDoMes => {
      // Incluir gastos
      dadosDoMes.gastos?.por_categoria?.forEach(categoria => {
        agregacaoCategorias[categoria.categoria] = (agregacaoCategorias[categoria.categoria] || 0) + categoria.total;
      });

      // Incluir dívidas mensais usando total_dividas_mensais
      const dividasMensais = dadosDoMes.resumo_financeiro?.total_dividas_mensais || 0;
      if (dividasMensais > 0) {
        agregacaoCategorias['Dívidas Mensais'] = (agregacaoCategorias['Dívidas Mensais'] || 0) + dividasMensais;
      }

      // Somar ao total de custos anuais
      totalCustosAnual += dadosDoMes.resumo_financeiro?.total_custos || 0;
    });

    const labels = Object.keys(agregacaoCategorias);
    const valores = Object.values(agregacaoCategorias);
    
    return {
      labels,
      datasets: [
        {
          data: valores,
          backgroundColor: cores.slice(0, labels.length),
          borderColor: cores.slice(0, labels.length).map(cor => cor + '20'),
          borderWidth: 2,
          cutout: '60%',
        }
      ],
      totalCustosAnual
    };
  };

  const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Vamos usar uma legenda personalizada
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            const valor = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentual = ((valor / total) * 100).toFixed(1);
            return `${formatCurrency(valor)} (${percentual}%)`;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Custos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !distribuicaoData?.dados_mensais) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Custos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex flex-col items-center justify-center text-center space-y-4">
            <CreditCard className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Nenhum custo cadastrado</h3>
              <p className="text-muted-foreground">Cadastre gastos e dívidas para visualizar a distribuição</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const configGrafico = gerarConfigGrafico(distribuicaoData);
  const mesesConsiderados = distribuicaoData.meses_disponeis?.length || 0;

  // Calcular dados agregados para exibição
  const dadosAgregados: Array<{categoria: string, valor: number, percentual: number}> = [];
  let totalGeral = 0;

  if (configGrafico.labels.length > 0) {
    configGrafico.labels.forEach((label, index) => {
      const valor = configGrafico.datasets[0].data[index];
      totalGeral += valor;
    });

    configGrafico.labels.forEach((label, index) => {
      const valor = configGrafico.datasets[0].data[index];
      dadosAgregados.push({
        categoria: label,
        valor: valor,
        percentual: (valor / totalGeral) * 100
      });
    });

    // Ordenar por valor decrescente
    dadosAgregados.sort((a, b) => b.valor - a.valor);
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-red-600" />
            <span>Distribuição de Custos - Ano {ano}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Inclui gastos e dívidas mensais de {mesesConsiderados} meses</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Total: {formatCurrency(totalGeral)} • {mesesConsiderados} meses considerados
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de rosca */}
            <div className="relative">
              <div className="h-64">
                <Doughnut data={configGrafico} options={opcoes} />
              </div>
              {/* Valor total no centro */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalGeral)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Anual</div>
                  <div className="text-xs text-muted-foreground">{mesesConsiderados} meses</div>
                </div>
              </div>
            </div>

            {/* Lista de categorias */}
            <div className="space-y-4">
              {dadosAgregados.map((item, index) => (
                <div key={item.categoria} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: cores[index] }}
                      />
                      <span className="font-medium text-sm">{item.categoria}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">{formatCurrency(item.valor)}</div>
                      <div className="text-xs text-muted-foreground">{item.percentual.toFixed(1)}%</div>
                    </div>
                  </div>
                  <Progress 
                    value={item.percentual} 
                    className="h-2"
                    style={{
                      '--progress-background': cores[index],
                    } as React.CSSProperties}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-sm">Insights</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              {dadosAgregados.length > 0 && (
                <>
                  <div>• Maior custo: {dadosAgregados[0].categoria} ({dadosAgregados[0].percentual.toFixed(1)}%)</div>
                  {dadosAgregados.length > 1 && (
                    <div>• Segundo maior: {dadosAgregados[1].categoria} ({dadosAgregados[1].percentual.toFixed(1)}%)</div>
                  )}
                  <div>• Total de categorias: {dadosAgregados.length}</div>
                  <div>• Período analisado: {mesesConsiderados} meses de {ano}</div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default DistribuicaoGastosChart;
