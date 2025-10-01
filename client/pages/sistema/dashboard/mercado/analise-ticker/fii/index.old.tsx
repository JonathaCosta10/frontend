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
  ultima_data_cotas: string;
  aumento_cotas: {
    houve_aumento: boolean;
    quantidade_aumentos: number;
    total_cotas_emitidas: number;
    variacao_percentual_total: number;
    detalhes_aumentos: any[];
  };
  administrador: string;
  segmento: string;
  situacao: string;
  data_inicio_atividade: string;
  categoria: string;
  data_registro_cvm: string;
  numero_registro_cvm: string;
  patrimonio_liquido: number;
  valor_patrimonial_cota: number;
  valor_patrimonial_cota: number;
  valor_patrimonial_cotas?: number; // alias para compatibilidade // alias para compatibilidade
  cotistas_pf: number | null;
  cotistas_pj: number | null;
  cotistas_bancos: number | null;
  cotistas_estrangeiros: number | null;
  numero_total_cotistas: number;
  dividendo: number;
  ultimo_dividendo: number; // alias para compatibilidade
  taxa_administracao: number;
  outras_despesas: number;
  resultado_liquido: number;
  caixa: number;
  contas_receber: number;
  alugueis_receber: number;
  terrenos: number;
  edificacoes: number;
  obras_curso: number;
  outros_investimentos: number;
  total_investimentos: number;
  total_investido: number; // alias para compatibilidade
  quantidade_ativos_fundo: number;
  last_price: number;
  volume_ultimo_dia: number;
  preco_minimo_mes: number;
  preco_maximo_mes: number;
  volume_medio_mes: number;
  data_ultimo_preco: string;
  variacao_mes: number;
  p_vp: number;
  valor_patrimonial_cota_calculado: number;
  dividend_yield_anualizado: number;
  valor_mercado: number;
  desconto_premio_vp: number;
  data_analise: string;
  status: string;
  tipo_ativo: string;
  historico_mensal: Array<{
    mes: string;
    total_ativo: number;
    total_passivo: number;
    caixa: number;
    total_imoveis: number;
    contas_receber: number;
  }>;
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

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    return 'N/A';
  }
};

