import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  TrendingUp,
  DollarSign,
  Building2,
  Loader2,
  LineChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  ExternalLink,
  BarChart3,
  Calendar,
  Percent,
  Globe,
  Info,
  Eye
} from "lucide-react";
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
import { Line, Bar } from 'react-chartjs-2';
import MarketPremiumGuard from "@/components/MarketPremiumGuard";
import { useTranslation } from "@/contexts/TranslationContext";
import investmentService from "@/services/investmentService";

// Registrar componentes do Chart.js
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

interface TickerSearchResult {
  ticker: string;
  descricao: string;
  tipo_ativo: string;
  setor?: string;
}

interface AcaoAnalysisData {
  ticker: string;
  cnpj: string;
  nome_empresarial: string;
  tipo_ativo: string;
  
  informacoes_corporativas: {
    nome_empresarial: string;
    setor_atividade: string;
    descricao_atividade: string;
    situacao_emissor: string;
    data_constituicao: string;
    data_registro_cvm: string;
    codigo_cvm: number;
    especie_controle_acionario: string;
    pagina_web: string;
    pais_origem: string;
    data_referencia: string;
    tipo_registro: string;
  };
  
  valor_mobiliario: {
    codigo_negociacao: string;
    valor_mobiliario: string;
    classe_acao: string;
    sigla_classe: string;
    mercado: string;
    segmento: string;
    entidade_administradora: string;
    data_inicio_negociacao: string;
    data_fim_negociacao: string;
    data_inicio_listagem: string;
    composicao_bdr_unit: string;
    eh_bdr: boolean;
  };
  
  precos_performance: {
    preco_atual: number;
    volume_ultimo_dia: number;
    data_ultimo_preco: string;
    min_52_semanas: number;
    max_52_semanas: number;
    min_mes: number;
    max_mes: number;
    variacao_dia: number;
    variacao_semana: number;
    variacao_mes: number;
    variacao_ano: number;
    volume_medio_30d: number;
    historico_semanal: Array<{
      data: string;
      preco: number;
      volume: number;
      high: number;
      low: number;
    }>;
    liquidez_diaria_media: number;
  };
  
  metricas_financeiras: {
    valor_mercado_estimado: number;
    p_l: number;
    p_vp: number;
    dividend_yield: number;
    roe: number;
    roa: number;
    margem_liquida: number;
    endividamento: number;
    liquidez_corrente: number;
    crescimento_receita: number;
    preco_atual: number;
    ticker: string;
    cnpj: string;
    posicao_52_semanas: number;
    rsi: number;
    volatilidade: number;
    status_implementacao: string;
    dados_fundamentalistas_disponiveis: boolean;
    observacoes: string;
  };
  
  indicadores_tecnicos: {
    media_movel_20: number;
    media_movel_50: number;
    rsi_14: number;
    volatilidade_30d: number;
    beta: number;
    posicao_bandas_bollinger: string;
    tendencia_preco: string;
  };
  
  resumo_executivo: {
    setor: string;
    segmento_mercado: string;
    classe_acao: string;
    eh_bdr: boolean;
    preco_atual: number;
    variacao_mes: number;
    variacao_ano: number;
    volume_medio_30d: number;
    liquidez_diaria_media: number;
    volatilidade_30d: number;
    posicao_52_semanas: {
      min: number;
      max: number;
      atual: number;
      posicao_percentual: number;
    };
  };
  
  data_analise: string;
  status: string;
  versao_api: string;
  observacoes: string[];
}

const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatPercentage = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) return "0,00%";
  return `${value.toFixed(2)}%`;
};

const formatNumber = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  
  return value.toLocaleString("pt-BR");
};

const formatDate = (dateString: string): string => {
  try {
    const [day, month, year] = dateString.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  } catch {
    return dateString;
  }
};

const getVariationColor = (value: number): string => {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-muted-foreground';
};

const getVariationIcon = (value: number) => {
  if (value > 0) return <ArrowUpRight className="h-4 w-4" />;
  if (value < 0) return <ArrowDownRight className="h-4 w-4" />;
  return null;
};

