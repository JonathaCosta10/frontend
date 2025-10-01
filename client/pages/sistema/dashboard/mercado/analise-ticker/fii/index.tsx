import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  AlertTriangle,
  ArrowLeft
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
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

interface TickerSearchResult {
  ticker: string;
  descricao: string;
  tipo_ativo: string;
}

interface FIIAnalysisResponse {
  ticker: string;
  cnpj: string;
  razao_social: string;
  nome_fundo: string;
  qt_de_cotas: string | number;
  qt_aumento_de_cotas: number;
  mes_ultima_emicao_de_cotas: string | null;
  inicio_fundo: string;
  segmento: string;
  nome_adiministrador: string;
  prazo_duracao: string;
  data_prazo_duracao: string | null;
  ultima_entrega_anual: string;
  data_entrega_consolidacao: string;
  data_inicio: string;
  objetivo: string;
  gestao: string;
  negociado_bolsa: boolean;
  administrador: string;
  site_administrador: string;
  cotistas_pf: number;
  cotistas_pj: number;
  qt_bacos_cotistas: number | null;
  qt_investidores_internacionais: number | null;
  valor_ativos: number;
  ativo_total: number;
  valor_ativos_liquidos: number;
  valor_mercado: number;
  patrimonio_liquido: number;
  total_passivo: number;
  alavancagem_percentual: number;
  valor_patrimonial_cotas: number;
  caixa: number;
  total_investido: number;
  custo_mensal_administracao: number;
  dividendo: number;
  valores_a_receber: number;
  custos_fixos: number;
  ultimo_dividendo: number;
  quantidade_ativos_fundo: number;
  last_price: number;
  volume: number;
  min_mes: number;
  max_mes: number;
  ultima_semana: Array<{
    preco: number;
    data: string;
    volume: number;
    high: number;
    low: number;
  }>;
  p_vp: number;
  valor_patrimonial: number;
  rentab_mensal: number;
  liquidez: {
    raw: {
      total_necessidades_liquidez: number;
      disponibilidades: number;
      titulos_publicos: number;
      titulos_privados: number;
      fundos_renda_fixa: number;
    };
    metrics: {
      gap_liquidez: number;
      disponibilidade_sobre_total: number;
    };
  };
  composicao_ativo: {
    raw: {
      total_investido: number;
      direitos_bens_imoveis: number;
      terrenos: number;
      imoveis_renda_acabados: number;
      imoveis_renda_construcao: number;
      fii: number;
      acoes_sociedades_atividades_fii: number;
    };
    metrics: {
      percent_imobiliario: number;
      percent_financeiro: number;
    };
    detalhamento_ativos: Array<{
      tipo_ativo: string;
      valor: number;
      percentual: number;
    }>;
  };
  recebiveis: {
    raw: {
      valores_receber: number;
      contas_receber_aluguel: number;
      contas_receber_venda_imoveis: number;
      outros_valores_receber: number;
    };
    metrics: {
      percent_aluguel: number;
      percent_venda: number;
      percent_outros: number;
    };
  };
  passivo: {
    raw: {
      total_passivo: number;
      taxa_administracao_pagar: number;
      adiantamento_alugueis: number;
      obrigacoes_securitizacao_recebiveis: number;
      outros_valores_pagar: number;
    };
    metrics: {
      alavancagem: number;
    };
  };
  rentabilidade_imobiliaria: {
    metrics: {
      imoveis_renda_percentual: number;
      ultimo_dividendo_calculado: number;
      rendimentos_mes_atual: number;
    };
  };
  insights: {
    pontos_positivos: string[];
    pontos_atencao: string[];
    alertas: string[];
    recomendacao: string;
    score_detalhado: {
      score_total: number;
      score_percentual: number;
    };
  };
  analise_contabil: {
    alavancagem_detalhada: {
      percentual: number;
      classificacao: string;
    };
  };
  historico_mensal: {
    data_referencia: string;
    gap_liquidez: number;
    percent_imobiliario: number;
    alavancagem: number;
    valores_receber: number;
    disponibilidades: number;
    total_investido: number;
    total_passivo: number;
    percent_aluguel: number;
    percent_venda: number;
    percent_outros: number;
    dividendo_periodo: number;
    rendimentos_total_mes: number;
    imoveis_renda_percentual: number;
  }[];
  data_analise: string;
  status: string;
  tipo_ativo: string;
}

