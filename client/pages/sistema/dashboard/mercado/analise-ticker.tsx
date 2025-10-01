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
  BarElement
);

interface TickerSearchResult {
  ticker: string;
  descricao: string;
  tipo_ativo: string;
}

// Interface completa da resposta da API FII
interface FIIAnalysisResponse {
  ticker: string;
  cnpj: string;
  razao_social: string;
  qt_de_cotas: number;
  qt_aumento_de_cotas: number;
  mes_ultima_emicao_de_cotas: string | null;
  inicio_fundo: string;
  segmento: string;
  nome_adiministrador: string;
  prazo_duracao: string;
  data_prazo_duracao: string | null;
  nome_fundo: string;
  ultima_entrega_anual: string;
  data_entrega_consolidacao: string;
  data_inicio: string;
  objetivo: string;
  gestao: string;
  negociado_bolsa: boolean;
  administrador: string;
  site_administrador: string;
  cotistas_pf: number | null;
  cotistas_pj: number | null;
  qt_bacos_cotistas: number | null;
  qt_investidores_internacionais: number | null;
  valor_ativos: number;
  patrimonio_liquido: number;
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
  }>;
  p_vp: number;
  valor_patrimonial: number;
  rentab_mensal: number;
  data_analise: string;
  status: string;
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
    };
  };
  historico_mensal: Array<{
    data_referencia: string;
    gap_liquidez: number;
    alavancagem: number;
    percent_imobiliario: number;
    valores_receber: number;
    disponibilidades: number;
    total_investido: number;
    total_passivo: number;
    percent_aluguel: number;
    percent_venda: number;
    percent_outros: number;
    dividendo_periodo: number;
    imoveis_renda_percentual: number;
  }>;
}

