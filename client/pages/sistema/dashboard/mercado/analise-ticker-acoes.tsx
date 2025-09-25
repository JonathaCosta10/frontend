import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Building2,
  PieChart,
  BarChart3,
  ExternalLink,
  Loader2,
  LineChart,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle
} from "lucide-react";
import MarketPremiumGuard from "@/components/MarketPremiumGuard";
import { useTranslation } from "@/contexts/TranslationContext";
import investmentService from "@/services/investmentService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

// Registro dos componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  BarElement,
);

interface TickerSearchResult {
  ticker: string;
  descricao: string;
  tipo_ativo: string;
  setor?: string;
}

// Interface completa da resposta da API FII
interface FIIAnalysisData {
  ticker: string;
  nome: string;
  setor: string;
  tipo: string;
  
  // Informações básicas
  preco_atual: number;
  preco_fechamento_anterior: number;
  variacao_preco: number;
  variacao_percentual: number;
  volume_negociado: number;
  valor_mercado: number;
  
  // Informações específicas de FII
  valor_patrimonial: number;
  dividend_yield: number;
  p_vp: number;
  
  // Patrimônio
  patrimonio_liquido: number;
  numero_cotistas: number;
  numero_imoveis: number;
  vacancia_fisica: number;
  vacancia_financeira: number;
  
  // Rentabilidade
  rentabilidade_mes: number;
  rentabilidade_ano: number;
  rentabilidade_12m: number;
  rentabilidade_24m: number;
  rentabilidade_36m: number;
  
  // Dividendos
  ultimo_dividendo: number;
  data_ultimo_dividendo: string;
  dividendo_medio_12m: number;
  
  // Histórico
  historico_mensal: Array<{
    data_referencia: string;
    preco_fechamento: number;
    dividendo: number;
    rentabilidade: number;
  }>;
  
  // Status e metadados
  data_ultima_atualizacao: string;
  fonte_dados: string;
}

// Função auxiliar para formatar moeda
const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Função auxiliar para formatar percentual
const formatPercentage = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) return "0,00%";
  return `${value.toFixed(2)}%`;
};

// Função auxiliar para formatar números grandes
const formatNumber = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  
  return value.toLocaleString("pt-BR");
};