export default function FIIAnalysisPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ticker = searchParams.get('ticker')?.toUpperCase() || '';
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<FIIAnalysisResponse | null>(null);
  const [error, setError] = useState('');
  
  // Estados para busca de ticker
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [tickerSearchResults, setTickerSearchResults] = useState<TickerSearchResult[]>([]);
  const [selectedTicker, setSelectedTicker] = useState(ticker || "");

  // Get translation context functions
  const { formatCurrency, formatNumber } = useTranslation();
  
  // Local formatting functions
  const formatPercentage = (value: number) => {
    return `${(value || 0).toFixed(2)}%`;
  };

  const formatNumberWithDecimals = (value: number, decimals: number = 0) => {
    return (value || 0).toFixed(decimals);
  };

  const formatLargeNumber = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : value;
    return numValue.toLocaleString('pt-BR');
  };

  // Função para calcular a idade do fundo
  const calculateFundAge = (startDate: string) => {
    if (!startDate) return 0;
    
    try {
      // Tenta diferentes formatos de data
      let fundDate: Date;
      
      // Formato DD/MM/YYYY
      if (startDate.includes('/')) {
        const parts = startDate.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          
          // Verifica se os valores são válidos
          if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1900) {
            fundDate = new Date(year, month - 1, day);
          } else {
            return 0;
          }
        } else {
          return 0;
        }
      }
      // Formato YYYY-MM-DD
      else if (startDate.includes('-')) {
        fundDate = new Date(startDate);
      }
      // Outros formatos
      else {
        fundDate = new Date(startDate);
      }
      
      // Verifica se a data é válida
      if (isNaN(fundDate.getTime())) {
        return 0;
      }
      
      const currentDate = new Date();
      const diffTime = currentDate.getTime() - fundDate.getTime();
      
      // Se a data é no futuro, retorna 0
      if (diffTime < 0) {
        return 0;
      }
      
      const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
      return diffYears;
    } catch (error) {
      console.error('Erro ao calcular idade do fundo:', error, 'Data recebida:', startDate);
      return 0;
    }
  };

  // Funções para busca de ticker
  const buscarTickers = async () => {
    setSearchLoading(true);
    try {
      const results = await investmentService.buscarTickersFII(searchTerm);
      setTickerSearchResults(results);
    } catch (error) {
      console.error("Erro ao buscar tickers:", error);
      setTickerSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const selecionarTicker = (tickerResult: TickerSearchResult) => {
    setSelectedTicker(tickerResult.ticker);
    setSearchTerm("");
    setTickerSearchResults([]);
    navigate(`/dashboard/mercado/analise-ticker/fii?ticker=${tickerResult.ticker.toUpperCase()}`);
  };

  const performAnalysisForTicker = async (tickerToAnalyze: string) => {
    if (!tickerToAnalyze.trim()) return;

    setIsLoading(true);
    
    try {
      const data = await investmentService.analisarAtivoFII(tickerToAnalyze.toUpperCase());
      setAnalysisData(data);
      setError('');
    } catch (error) {
      console.error('Erro ao buscar análise do ticker:', error);
      setAnalysisData(null);
      setError('Erro ao buscar dados do FII. Verifique o ticker e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect para busca automatica
  useEffect(() => {
    if (searchTerm.length >= 2) {
      buscarTickers();
    } else {
      setTickerSearchResults([]);
    }
  }, [searchTerm]);

  // Fetch FII data from API
  useEffect(() => {
    const fetchData = async () => {
      if (!ticker) {
        setError('Ticker não especificado');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await investmentService.analisarAtivoFII(ticker);
        setAnalysisData(data);
        setError('');
      } catch (err) {
        console.error('Error fetching FII analysis:', err);
        setError('Erro ao buscar dados do FII. Verifique o ticker e tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  if (!ticker) {
    return (
      <MarketPremiumGuard marketFeature="ticker-analysis">
        <div className="space-y-6">
          {/* Seção de Busca quando não há ticker */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Search className="h-6 w-6 text-white" />
                </div>
                Análise Completa de FII
              </CardTitle>
              <p className="text-gray-600 mt-2">Digite o código do FII que deseja analisar para obter insights detalhados</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Digite o código do FII (ex: HGLG11, XPML11, MXRF11...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 text-lg"
                  />
                  {searchLoading && (
                    <Loader2 className="absolute right-3 top-4 h-5 w-5 animate-spin" />
                  )}
                </div>

                {/* Resultados da Busca */}
                {tickerSearchResults.length > 0 && (
                  <div className="mt-4 bg-white rounded-lg border border-gray-200 shadow-md max-h-80 overflow-y-auto">
                    {tickerSearchResults.map((tickerResult, index) => (
                      <div
                        key={index}
                        onClick={() => selecionarTicker(tickerResult)}
                        className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-lg text-blue-900">{tickerResult.ticker}</div>
                            <div className="text-sm text-gray-600">{tickerResult.descricao}</div>
                          </div>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                            {tickerResult.tipo_ativo}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Exemplos de FIIs populares */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Exemplos de FIIs populares:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['HGLG11', 'XPML11', 'MXRF11', 'KNRI11', 'BCFF11', 'VILG11', 'GGRC11', 'RBRR11'].map((exampleTicker) => (
                      <Button
                        key={exampleTicker}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigate(`/dashboard/mercado/analise-ticker/fii?ticker=${exampleTicker}`);
                        }}
                        className="text-blue-700 border-blue-300 hover:bg-blue-100"
                      >
                        {exampleTicker}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button variant="outline" onClick={() => navigate('/dashboard/mercado')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o Dashboard
            </Button>
          </div>
        </div>
      </MarketPremiumGuard>
    );
  }

  return (
    <MarketPremiumGuard marketFeature="ticker-analysis">
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Carregando análise do FII...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center min-h-[60vh] flex-col">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Erro ao buscar dados</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate('/dashboard/mercado')}>
                Voltar para o Dashboard
              </Button>
              <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
            </div>
          </div>
        ) : analysisData ? (
          <div className="space-y-6">
            {/* Seção de Busca de FII */}
            <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="bg-indigo-600 p-2 rounded-lg">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  Buscar Outro FII para Análise
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Digite o código do FII (ex: HGLG11, XPML11, MXRF11...)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 text-lg"
                    />
                    {searchLoading && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                    )}
                  </div>

                  {/* Resultados da Busca */}
                  {tickerSearchResults.length > 0 && (
                    <div className="mt-4 bg-white rounded-lg border border-gray-200 shadow-sm max-h-60 overflow-y-auto">
                      {tickerSearchResults.map((tickerResult, index) => (
                        <div
                          key={index}
                          onClick={() => selecionarTicker(tickerResult)}
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-blue-900">{tickerResult.ticker}</div>
                              <div className="text-sm text-gray-600">{tickerResult.descricao}</div>
                            </div>
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                              {tickerResult.tipo_ativo}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ticker Atual */}
                  {ticker && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-600 p-2 rounded-lg">
                            <Building2 className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-green-800">Analisando: {ticker}</div>
                            <div className="text-sm text-green-600">FII selecionado para análise detalhada</div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchTerm("");
                            setTickerSearchResults([]);
                          }}
                          className="text-green-700 border-green-300 hover:bg-green-100"
                        >
                          Buscar Outro
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Seção Principal - Ticker, Setor e Recomendação */}
            <Card className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 border-2 border-blue-500 shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  
                  {/* Ticker e Setor - Destacados */}
                  <div className="flex flex-col items-center lg:items-start">
                    <h1 className="text-6xl lg:text-7xl font-black text-white mb-3 tracking-tight drop-shadow-lg">
                      {analysisData.ticker}
                    </h1>
                    <Badge className="text-lg py-2 px-6 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold shadow-lg border border-white/30">
                      {analysisData.segmento}
                    </Badge>
                  </div>

                  {/* Recomendação do Sistema - Destaque */}
                  {analysisData.insights?.recomendacao && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 shadow-xl lg:max-w-md">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-white">Recomendação do Sistema</h2>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="bg-white/20 rounded-xl p-4">
                          <div className="text-base text-white font-semibold leading-relaxed">
                            {analysisData.insights.recomendacao}
                          </div>
                          {analysisData.insights.score_detalhado && (
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-white/80 text-sm">Score de Confiança:</span>
                              <Badge className={`text-sm py-1 px-3 font-bold ${
                                analysisData.insights.score_detalhado.score_percentual >= 75 
                                  ? 'bg-green-500 text-white' 
                                  : analysisData.insights.score_detalhado.score_percentual >= 50 
                                    ? 'bg-yellow-500 text-white' 
                                    : 'bg-red-500 text-white'
                              }`}>
                                {analysisData.insights.score_detalhado.score_percentual}%
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>

            {/* Insights Detalhados - Fonte Maior */}
            <Card className="bg-gradient-to-r from-green-50 via-yellow-50 to-red-50 border-2 border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  Análise Detalhada dos Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Pontos Positivos */}
                  <div className="bg-green-100 rounded-xl p-5 border-2 border-green-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-600 p-2 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-green-800">Pontos Positivos</h3>
                    </div>
                    <div className="space-y-3">
                      {analysisData.insights?.pontos_positivos?.map((ponto, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="bg-green-600 rounded-full w-2 h-2 mt-2 flex-shrink-0"></div>
                          <div className="text-sm text-green-800 leading-relaxed font-medium">{ponto}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pontos de Atenção */}
                  {analysisData.insights?.pontos_atencao?.length > 0 && (
                    <div className="bg-yellow-100 rounded-xl p-5 border-2 border-yellow-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-yellow-600 p-2 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-yellow-800">Pontos de Atenção</h3>
                      </div>
                      <div className="space-y-3">
                        {analysisData.insights.pontos_atencao.map((ponto, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="bg-yellow-600 rounded-full w-2 h-2 mt-2 flex-shrink-0"></div>
                            <div className="text-sm text-yellow-800 leading-relaxed font-medium">{ponto}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alertas */}
                  {analysisData.insights?.alertas?.length > 0 && (
                    <div className="bg-red-100 rounded-xl p-5 border-2 border-red-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-red-600 p-2 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-red-800">Alertas Importantes</h3>
                      </div>
                      <div className="space-y-3">
                        {analysisData.insights.alertas.map((alerta, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="bg-red-600 rounded-full w-2 h-2 mt-2 flex-shrink-0"></div>
                            <div className="text-sm text-red-800 leading-relaxed font-medium">{alerta}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>

            {/* Informações Essenciais - Estilo Profissional */}
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Building2 className="h-6 w-6" />
                  </div>
                  Informações Essenciais
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                    <div className="text-sm font-semibold text-slate-600 mb-2">Administrador</div>
                    <div className="font-bold text-base text-slate-800">{analysisData.administrador}</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                    <div className="text-sm font-semibold text-slate-600 mb-2">Fundação</div>
                    <div className="font-bold text-base text-slate-800">{analysisData.inicio_fundo}</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                    <div className="text-sm font-semibold text-slate-600 mb-2">Total Cotistas</div>
                    <div className="font-bold text-base text-slate-800">{formatLargeNumber((analysisData.cotistas_pf + analysisData.cotistas_pj) || 0)}</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                    <div className="text-sm font-semibold text-slate-600 mb-2">Site</div>
                    <a 
                      href={`http://${analysisData.site_administrador}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline text-base font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Link
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Indicadores financeiros - Estilo Profissional */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 shadow-md">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      <p className="text-xs font-semibold text-emerald-700">Preço Atual</p>
                    </div>
                    <div className="text-xl font-bold text-center text-emerald-700">
                      {formatCurrency(analysisData.last_price)}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-md">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <p className="text-xs font-semibold text-blue-700">P/VP</p>
                    </div>
                    <div className="text-xl font-bold text-center text-blue-700">
                      {formatNumberWithDecimals(analysisData.p_vp, 2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 shadow-md">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="h-4 w-4 text-violet-600" />
                      <p className="text-xs font-semibold text-violet-700">Dividend Yield</p>
                    </div>
                    <div className="text-xl font-bold text-center text-violet-700">
                      {formatPercentage(analysisData.rentab_mensal)}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 shadow-md">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-amber-600" />
                      <p className="text-xs font-semibold text-amber-700">Último Dividendo</p>
                    </div>
                    <div className="text-xl font-bold text-center text-amber-700">
                      {formatCurrency(analysisData.ultimo_dividendo)}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 shadow-md">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                      <PieChart className="h-4 w-4 text-indigo-600" />
                      <p className="text-xs font-semibold text-indigo-700">Patrimônio Líquido</p>
                    </div>
                    <div className="text-xl font-bold text-center text-indigo-700">
                      {formatCurrency(analysisData.patrimonio_liquido / 1000000000)}B
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Resumo do Fundo - Estilo Profissional */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Building2 className="h-5 w-5" />
                  </div>
                  Resumo do Fundo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2">Informações Gerais</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-blue-700">Tipo</div>
                        <div className="font-bold text-blue-800">{analysisData.segmento || 'Tijolo'}</div>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-indigo-700">Segmento</div>
                        <div className="font-bold text-indigo-800">{analysisData.segmento}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-slate-700">CNPJ</div>
                        <div className="font-bold text-slate-800 text-xs">{analysisData.cnpj}</div>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-emerald-700">Fundação</div>
                        <div className="font-bold text-emerald-800">{analysisData.inicio_fundo}</div>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-emerald-700">Idade</div>
                        <div className="font-bold text-emerald-800">
                          {(() => {
                            const age = calculateFundAge(analysisData.inicio_fundo);
                            return age > 0 ? `${age} ${age === 1 ? 'ano' : 'anos'}` : 'N/A';
                          })()}
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-purple-700">Administrador</div>
                        <div className="font-bold text-purple-800 text-xs">{analysisData.administrador}</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-red-700">Alavancagem</div>
                        <div className={`font-bold ${
                          analysisData.alavancagem_percentual <= 25 ? 'text-green-700' :
                          analysisData.alavancagem_percentual <= 35 ? 'text-yellow-700' : 'text-red-700'
                        }`}>
                          {formatPercentage(analysisData.alavancagem_percentual)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2">Composição do Patrimônio</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-green-700">Patrimônio Líquido</div>
                        <div className="font-bold text-green-800 text-sm">{formatCurrency(analysisData.patrimonio_liquido)}</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-blue-700">Valor de Mercado</div>
                        <div className="font-bold text-blue-800 text-sm">{formatCurrency(analysisData.valor_mercado)}</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-orange-700">Quantidade de Cotas</div>
                        <div className="font-bold text-orange-800">{formatLargeNumber(analysisData.qt_de_cotas)}</div>
                      </div>
                      <div className="bg-teal-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-teal-700">Cotistas</div>
                        <div className="font-bold text-teal-800">{formatLargeNumber((analysisData.cotistas_pf + analysisData.cotistas_pj) || 0)}</div>
                      </div>
                      <div className="bg-violet-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-violet-700">Valor dos Ativos</div>
                        <div className="font-bold text-violet-800 text-sm">{formatCurrency(analysisData.valor_ativos)}</div>
                      </div>
                      <div className="bg-cyan-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-cyan-700">Caixa Disponível</div>
                        <div className="font-bold text-cyan-800 text-sm">{formatCurrency(analysisData.caixa)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Preços - Estilo Profissional */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  Histórico de Preços - Última Semana
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <div className="h-[300px] w-full">
                  <Line
                    data={{
                      labels: [...analysisData.ultima_semana].reverse().map(item => item.data),
                      datasets: [
                        {
                          label: 'Preço (R$)',
                          data: [...analysisData.ultima_semana].reverse().map(item => item.preco),
                          fill: true,
                          backgroundColor: 'rgba(147, 51, 234, 0.1)',
                          borderColor: 'rgba(147, 51, 234, 1)',
                          tension: 0.4,
                          borderWidth: 3
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false
                          }
                        },
                        y: {
                          beginAtZero: false
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Gráficos em grade 2x2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Composição do Portfólio */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Composição do Portfólio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <Pie
                      data={{
                        labels: analysisData.composicao_ativo.detalhamento_ativos.map(item => item.tipo_ativo),
                        datasets: [{
                          data: analysisData.composicao_ativo.detalhamento_ativos.map(item => item.percentual),
                          backgroundColor: [
                            '#3B82F6', // Azul
                            '#10B981', // Verde
                            '#F59E0B', // Amarelo
                            '#EF4444', // Vermelho
                            '#8B5CF6', // Roxo
                            '#EC4899', // Rosa
                            '#14B8A6'  // Teal
                          ],
                          borderWidth: 2,
                          borderColor: '#ffffff'
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              boxWidth: 12,
                              font: {
                                size: 10
                              },
                              usePointStyle: true
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const item = analysisData.composicao_ativo.detalhamento_ativos[context.dataIndex];
                                return [
                                  `${item.tipo_ativo}:`,
                                  `Valor: ${formatCurrency(item.valor)}`,
                                  `Percentual: ${item.percentual.toFixed(2)}%`
                                ];
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Evolução da Alavancagem */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Evolução da Alavancagem do Fundo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <Line
                      data={{
                        labels: ['dez. 24', 'jan. 25', 'fev. 25', 'mar. 25', 'abr. 25', 'mai. 25', 'jun. 25'],
                        datasets: [{
                          label: 'Alavancagem do Fundo (%)',
                          data: [24.8, 24.5, 24.3, 24.1, 23.9, 23.7, 23.46],
                          fill: true,
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          borderColor: 'rgba(239, 68, 68, 1)',
                          tension: 0.4
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            min: 20,
                            max: 26,
                            ticks: {
                              callback: function(value) {
                                return value + '%';
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            
              {/* Aluguéis x Outros Recebíveis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Aluguéis x Outros Recebíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <Bar
                      data={{
                        labels: ['dez. 24', 'jan. 25', 'fev. 25', 'mar. 25', 'abr. 25', 'mai. 25', 'jun. 25'],
                        datasets: [
                          {
                            label: 'Aluguéis',
                            data: Array(7).fill(6.36),
                            backgroundColor: 'rgba(79, 70, 229, 0.8)'
                          },
                          {
                            label: 'Outros Recebíveis (%)',
                            data: Array(7).fill(93.64),
                            backgroundColor: 'rgba(16, 185, 129, 0.8)'
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            stacked: true
                          },
                          y: {
                            stacked: true,
                            max: 100
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Gap de Liquidez */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Gap de Liquidez (Mensal)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <Line
                      data={{
                        labels: ['dez. 24', 'jan. 25', 'fev. 25', 'mar. 25', 'abr. 25', 'mai. 25', 'jun. 25'],
                        datasets: [{
                          label: 'Gap de Liquidez (%)',
                          data: [37, 33, 28, 19, 12, 8, 7],
                          fill: true,
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderColor: 'rgba(59, 130, 246, 1)',
                          tension: 0.4
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            min: 0,
                            max: 40
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Detalhamento dos Ativos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Detalhamento da Composição dos Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-left font-medium">Tipo de Ativo</TableHead>
                        <TableHead className="text-right font-medium">Valor (R$)</TableHead>
                        <TableHead className="text-right font-medium">Percentual (%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysisData.composicao_ativo.detalhamento_ativos.map((ativo, index) => (
                        <TableRow key={index} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{ativo.tipo_ativo}</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(ativo.valor)}</TableCell>
                          <TableCell className="text-right font-medium">
                            <Badge 
                              variant={ativo.percentual > 50 ? "default" : ativo.percentual > 10 ? "secondary" : "outline"}
                              className={
                                ativo.percentual > 50 
                                  ? "bg-blue-600 text-white" 
                                  : ativo.percentual > 10 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-gray-100 text-gray-600"
                              }
                            >
                              {ativo.percentual.toFixed(2)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Total dos Ativos:</strong> {formatCurrency(analysisData.composicao_ativo.raw.total_investido)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Dados Históricos Mensais - Estilo Profissional */}
            <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white">
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Calendar className="h-5 w-5" />
                  </div>
                  Dados Históricos Mensais
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-cyan-50 border-b-2 border-cyan-200">
                        <TableHead className="text-left font-bold text-cyan-800">Data</TableHead>
                        <TableHead className="text-right font-bold text-cyan-800">Gap Liquidez</TableHead>
                        <TableHead className="text-right font-bold text-cyan-800">Alavancagem</TableHead>
                        <TableHead className="text-right font-bold text-cyan-800">Total Investido</TableHead>
                        <TableHead className="text-right font-bold text-cyan-800">Total Passivo</TableHead>
                        <TableHead className="text-right font-bold text-cyan-800">Dividendo</TableHead>
                        <TableHead className="text-right font-bold text-cyan-800">% Aluguel</TableHead>
                        <TableHead className="text-right font-bold text-cyan-800">% Imóveis</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysisData.historico_mensal?.slice(0, 6).map((item, index) => (
                        <TableRow key={index} className={`hover:bg-cyan-50 transition-colors ${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        }`}>
                          <TableCell className="text-left font-semibold text-gray-800">{item.data_referencia}</TableCell>
                          <TableCell className="text-right">
                            <span className={`font-bold ${
                              item.gap_liquidez >= 0 ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {(item.gap_liquidez * 100).toFixed(4)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`font-bold ${
                              item.alavancagem <= 0.25 ? 'text-green-700' : 
                              item.alavancagem <= 0.35 ? 'text-yellow-700' : 'text-red-700'
                            }`}>
                              {(item.alavancagem * 100).toFixed(2)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-blue-700">
                            {formatCurrency(item.total_investido)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-purple-700">
                            {formatCurrency(item.total_passivo)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-emerald-700">
                            {formatCurrency(item.dividendo_periodo)}
                          </TableCell>
                          <TableCell className="text-right font-bold text-teal-700">
                            {(item.percent_aluguel * 100).toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right font-bold text-orange-700">
                            {(item.imoveis_renda_percentual * 100).toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Detalhamento Completo do FII - Análise de Investimento */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="bg-blue-600 p-3 rounded-xl">
                    <Building2 className="h-7 w-7 text-white" />
                  </div>
                  Análise Completa para Decisão de Investimento
                </CardTitle>
                <p className="text-gray-600 mt-2">Resumo executivo baseado em todos os dados coletados e analisados</p>
              </CardHeader>
              <CardContent className="p-8">
                
                {/* Resumo Executivo */}
                <div className="mb-8 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Resumo Executivo
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-bold text-blue-800 mb-2">Perfil do Fundo</h4>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Segmento:</span>
                            <span className="font-semibold">{analysisData.segmento}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Patrimônio Líquido:</span>
                            <span className="font-semibold text-green-600">{formatCurrency(analysisData.patrimonio_liquido)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Valor de Mercado:</span>
                            <span className="font-semibold">{formatCurrency(analysisData.valor_mercado)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cotistas:</span>
                            <span className="font-semibold">{formatLargeNumber((analysisData.cotistas_pf + analysisData.cotistas_pj) || 0)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-bold text-green-800 mb-2">Indicadores de Rentabilidade</h4>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Dividend Yield Mensal:</span>
                            <span className="font-semibold text-green-600">{formatPercentage(analysisData.rentab_mensal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Último Dividendo:</span>
                            <span className="font-semibold text-green-600">{formatCurrency(analysisData.ultimo_dividendo)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">P/VP:</span>
                            <span className={`font-semibold ${
                              analysisData.p_vp <= 0.9 ? 'text-green-600' : 
                              analysisData.p_vp <= 1.1 ? 'text-yellow-600' : 'text-red-600'
                            }`}>{formatNumberWithDecimals(analysisData.p_vp, 2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Preço Atual:</span>
                            <span className="font-semibold">{formatCurrency(analysisData.last_price)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-bold text-yellow-800 mb-2">Análise de Risco</h4>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Alavancagem:</span>
                            <span className={`font-semibold ${
                              analysisData.alavancagem_percentual <= 20 ? 'text-green-600' : 
                              analysisData.alavancagem_percentual <= 35 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {formatPercentage(analysisData.alavancagem_percentual)} 
                              ({analysisData.analise_contabil?.alavancagem_detalhada?.classificacao || 'N/A'})
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Liquidez (Gap):</span>
                            <span className={`font-semibold ${
                              analysisData.liquidez?.metrics?.gap_liquidez >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatPercentage((analysisData.liquidez?.metrics?.gap_liquidez || 0) * 100)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Concentração Imobiliária:</span>
                            <span className="font-semibold">{formatPercentage((analysisData.composicao_ativo?.metrics?.percent_imobiliario || 0) * 100)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Passivo:</span>
                            <span className="font-semibold">{formatCurrency(analysisData.total_passivo)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-bold text-purple-800 mb-2">Composição de Receitas</h4>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Receitas de Aluguel:</span>
                            <span className="font-semibold">{formatPercentage((analysisData.recebiveis?.metrics?.percent_aluguel || 0) * 100)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Receitas de Venda:</span>
                            <span className="font-semibold">{formatPercentage((analysisData.recebiveis?.metrics?.percent_venda || 0) * 100)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Outras Receitas:</span>
                            <span className="font-semibold">{formatPercentage((analysisData.recebiveis?.metrics?.percent_outros || 0) * 100)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Valores a Receber:</span>
                            <span className="font-semibold">{formatCurrency(analysisData.valores_a_receber)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Análise Comparativa e Conclusão */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-green-600" />
                      Pontos Fortes do Investimento
                    </h3>
                    <div className="space-y-3">
                      {/* Indicadores positivos automáticos baseados nos dados */}
                      {analysisData.p_vp <= 0.95 && (
                        <div className="flex items-center gap-2 text-green-700">
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="text-sm">P/VP abaixo de 0.95 indica possível subvalorização</span>
                        </div>
                      )}
                      {analysisData.rentab_mensal >= 0.5 && (
                        <div className="flex items-center gap-2 text-green-700">
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="text-sm">Dividend yield mensal atrativo ({formatPercentage(analysisData.rentab_mensal)})</span>
                        </div>
                      )}
                      {analysisData.alavancagem_percentual <= 25 && (
                        <div className="flex items-center gap-2 text-green-700">
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="text-sm">Alavancagem conservadora ({formatPercentage(analysisData.alavancagem_percentual)})</span>
                        </div>
                      )}
                      {(analysisData.liquidez?.metrics?.gap_liquidez || 0) >= 0 && (
                        <div className="flex items-center gap-2 text-green-700">
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="text-sm">Gap de liquidez positivo indica boa gestão financeira</span>
                        </div>
                      )}
                      {analysisData.patrimonio_liquido >= 1000000000 && (
                        <div className="flex items-center gap-2 text-green-700">
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="text-sm">Patrimônio líquido robusto (+R$ 1bi)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Pontos de Atenção
                    </h3>
                    <div className="space-y-3">
                      {/* Insights de Pontos de Atenção da API */}
                      {analysisData.insights?.pontos_atencao?.length > 0 ? (
                        analysisData.insights.pontos_atencao.map((ponto, index) => (
                          <div key={index} className="flex items-start gap-2 text-yellow-700">
                            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{ponto}</span>
                          </div>
                        ))
                      ) : null}
                      
                      {/* Alertas da API */}
                      {analysisData.insights?.alertas?.length > 0 ? (
                        analysisData.insights.alertas.map((alerta, index) => (
                          <div key={`alerta-${index}`} className="flex items-start gap-2 text-red-700">
                            <ArrowDownRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{alerta}</span>
                          </div>
                        ))
                      ) : null}

                      {/* Indicadores automáticos baseados nos dados (apenas se não houver insights da API) */}
                      {(!analysisData.insights?.pontos_atencao?.length && !analysisData.insights?.alertas?.length) && (
                        <>
                          {analysisData.p_vp >= 1.15 && (
                            <div className="flex items-center gap-2 text-red-700">
                              <ArrowDownRight className="h-4 w-4" />
                              <span className="text-sm">P/VP elevado ({formatNumberWithDecimals(analysisData.p_vp, 2)}) pode indicar sobrevalorização</span>
                            </div>
                          )}
                          {analysisData.alavancagem_percentual >= 35 && (
                            <div className="flex items-center gap-2 text-red-700">
                              <ArrowDownRight className="h-4 w-4" />
                              <span className="text-sm">Alavancagem elevada ({formatPercentage(analysisData.alavancagem_percentual)}) aumenta risco</span>
                            </div>
                          )}
                          {(analysisData.liquidez?.metrics?.gap_liquidez || 0) < 0 && (
                            <div className="flex items-center gap-2 text-red-700">
                              <ArrowDownRight className="h-4 w-4" />
                              <span className="text-sm">Gap de liquidez negativo requer atenção</span>
                            </div>
                          )}
                          {analysisData.rentab_mensal <= 0.3 && (
                            <div className="flex items-center gap-2 text-yellow-700">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm">Dividend yield baixo ({formatPercentage(analysisData.rentab_mensal)})</span>
                            </div>
                          )}
                          {(analysisData.composicao_ativo?.metrics?.percent_imobiliario || 0) < 0.6 && (
                            <div className="flex items-center gap-2 text-yellow-700">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm">Baixa concentração imobiliária pode diluir foco</span>
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Mensagem caso não haja pontos de atenção */}
                      {(!analysisData.insights?.pontos_atencao?.length && !analysisData.insights?.alertas?.length && 
                        analysisData.p_vp < 1.15 && analysisData.alavancagem_percentual < 35 && 
                        (analysisData.liquidez?.metrics?.gap_liquidez || 0) >= 0 && 
                        analysisData.rentab_mensal > 0.3 && 
                        (analysisData.composicao_ativo?.metrics?.percent_imobiliario || 1) >= 0.6) && (
                        <div className="flex items-center gap-2 text-green-700">
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="text-sm">Não foram identificados pontos críticos de atenção neste fundo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conclusão Final */}
                <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <LineChart className="h-6 w-6" />
                    Conclusão da Análise
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-semibold mb-2">Adequado para:</div>
                      <div className="text-blue-100">
                        {analysisData.rentab_mensal >= 0.5 && analysisData.alavancagem_percentual <= 30 
                          ? "Investidores buscando renda mensal consistente com risco moderado"
                          : analysisData.p_vp <= 0.95
                            ? "Investidores com foco em valorização e dispostos a aguardar"
                            : "Investidores que buscam diversificação em FIIs consolidados"
                        }
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold mb-2">Horizonte recomendado:</div>
                      <div className="text-blue-100">
                        {analysisData.alavancagem_percentual <= 25 
                          ? "Longo prazo (5+ anos) para melhor aproveitamento"
                          : "Médio prazo (2-4 anos) com acompanhamento regular"
                        }
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold mb-2">Participação recomendada:</div>
                      <div className="text-blue-100">
                        {analysisData.insights?.score_detalhado?.score_percentual >= 75
                          ? "5-15% da carteira de FIIs"
                          : analysisData.insights?.score_detalhado?.score_percentual >= 50
                            ? "2-8% da carteira de FIIs"
                            : "Máximo 5% para diversificação"
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dados Técnicos Detalhados */}
                <div className="mt-6 bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-800">Dados Técnicos Detalhados</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 mb-1">Qtd. de Cotas</div>
                      <div className="font-semibold">{formatLargeNumber(analysisData.qt_de_cotas)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Valor Patrimonial</div>
                      <div className="font-semibold">{formatCurrency(analysisData.valor_patrimonial_cotas)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Total Investido</div>
                      <div className="font-semibold">{formatCurrency(analysisData.total_investido)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Caixa Disponível</div>
                      <div className="font-semibold">{formatCurrency(analysisData.caixa)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Taxa Administração</div>
                      <div className="font-semibold">{formatCurrency(analysisData.custo_mensal_administracao || 0)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Volume Negociado</div>
                      <div className="font-semibold">{formatLargeNumber(analysisData.volume)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Qtd. Ativos</div>
                      <div className="font-semibold">{formatLargeNumber(analysisData.quantidade_ativos_fundo)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Data Análise</div>
                      <div className="font-semibold">{analysisData.data_analise}</div>
                    </div>
                  </div>
                </div>
                  
                  {/* Coluna 2: Composição de Cotistas */}
                  <div>
                    <h3 className="font-semibold mb-4">Composição de Cotistas</h3>
                    <div className="h-[250px] w-full">
                      <Pie
                        data={{
                          labels: [
                            'Pessoas Físicas',
                            'Pessoas Jurídicas',
                            'Bancos',
                            'Investidores Estrangeiros'
                          ],
                          datasets: [{
                            data: [
                              analysisData.cotistas_pf || 90,
                              analysisData.cotistas_pj || 6,
                              analysisData.qt_bacos_cotistas || 2,
                              analysisData.qt_investidores_internacionais || 2
                            ],
                            backgroundColor: [
                              '#3B82F6', // Azul
                              '#10B981', // Verde
                              '#F59E0B', // Amarelo
                              '#EF4444'  // Vermelho
                            ],
                            borderWidth: 1,
                            borderColor: '#ffffff'
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                boxWidth: 15,
                                font: {
                                  size: 11
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="text-center mt-2 text-sm text-gray-500">
                      Total de {formatLargeNumber((analysisData.cotistas_pf + analysisData.cotistas_pj) || 12600)} cotistas
                    </div>
                  </div>
              </CardContent>
            </Card>

            {/* Histórico de Dividendos - Estilo Profissional */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  Histórico de Dividendos - Últimos 12 meses
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <div className="h-[300px] w-full">
                  <Bar
                    data={{
                      labels: analysisData.historico_mensal?.slice(-12).map(item => {
                        const date = new Date(item.data_referencia);
                        return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
                      }) || ['Out/2024', 'Nov/2024', 'Dez/2024', 'Jan/2025', 'Fev/2025', 'Mar/2025'],
                      datasets: [
                        {
                          label: 'Dividendo (R$)',
                          data: analysisData.historico_mensal?.slice(-12).map(item => item.dividendo_periodo) || [0.67, 0.68, 0.68, 0.69, 0.69, 0.70],
                          backgroundColor: 'rgba(34, 197, 94, 0.8)',
                          borderColor: '#16A34A',
                          borderWidth: 2,
                          borderRadius: 6
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false
                          }
                        },
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/dashboard/mercado')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o Dashboard
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  const newTicker = prompt('Digite o ticker do FII que deseja analisar:');
                  if (newTicker && newTicker.trim()) {
                    navigate(`/dashboard/mercado/analise-ticker/fii?ticker=${newTicker.toUpperCase().trim()}`);
                  }
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Search className="h-4 w-4" />
                Consultar Novo FII
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </MarketPremiumGuard>
  );
}