// Funções de formatação brasileira
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercentage = (value: number | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

const formatNumber = (value: number | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
};

// Função para formatação em milhões/bilhões
const formatLargeNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  
  if (value >= 1000000000) {
    // Bilhões
    return `R$ ${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    // Milhões
    return `R$ ${(value / 1000000).toFixed(0)}MM`;
  } else {
    // Valores menores que milhão
    return formatCurrency(value);
  }
};

// Função para gerar insights automáticos
interface Insight {
  type: 'positive' | 'negative' | 'alert';
  icon: React.ReactNode;
  message: string;
}

const generateInsights = (data: FIIAnalysisResponse | null): Insight[] => {
  if (!data || !data.historico_mensal || data.historico_mensal.length === 0) {
    return [];
  }

  const insights: Insight[] = [];
  const historico = data.historico_mensal.sort((a, b) => new Date(a.data_referencia).getTime() - new Date(b.data_referencia).getTime());

  // ========== ANÁLISE TOTAL INVESTIDO ==========
  if (historico.length >= 2) {
    const atual = historico[historico.length - 1];
    const anterior = historico[historico.length - 2];
    
    const totalInvestidoAtual = atual.total_investido;
    const totalInvestidoAnterior = anterior.total_investido;
    
    if (totalInvestidoAtual > 0 && totalInvestidoAnterior > 0) {
      const crescimentoInvestimento = ((totalInvestidoAtual - totalInvestidoAnterior) / totalInvestidoAnterior) * 100;
      
      if (Math.abs(crescimentoInvestimento) > 1) { // Só mostra se mudança > 1%
        if (crescimentoInvestimento > 0) {
          insights.push({
            type: 'positive',
            icon: <ArrowUpRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
            message: `� Total investido cresceu ${crescimentoInvestimento.toFixed(1)}% no último mês`
          });
        } else {
          insights.push({
            type: 'negative',
            icon: <ArrowDownRight className="h-3 w-3 text-red-600 flex-shrink-0" />,
            message: `📉 Total investido caiu ${Math.abs(crescimentoInvestimento).toFixed(1)}% no último mês`
          });
        }
      }
    }
  }

  // ========== ANÁLISE ALAVANCAGEM ==========
  if (historico.length >= 2) {
    const atual = historico[historico.length - 1];
    const anterior = historico[historico.length - 2];
    
    const alavancagemAtual = atual.alavancagem * 100;
    const alavancagemAnterior = anterior.alavancagem * 100;
    
    if (alavancagemAtual >= 0 && alavancagemAnterior >= 0) {
      const mudancaAlavancagem = alavancagemAtual - alavancagemAnterior;
      
      if (Math.abs(mudancaAlavancagem) > 1) { // Só mostra se mudança > 1%
        if (mudancaAlavancagem < 0) {
          insights.push({
            type: 'positive',
            icon: <ArrowDownRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
            message: `📊 Alavancagem reduziu de ${alavancagemAnterior.toFixed(1)}% para ${alavancagemAtual.toFixed(1)}%`
          });
        } else {
          insights.push({
            type: 'negative',
            icon: <ArrowUpRight className="h-3 w-3 text-red-600 flex-shrink-0" />,
            message: `⚠️ Alavancagem aumentou de ${alavancagemAnterior.toFixed(1)}% para ${alavancagemAtual.toFixed(1)}%`
          });
        }
      }
    }
  }

  // ========== ANÁLISE DIVIDENDOS ==========
  if (historico.length >= 2) {
    const atual = historico[historico.length - 1];
    const anterior = historico[historico.length - 2];
    
    const dividendoAtual = atual.dividendo_periodo;
    const dividendoAnterior = anterior.dividendo_periodo;
    
    // Caso especial: Dividendo = 0
    if (dividendoAtual === 0) {
      insights.push({
        type: 'alert',
        icon: <AlertTriangle className="h-3 w-3 text-yellow-600 flex-shrink-0" />,
        message: `🚨 ALERTA: Dividendo zero no período. Favor verificar se há problema na gestão do fundo`
      });
    } else if (dividendoAtual > 0 && dividendoAnterior > 0) {
      const crescimentoDividendo = ((dividendoAtual - dividendoAnterior) / dividendoAnterior) * 100;
      
      if (Math.abs(crescimentoDividendo) > 2) { // Só mostra se mudança > 2%
        if (crescimentoDividendo > 0) {
          insights.push({
            type: 'positive',
            icon: <ArrowUpRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
            message: `� Dividendo cresceu ${crescimentoDividendo.toFixed(1)}% no último mês`
          });
        } else {
          insights.push({
            type: 'negative',
            icon: <ArrowDownRight className="h-3 w-3 text-red-600 flex-shrink-0" />,
            message: `� Dividendo reduziu ${Math.abs(crescimentoDividendo).toFixed(1)}% no último mês`
          });
        }
      }
    }

    // Análise de estabilidade prolongada de dividendos
    if (historico.length >= 6) {
      const ultimosSeisMeses = historico.slice(-6);
      const dividendosSemVariacao = ultimosSeisMeses.every((mes, index) => {
        if (index === 0) return true;
        const anterior = ultimosSeisMeses[index - 1];
        if (anterior.dividendo_periodo === 0) return false;
        const variacao = Math.abs((mes.dividendo_periodo - anterior.dividendo_periodo) / anterior.dividendo_periodo) * 100;
        return variacao < 1; // Menos de 1% de variação
      });

      if (dividendosSemVariacao && dividendoAtual > 0) {
        insights.push({
          type: 'alert',
          icon: <AlertTriangle className="h-3 w-3 text-yellow-600 flex-shrink-0" />,
          message: `⚠️ Dividendos estáveis há 6+ meses. Possível estagnação na gestão`
        });
      }
    }
  }

  // ========== ANÁLISE IDADE DO FUNDO ==========
  if (data.data_inicio) {
    const dataInicio = new Date(data.data_inicio);
    const hoje = new Date();
    const idadeEmMeses = Math.floor((hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const idadeEmAnos = Math.floor(idadeEmMeses / 12);

    if (idadeEmAnos < 2) {
      insights.push({
        type: 'alert',
        icon: <AlertTriangle className="h-3 w-3 text-yellow-600 flex-shrink-0" />,
        message: `🆕 Fundo jovem (${idadeEmAnos === 0 ? idadeEmMeses + ' meses' : idadeEmAnos + (idadeEmAnos === 1 ? ' ano' : ' anos')}). Histórico limitado`
      });
    } else if (idadeEmAnos >= 5) {
      insights.push({
        type: 'positive',
        icon: <ArrowUpRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
        message: `✅ Fundo maduro (${idadeEmAnos} anos). Histórico sólido para análise`
      });
    }
  }

  // ========== ANÁLISE P/VP (PREÇO SOBRE VALOR PATRIMONIAL) ==========
  if (data.p_vp && data.p_vp > 0) {
    const pvp = data.p_vp;
    
    if (pvp < 0.8) {
      insights.push({
        type: 'positive',
        icon: <ArrowDownRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
        message: `💰 P/VP baixo (${pvp.toFixed(2)}). Possível oportunidade de compra`
      });
    } else if (pvp > 1.2) {
      insights.push({
        type: 'negative',
        icon: <ArrowUpRight className="h-3 w-3 text-red-600 flex-shrink-0" />,
        message: `⚠️ P/VP alto (${pvp.toFixed(2)}). Fundo pode estar sobrevalorizado`
      });
    } else {
      insights.push({
        type: 'positive',
        icon: <ArrowUpRight className="h-3 w-3 text-blue-600 flex-shrink-0" />,
        message: `📊 P/VP equilibrado (${pvp.toFixed(2)}). Preço justo`
      });
    }
  }

  // ========== ANÁLISE RENDIMENTO LÍQUIDO ==========
  if (data.dados_resumo?.patrimonio_liquido && historico.length >= 3) {
    const ultimosTresMeses = historico.slice(-3);
    const rendimentoMedio = ultimosTresMeses.reduce((acc, mes) => acc + (mes.dividendo_periodo || 0), 0) / 3;
    const rendimentoAnual = rendimentoMedio * 12;
    const precoAtual = data.indicadores_principais?.ultimo_preco || 1;
    const yieldAnual = (rendimentoAnual / precoAtual) * 100;

    if (yieldAnual > 8) {
      insights.push({
        type: 'positive',
        icon: <ArrowUpRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
        message: `� Yield projetado alto (${yieldAnual.toFixed(1)}% a.a.) baseado nos últimos 3 meses`
      });
    } else if (yieldAnual < 4 && yieldAnual > 0) {
      insights.push({
        type: 'negative',
        icon: <ArrowDownRight className="h-3 w-3 text-red-600 flex-shrink-0" />,
        message: `� Yield projetado baixo (${yieldAnual.toFixed(1)}% a.a.) baseado nos últimos 3 meses`
      });
    }
  }

  // ========== ANÁLISE LIQUIDEZ ==========
  if (data.liquidez?.metrics?.gap_liquidez !== undefined) {
    const gapLiquidez = data.liquidez.metrics.gap_liquidez * 100;
    
    if (gapLiquidez < 1) {
      insights.push({
        type: 'alert',
        icon: <AlertTriangle className="h-3 w-3 text-yellow-600 flex-shrink-0" />,
        message: `⚠️ Baixa liquidez (${gapLiquidez.toFixed(2)}%). Atenção para necessidades de caixa`
      });
    } else if (gapLiquidez > 10) {
      insights.push({
        type: 'positive',
        icon: <ArrowUpRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
        message: `💰 Boa liquidez (${gapLiquidez.toFixed(1)}%). Fundo bem posicionado em caixa`
      });
    }
  }

  // ========== ANÁLISE RECEITA DE ALUGUÉIS vs OUTROS ==========
  if (data.recebiveis?.metrics) {
    const percentAluguel = data.recebiveis.metrics.percent_aluguel * 100;
    
    if (percentAluguel > 70) {
      insights.push({
        type: 'positive',
        icon: <ArrowUpRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
        message: `🏢 Foco em aluguéis (${percentAluguel.toFixed(1)}%). Receita recorrente sólida`
      });
    }
  }

  return insights.slice(0, 5); // Máximo de 5 insights para não sobrecarregar
};

// Componente InfoCard para indicadores
const InfoCard: React.FC<{
  title: string;
  value: string;
  tooltip: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}> = ({ title, value, tooltip, icon, trend }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className="cursor-help hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
              <div className="flex items-center gap-2">
                {icon}
                {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Componente principal
export default function AnaliseTicker() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicker, setSelectedTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [tickerSearchResults, setTickerSearchResults] = useState<TickerSearchResult[]>([]);
  const [analysisData, setAnalysisData] = useState<FIIAnalysisResponse | null>(null);
  const [insights, setInsights] = useState<Array<{
    type: 'positive' | 'negative' | 'alert';
    icon: React.ReactElement;
    message: string;
  }>>([]);

  useEffect(() => {
    const tickerFromUrl = searchParams.get("ticker");
    if (tickerFromUrl) {
      setSelectedTicker(tickerFromUrl);
      performAnalysisForTicker(tickerFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      buscarTickers();
    } else {
      setTickerSearchResults([]);
    }
  }, [searchTerm]);

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

  const selecionarTicker = (ticker: TickerSearchResult) => {
    // Se for um FII (termina em 11), redirecionar para a página específica de FII
    if (ticker.ticker.toUpperCase().endsWith('11')) {
      window.location.href = `/dashboard/mercado/analise-ticker/fii?ticker=${ticker.ticker.toUpperCase()}`;
      return;
    }
    
    setSelectedTicker(ticker.ticker);
    setSearchTerm("");
    setTickerSearchResults([]);
    // Executa análise automaticamente
    performAnalysisForTicker(ticker.ticker);
  };

  const performAnalysisForTicker = async (ticker: string) => {
    if (!ticker.trim()) return;
    
    // Verificar se o ticker é um FII (termina em 11)
    if (ticker.toUpperCase().endsWith('11')) {
      // Redirecionar para a página específica de análise de FII
      window.location.href = `/dashboard/mercado/analise-ticker/fii?ticker=${ticker.toUpperCase()}`;
      return;
    }

    setLoading(true);
    setInsights([]); // Limpar insights anteriores
    
    try {
      const data = await investmentService.analisarAtivo(ticker.toUpperCase());
      setAnalysisData(data);
      
      // Processar insights após receber os dados
      if (data && data.historico_mensal && data.historico_mensal.length > 0) {
        const processedInsights = generateInsights(data);
        // Garantir que os insights estejam no formato correto
        const formattedInsights = processedInsights.map(insight => ({
          type: insight.type as 'positive' | 'negative' | 'alert',
          icon: insight.icon as React.ReactElement,
          message: insight.message
        }));
        setInsights(formattedInsights);
      }
    } catch (error) {
      console.error('Erro ao buscar análise do ticker:', error);
      setAnalysisData(null);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  const performAnalysis = () => {
    if (selectedTicker.trim()) {
      performAnalysisForTicker(selectedTicker);
    }
  };

  return (
    <MarketPremiumGuard marketFeature="ticker-analysis">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Análise de FII</h1>
          <p className="text-muted-foreground">
            Análise completa e detalhada de Fundos de Investimento Imobiliário
          </p>
        </div>

        {/* Search Section - Ocultar quando há análise */}
        {!analysisData && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={!selectedTicker ? "Digite o código do ticker (ex: HGLG11)" : `${selectedTicker} selecionado - Digite para alterar`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                    {searchLoading && (
                      <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin" />
                    )}
                  </div>

                  {selectedTicker && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-green-800 font-medium">Ticker selecionado: {selectedTicker}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTicker("");
                            setSearchTerm("");
                          }}
                          className="text-green-600 hover:text-green-700"
                        >
                          Selecionar Novo
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {tickerSearchResults.length > 0 && (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
                      {tickerSearchResults.map((result, index) => (
                        <div
                          key={index}
                          className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                          onClick={() => selecionarTicker(result)}
                        >
                          <div className="font-medium">{result.ticker}</div>
                          <div className="text-sm text-muted-foreground">{result.descricao}</div>
                          <Badge variant="outline" className="text-xs mt-1">{result.tipo_ativo}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={performAnalysis} 
                    disabled={loading || !selectedTicker.trim()}
                    className="min-w-[120px]"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? "Analisando..." : "Analisar"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysisData && (
          <div className="space-y-8">
            {/* Botão Nova Pesquisa */}
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setAnalysisData(null);
                  setSelectedTicker("");
                  setSearchTerm("");
                }}
                variant="outline"
                className="mb-4"
              >
                <Search className="h-4 w-4 mr-2" />
                Nova Pesquisa
              </Button>
            </div>

            {/* 🎯 Cabeçalho Principal com Ticker em Destaque */}
            <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 border-2 border-blue-300">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Coluna Esquerda: Ticker + Segmento */}
                  <div className="text-center lg:text-left space-y-4">
                    <div className="space-y-2">
                      <h1 className="text-5xl lg:text-6xl font-black text-blue-900 tracking-tight">
                        {analysisData.ticker}
                      </h1>
                      <Badge variant="default" className="text-xl px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                        <Building2 className="h-5 w-5 mr-2" />
                        {analysisData.segmento}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Coluna Central: Detalhes da Empresa */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-800 text-xl mb-2">Razão Social</h3>
                      <p className="text-lg text-gray-700">{analysisData.razao_social}</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg mb-1">CNPJ</h3>
                      <p className="text-base font-mono text-gray-600">{analysisData.cnpj}</p>
                    </div>
                    {analysisData.site_administrador && (
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg mb-1">Site do Administrador</h3>
                        <a 
                          href={analysisData.site_administrador.startsWith('http') ? analysisData.site_administrador : `https://${analysisData.site_administrador}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-base"
                        >
                          {analysisData.site_administrador}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Coluna Direita: Insights Automáticos */}
                  <div className="bg-white rounded-lg border-2 border-blue-200 p-4 shadow-sm">
                    <h3 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      Insights Automáticos
                    </h3>
                    <div className="space-y-2">
                      {loading ? (
                        <div className="text-center py-3">
                          <p className="text-xs text-gray-500">
                            Carregando insights...
                          </p>
                        </div>
                      ) : insights.length > 0 ? (
                        insights.map((insight, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded-md border-l-3 text-xs ${
                              insight.type === 'positive'
                                ? 'bg-green-50 border-green-400'
                                : insight.type === 'negative'
                                ? 'bg-red-50 border-red-400'
                                : 'bg-yellow-50 border-yellow-400'
                            }`}
                          >
                            <div className="flex items-start gap-1">
                              {insight.icon}
                              <p className="font-medium text-gray-700 leading-relaxed">
                                {insight.message}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-3">
                          <p className="text-xs text-gray-500">
                            {analysisData && analysisData.historico_mensal?.length ? 
                              `Processando ${analysisData.historico_mensal.length} meses de dados...` : 
                              'Dados históricos insuficientes para insights'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 📊 Cards de Indicadores Principais */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <InfoCard
                title="Preço Atual"
                value={formatCurrency(analysisData.last_price)}
                tooltip="Último preço de fechamento na bolsa de valores."
                icon={<DollarSign className="h-5 w-5 text-green-600" />}
              />
              
              <InfoCard
                title="P/VP"
                value={formatNumber(analysisData.p_vp, 2)}
                tooltip="Relação Preço ÷ Valor Patrimonial por cota. Indica se o fundo está caro ou barato."
                icon={<Percent className="h-5 w-5 text-blue-600" />}
              />
              
              <InfoCard
                title="Dividendo Mês"
                value={formatPercentage(analysisData.rentab_mensal)}
                tooltip="Preço atual / último rendimento. Rentabilidade mensal estimada do fundo."
                icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
              />
              
              <InfoCard
                title="Último Dividendo"
                value={formatCurrency(analysisData.rentabilidade_imobiliaria.metrics.ultimo_dividendo_calculado)}
                tooltip="Última distribuição de dividendos por cota do fundo."
                icon={<DollarSign className="h-5 w-5 text-green-600" />}
              />
              
              <InfoCard
                title="Patrimônio Líquido"
                value={formatLargeNumber(analysisData.patrimonio_liquido)}
                tooltip={`Valor Patrimonial Total: ${formatCurrency(analysisData.patrimonio_liquido)}`}
                icon={<Building2 className="h-5 w-5 text-blue-600" />}
              />
              
              <InfoCard
                title="Alavancagem do Fundo"
                value={formatPercentage(analysisData.passivo.metrics.alavancagem * 100)}
                tooltip="Índice de alavancagem (Dívida ÷ Patrimônio Líquido). Indica o nível de endividamento do fundo."
                icon={<Activity className="h-5 w-5 text-red-600" />}
              />
            </div>

            {/* 🏢 Resumo do Fundo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Building2 className="h-6 w-6" />
                  Resumo do Fundo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Coluna A: Informações Principais */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-lg mb-4 text-gray-800">Informações Gerais</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Data de Início:</span>
                          <span className="font-semibold">{formatDate(analysisData.data_inicio)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Prazo de Duração:</span>
                          <span className="font-semibold">{analysisData.prazo_duracao}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Objetivo:</span>
                          <Badge variant="secondary">{analysisData.objetivo}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Gestão:</span>
                          <Badge variant="outline">{analysisData.gestao}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Administrador:</span>
                          <span className="font-semibold">{analysisData.administrador}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-lg mb-4 text-gray-800">Patrimônio e Cotas</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Qtd. de Cotas:</span>
                          <span className="font-semibold">{formatNumber(analysisData.qt_de_cotas, 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Valor Patrimonial Total:</span>
                          <span className="font-semibold">{formatCurrency(analysisData.patrimonio_liquido)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Valor por Cota:</span>
                          <span className="font-semibold">{formatCurrency(analysisData.valor_patrimonial_cotas)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Qtd. de Ativos:</span>
                          <span className="font-semibold">{formatNumber(analysisData.quantidade_ativos_fundo, 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Patrimônio Líquido:</span>
                          <span className="font-semibold text-blue-600">{formatLargeNumber(analysisData.patrimonio_liquido)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coluna B: Rentabilidade e Receita */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-lg mb-4 text-gray-800">Rentabilidade e Qualidade</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Imóveis Renda (%):</span>
                          <span className="font-semibold text-green-600">
                            {formatPercentage(analysisData.rentabilidade_imobiliaria.metrics.imoveis_renda_percentual * 100)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Último Dividendo Calculado:</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(analysisData.rentabilidade_imobiliaria.metrics.ultimo_dividendo_calculado)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Receita Aluguel (%):</span>
                          <span className="font-semibold">{formatPercentage(analysisData.recebiveis.metrics.percent_aluguel * 100)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Outros Recebíveis (%):</span>
                          <span className="font-semibold">{formatPercentage(analysisData.recebiveis.metrics.percent_outros * 100)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Qualidade da Receita:</span>
                          <div className="text-right">
                            <div className="text-sm">Aluguel: {formatPercentage(analysisData.recebiveis.metrics.percent_aluguel * 100)}</div>
                            <div className="text-sm">Outros: {formatPercentage(analysisData.recebiveis.metrics.percent_outros * 100)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-lg mb-4 text-gray-800">Custos e Despesas</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Taxa Admin. Mensal:</span>
                          <span className="font-semibold text-red-600">{formatCurrency(analysisData.custo_mensal_administracao)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Custos Fixos:</span>
                          <span className="font-semibold text-red-600">{formatCurrency(analysisData.custos_fixos)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Total Passivo:</span>
                          <span className="font-semibold text-red-600">{formatCurrency(analysisData.passivo.raw.total_passivo)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Nível de Risco:</span>
                          <div className="text-right">
                            <span className="font-semibold text-red-600">
                              {formatPercentage(analysisData.passivo.metrics.alavancagem * 100)}
                            </span>
                            <div className="text-xs text-gray-500">alavancagem do fundo</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 📈 Gráficos Interativos - Nova Organização */}
            
            {/* 1. Histórico de Preços (Primeira posição, largura completa) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Histórico de Preços - Última Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Line
                    data={{
                      labels: analysisData.ultima_semana.map(item => item.data).reverse(),
                      datasets: [{
                        label: 'Preço (R$)',
                        data: analysisData.ultima_semana.map(item => item.preco).reverse(),
                        borderColor: 'rgb(139, 92, 246)',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        tension: 0.4,
                        fill: true,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          ticks: {
                            callback: function(value) {
                              return 'R$ ' + value;
                            }
                          }
                        }
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `Preço: ${formatCurrency(context.raw as number)}`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. Portfólio e Alavancagem (lado a lado) */}
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
                  <div className="h-64">
                    <Pie
                      data={{
                        labels: [
                          'Imóveis Acabados',
                          'Terrenos',
                          'FIIs',
                          'Ações/Sociedades',
                          'Imóveis em Construção'
                        ],
                        datasets: [{
                          data: [
                            analysisData.composicao_ativo.raw.imoveis_renda_acabados,
                            analysisData.composicao_ativo.raw.terrenos,
                            analysisData.composicao_ativo.raw.fii,
                            analysisData.composicao_ativo.raw.acoes_sociedades_atividades_fii,
                            analysisData.composicao_ativo.raw.imoveis_renda_construcao
                          ],
                          backgroundColor: [
                            '#3B82F6',
                            '#10B981',
                            '#F59E0B',
                            '#EF4444',
                            '#8B5CF6'
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
                            position: 'bottom'
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const value = context.raw as number;
                                const total = analysisData.composicao_ativo.raw.total_investido;
                                const percentage = ((value / total) * 100).toFixed(2);
                                return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
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
                    <BarChart3 className="h-5 w-5" />
                    Aluguéis x Outros Recebíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: analysisData.historico_mensal.map(item => 
                          new Date(item.data_referencia).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
                        ),
                        datasets: [
                          {
                            label: 'Aluguéis (%)',
                            data: analysisData.historico_mensal.map(item => item.percent_aluguel * 100),
                            backgroundColor: 'rgba(59, 130, 246, 0.8)',
                            borderColor: 'rgb(59, 130, 246)',
                            borderWidth: 1,
                          },
                          {
                            label: 'Outros Recebíveis (%)',
                            data: analysisData.historico_mensal.map(item => item.percent_outros * 100),
                            backgroundColor: 'rgba(16, 185, 129, 0.8)',
                            borderColor: 'rgb(16, 185, 129)',
                            borderWidth: 1,
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return value + '%';
                              }
                            }
                          }
                        },
                        plugins: {
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `${context.dataset.label}: ${context.raw}%`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 3. Recebíveis e Gap de Liquidez (lado a lado) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Evolução da Alavancagem do Fundo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Evolução da Alavancagem do Fundo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Line
                      data={{
                        labels: analysisData.historico_mensal.map(item => 
                          new Date(item.data_referencia).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
                        ),
                        datasets: [{
                          label: 'Alavancagem do Fundo (%)',
                          data: analysisData.historico_mensal.map(item => item.alavancagem * 100),
                          borderColor: 'rgb(239, 68, 68)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          tension: 0.4,
                          fill: true,
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return value + '%';
                              }
                            }
                          }
                        },
                        plugins: {
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `Alavancagem do Fundo: ${context.raw}%`;
                              }
                            }
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
                  <div className="h-64">
                    <Line
                      data={{
                        labels: analysisData.historico_mensal.map(item => 
                          new Date(item.data_referencia).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
                        ),
                        datasets: [{
                          label: 'Gap de Liquidez (%)',
                          data: analysisData.historico_mensal.map(item => item.gap_liquidez * 100),
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.4,
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return value + '%';
                              }
                            }
                          }
                        },
                        plugins: {
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const index = context.dataIndex;
                                const dataPoint = analysisData.historico_mensal[analysisData.historico_mensal.length - 1 - index];
                                return [
                                  `Gap: ${formatPercentage(dataPoint.gap_liquidez * 100)}`,
                                  `Disponibilidades: ${formatCurrency(dataPoint.disponibilidades)}`
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
            </div>

            {/* 📊 Dados Históricos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Calendar className="h-6 w-6" />
                  Dados Históricos Mensais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Gap Liquidez</TableHead>
                        <TableHead>Alavancagem do Fundo</TableHead>
                        <TableHead>Total Investido</TableHead>
                        <TableHead>Total Passivo</TableHead>
                        <TableHead>Dividendo</TableHead>
                        <TableHead>% Aluguel</TableHead>
                        <TableHead>% Imóveis</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysisData.historico_mensal.slice().reverse().map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {formatDate(item.data_referencia)}
                          </TableCell>
                          <TableCell>{formatPercentage(item.gap_liquidez * 100, 4)}</TableCell>
                          <TableCell>{formatPercentage(item.alavancagem * 100)}</TableCell>
                          <TableCell>{formatCurrency(item.total_investido)}</TableCell>
                          <TableCell>{formatCurrency(item.total_passivo)}</TableCell>
                          <TableCell className="text-green-600 font-semibold">
                            {formatCurrency(item.dividendo_periodo)}
                          </TableCell>
                          <TableCell>{formatPercentage(item.percent_aluguel * 100)}</TableCell>
                          <TableCell>{formatPercentage(item.imoveis_renda_percentual * 100)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!analysisData && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Análise Profissional de FII
              </h3>
              <p className="text-muted-foreground">
                Digite o código de um ticker para começar a análise completa
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MarketPremiumGuard>
  );
}