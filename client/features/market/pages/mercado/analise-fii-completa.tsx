import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  PieChart as PieChartIcon, 
  BarChart3, 
  DollarSign,
  Percent,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  Users
} from "lucide-react";
import { analisarAtivoFII } from "@/features/investments/services/investmentService";
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnaliseFIICompleta() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedTicker, setSelectedTicker] = useState(searchParams.get('ticker') || '');

  // Query para análise do FII
  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    error: analysisError,
    refetch: refetchAnalysis
  } = useQuery({
    queryKey: ['fii-analysis', selectedTicker],
    queryFn: () => {
      console.log('🚀 Chamando API de FII para:', selectedTicker);
      console.log('📡 URL completa:', `http://127.0.0.1:5000/api/investimentos/analise-ativo/fii/?ticker=${selectedTicker}`);
      console.log('🔍 Iniciando chamada da API...');
      return analisarAtivoFII(selectedTicker);
    },
    enabled: !!selectedTicker && selectedTicker.length >= 3,
    staleTime: 5 * 60 * 1000,
  });

  // Funções de formatação
  const formatCurrency = (value: number | string | null | undefined) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatNumber = (value: number | string | null | undefined, decimals = 2) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return '0';
    }
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(numValue);
  };

  const formatMillion = (value: number | string | null | undefined) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return 'R$ 0M';
    }
    const millions = numValue / 1000000;
    return `R$ ${formatNumber(millions, 1)}M`;
  };

  const formatPercentage = (value: number | string | null | undefined) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return '0,00%';
    }
    return `${formatNumber(numValue, 2)}%`;
  };

  // Componente para composição de ativos
  const ComposicaoAtivosChart = ({ data }: { data: any }) => {
    if (!data?.composicao_ativo?.detalhamento_ativos) return null;

    const chartData = {
      labels: data.composicao_ativo.detalhamento_ativos.map((item: any) => item.tipo_ativo),
      datasets: [{
        data: data.composicao_ativo.detalhamento_ativos.map((item: any) => item.percentual),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'
        ],
        borderWidth: 0
      }]
    };

    return (
      <div className="h-64">
        <Pie data={chartData} options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom' as const,
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  return `${label}: ${formatPercentage(value)}`;
                }
              }
            }
          }
        }} />
      </div>
    );
  };

  // Componente para histórico mensal
  const HistoricoMensalChart = ({ data }: { data: any }) => {
    if (!data?.historico_mensal) return null;

    const chartData = {
      labels: data.historico_mensal.map((item: any) => {
        const date = new Date(item.data_referencia);
        return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      }),
      datasets: [
        {
          label: 'Dividendo (R$)',
          data: data.historico_mensal.map((item: any) => item.dividendo_periodo),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          yAxisID: 'y',
        },
        {
          label: 'Alavancagem (%)',
          data: data.historico_mensal.map((item: any) => item.alavancagem * 100),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          yAxisID: 'y1',
        }
      ]
    };

    return (
      <div className="h-64">
        <Line data={chartData} options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index' as const,
            intersect: false,
          },
          scales: {
            y: {
              type: 'linear' as const,
              display: true,
              position: 'left' as const,
              title: {
                display: true,
                text: 'Dividendo (R$)'
              }
            },
            y1: {
              type: 'linear' as const,
              display: true,
              position: 'right' as const,
              title: {
                display: true,
                text: 'Alavancagem (%)'
              },
              grid: {
                drawOnChartArea: false,
              },
            },
          },
        }} />
      </div>
    );
  };

  // Componente para última semana
  const UltimaSemanaChart = ({ data }: { data: any }) => {
    if (!data?.ultima_semana) return null;

    const chartData = {
      labels: data.ultima_semana.map((item: any) => item.data),
      datasets: [
        {
          label: 'Preço (R$)',
          data: data.ultima_semana.map((item: any) => item.preco),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
        }
      ]
    };

    return (
      <div className="h-48">
        <Line data={chartData} options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
            },
          },
        }} />
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold">Análise Completa de FII</h1>
        <p className="text-muted-foreground">Análise fundamentalista detalhada de Fundos de Investimento Imobiliário</p>
      </div>

      {/* Análise do FII */}
      {isAnalysisLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3">Carregando análise...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisError && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar análise</h3>
              <p>{analysisError.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisData && !isAnalysisLoading && (
        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {analysisData.ticker} - {analysisData.nome_fundo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Segmento</p>
                  <p className="font-semibold">{analysisData.segmento}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Preço Atual</p>
                  <p className="font-semibold text-lg">{formatCurrency(analysisData.last_price)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">P/VP</p>
                  <p className="font-semibold">{formatNumber(analysisData.p_vp)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Último Dividendo</p>
                  <p className="font-semibold">{formatCurrency(analysisData.ultimo_dividendo)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights de Análise */}
          {analysisData.insights && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Análise Detalhada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Pontos Positivos e Pontos de Atenção lado a lado */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pontos Positivos */}
                    {analysisData.insights.pontos_positivos && analysisData.insights.pontos_positivos.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          Pontos Positivos
                        </h4>
                        <div className="grid gap-2">
                          {analysisData.insights.pontos_positivos.map((ponto: string, index: number) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-green-800">{ponto}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pontos de Atenção */}
                    {analysisData.insights.pontos_atencao && analysisData.insights.pontos_atencao.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-yellow-700">
                          <Info className="h-4 w-4" />
                          Pontos de Atenção
                        </h4>
                        <div className="grid gap-2">
                          {analysisData.insights.pontos_atencao.map((ponto: string, index: number) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg">
                              <Info className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-yellow-800">{ponto}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Alertas - abaixo dos outros dois */}
                  {analysisData.insights.alertas && analysisData.insights.alertas.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        Alertas Importantes
                      </h4>
                      <div className="grid gap-2">
                        {analysisData.insights.alertas.map((alerta: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-red-800 font-medium">{alerta}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs de Análise */}
          <Tabs defaultValue="metricas" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="metricas">Métricas</TabsTrigger>
              <TabsTrigger value="composicao">Composição</TabsTrigger>
              <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
              <TabsTrigger value="cotacao">Cotação</TabsTrigger>
              <TabsTrigger value="liquidez">Liquidez</TabsTrigger>
              <TabsTrigger value="gestao">Gestão</TabsTrigger>
            </TabsList>

            {/* Tab Métricas Principais */}
            <TabsContent value="metricas">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Indicadores Fundamentais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>P/VP</span>
                        <span className="font-semibold">{formatNumber(analysisData.p_vp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valor Patrimonial</span>
                        <span className="font-semibold">{formatCurrency(analysisData.valor_patrimonial)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rentabilidade Mensal</span>
                        <span className="font-semibold">{formatPercentage(analysisData.rentab_mensal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Alavancagem</span>
                        <span className="font-semibold">{formatPercentage(analysisData.alavancagem_percentual)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Patrimônio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Patrimônio Líquido</span>
                        <span className="font-semibold">{formatMillion(analysisData.patrimonio_liquido)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valor de Mercado</span>
                        <span className="font-semibold">{formatMillion(analysisData.valor_mercado)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Investido</span>
                        <span className="font-semibold">{formatMillion(analysisData.total_investido)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Último Dividendo</span>
                        <span className="font-semibold">{formatCurrency(analysisData.ultimo_dividendo)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Distribuído</span>
                        <span className="font-semibold">{formatMillion(analysisData.dividendo)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantidade de Cotas</span>
                        <span className="font-semibold">{formatNumber(parseFloat(analysisData.qt_de_cotas), 0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Composição de Ativos */}
            <TabsContent value="composicao">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Composição de Ativos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ComposicaoAtivosChart data={analysisData} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Detalhamento dos Ativos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisData.composicao_ativo?.detalhamento_ativos?.map((ativo: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded bg-gray-50">
                          <span className="text-sm">{ativo.tipo_ativo}</span>
                          <div className="text-right">
                            <div className="font-semibold">{formatPercentage(ativo.percentual)}</div>
                            <div className="text-xs text-muted-foreground">{formatMillion(ativo.valor)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Análise Financeira */}
            <TabsContent value="financeiro">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Receitas a Receber</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total a Receber</span>
                        <span className="font-semibold">{formatMillion(analysisData.valores_a_receber)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aluguéis</span>
                        <span className="font-semibold">{formatPercentage(analysisData.recebiveis?.metrics?.percent_aluguel * 100)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Venda de Imóveis</span>
                        <span className="font-semibold">{formatPercentage(analysisData.recebiveis?.metrics?.percent_venda * 100)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Outros</span>
                        <span className="font-semibold">{formatPercentage(analysisData.recebiveis?.metrics?.percent_outros * 100)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Passivos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total do Passivo</span>
                        <span className="font-semibold">{formatMillion(analysisData.total_passivo)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de Administração</span>
                        <span className="font-semibold">{formatMillion(analysisData.custo_mensal_administracao)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Custos Fixos</span>
                        <span className="font-semibold">{formatMillion(analysisData.custos_fixos)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Alavancagem</span>
                        <span className="font-semibold">{formatPercentage(analysisData.alavancagem_percentual)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Histórico Mensal */}
            <TabsContent value="historico">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <HistoricoMensalChart data={analysisData} />
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Dividendo Médio</p>
                      <p className="font-semibold">{formatCurrency(analysisData.ultimo_dividendo)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Alavancagem Atual</p>
                      <p className="font-semibold">{formatPercentage(analysisData.alavancagem_percentual)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Patrimônio Líquido</p>
                      <p className="font-semibold">{formatMillion(analysisData.patrimonio_liquido)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Cotação */}
            <TabsContent value="cotacao">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Última Semana</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UltimaSemanaChart data={analysisData} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Informações de Cotação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Preço Atual</span>
                        <span className="font-semibold text-lg">{formatCurrency(analysisData.last_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volume</span>
                        <span className="font-semibold">{formatMillion(analysisData.volume)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mínima do Mês</span>
                        <span className="font-semibold">{formatCurrency(analysisData.min_mes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Máxima do Mês</span>
                        <span className="font-semibold">{formatCurrency(analysisData.max_mes)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Liquidez */}
            <TabsContent value="liquidez">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Liquidez</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Disponibilidades</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Caixa</span>
                          <span className="font-semibold">{formatCurrency(analysisData.caixa)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fundos de Renda Fixa</span>
                          <span className="font-semibold">{formatMillion(analysisData.liquidez?.raw?.fundos_renda_fixa)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Necessidades</span>
                          <span className="font-semibold">{formatMillion(analysisData.liquidez?.raw?.total_necessidades_liquidez)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Métricas</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Gap de Liquidez</span>
                          <span className="font-semibold">{formatPercentage(analysisData.liquidez?.metrics?.gap_liquidez * 100)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Disponibilidade/Total</span>
                          <span className="font-semibold">{formatPercentage(analysisData.liquidez?.metrics?.disponibilidade_sobre_total * 100)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Gestão */}
            <TabsContent value="gestao">
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Gestão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Fundo</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Administrador</span>
                          <span className="font-semibold">{analysisData.administrador}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gestão</span>
                          <span className="font-semibold">{analysisData.gestao}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Objetivo</span>
                          <span className="font-semibold">{analysisData.objetivo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Início do Fundo</span>
                          <span className="font-semibold">{new Date(analysisData.inicio_fundo).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Cotistas</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Pessoas Físicas</span>
                          <span className="font-semibold">{formatNumber(analysisData.cotistas_pf, 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pessoas Jurídicas</span>
                          <span className="font-semibold">{formatNumber(analysisData.cotistas_pj, 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total de Cotas</span>
                          <span className="font-semibold">{formatNumber(parseFloat(analysisData.qt_de_cotas), 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Dados da Consulta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dados da Consulta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Data da Análise</p>
                  <p className="font-semibold">{analysisData.data_analise}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ticker Analisado</p>
                  <p className="font-semibold">{analysisData.ticker}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="default">{analysisData.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}