import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Users, 
  FileText, 
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import { analisarAtivoAcoes, buscarTickers } from "@/services/investmentService";
import { Line, Bar, Pie } from 'react-chartjs-2';
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

export default function AnaliseAcoesCompleta() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedTicker, setSelectedTicker] = useState(searchParams.get('ticker') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search function
  const debouncedSearch = useCallback(
    async (term: string) => {
      if (!term || term.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await buscarTickers(term);
        const acoesResults = results.filter((item: any) => 
          item.tipo_ativo === 'AÇÃO' || item.tipo_ativo === 'acao'
        );
        setSearchResults(acoesResults);
      } catch (error) {
        console.error('Erro na busca:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // Effect for auto-search with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  // Função para selecionar uma ação
  const selectTicker = (ticker: string) => {
    setSelectedTicker(ticker);
    setSearchTerm('');
    setSearchResults([]);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('ticker', ticker);
    navigate({ search: newSearchParams.toString() });
  };

  // Query para análise da ação
  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    error: analysisError,
    refetch: refetchAnalysis
  } = useQuery({
    queryKey: ['acao-analysis', selectedTicker],
    queryFn: () => {
      console.log('🚀 Chamando API de Ações para:', selectedTicker);
      console.log('📡 URL completa:', `http://127.0.0.1:5000/api/investimentos/analise-ativo/acoes/?ticker=${selectedTicker}`);
      console.log('🔍 Iniciando chamada da API...');
      return analisarAtivoAcoes(selectedTicker);
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
    return `R$ ${formatNumber(numValue, 0)}M`;
  };

  const formatPercentage = (value: number | string | null | undefined) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return '0,00%';
    }
    return `${formatNumber(numValue, 2)}%`;
  };

  // Componente para gráfico de composição acionária
  const ComposicaoAcionariaChart = ({ data }: { data: any }) => {
    if (!data?.graficos?.composicao_acionaria) return null;

    const chartData = {
      labels: data.graficos.composicao_acionaria.map((item: any) => item.tipo),
      datasets: [{
        data: data.graficos.composicao_acionaria.map((item: any) => item.valor),
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
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

  // Componente para movimentação de controladores
  const MovimentacaoControladoresChart = ({ data }: { data: any }) => {
    if (!data?.movimentacao_controladores?.analise_temporal) return null;

    const temporal = data.movimentacao_controladores.analise_temporal;
    const periods = ['ultimos_3_meses', 'ultimos_6_meses', 'ultimos_12_meses'];
    const labels = ['3 meses', '6 meses', '12 meses'];

    const chartData = {
      labels,
      datasets: [
        {
          label: 'Compras',
          data: periods.map(period => temporal[period]?.compras || 0),
          backgroundColor: '#10B981',
        },
        {
          label: 'Vendas',
          data: periods.map(period => temporal[period]?.vendas || 0),
          backgroundColor: '#EF4444',
        }
      ]
    };

    return (
      <div className="h-64">
        <Bar data={chartData} options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
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
        <h1 className="text-3xl font-bold">Análise Completa de Ações</h1>
        <p className="text-muted-foreground">Análise fundamentalista detalhada com dados da CVM</p>

      </div>

      {/* Campo de Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Ação para Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Digite o código da ação (ex: PETR4, VALE3, ITUB4)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => debouncedSearch(searchTerm)} disabled={isSearching}>
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>

          {/* Botões de Teste */}
          <div className="mt-4 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => selectTicker('PETR4')}
            >
              Testar PETR4
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => selectTicker('VALE3')}
            >
              Testar VALE3
            </Button>
            {selectedTicker && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchAnalysis()}
              >
                Recarregar Dados
              </Button>
            )}
          </div>

          {/* Resultados da Busca */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-semibold">Ações encontradas:</h4>
              <div className="grid gap-2 max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => selectTicker(result.ticker)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold">{result.ticker}</span>
                        <span className="ml-2 text-gray-600">{result.descricao}</span>
                      </div>
                      <Badge variant="secondary">{result.setor || 'N/A'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estados de Loading e Erro */}
      {isAnalysisLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

      {/* Dados da Análise */}
      {analysisData && !isAnalysisLoading && (
        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {analysisData.ticker} - {analysisData.empresa?.nome}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Setor</p>
                  <p className="font-semibold">{analysisData.empresa?.setor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Preço Atual</p>
                  <p className="font-semibold text-lg">{formatCurrency(analysisData.metricas_financeiras?.preco_atual)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor de Mercado</p>
                  <p className="font-semibold">{formatMillion(analysisData.metricas_financeiras?.valor_mercado_milhoes)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">P/VP</p>
                  <p className="font-semibold">{formatNumber(analysisData.metricas_financeiras?.p_vp)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs de Análise */}
          <Tabs defaultValue="metricas" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="metricas">Métricas</TabsTrigger>
              <TabsTrigger value="composicao">Composição</TabsTrigger>
              <TabsTrigger value="movimentacao">Movimentação</TabsTrigger>
              <TabsTrigger value="eventos">Eventos</TabsTrigger>
              <TabsTrigger value="governanca">Governança</TabsTrigger>
              <TabsTrigger value="setorial">Setorial</TabsTrigger>
            </TabsList>

            {/* Tab Métricas Financeiras */}
            <TabsContent value="metricas">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas Fundamentais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>VPA (Valor Patrimonial por Ação)</span>
                        <span className="font-semibold">{formatCurrency(analysisData.metricas_financeiras?.vpa)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>P/VP (Preço sobre Valor Patrimonial)</span>
                        <span className="font-semibold">{formatNumber(analysisData.metricas_financeiras?.p_vp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Patrimônio Líquido</span>
                        <span className="font-semibold">{formatMillion(analysisData.metricas_financeiras?.patrimonio_liquido_milhoes)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Estrutura Acionária</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total de Ações</span>
                        <span className="font-semibold">{formatNumber(analysisData.estrutura_acionaria?.total_acoes, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ações Ordinárias</span>
                        <span className="font-semibold">{formatPercentage(analysisData.estrutura_acionaria?.pct_ordinarias)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ações Preferenciais</span>
                        <span className="font-semibold">{formatPercentage(analysisData.estrutura_acionaria?.pct_preferenciais)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Composição */}
            <TabsContent value="composicao">
              <Card>
                <CardHeader>
                  <CardTitle>Composição Acionária</CardTitle>
                </CardHeader>
                <CardContent>
                  <ComposicaoAcionariaChart data={analysisData} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Movimentação de Controladores */}
            <TabsContent value="movimentacao">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Movimentação dos Controladores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Tendência Geral</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              analysisData.movimentacao_controladores?.tendencia_geral === 'Fortemente Comprando' ? 'default' :
                              analysisData.movimentacao_controladores?.tendencia_geral === 'Comprando' ? 'secondary' : 'destructive'
                            }>
                              {analysisData.movimentacao_controladores?.tendencia_geral}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Score de Confiança: </span>
                            <span className="font-semibold">{analysisData.movimentacao_controladores?.confianca_score}/10</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Últimos 12 Meses</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Operações de Compra</span>
                            <span className="font-semibold text-green-600">
                              {analysisData.movimentacao_controladores?.analise_temporal?.ultimos_12_meses?.compras || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Operações de Venda</span>
                            <span className="font-semibold text-red-600">
                              {analysisData.movimentacao_controladores?.analise_temporal?.ultimos_12_meses?.vendas || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Volume Total</span>
                            <span className="font-semibold">
                              {formatNumber(analysisData.movimentacao_controladores?.analise_temporal?.ultimos_12_meses?.volume_compra, 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <MovimentacaoControladoresChart data={analysisData} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Eventos Corporativos */}
            <TabsContent value="eventos">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Eventos Corporativos Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisData.eventos_corporativos?.eventos_importantes?.slice(0, 10).map((evento: any, index: number) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold">{evento.titulo}</h4>
                          <Badge variant={
                            evento.relevancia === 'CRÍTICA' ? 'destructive' :
                            evento.relevancia === 'ALTA' ? 'default' : 'secondary'
                          }>
                            {evento.relevancia}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{evento.descricao}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{evento.data}</span>
                          {evento.link_documento && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={evento.link_documento} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Governança */}
            <TabsContent value="governanca">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Governança Corporativa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Score de Transparência</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Score Geral</span>
                            <span className="font-semibold">{analysisData.governanca_corporativa?.transparencia_score}/100</span>
                          </div>
                          <Progress value={analysisData.governanca_corporativa?.transparencia_score} className="h-2" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Movimentações Executivas</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total de Movimentações</span>
                          <span className="font-semibold">{analysisData.governanca_corporativa?.movimentacoes_executivas?.total_movimentacoes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Volume Total</span>
                          <span className="font-semibold">{formatNumber(analysisData.governanca_corporativa?.movimentacoes_executivas?.volume_total)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Executivos Ativos</span>
                          <span className="font-semibold">{analysisData.governanca_corporativa?.executivos_ativos}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Comparação Setorial */}
            <TabsContent value="setorial">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Comparação Setorial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Posição no Setor</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Setor</span>
                          <span className="font-semibold">{analysisData.comparacao_setorial?.setor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ranking P/VP</span>
                          <span className="font-semibold">{analysisData.comparacao_setorial?.posicao_setor?.p_vp_rank}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ranking VPA</span>
                          <span className="font-semibold">{analysisData.comparacao_setorial?.posicao_setor?.vpa_rank}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Análise Posicionamento</h4>
                      <div className="space-y-2">
                        <p className="text-sm">{analysisData.comparacao_setorial?.analise_posicionamento?.posicionamento_p_vp}</p>
                        <p className="text-sm">{analysisData.comparacao_setorial?.analise_posicionamento?.posicionamento_vpa}</p>
                        <p className="text-sm">{analysisData.comparacao_setorial?.analise_posicionamento?.resumo_setorial}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Legendas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Legendas e Definições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Métricas Financeiras</h4>
                  <ul className="space-y-1">
                    <li><strong>VPA:</strong> {analysisData.legendas?.vpa}</li>
                    <li><strong>P/VP:</strong> {analysisData.legendas?.p_vp}</li>
                    <li><strong>Valor de Mercado:</strong> {analysisData.legendas?.valor_mercado}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Análises</h4>
                  <ul className="space-y-1">
                    <li><strong>Score Transparência:</strong> {analysisData.legendas?.transparencia_score}</li>
                    <li><strong>Movimentação:</strong> {analysisData.legendas?.movimentacao_controladores}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data da Análise */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-center">
                Análise realizada em: {analysisData.data_analise}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}