// Função para gerar insights baseados nos dados do FII
const generateInsights = (data: FIIAnalysisResponse) => {
  const insights: Array<{
    type: 'positive' | 'negative' | 'alert';
    icon: React.ReactElement;
    message: string;
  }> = [];

  // ========== ANÁLISE DE DIVIDENDOS ==========
  const historico = data.historico_mensal || [];
  
  if (historico.length > 0) {
    const dividendoAtual = historico[historico.length - 1]?.dividendo_periodo || 0;
    
    // Tendência de dividendos
    if (historico.length >= 3) {
      const ultimos3Meses = historico.slice(-3);
      const dividendos = ultimos3Meses.map(mes => mes.dividendo_periodo || 0);
      
      const crescente = dividendos.every((dividendo, index) => {
        if (index === 0) return true;
        return dividendo >= dividendos[index - 1];
      });
      
      const decrescente = dividendos.every((dividendo, index) => {
        if (index === 0) return true;
        return dividendo <= dividendos[index - 1];
      });
      
      if (crescente && !decrescente && dividendos[2] > 0) {
        insights.push({
          type: 'positive',
          icon: <ArrowUpRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
          message: `📈 Dividendos em crescimento nos últimos 3 meses`
        });
      } else if (decrescente && !crescente && dividendos[0] > 0) {
        insights.push({
          type: 'negative',
          icon: <ArrowDownRight className="h-3 w-3 text-red-600 flex-shrink-0" />,
          message: `📉 Dividendos em queda nos últimos 3 meses`
        });
      }
    }
    
    // Variação de dividendos
    if (historico.length >= 2) {
      const ultimoMes = historico[historico.length - 1];
      const penultimoMes = historico[historico.length - 2];
      
      if (ultimoMes.dividendo_periodo > 0 && penultimoMes.dividendo_periodo > 0) {
        const variacaoDividendo = ((ultimoMes.dividendo_periodo - penultimoMes.dividendo_periodo) / penultimoMes.dividendo_periodo) * 100;
        
        if (variacaoDividendo >= 10) {
          insights.push({
            type: 'positive',
            icon: <ArrowUpRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
            message: `⬆️ Aumento de ${variacaoDividendo.toFixed(1)}% no dividendo no último mês`
          });
        } else if (variacaoDividendo <= -10) {
          insights.push({
            type: 'negative',
            icon: <ArrowDownRight className="h-3 w-3 text-red-600 flex-shrink-0" />,
            message: `⬇️ Redução de ${Math.abs(variacaoDividendo).toFixed(1)}% no dividendo no último mês`
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
  if (data.data_inicio_atividade) {
    const dataInicio = new Date(data.data_inicio_atividade);
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
  if (data.patrimonio_liquido && historico.length >= 3) {
    const ultimosTresMeses = historico.slice(-3);
    const rendimentoMedio = ultimosTresMeses.reduce((acc, mes) => acc + (mes.dividendo_periodo || 0), 0) / 3;
    const rendimentoAnual = rendimentoMedio * 12;
    const precoAtual = data.last_price || 1;
    const yieldAnual = (rendimentoAnual / precoAtual) * 100;

    if (yieldAnual > 8) {
      insights.push({
        type: 'positive',
        icon: <ArrowUpRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
        message: `💵 Yield projetado alto (${yieldAnual.toFixed(1)}% a.a.) baseado nos últimos 3 meses`
      });
    } else if (yieldAnual < 4 && yieldAnual > 0) {
      insights.push({
        type: 'negative',
        icon: <ArrowDownRight className="h-3 w-3 text-red-600 flex-shrink-0" />,
        message: `📉 Yield projetado baixo (${yieldAnual.toFixed(1)}% a.a.) baseado nos últimos 3 meses`
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
    } else if (gapLiquidez > 20) {
      insights.push({
        type: 'negative',
        icon: <ArrowDownRight className="h-3 w-3 text-yellow-600 flex-shrink-0" />,
        message: `💰 Excesso de liquidez (${gapLiquidez.toFixed(2)}%). Possível ineficiência na alocação`
      });
    } else if (gapLiquidez >= 5 && gapLiquidez <= 20) {
      insights.push({
        type: 'positive',
        icon: <ArrowUpRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
        message: `✅ Liquidez adequada (${gapLiquidez.toFixed(2)}%). Boa gestão de caixa`
      });
    }
  }

  // ========== ANÁLISE ALAVANCAGEM ==========
  if (data.passivo?.metrics?.alavancagem !== undefined) {
    const alavancagem = data.passivo.metrics.alavancagem * 100;
    
    if (alavancagem > 15) {
      insights.push({
        type: 'negative',
        icon: <AlertTriangle className="h-3 w-3 text-red-600 flex-shrink-0" />,
        message: `⚠️ Alta alavancagem (${alavancagem.toFixed(2)}%). Risco financeiro elevado`
      });
    } else if (alavancagem < 5 && alavancagem > 0) {
      insights.push({
        type: 'positive',
        icon: <ArrowUpRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
        message: `✅ Baixa alavancagem (${alavancagem.toFixed(2)}%). Situação financeira sólida`
      });
    }
  }

  // ========== ANÁLISE VACÂNCIA ==========
  // Esta métrica não está presente diretamente, mas é um insight importante
  if (data.rentabilidade_imobiliaria?.metrics?.imoveis_renda_percentual !== undefined) {
    const rendaPercentual = data.rentabilidade_imobiliaria.metrics.imoveis_renda_percentual * 100;
    
    if (rendaPercentual < 70) {
      insights.push({
        type: 'negative',
        icon: <AlertTriangle className="h-3 w-3 text-red-600 flex-shrink-0" />,
        message: `⚠️ Possível alta vacância. Baixa rentabilidade imobiliária (${rendaPercentual.toFixed(2)}%)`
      });
    } else if (rendaPercentual > 90) {
      insights.push({
        type: 'positive',
        icon: <ArrowUpRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
        message: `✅ Alta ocupação. Boa rentabilidade imobiliária (${rendaPercentual.toFixed(2)}%)`
      });
    }
  }

  return insights;
};

// Componente de card de informação com tooltip
const InfoCard = ({ title, value, tooltip, icon }: { title: string; value: string; tooltip: string; icon?: React.ReactNode }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">{icon}</div>
            <h4 className="text-muted-foreground text-xs font-medium mb-1">{title}</h4>
            <div className="text-lg font-bold truncate">{value}</div>
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
export default function FIIAnalise() {
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
    setSelectedTicker(ticker.ticker);
    setSearchTerm("");
    setTickerSearchResults([]);
    // Executa análise automaticamente
    performAnalysisForTicker(ticker.ticker);
  };

  const performAnalysisForTicker = async (ticker: string) => {
    if (!ticker.trim()) return;

    setLoading(true);
    setInsights([]); // Limpar insights anteriores
    
    try {
      // Utilizamos o endpoint específico para análise de FII
      const data = await investmentService.analisarAtivoFII(ticker.toUpperCase());
      setAnalysisData(data);
      
      // Insights básicos baseados apenas nos dados principais
      const basicInsights = [];
      
      // Insight sobre P/VP
      if (data.p_vp < 1) {
        basicInsights.push({
          type: 'positive' as 'positive' | 'negative' | 'alert',
          icon: <ArrowUpRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
          message: `✅ FII negociado com desconto de ${Math.abs(data.desconto_premio_vp).toFixed(1)}% em relação ao valor patrimonial`
        });
      } else if (data.p_vp > 1.2) {
        basicInsights.push({
          type: 'alert' as 'positive' | 'negative' | 'alert',
          icon: <AlertTriangle className="h-3 w-3 text-yellow-600 flex-shrink-0" />,
          message: `⚠️ FII negociado com prêmio de ${data.desconto_premio_vp.toFixed(1)}% em relação ao valor patrimonial`
        });
      }
      
      setInsights(basicInsights);
    } catch (error) {
      console.error('Erro ao buscar análise do ticker FII:', error);
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
                          <div className="text-xs text-muted-foreground">{result.descricao}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={performAnalysis} 
                  disabled={!selectedTicker.trim() || loading} 
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analisando FII...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Analisar FII
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <p>
                    Os dados são atualizados mensalmente conforme relatórios publicados pelos fundos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium">Analisando dados do fundo...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Calculando indicadores e processando histórico
            </p>
          </div>
        )}

        {/* FII Analysis Results */}
        {analysisData && !loading && (
          <div className="space-y-6">
            {/* Botão para Nova Pesquisa */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setAnalysisData(null);
                  setSelectedTicker("");
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                Nova Pesquisa
              </Button>
            </div>

            {/* Header do FII */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{analysisData.ticker}</h2>
                      <Badge variant="secondary">{analysisData.segmento}</Badge>
                    </div>
                    <p className="text-muted-foreground">{analysisData.razao_social}</p>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="text-2xl font-bold">
                      {formatCurrency(analysisData.last_price)}
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        Início: {formatDate(analysisData.data_inicio_atividade)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Administrador</div>
                    <div className="font-medium">{analysisData.administrador}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">CNPJ</div>
                    <div className="font-medium">{analysisData.cnpj}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Gestão</div>
                    <div className="font-medium">{analysisData.categoria || "N/A"}</div>
                  </div>
                </div>

                {/* Insights e Análises */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Insights da Análise
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {loading ? (
                      <div className="col-span-2 flex justify-center items-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span>Processando insights...</span>
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
                title="Dividendo"
                value={formatCurrency(analysisData.dividendo)}
                tooltip="Valor do dividendo pago por cota."
                icon={<DollarSign className="h-5 w-5 text-amber-600" />}
              />
              
              <InfoCard
                title="Patrimônio Líquido"
                value={formatCurrency(analysisData.patrimonio_liquido)}
                tooltip="Valor total do patrimônio líquido do fundo."
                icon={<Building2 className="h-5 w-5 text-purple-600" />}
              />
              
              <InfoCard
                title="Valor Patrimonial/Cota"
                value={formatCurrency(analysisData.valor_patrimonial_cota)}
                tooltip="Valor patrimonial por cota. Preço justo teórico de cada cota."
                icon={<LineChart className="h-5 w-5 text-indigo-600" />}
              />
              
              <InfoCard
                title="Qtd. Ativos no Fundo"
                value={formatNumber(analysisData.quantidade_ativos_fundo, 0)}
                tooltip="Número total de ativos imobiliários no fundo."
                icon={<Building2 className="h-5 w-5 text-gray-600" />}
              />
            </div>

            {/* Detalhamento do Fundo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Detalhamento do FII
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Coluna 1: Informações */}
                  <div>
                    <h3 className="font-semibold mb-4">Informações Gerais</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500">Qtd. de Cotas</div>
                          <div className="font-medium">
                            {formatNumber(analysisData.qt_de_cotas, 0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Valor por Cota</div>
                          <div className="font-medium">
                            {formatCurrency(analysisData.valor_patrimonial_cotas)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500">Total Investido</div>
                          <div className="font-medium">
                            {formatCurrency(analysisData.total_investimentos)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Contas a Receber</div>
                          <div className="font-medium">
                            {formatCurrency(analysisData.contas_receber || 0)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500">Disponibilidade (Caixa)</div>
                          <div className="font-medium">
                            {formatCurrency(analysisData.caixa)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Taxa Adm.</div>
                          <div className="font-medium">
                            {formatCurrency(analysisData.taxa_administracao || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Coluna 2: Métricas */}
                  <div>
                    <h3 className="font-semibold mb-4">Métricas e Indicadores</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500">Composição Imobiliária</div>
                          <div className="font-medium">
                            {analysisData.composicao_ativo?.metrics ? 
                              formatPercentage(analysisData.composicao_ativo.metrics.percent_imobiliario * 100) : 
                              'N/A'
                            }
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Composição Financeira</div>
                          <div className="font-medium">
                            {analysisData.composicao_ativo?.metrics ? 
                              formatPercentage(analysisData.composicao_ativo.metrics.percent_financeiro * 100) : 
                              'N/A'
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-gray-500">Recebíveis Aluguel</div>
                          <div className="font-medium">
                            {analysisData.recebiveis?.metrics ? 
                              formatPercentage(analysisData.recebiveis.metrics.percent_aluguel * 100) : 
                              'N/A'
                            }
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Recebíveis Venda</div>
                          <div className="font-medium">
                            {analysisData.recebiveis?.metrics ? 
                              formatPercentage(analysisData.recebiveis.metrics.percent_venda * 100) : 
                              'N/A'
                            }
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Outros Recebíveis</div>
                          <div className="font-medium">
                            {analysisData.recebiveis?.metrics ? 
                              formatPercentage(analysisData.recebiveis.metrics.percent_outros * 100) : 
                              'N/A'
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500">Gap de Liquidez</div>
                          <div className="font-medium">
                            {analysisData.liquidez?.metrics ? 
                              formatPercentage(analysisData.liquidez.metrics.gap_liquidez * 100) : 
                              'N/A'
                            }
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Alavancagem</div>
                          <div className="font-medium">
                            <span>
                              {analysisData.passivo?.metrics?.alavancagem !== undefined ? 
                                formatPercentage(analysisData.passivo.metrics.alavancagem * 100) : 
                                'N/A'
                              }
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
                  Histórico de Preço Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysisData.historico_mensal && analysisData.historico_mensal.length > 0 ? (
                  <div className="h-64">
                    <Line
                      data={{
                        labels: analysisData.historico_mensal.map(item => {
                          // Formatar o mês para exibição
                          return item.mes ? item.mes.substring(5) : ""; // Formato YYYY-MM, pegamos só o MM
                        }),
                        datasets: [
                          {
                            label: 'Patrimônio Total (R$)',
                            data: analysisData.historico_mensal.map(item => item.total_ativo || 0),
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.3,
                            fill: true,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                            align: 'end',
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `Preço: ${formatCurrency(context.parsed.y)}`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: false,
                            ticks: {
                              callback: function(value) {
                                return formatCurrency(value as number);
                              },
                            },
                          },
                          x: {
                            grid: {
                              display: false,
                            },
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Dados históricos de preços não disponíveis para este FII
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* 2. Gráficos secundários em grid (2 em linha em desktop, 1 por linha em mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 2.1. Composição de Ativos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Composição de Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisData.composicao_ativo ? (
                    <div className="h-64">
                      <Pie
                        data={{
                          labels: ['Imobiliário', 'Financeiro'],
                          datasets: [
                            {
                              data: [
                                analysisData.composicao_ativo.metrics.percent_imobiliario * 100,
                                analysisData.composicao_ativo.metrics.percent_financeiro * 100,
                              ],
                              backgroundColor: [
                                'rgba(99, 102, 241, 0.8)',
                                'rgba(79, 70, 229, 0.8)',
                              ],
                              borderColor: [
                                'rgba(99, 102, 241, 1)',
                                'rgba(79, 70, 229, 1)',
                              ],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return `${context.label}: ${context.parsed.toFixed(2)}%`;
                                }
                              }
                            }
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Dados de composição não disponíveis para este FII
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* 2.2. Recebíveis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Distribuição de Recebíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisData.recebiveis ? (
                    <div className="h-64">
                      <Bar
                        data={{
                          labels: ['Aluguel', 'Venda', 'Outros'],
                          datasets: [
                            {
                              label: 'Proporção (%)',
                              data: [
                                analysisData.recebiveis.metrics.percent_aluguel * 100,
                                analysisData.recebiveis.metrics.percent_venda * 100,
                                analysisData.recebiveis.metrics.percent_outros * 100,
                              ],
                              backgroundColor: [
                                'rgba(34, 197, 94, 0.8)',
                                'rgba(249, 115, 22, 0.8)',
                                'rgba(99, 102, 241, 0.8)',
                              ],
                              borderColor: [
                                'rgba(34, 197, 94, 1)',
                                'rgba(249, 115, 22, 1)',
                                'rgba(99, 102, 241, 1)',
                              ],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return `${context.label}: ${context.parsed.y.toFixed(2)}%`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 100,
                              ticks: {
                                callback: function(value) {
                                  return `${value}%`;
                                },
                              },
                            },
                            x: {
                              grid: {
                                display: false,
                              },
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Dados de recebíveis não disponíveis para este FII
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Histórico Mensal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Histórico Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Mês/Ano</TableHead>
                        <TableHead className="font-semibold">Total Ativos</TableHead>
                        <TableHead className="font-semibold">Total Passivo</TableHead>
                        <TableHead className="font-semibold">Caixa</TableHead>
                        <TableHead className="font-semibold">Total Imóveis</TableHead>
                        <TableHead className="font-semibold">Contas Receber</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysisData.historico_mensal.slice().reverse().map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.mes}
                          </TableCell>
                          <TableCell>{formatCurrency(item.total_ativo || 0)}</TableCell>
                          <TableCell>{formatCurrency(item.total_passivo || 0)}</TableCell>
                          <TableCell>{formatCurrency(item.caixa || 0)}</TableCell>
                          <TableCell>{formatCurrency(item.total_imoveis || 0)}</TableCell>
                          <TableCell>{formatCurrency(item.contas_receber || 0)}</TableCell>
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
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Análise Detalhada de FII
              </h3>
              <p className="text-muted-foreground">
                Digite o código do FII para começar a análise
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MarketPremiumGuard>
  );
}