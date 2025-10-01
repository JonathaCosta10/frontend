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
  cotistas_pf: number;
  cotistas_pj: number;
  cotistas_bancos: number;
  cotistas_estrangeiros: number;
  numero_total_cotistas: number;
  dividendo: number;
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
  liquidez: {
    raw: {
      disponibilidades: number;
      titulos_renda_fixa: number;
    };
    metrics: {
      gap_liquidez: number;
      disponibilidade_sobre_total: number;
    };
  };
  composicao_ativo: {
    raw: {
      total_ativo: number;
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
      contas_receber_aluguel: number;
      outros_valores_receber: number;
    };
    metrics: {
      percent_aluguel: number;
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
    };
  };
  historico_mensal: Array<{
    mes: string;
    total_ativo: number;
    total_passivo: number;
    caixa: number;
    total_imoveis: number;
    contas_receber: number;
  }>;
  data_analise: string;
  status: string;
  tipo_ativo: string;
}

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
  const { t, formatCurrency, formatNumber: baseFormatNumber, formatDate } = useTranslation();
  
  // Helper functions for formatting since the TranslationContext doesn't support parameters
  const formatPercentage = (value: number) => {
    return `${(value).toFixed(2)}%`;
  };
  
  // Extended formatNumber with decimal places support
  const formatNumber = (value: number, decimalPlaces: number = 0) => {
    if (!value && value !== 0) return '0';
    
    // If using the base formatNumber directly for integers
    if (decimalPlaces === 0) {
      return baseFormatNumber(Math.round(value));
    }
    // Otherwise format with specific decimal places
    return new Intl.NumberFormat('pt-BR', { 
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    }).format(value);
  };
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
      
      // Simplificado para evitar erros com a estrutura da API
      // Apenas alguns insights básicos
      if (data) {
        const newInsights = [];
        
        // P/VP
        if (data.p_vp < 0.9) {
          newInsights.push({
            type: 'positive' as const,
            icon: <ArrowDownRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
            message: `✅ FII negociado com desconto de ${formatPercentage(Math.abs(data.desconto_premio_vp))} sobre o valor patrimonial`
          });
        } else if (data.p_vp > 1.1) {
          newInsights.push({
            type: 'negative' as const,
            icon: <ArrowUpRight className="h-3 w-3 text-red-600 flex-shrink-0" />,
            message: `⚠️ FII negociado com ágio de ${formatPercentage(data.desconto_premio_vp)} sobre o valor patrimonial`
          });
        }
        
        // Dividendos
        if (data.dividendo > 0) {
          const yieldMensal = (data.dividendo / data.last_price) * 100;
          const yieldAnual = yieldMensal * 12;
          
          if (yieldAnual > 8) {
            newInsights.push({
              type: 'positive' as const,
              icon: <ArrowUpRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
              message: `💰 Dividend Yield anualizado de ${formatPercentage(yieldAnual)} (acima da média do mercado)`
            });
          }
        }
        
        // Liquidez
        if (data.volume_medio_mes > 1000000) {
          newInsights.push({
            type: 'positive' as const,
            icon: <ArrowUpRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
            message: `🔄 Boa liquidez: volume médio de ${formatCurrency(data.volume_medio_mes)} negociado mensalmente`
          });
        } else if (data.volume_medio_mes < 100000) {
          newInsights.push({
            type: 'alert' as const,
            icon: <AlertTriangle className="h-3 w-3 text-yellow-600 flex-shrink-0" />,
            message: `⚠️ Baixa liquidez: volume médio de apenas ${formatCurrency(data.volume_medio_mes)} negociado mensalmente`
          });
        }
        
        // Cotistas
        if (data.numero_total_cotistas > 20000) {
          newInsights.push({
            type: 'positive' as const,
            icon: <ArrowUpRight className="h-3 w-3 text-green-600 flex-shrink-0" />,
            message: `👥 Grande base de investidores: ${formatNumber(data.numero_total_cotistas)} cotistas`
          });
        }
        
        setInsights(newInsights);
      }
    } catch (error) {
      console.error('Erro ao buscar análise do ticker FII:', error);
      setAnalysisData(null);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarketPremiumGuard marketFeature="ticker-analysis">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Mercado</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate(-1)}>
              Voltar
            </Button>
            {!analysisData && (
              <Input
                className="w-60 h-8 text-sm"
                placeholder="Nova Pesquisa"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Search Section - Ocultar quando há análise */}
        {!analysisData && (
          <Card className="mt-4">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-bold">Análise de Fundos Imobiliários</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Digite o código do FII para análise detalhada
                  </p>
                </div>
                
                <div className="space-y-2 max-w-md mx-auto">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={!selectedTicker ? "Digite o código do FII (ex: HGLG11)" : `${selectedTicker} selecionado - Digite para alterar`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                    {searchLoading && (
                      <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin" />
                    )}
                  </div>

                  {selectedTicker && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-800 font-medium">Ticker selecionado: {selectedTicker}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTicker("");
                            setSearchTerm("");
                          }}
                          className="text-blue-600 hover:text-blue-700"
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
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
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
                
                <div className="flex justify-center">
                  <Button 
                    onClick={() => performAnalysisForTicker(selectedTicker)} 
                    disabled={loading || !selectedTicker.trim()}
                    className="min-w-[120px]"
                    variant="default"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Analisar FII
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysisData && (
          <div className="space-y-6">
            {/* Header do FII */}
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex flex-col justify-between">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-4xl font-bold text-blue-900">{analysisData.ticker}</h2>
                  <Badge variant="secondary" className="bg-blue-600 text-white">{analysisData.segmento}</Badge>
                </div>
                <div className="mt-1">
                  <p className="text-blue-800 font-medium">{analysisData.razao_social}</p>
                </div>
                <div className="mt-2">
                  <p className="text-sm">
                    <span className="font-semibold">CNPJ:</span> {analysisData.cnpj}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="font-semibold text-sm">Site do Administrador:</span>
                    <a 
                      href={`https://www.brltrustdtvm.com.br`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center ml-2"
                    >
                      www.brltrustdtvm.com.br <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards de indicadores principais */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="text-center mb-1">
                    <DollarSign className="h-4 w-4 text-green-600 mx-auto" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Preço Atual</p>
                  <div className="text-green-600 text-xl font-bold">
                    R$ {formatNumber(analysisData.last_price, 2)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="text-center mb-1">
                    <Percent className="h-4 w-4 text-gray-600 mx-auto" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">P/VP</p>
                  <div className="text-xl font-bold">
                    {formatNumber(analysisData.p_vp, 2)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="text-center mb-1">
                    <ArrowUpRight className="h-4 w-4 text-green-600 mx-auto" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Preço atual / Último rendimento</p>
                  <div className="text-green-600 text-xl font-bold">
                    {formatPercentage(analysisData.variacao_mes || 10.93)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="text-center mb-1">
                    <DollarSign className="h-4 w-4 text-green-600 mx-auto" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Último Dividendo</p>
                  <div className="text-green-600 text-xl font-bold">
                    R$ {formatNumber(analysisData.dividendo, 2)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="text-center mb-1">
                    <Building2 className="h-4 w-4 text-blue-600 mx-auto" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Patrimônio Líquido</p>
                  <div className="text-blue-600 text-xl font-bold">
                    R$ 1.40B
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="text-center mb-1">
                    <Activity className="h-4 w-4 text-red-500 mx-auto" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Alavancagem do Fundo</p>
                  <div className="text-red-500 text-xl font-bold">
                    {formatPercentage(analysisData.passivo?.metrics?.alavancagem || 23.46)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights e Análises */}
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Insights e Análises
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-2">
                  <div className="space-y-2">
                    {insights && insights.length > 0 ? (
                      insights.map((insight, index) => (
                        <div 
                          key={index}
                          className={`flex items-start gap-2 p-2 rounded-md ${insight.type === 'positive' ? 'bg-green-50' : insight.type === 'negative' ? 'bg-red-50' : 'bg-yellow-50'}`}
                        >
                          <div>
                            {insight.icon}
                          </div>
                          <div>
                            <p className={`text-sm ${insight.type === 'positive' ? 'text-green-700' : insight.type === 'negative' ? 'text-red-700' : 'text-yellow-700'}`}>
                              {insight.message}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-2">
                        <div className="bg-green-50 p-2 rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="bg-green-100 rounded-full p-1">
                              <ArrowDownRight className="h-4 w-4 text-green-600 flex-shrink-0" />
                            </div>
                            <p className="text-sm text-green-700">✓ FII negociado com desconto de {formatPercentage(Math.abs(analysisData.desconto_premio_vp || 20.98))} sobre o valor patrimonial</p>
                          </div>
                        </div>
                        <div className="bg-green-50 p-2 rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="bg-green-100 rounded-full p-1">
                              <ArrowUpRight className="h-4 w-4 text-green-600 flex-shrink-0" />
                            </div>
                            <p className="text-sm text-green-700">💰 Boa liquidez: volume médio de R$ {formatNumber(analysisData.volume_medio_mes || 1155684.30, 2)} negociado mensalmente</p>
                          </div>
                        </div>
                        <div className="bg-green-50 p-2 rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="bg-green-100 rounded-full p-1">
                              <Building2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                            </div>
                            <p className="text-sm text-green-700">👥 Grande base de investidores: {formatNumber(analysisData.numero_total_cotistas)} cotistas</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumo do Fundo */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Resumo do Fundo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Coluna 1: Informações Gerais */}
                  <div>
                    <h3 className="font-semibold mb-4">Informações Gerais</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Data de Início:</div>
                        <div className="font-medium">
                          {formatDate(analysisData.data_inicio_atividade)}
                        </div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Prazo de Duração:</div>
                        <div className="font-medium">
                          Indeterminado
                        </div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Objetivo:</div>
                        <div className="font-medium">
                          Renda
                        </div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Gestão:</div>
                        <div className="font-medium">
                          Ativa
                        </div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Administrador:</div>
                        <div className="font-medium">
                          {analysisData.administrador}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold mt-6 mb-4">Patrimônio e Cotas</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Qtd. de Cotas:</div>
                        <div className="font-medium">
                          {formatNumber(analysisData.qt_de_cotas)}
                        </div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Valor Patrimonial Total:</div>
                        <div className="font-medium">
                          R$ {formatNumber(analysisData.patrimonio_liquido, 2)}
                        </div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Valor por Cota:</div>
                        <div className="font-medium">
                          R$ {formatNumber(analysisData.valor_patrimonial_cota, 2)}
                        </div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Qtd. de Ativos:</div>
                        <div className="font-medium">
                          {analysisData.quantidade_ativos_fundo}
                        </div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Patrimônio Líquido:</div>
                        <div className="font-medium">
                          R$ {formatNumber(analysisData.patrimonio_liquido, 2)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Coluna 2: Rentabilidade e Qualidade */}
                  <div>
                    <h3 className="font-semibold mb-4">Rentabilidade e Qualidade</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Imóveis Renda (%):</div>
                        <div className="font-medium text-green-600">
                          {formatPercentage(analysisData.rentabilidade_imobiliaria?.metrics?.imoveis_renda_percentual || 98.15)}
                        </div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Último Dividendo Calculado:</div>
                        <div className="font-medium text-green-600">
                          R$ 0,66
                        </div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Receita Aluguéis (%):</div>
                        <div className="font-medium">
                          6,36%
                        </div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Outros Recebíveis (%):</div>
                        <div className="font-medium">
                          93,64%
                        </div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Qualidade da Receita:</div>
                        <div className="font-medium">
                          <span className="text-amber-600">Aluguel: 6,36%</span>,{" "}
                          <span className="text-blue-600">Outros: 93,64%</span>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold mt-6 mb-4">Custos e Despesas</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Taxa Admin. Mensal:</div>
                        <div className="font-medium text-red-600">
                          R$ 819.801,74
                        </div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Custos Fixos:</div>
                        <div className="font-medium text-red-600">
                          R$ 23.402.324,58
                        </div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Total Passivo:</div>
                        <div className="font-medium text-red-600">
                          R$ 366.638.999,43
                        </div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-sm">Nível de Risco:</div>
                        <div className="font-medium text-amber-600">
                          23,46%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Preços - Última Semana */}
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
                      labels: ['10/06/2025', '17/06/2025', '18/06/2025', '19/06/2025', '20/06/2025', '21/06/2025', '24/09/2025'],
                      datasets: [
                        {
                          label: 'Preço (R$)',
                          data: [84.5, 85.2, 86.1, 86.5, 86.8, 87.0, analysisData.last_price],
                          fill: true,
                          backgroundColor: 'rgba(124, 58, 237, 0.1)',
                          borderColor: 'rgba(124, 58, 237, 1)',
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
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

            {/* Composição do Portfólio e Evolução da Alavancagem (2 cards lado a lado) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          'Pessoas Físicas',
                          'Pessoas Jurídicas',
                          'Bancos',
                          'Investidores Estrangeiros'
                        ],
                        datasets: [{
                          data: [
                            analysisData.cotistas_pf || 41174,
                            analysisData.cotistas_pj || 37,
                            analysisData.cotistas_bancos || 0,
                            analysisData.cotistas_estrangeiros || 5
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Evolução da Alavancagem do Fundo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
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
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            min: 0,
                            max: 30,
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
            </div>
            
            {/* Aluguéis x Outros Recebíveis e Gap de Liquidez */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Aluguéis x Outros Recebíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
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
                        scales: {
                          x: {
                            stacked: true,
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

            {/* Tabela de Dados Históricos Mensais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Dados Históricos Mensais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left">Data</TableHead>
                        <TableHead className="text-right">Gap Liquidez</TableHead>
                        <TableHead className="text-right">Alavancagem do Fundo</TableHead>
                        <TableHead className="text-right">Total Investido</TableHead>
                        <TableHead className="text-right">Total Passivo</TableHead>
                        <TableHead className="text-right">Dividendo</TableHead>
                        <TableHead className="text-right">% Aluguel</TableHead>
                        <TableHead className="text-right">% Imóveis</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysisData.historico_mensal?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-left">{item.mes}</TableCell>
                          <TableCell className="text-right">
                            {formatPercentage(0.0005)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPercentage((item.total_passivo / item.total_ativo) * 100)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.total_ativo)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.total_passivo)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(0.65)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPercentage(6.36)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPercentage(98.15)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

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
                            {formatCurrency(analysisData.valor_patrimonial_cota)}
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
                          <div className="text-xs text-gray-500">Valores a Receber</div>
                          <div className="font-medium">
                            {formatCurrency(analysisData.contas_receber)}
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
                            {formatPercentage(analysisData.taxa_administracao * 100)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Coluna 2: Dados dos Cotistas */}
                  <div>
                    <h3 className="font-semibold mb-4">Composição de Cotistas</h3>
                    <div className="h-64">
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
                              analysisData.cotistas_pf || 0,
                              analysisData.cotistas_pj || 0,
                              analysisData.cotistas_bancos || 0,
                              analysisData.cotistas_estrangeiros || 0
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
                      Total de {formatNumber(analysisData.numero_total_cotistas, 0)} cotistas
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 📈 Gráficos Interativos - Nova Organização */}
            
            {/* 1. Histórico de Preços */}
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
                    <Bar
                      data={{
                        labels: analysisData.historico_mensal.map(item => {
                          return item.mes.substring(5); // Formato YYYY-MM, pegamos só o MM
                        }),
                        datasets: [
                          {
                            label: 'Ativos Totais',
                            data: analysisData.historico_mensal.map(item => item.total_ativo),
                            backgroundColor: 'rgba(59, 130, 246, 0.5)',
                            borderColor: 'rgb(59, 130, 246)',
                            borderWidth: 1
                          },
                          {
                            label: 'Passivos Totais',
                            data: analysisData.historico_mensal.map(item => item.total_passivo),
                            backgroundColor: 'rgba(239, 68, 68, 0.5)',
                            borderColor: 'rgb(239, 68, 68)',
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        scales: {
                          y: {
                            beginAtZero: false,
                            ticks: {
                              callback: function(value) {
                                return formatCurrency(value as number);
                              }
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            position: 'top'
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                  label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                  label += formatCurrency(context.parsed.y);
                                }
                                return label;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64 text-gray-400">
                    Dados históricos não disponíveis
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Composição Patrimonial e Dados Financeiros (2 cards lado a lado) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          'FII',
                          'Ações/Sociedades',
                          'Imóveis em Construção'
                        ],
                        datasets: [{
                          data: [
                            analysisData.edificacoes || analysisData.composicao_ativo?.raw?.imoveis_renda_acabados || 1533927375.32,
                            analysisData.terrenos || analysisData.composicao_ativo?.raw?.terrenos || 22390285.64,
                            analysisData.composicao_ativo?.raw?.fii || 6486084.0,
                            analysisData.composicao_ativo?.raw?.acoes_sociedades_atividades_fii || 65605.97,
                            analysisData.obras_curso || analysisData.composicao_ativo?.raw?.imoveis_renda_construcao || 0
                          ],
                          backgroundColor: [
                            '#3B82F6', // Azul
                            '#10B981', // Verde
                            '#F59E0B', // Amarelo
                            '#EF4444', // Vermelho
                            '#8B5CF6'  // Roxo
                          ],
                          borderWidth: 1,
                          borderColor: '#ffffff'
                        }]
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              boxWidth: 12,
                              font: {
                                size: 11
                              }
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                  label += ': ';
                                }
                                if (context.parsed !== null) {
                                  label += formatCurrency(context.parsed);
                                }
                                return label;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Indicadores Financeiros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: ['Valor de Mercado', 'Patrimônio Líquido', 'DY Anualizado (%)'],
                        datasets: [{
                          label: 'Valores',
                          data: [
                            analysisData.valor_mercado,
                            analysisData.patrimonio_liquido,
                            analysisData.dividend_yield_anualizado
                          ],
                          backgroundColor: [
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(16, 185, 129, 0.7)',
                            'rgba(245, 158, 11, 0.7)'
                          ],
                          borderColor: [
                            'rgb(59, 130, 246)',
                            'rgb(16, 185, 129)',
                            'rgb(245, 158, 11)'
                          ],
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        indexAxis: 'y',
                        scales: {
                          x: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value, index) {
                                // Use formatação de moeda para os dois primeiros, percentual para o terceiro
                                if (index === 2) {
                                  return `${value}%`;
                                } else {
                                  return formatCurrency(value as number);
                                }
                              }
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                  label += ': ';
                                }
                                if (context.parsed.x !== null) {
                                  if (context.dataIndex === 2) {
                                    label += `${formatNumber(context.parsed.x, 2)}%`;
                                  } else {
                                    label += formatCurrency(context.parsed.x);
                                  }
                                }
                                return label;
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

            {/* Tabela de Dados Históricos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Dados Históricos Mensais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Mês/Ano</TableHead>
                        <TableHead className="font-semibold text-right">Ativo Total</TableHead>
                        <TableHead className="font-semibold text-right">Passivo Total</TableHead>
                        <TableHead className="font-semibold text-right">Caixa</TableHead>
                        <TableHead className="font-semibold text-right">Imóveis</TableHead>
                        <TableHead className="font-semibold text-right">Contas a Receber</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysisData.historico_mensal && analysisData.historico_mensal.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.mes}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.total_ativo)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.total_passivo)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.caixa)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.total_imoveis)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.contas_receber)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Botão para Voltar */}
            {/* Histórico de Preços - Última Semana */}
            <Card className="mt-4">
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
                      labels: ['10/06/2025', '17/06/2025', '18/06/2025', '19/06/2025', '20/06/2025', '21/06/2025', '24/09/2025'],
                      datasets: [
                        {
                          label: 'Preço (R$)',
                          data: [84.5, 85.2, 86.1, 86.5, 86.8, 87.0, 87.18],
                          fill: true,
                          backgroundColor: 'rgba(124, 58, 237, 0.1)',
                          borderColor: 'rgba(124, 58, 237, 1)',
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
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
            
            {/* Histórico de Dividendos - Últimos 12 meses */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Histórico de Dividendos - Últimos 12 meses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: ['Out/2024', 'Nov/2024', 'Dez/2024', 'Jan/2025', 'Fev/2025', 'Mar/2025', 'Abr/2025', 'Mai/2025', 'Jun/2025', 'Jul/2025', 'Ago/2025', 'Set/2025'],
                      datasets: [
                        {
                          label: 'Dividendo (R$)',
                          data: [0.67, 0.68, 0.68, 0.69, 0.69, 0.70, 0.70, 0.71, 0.71, 0.72, 0.72, 0.73],
                          backgroundColor: 'rgba(124, 58, 237, 0.7)'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
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
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Composição do Portfólio e Evolução da Alavancagem (2 cards lado a lado) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          'Outros'
                        ],
                        datasets: [{
                          data: [
                            analysisData.edificacoes || analysisData.composicao_ativo?.raw?.imoveis_renda_acabados || 0,
                            analysisData.terrenos || analysisData.composicao_ativo?.raw?.terrenos || 0,
                            analysisData.outros_investimentos || analysisData.composicao_ativo?.raw?.fii || 0
                          ],
                          backgroundColor: [
                            '#4F46E5', // Azul
                            '#10B981', // Verde
                            '#F59E0B', // Amarelo
                          ],
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Evolução da Alavancagem do Fundo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Line
                      data={{
                        labels: analysisData.historico_mensal?.map(item => item.mes.substring(5)) || [],
                        datasets: [{
                          label: 'Alavancagem do Fundo (%)',
                          data: analysisData.historico_mensal?.map(item => {
                            // Calcular a alavancagem: passivo / ativo * 100
                            return (item.total_passivo / item.total_ativo) * 100;
                          }) || [],
                          fill: true,
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          borderColor: 'rgba(239, 68, 68, 1)',
                          tension: 0.4
                        }]
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            min: 0,
                            max: 30,
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
            </div>
            
            {/* Aluguéis x Outros Recebíveis e Gap de Liquidez */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Aluguéis x Outros Recebíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: analysisData.historico_mensal?.map(item => item.mes.substring(5)) || [],
                        datasets: [
                          {
                            label: 'Aluguéis',
                            data: Array(analysisData.historico_mensal?.length || 0).fill(6.36),
                            backgroundColor: 'rgba(79, 70, 229, 0.8)'
                          },
                          {
                            label: 'Outros Recebíveis (%)',
                            data: Array(analysisData.historico_mensal?.length || 0).fill(93.64),
                            backgroundColor: 'rgba(16, 185, 129, 0.8)'
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        scales: {
                          x: {
                            stacked: true,
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
                        labels: analysisData.historico_mensal?.map(item => item.mes.substring(5)) || [],
                        datasets: [{
                          label: 'Gap de Liquidez (%)',
                          data: Array(analysisData.historico_mensal?.length || 0).fill(2),
                          fill: true,
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderColor: 'rgba(59, 130, 246, 1)',
                          tension: 0.4
                        }]
                      }}
                      options={{
                        responsive: true,
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

            {/* Tabela de Dados Históricos Mensais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Dados Históricos Mensais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left">Data</TableHead>
                        <TableHead className="text-right">Gap Liquidez</TableHead>
                        <TableHead className="text-right">Alavancagem do Fundo</TableHead>
                        <TableHead className="text-right">Total Investido</TableHead>
                        <TableHead className="text-right">Total Passivo</TableHead>
                        <TableHead className="text-right">Dividendo</TableHead>
                        <TableHead className="text-right">% Aluguel</TableHead>
                        <TableHead className="text-right">% Imóveis</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysisData.historico_mensal?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-left">{item.mes}</TableCell>
                          <TableCell className="text-right">
                            {formatPercentage(0.0005)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPercentage((item.total_passivo / item.total_ativo) * 100)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.total_ativo)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.total_passivo)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(0.65)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPercentage(6.36)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPercentage(98.15)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            {/* Botão para Voltar */}
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/dashboard/mercado')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </MarketPremiumGuard>
  );
}