// Componente para exibir gráfico de histórico de preços
const PriceHistoryChart = ({ data }: { data: FIIAnalysisData }) => {
  if (!data.historico_mensal || data.historico_mensal.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Histórico de Preços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Dados de histórico não disponíveis
          </p>
        </CardContent>
      </Card>
    );
  }

  const historico = data.historico_mensal.sort((a, b) => new Date(a.data_referencia).getTime() - new Date(b.data_referencia).getTime());
  
  const chartData = {
    labels: historico.map(item => {
      const date = new Date(item.data_referencia);
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }),
    datasets: [
      {
        label: 'Preço de Fechamento',
        data: historico.map(item => item.preco_fechamento),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

  const options = {
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
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          Histórico de Preços (12 meses)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para exibir gráfico de dividendos
const DividendChart = ({ data }: { data: FIIAnalysisData }) => {
  if (!data.historico_mensal || data.historico_mensal.length === 0) {
    return null;
  }

  const historico = data.historico_mensal.sort((a, b) => new Date(a.data_referencia).getTime() - new Date(b.data_referencia).getTime());
  const dividendHistory = historico.filter(item => item.dividendo > 0);
  
  if (dividendHistory.length === 0) {
    return null;
  }

  const chartData = {
    labels: dividendHistory.map(item => {
      const date = new Date(item.data_referencia);
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }),
    datasets: [
      {
        label: 'Dividendo Pago',
        data: dividendHistory.map(item => item.dividendo),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      }
    ],
  };

  const options = {
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
            return formatCurrency(value);
          }
        }
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Histórico de Dividendos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

// Componente principal
export default function AnaliseTicker() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<TickerSearchResult[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string>("");
  const [analysisData, setAnalysisData] = useState<FIIAnalysisData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchError, setSearchError] = useState<string>("");
  const [analysisError, setAnalysisError] = useState<string>("");

  // Função para calcular idade do fundo
  const calcularIdadeFundo = (dataInicio: string): string => {
    try {
      const inicio = new Date(dataInicio);
      const hoje = new Date();
      const diffTime = hoje.getTime() - inicio.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) {
        return `${diffDays} dias`;
      } else if (diffDays < 365) {
        const meses = Math.floor(diffDays / 30);
        return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
      } else {
        const anos = Math.floor(diffDays / 365);
        const mesesRestantes = Math.floor((diffDays % 365) / 30);
        if (mesesRestantes === 0) {
          return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
        }
        return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${mesesRestantes} ${mesesRestantes === 1 ? 'mês' : 'meses'}`;
      }
    } catch {
      return "Não informado";
    }
  };

  // Função para classificar P/VP
  const classificarPVP = (pvp: number): { label: string, color: string } => {
    if (pvp < 0.8) return { label: "Descontado", color: "text-green-600" };
    if (pvp <= 1.0) return { label: "Justo", color: "text-blue-600" };
    if (pvp <= 1.2) return { label: "Prêmio Baixo", color: "text-yellow-600" };
    if (pvp <= 1.5) return { label: "Prêmio Alto", color: "text-orange-600" };
    return { label: "Caro", color: "text-red-600" };
  };

  // Função para classificar Dividend Yield
  const classificarDY = (dy: number): { label: string, color: string } => {
    if (dy >= 10) return { label: "Excelente", color: "text-green-600" };
    if (dy >= 8) return { label: "Muito Bom", color: "text-blue-600" };
    if (dy >= 6) return { label: "Bom", color: "text-yellow-600" };
    if (dy >= 4) return { label: "Regular", color: "text-orange-600" };
    return { label: "Baixo", color: "text-red-600" };
  };

  // Efeito para carregar ticker da URL
  useEffect(() => {
    const tickerFromUrl = searchParams.get("ticker");
    if (tickerFromUrl) {
      setSelectedTicker(tickerFromUrl);
      setSearchTerm(tickerFromUrl);
      handleAnalysis(tickerFromUrl);
    }
  }, [searchParams]);

  // Função para buscar tickers
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
      console.error("Erro ao buscar tickers:", error);
      setSearchError("Erro ao buscar tickers. Tente novamente.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Função para analisar um ticker
  const handleAnalysis = async (ticker: string) => {
    if (!ticker.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError("");
    setSelectedTicker(ticker);

    try {
      const data = await investmentService.analisarAtivo(ticker.toUpperCase());
      setAnalysisData(data);
      
      // Atualizar URL
      setSearchParams({ ticker: ticker.toUpperCase() });
    } catch (error) {
      console.error("Erro ao analisar ticker:", error);
      setAnalysisError("Erro ao analisar ticker. Verifique se o código está correto.");
      setAnalysisData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Debounce para busca
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
        {/* Cabeçalho */}
        <div>
          <h1 className="text-2xl font-bold mb-2">Análise de Ações</h1>
          <p className="text-muted-foreground">
            Análise fundamentalista, técnica e detalhada de ações
          </p>
        </div>

        {/* Busca de Ticker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {analysisData ? "Alterar Ticker" : "Digite um ticker para começar"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="Digite o código da ação (ex: PETR4, VALE3)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchTerm) {
                      handleAnalysis(searchTerm);
                    }
                  }}
                />
                
                {/* Dropdown de resultados */}
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

            {/* Estados de loading e erro */}
            {isSearching && (
              <div className="mt-4 text-center text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                Buscando tickers...
              </div>
            )}

            {searchError && (
              <div className="mt-4 text-center text-destructive">
                {searchError}
              </div>
            )}

            {analysisError && (
              <div className="mt-4 text-center text-destructive">
                {analysisError}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Análise do Ticker */}
        {analysisData && (
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{analysisData.ticker}</CardTitle>
                      <p className="text-muted-foreground">{analysisData.nome}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {formatCurrency(analysisData.preco_atual)}
                      </div>
                      <div className={`flex items-center gap-1 ${
                        analysisData.variacao_percentual >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analysisData.variacao_percentual >= 0 ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        {formatPercentage(Math.abs(analysisData.variacao_percentual))}
                        {' '}({formatCurrency(Math.abs(analysisData.variacao_preco))})
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Setor</p>
                      <p className="font-medium">{analysisData.setor || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <Badge variant="secondary">{analysisData.tipo}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Volume</p>
                      <p className="font-medium">{formatNumber(analysisData.volume_negociado)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor de Mercado</p>
                      <p className="font-medium">{formatNumber(analysisData.valor_mercado)}</p>
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
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">P/VP</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className={`font-medium ${classificarPVP(analysisData.p_vp || 0).color}`}>
                              {(analysisData.p_vp || 0).toFixed(2)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{classificarPVP(analysisData.p_vp || 0).label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Dividend Yield</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className={`font-medium ${classificarDY(analysisData.dividend_yield || 0).color}`}>
                              {formatPercentage(analysisData.dividend_yield || 0)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{classificarDY(analysisData.dividend_yield || 0).label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Valor Patrimonial</span>
                      <span className="font-medium">{formatCurrency(analysisData.valor_patrimonial || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rentabilidade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Rentabilidade Histórica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">No Mês</p>
                    <p className={`text-lg font-bold ${
                      (analysisData.rentabilidade_mes || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(analysisData.rentabilidade_mes || 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">No Ano</p>
                    <p className={`text-lg font-bold ${
                      (analysisData.rentabilidade_ano || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(analysisData.rentabilidade_ano || 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">12 Meses</p>
                    <p className={`text-lg font-bold ${
                      (analysisData.rentabilidade_12m || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(analysisData.rentabilidade_12m || 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">24 Meses</p>
                    <p className={`text-lg font-bold ${
                      (analysisData.rentabilidade_24m || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(analysisData.rentabilidade_24m || 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">36 Meses</p>
                    <p className={`text-lg font-bold ${
                      (analysisData.rentabilidade_36m || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(analysisData.rentabilidade_36m || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patrimônio e Informações Adicionais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informações Patrimoniais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patrimônio Líquido</span>
                    <span className="font-medium">{formatNumber(analysisData.patrimonio_liquido || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Número de Cotistas</span>
                    <span className="font-medium">{formatNumber(analysisData.numero_cotistas || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Número de Imóveis</span>
                    <span className="font-medium">{formatNumber(analysisData.numero_imoveis || 0)}</span>
                  </div>
                  {analysisData.vacancia_fisica !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vacância Física</span>
                      <span className="font-medium">{formatPercentage(analysisData.vacancia_fisica)}</span>
                    </div>
                  )}
                  {analysisData.vacancia_financeira !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vacância Financeira</span>
                      <span className="font-medium">{formatPercentage(analysisData.vacancia_financeira)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Informações de Dividendos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Último Dividendo</span>
                    <span className="font-medium">{formatCurrency(analysisData.ultimo_dividendo || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data do Último Dividendo</span>
                    <span className="font-medium">
                      {analysisData.data_ultimo_dividendo ? 
                        new Date(analysisData.data_ultimo_dividendo).toLocaleDateString('pt-BR') : 
                        'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dividendo Médio (12m)</span>
                    <span className="font-medium">{formatCurrency(analysisData.dividendo_medio_12m || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dividend Yield</span>
                    <span className={`font-medium ${classificarDY(analysisData.dividend_yield || 0).color}`}>
                      {formatPercentage(analysisData.dividend_yield || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <PriceHistoryChart data={analysisData} />
              <DividendChart data={analysisData} />
            </div>

            {/* Informações Técnicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informações Técnicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Última Atualização</p>
                    <p className="font-medium">
                      {analysisData.data_ultima_atualizacao ? 
                        new Date(analysisData.data_ultima_atualizacao).toLocaleString('pt-BR') : 
                        'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fonte dos Dados</p>
                    <p className="font-medium">{analysisData.fonte_dados || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Código de Negociação</p>
                    <p className="font-medium">{analysisData.ticker}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Links Externos */}
            <Card>
              <CardHeader>
                <CardTitle>Links Úteis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://www.fundamentus.com.br/detalhes.php?papel=${analysisData.ticker}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Fundamentus
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://statusinvest.com.br/acoes/${analysisData.ticker.toLowerCase()}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Status Invest
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://www.b3.com.br/pt_br/produtos-e-servicos/negociacao/renda-variavel/empresas-listadas.htm?codigo=${analysisData.ticker}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    B3
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Aviso de Responsabilidade */}
            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
              <CardContent className="flex items-start gap-3 pt-6">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Aviso de Responsabilidade
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    As informações apresentadas são apenas para fins educacionais e não constituem 
                    recomendação de investimento. Sempre consulte um profissional qualificado antes 
                    de tomar decisões de investimento. O investimento em ações envolve riscos e a 
                    rentabilidade passada não garante resultados futuros.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MarketPremiumGuard>
  );
}