export default function AnaliseTickerAcoes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<TickerSearchResult[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string>("");
  const [analysisData, setAnalysisData] = useState<AcaoAnalysisData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchError, setSearchError] = useState<string>("");
  const [analysisError, setAnalysisError] = useState<string>("");

  // Preparar dados dos gráficos
  const chartData = useMemo(() => {
    if (!analysisData?.precos_performance?.historico_semanal) return null;

    const historico = [...analysisData.precos_performance.historico_semanal]
      .reverse() // Mostrar do mais antigo para o mais recente
      .slice(-10); // Últimos 10 pontos para não sobrecarregar

    return {
      priceChart: {
        labels: historico.map(item => formatDate(item.data)),
        datasets: [{
          label: 'Preço de Fechamento',
          data: historico.map(item => item.preco),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
        }, {
          label: 'Máximo',
          data: historico.map(item => item.high),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderDash: [5, 5],
          tension: 0.1,
        }, {
          label: 'Mínimo',
          data: historico.map(item => item.low),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderDash: [5, 5],
          tension: 0.1,
        }]
      },
      volumeChart: {
        labels: historico.map(item => formatDate(item.data)),
        datasets: [{
          label: 'Volume (R$)',
          data: historico.map(item => item.volume),
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
        }]
      }
    };
  }, [analysisData]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  const volumeChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatNumber(value);
          }
        }
      },
    },
  };

  useEffect(() => {
    const tickerFromUrl = searchParams.get("ticker");
    if (tickerFromUrl) {
      setSelectedTicker(tickerFromUrl);
      setSearchTerm(tickerFromUrl);
      handleAnalysis(tickerFromUrl);
    }
  }, [searchParams]);

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      const results = await investmentService.buscarTickersAcoes(term);
      setSearchResults(results);
    } catch (error) {
      console.error("Erro ao buscar tickers de ações:", error);
      setSearchError("Erro ao buscar tickers. Tente novamente.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAnalysis = async (ticker: string) => {
    if (!ticker.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError("");
    setSelectedTicker(ticker);

    try {
      const data = await investmentService.analisarAtivoAcoes(ticker.toUpperCase());
      setAnalysisData(data);
      setSearchParams({ ticker: ticker.toUpperCase() });
    } catch (error) {
      console.error("Erro ao analisar ação:", error);
      setAnalysisError("Erro ao analisar ação. Verifique se o código está correto.");
      setAnalysisData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm && !selectedTicker) {
        handleSearch(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedTicker]);

  return (
    <MarketPremiumGuard marketFeature="ticker-analysis">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Análise de Ações</h1>
          <p className="text-muted-foreground">
            Análise fundamentalista detalhada de ações da B3
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Digite o código da ação (ex: PETR4, VALE3, ITUB4...)"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedTicker("");
                  }}
                  className="pl-10"
                />
                
                {searchResults.length > 0 && !selectedTicker && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result.ticker}
                        className="w-full text-left px-4 py-2 hover:bg-muted flex items-center justify-between"
                        onClick={() => {
                          setSearchTerm(result.ticker);
                          setSearchResults([]);
                          handleAnalysis(result.ticker);
                        }}
                      >
                        <div>
                          <div className="font-medium">{result.ticker}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {result.descricao}
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {result.tipo_ativo}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <Button 
                onClick={() => handleAnalysis(searchTerm)}
                disabled={!searchTerm.trim() || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analisar
                  </>
                )}
              </Button>
            </div>

            {isSearching && (
              <div className="mt-4 text-center text-muted-foreground">
                Buscando tickers...
              </div>
            )}

            {searchError && (
              <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {searchError}
              </div>
            )}

            {analysisError && (
              <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {analysisError}
              </div>
            )}
          </CardContent>
        </Card>

        {analysisData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{analysisData.ticker}</CardTitle>
                      <p className="text-muted-foreground">{analysisData.informacoes_corporativas.nome_empresarial}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {formatCurrency(analysisData.precos_performance.preco_atual)}
                      </div>
                      <div className={`flex items-center gap-1 ${
                        analysisData.precos_performance.variacao_dia >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analysisData.precos_performance.variacao_dia >= 0 ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        {formatPercentage(Math.abs(analysisData.precos_performance.variacao_dia))} (dia)
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Mês: {formatPercentage(analysisData.precos_performance.variacao_mes)} | 
                        Ano: {formatPercentage(analysisData.precos_performance.variacao_ano)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Setor</p>
                      <p className="font-medium">{analysisData.informacoes_corporativas.setor_atividade}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Classe</p>
                      <Badge variant="secondary">{analysisData.valor_mobiliario.classe_acao}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Volume (dia)</p>
                      <p className="font-medium">{formatNumber(analysisData.precos_performance.volume_ultimo_dia)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Liquidez Média</p>
                      <p className="font-medium">{formatNumber(analysisData.precos_performance.liquidez_diaria_media)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Indicadores Principais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Fundamentalistas</h4>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">P/L</span>
                      <span className="font-medium">
                        {analysisData.metricas_financeiras.p_l || "N/D"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">P/VP</span>
                      <span className="font-medium">
                        {analysisData.metricas_financeiras.p_vp || "N/D"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">ROE</span>
                      <span className="font-medium">
                        {analysisData.metricas_financeiras.roe ? formatPercentage(analysisData.metricas_financeiras.roe) : "N/D"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Dividend Yield</span>
                      <span className="font-medium">
                        {analysisData.metricas_financeiras.dividend_yield ? formatPercentage(analysisData.metricas_financeiras.dividend_yield) : "N/D"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Técnicos</h4>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">RSI (14)</span>
                      <span className="font-medium">
                        {analysisData.indicadores_tecnicos.rsi_14.toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Volatilidade (30d)</span>
                      <span className="font-medium">
                        {formatPercentage(analysisData.indicadores_tecnicos.volatilidade_30d)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tendência</span>
                      <Badge variant={analysisData.indicadores_tecnicos.tendencia_preco === 'alta' ? 'default' : 'secondary'}>
                        {analysisData.indicadores_tecnicos.tendencia_preco}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Bollinger</span>
                      <Badge variant="outline">
                        {analysisData.indicadores_tecnicos.posicao_bandas_bollinger}
                      </Badge>
                    </div>
                  </div>

                  {!analysisData.metricas_financeiras.dados_fundamentalistas_disponiveis && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <p className="text-xs text-yellow-800">
                          {analysisData.metricas_financeiras.observacoes}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
              <CardContent className="flex items-start gap-3 pt-6">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Aviso de Responsabilidade
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    As informações apresentadas são apenas para fins educacionais e não constituem 
                    recomendação de investimento. Consulte sempre um profissional qualificado.
                  </p>
                  {analysisData.observacoes && analysisData.observacoes.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium mb-1">Observações da API:</p>
                      <ul className="text-xs space-y-1">
                        {analysisData.observacoes.map((obs, idx) => (
                          <li key={idx}>• {obs}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!analysisData && !isAnalyzing && !analysisError && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Análise Fundamentalista de Ações
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Pesquise por um código de ação da B3 para obter análise completa
                com indicadores fundamentalistas, dados financeiros e histórico.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MarketPremiumGuard>
  );
}