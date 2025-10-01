import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  Loader2,
  Activity,
  AlertTriangle,
  ExternalLink,
  Calendar,
  Shield,
  Users,
  Info,
  FileText,
  PieChart,
  BarChart3,
  Download,
  HelpCircle,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Target,
  Globe
} from "lucide-react";
import MarketPremiumGuard from "@/components/MarketPremiumGuard";
import { useTranslation } from "@/contexts/TranslationContext";
import investmentService from "@/services/investmentService";

// Interface completa baseada no JSON real fornecido
interface AcaoAnalysisData {
  ticker: string;
  cnpj: string;
  tipo_ativo: string;
  status: string;
  data_analise: string;
  empresa: {
    nome: string;
    setor: string;
    codigo_cvm: number;
    situacao_registro: string;
    site: string;
  };
  responsaveis_comunicacao: {
    dri: {
      nome: string;
      telefone: string;
      email: string;
    };
    contatos: {
      telefone: string;
      email: string;
    };
  };
  metricas_financeiras: {
    vpa: number;
    p_vp: number;
    valor_mercado_milhoes: number;
    patrimonio_liquido_milhoes: number;
    preco_atual: number;
  };
  estrutura_acionaria: {
    total_acoes: number;
    acoes_circulacao: number;
    acoes_tesouraria: number;
    pct_ordinarias: number;
    pct_preferenciais: number;
    pct_tesouraria: number;
  };
  historico_financeiro: {
    crescimento_anual: Array<{
      periodo: string;
      crescimento_capital_pct: number;
      crescimento_acoes_pct: number;
      valor_inicial: number;
      valor_final: number;
    }>;
    metricas_evolucao: {
      crescimento_medio_anual: number;
      periodos_analisados: number;
      maior_crescimento: number;
      menor_crescimento: number;
    };
    tendencias: string;
  };
  movimentacao_controladores: {
    tendencia_geral: string;
    confianca_score: number;
    analise_temporal: {
      ultimos_3_meses: {
        compras: number;
        vendas: number;
        volume_compra: number;
        volume_venda: number;
        saldo_operacoes: number;
        saldo_volume: number;
        tendencia: string;
      };
      ultimos_6_meses: {
        compras: number;
        vendas: number;
        volume_compra: number;
        volume_venda: number;
        saldo_operacoes: number;
        saldo_volume: number;
        tendencia: string;
      };
      ultimos_12_meses: {
        compras: number;
        vendas: number;
        volume_compra: number;
        volume_venda: number;
        saldo_operacoes: number;
        saldo_volume: number;
        tendencia: string;
      };
      tendencia_evolucao: string;
    };
    executivos_destaque: Array<{
      nome: string;
      cargo: string | null;
      compras: number;
      vendas: number;
      volume_total: number;
      movimentacoes: number;
      tendencia: string;
    }>;
    diversidade_executivos: number;
    operacoes_recentes: {
      compras: number;
      vendas: number;
      volume_compra: number;
      volume_venda: number;
      frequencia_media: number;
      ticket_medio: number;
    };
    analise_comportamento: {
      interpretacao: string;
      padroes_identificados: string[];
      sinais_confianca: string[];
      recomendacao: string;
    };
    ultima_movimentacao: string;
    periodo_analise: string;
    total_movimentacoes: number;
  };
  eventos_corporativos: {
    total_eventos_relevantes: number;
    periodo_analise: string;
    frequencia_comunicacao: string;
    ultimo_evento: string;
    eventos_importantes: Array<{
      data: string;
      titulo: string;
      subtipo: string | null;
      descricao: string;
      relevancia: string;
      link_documento: string;
      protocolo: string | null;
      ano: number;
    }>;
    legendas: {
      CRÍTICA: string;
      ALTA: string;
      MÉDIA: string;
    };
  };
  governanca_corporativa: {
    transparencia_score: number;
    movimentacoes_executivas: {
      total_movimentacoes: number;
      volume_total: number;
      executivos_ativos: number;
      transparencia_score: number;
    };
    analise_transparencia: string;
    executivos_ativos: number;
  };
  documentos_cvm: {
    links_download: Array<{
      tipo: string;
      data: string;
      documento_id: string;
      link_download: string;
      empresa: string;
    }>;
    total_documentos: number;
  };
  graficos: {
    composicao_acionaria: Array<{
      tipo: string;
      valor: number;
      quantidade: number;
    }>;
    evolucao_patrimonio: Array<{
      data: string;
      valor_milhoes: number;
      total_acoes_milhoes: number;
    }>;
    crescimento_anual: Array<{
      periodo: string;
      crescimento_capital_pct: number;
      crescimento_acoes_pct: number;
      valor_inicial: number;
      valor_final: number;
    }>;
  };
  comparacao_setorial: {
    setor: string;
    total_empresas_setor: number;
    posicao_setor: {
      p_vp_rank: string;
      vpa_rank: string;
      valor_mercado_rank: string;
      percentil_p_vp: number;
      percentil_vpa: number;
    };
    medias_setor: {
      p_vp_medio: number;
      vpa_medio: number;
      valor_mercado_medio: number;
      patrimonio_liquido_medio: number;
    };
    comparacao_com_setor: {
      p_vp_vs_media: number;
      vpa_vs_media: number;
      vm_vs_media: number;
    };
    analise_posicionamento: {
      posicionamento_p_vp: string;
      posicionamento_vpa: string;
      posicionamento_tamanho: string;
      resumo_setorial: string;
    };
    top_empresas_setor: any[];
  };
  legendas: {
    vpa: string;
    p_vp: string;
    valor_mercado: string;
    transparencia_score: string;
    movimentacao_controladores: string;
  };
}

// Funções de formatação aprimoradas
const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatNumber = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  return value.toLocaleString("pt-BR");
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  } catch {
    return dateString;
  }
};

const formatPercentage = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) return "0,00%";
  return `${value.toFixed(2)}%`;
};

// Componente de tooltip para legendas
const LegendTooltip: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="group relative inline-block">
    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 min-w-[200px]">
      <div className="font-semibold mb-1">{title}</div>
      <div>{description}</div>
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

export default function AnaliseTicker() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [ticker, setTicker] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [analysisData, setAnalysisData] = useState<AcaoAnalysisData | null>(null);
  const [selectedTicker, setSelectedTicker] = useState("");

  useEffect(() => {
    const tickerFromUrl = searchParams.get("ticker");
    if (tickerFromUrl) {
      setSelectedTicker(tickerFromUrl);
      setTicker(tickerFromUrl);
      handleAnalysis(tickerFromUrl);
    }
  }, [searchParams]);

  const handleAnalysis = async (tickerToAnalyze?: string) => {
    const tickerValue = tickerToAnalyze || ticker;
    if (!tickerValue.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError("");
    setSelectedTicker(tickerValue);

    try {
      const data = await investmentService.analisarAtivoAcoes(tickerValue.toUpperCase());
      setAnalysisData(data);
      // Atualizar URL sem recarregar a página
      window.history.pushState(null, '', `?ticker=${tickerValue.toUpperCase()}`);
    } catch (error) {
      console.error("Erro ao analisar ação:", error);
      setAnalysisError("Erro ao analisar ação. Verifique se o código está correto.");
      setAnalysisData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalysis();
    }
  };

  return (
    <MarketPremiumGuard marketFeature="ticker-analysis">
      <div className="space-y-6">
        {/* Header e Busca */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Análise Completa de Ações</h1>
          <p className="text-muted-foreground">
            Análise detalhada com governança, eventos corporativos e indicadores fundamentalistas
          </p>
          
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Digite o código da ação (ex: PETR4, ITUB4, VALE3)"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    onKeyPress={handleKeyPress}
                    disabled={isAnalyzing}
                  />
                </div>
                <Button 
                  onClick={() => handleAnalysis()}
                  disabled={isAnalyzing || !ticker.trim()}
                  className="min-w-[120px]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Analisar
                    </>
                  )}
                </Button>
              </div>

              {analysisError && (
                <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {analysisError}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {isAnalyzing && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span className="text-lg">Analisando {selectedTicker}...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {analysisData && (
          <div className="space-y-6">
            {/* Header Principal da Empresa */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-3">
                        <Building2 className="h-6 w-6" />
                        {analysisData.empresa.nome}
                      </CardTitle>
                      <p className="text-muted-foreground mt-1">
                        {analysisData.ticker} • {analysisData.empresa.setor}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {analysisData.tipo_ativo}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <div className="text-sm font-semibold text-slate-600 mb-2">CNPJ</div>
                      <div className="font-bold text-base text-slate-800">{analysisData.cnpj}</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <div className="text-sm font-semibold text-slate-600 mb-2">Código CVM</div>
                      <div className="font-bold text-base text-slate-800">{analysisData.empresa.codigo_cvm}</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <div className="text-sm font-semibold text-slate-600 mb-2">Situação</div>
                      <Badge variant="default" className="bg-green-100 text-green-800">{analysisData.empresa.situacao_registro}</Badge>
                    </div>
                  </div>

                  {analysisData.empresa.site && (
                    <div className="mt-4">
                      <a 
                        href={analysisData.empresa.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Globe className="h-3 w-3" />
                        Ver site da empresa <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Preço Atual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {formatCurrency(analysisData.metricas_financeiras.preco_atual)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Última atualização: {formatDate(analysisData.data_analise)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Métricas Financeiras Principais com Legendas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Indicadores Fundamentalistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                        <p className="text-sm font-semibold text-emerald-700">VPA</p>
                      </div>
                      <LegendTooltip 
                        title="Valor Patrimonial por Ação (VPA)" 
                        description={analysisData.legendas.vpa}
                      />
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">
                      {formatCurrency(analysisData.metricas_financeiras.vpa)}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <p className="text-sm font-semibold text-blue-700">P/VP</p>
                      </div>
                      <LegendTooltip 
                        title="Preço sobre Valor Patrimonial (P/VP)" 
                        description={analysisData.legendas.p_vp}
                      />
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {analysisData.metricas_financeiras.p_vp.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-violet-600" />
                        <p className="text-sm font-semibold text-violet-700">Valor de Mercado</p>
                      </div>
                      <LegendTooltip 
                        title="Valor de Mercado" 
                        description={analysisData.legendas.valor_mercado}
                      />
                    </div>
                    <div className="text-2xl font-bold text-violet-700">
                      {formatNumber(analysisData.metricas_financeiras.valor_mercado_milhoes)}M
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-indigo-600" />
                        <p className="text-sm font-semibold text-indigo-700">Patrimônio Líquido</p>
                      </div>
                      <LegendTooltip 
                        title="Patrimônio Líquido" 
                        description="Total dos recursos próprios da empresa, representando o valor contábil pertencente aos acionistas"
                      />
                    </div>
                    <div className="text-2xl font-bold text-indigo-700">
                      {formatNumber(analysisData.metricas_financeiras.patrimonio_liquido_milhoes)}M
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estrutura Acionária Detalhada */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Estrutura Acionária
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center bg-blue-50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-blue-700 mb-1">Ações Ordinárias</div>
                    <div className="text-xl font-bold text-blue-800">
                      {formatPercentage(analysisData.estrutura_acionaria.pct_ordinarias)}
                    </div>
                    <div className="text-xs text-blue-600">
                      {formatNumber(analysisData.graficos.composicao_acionaria.find(item => item.tipo === "Ordinárias")?.quantidade || 0)} ações
                    </div>
                  </div>
                  <div className="text-center bg-green-50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-green-700 mb-1">Ações Preferenciais</div>
                    <div className="text-xl font-bold text-green-800">
                      {formatPercentage(analysisData.estrutura_acionaria.pct_preferenciais)}
                    </div>
                    <div className="text-xs text-green-600">
                      {formatNumber(analysisData.graficos.composicao_acionaria.find(item => item.tipo === "Preferenciais")?.quantidade || 0)} ações
                    </div>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Ações Tesouraria</div>
                    <div className="text-xl font-bold text-gray-800">
                      {formatPercentage(analysisData.estrutura_acionaria.pct_tesouraria)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatNumber(analysisData.estrutura_acionaria.acoes_tesouraria)} ações
                    </div>
                  </div>
                  <div className="text-center bg-purple-50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-purple-700 mb-1">Total de Ações</div>
                    <div className="text-xl font-bold text-purple-800">
                      {formatNumber(analysisData.estrutura_acionaria.total_acoes)}
                    </div>
                    <div className="text-xs text-purple-600">
                      {formatNumber(analysisData.estrutura_acionaria.acoes_circulacao)} em circulação
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Histórico Financeiro e Tendências */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Histórico Financeiro e Evolução
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">Métricas de Evolução</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium">Crescimento Médio Anual</span>
                        <span className="font-bold text-blue-700">
                          {formatPercentage(analysisData.historico_financeiro.metricas_evolucao.crescimento_medio_anual)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium">Maior Crescimento</span>
                        <span className="font-bold text-green-700">
                          {formatPercentage(analysisData.historico_financeiro.metricas_evolucao.maior_crescimento)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-sm font-medium">Menor Crescimento</span>
                        <span className="font-bold text-red-700">
                          {formatPercentage(analysisData.historico_financeiro.metricas_evolucao.menor_crescimento)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Períodos Analisados</span>
                        <span className="font-bold text-gray-700">
                          {analysisData.historico_financeiro.metricas_evolucao.periodos_analisados}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">Análise de Tendências</h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-yellow-600" />
                        <span className="font-semibold text-yellow-800">Tendência Identificada</span>
                      </div>
                      <p className="text-yellow-700">{analysisData.historico_financeiro.tendencias}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Movimentação de Controladores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Movimentação de Controladores
                  <LegendTooltip 
                    title="Movimentação de Controladores" 
                    description={analysisData.legendas.movimentacao_controladores}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      {analysisData.movimentacao_controladores.tendencia_geral.includes("Comprando") ? (
                        <ArrowUpRight className="h-8 w-8 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-8 w-8 text-red-600" />
                      )}
                      <div>
                        <h4 className="text-lg font-semibold">{analysisData.movimentacao_controladores.tendencia_geral}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Score de Confiança:</span>
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            {analysisData.movimentacao_controladores.confianca_score}/10
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Interpretação</h5>
                      <p className="text-blue-700 text-sm">
                        {analysisData.movimentacao_controladores.analise_comportamento.interpretacao}
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">Evolução da Tendência</h5>
                      <p className="text-green-700 text-sm">
                        {analysisData.movimentacao_controladores.analise_temporal.tendencia_evolucao}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">Análise Temporal</h4>
                    <Tabs defaultValue="12m" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="3m">3 Meses</TabsTrigger>
                        <TabsTrigger value="6m">6 Meses</TabsTrigger>
                        <TabsTrigger value="12m">12 Meses</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="3m" className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center bg-green-50 rounded-lg p-3">
                            <div className="text-sm font-semibold text-green-700">Compras</div>
                            <div className="text-xl font-bold text-green-800">
                              {analysisData.movimentacao_controladores.analise_temporal.ultimos_3_meses.compras}
                            </div>
                            <div className="text-xs text-green-600">
                              {formatCurrency(analysisData.movimentacao_controladores.analise_temporal.ultimos_3_meses.volume_compra)}
                            </div>
                          </div>
                          <div className="text-center bg-red-50 rounded-lg p-3">
                            <div className="text-sm font-semibold text-red-700">Vendas</div>
                            <div className="text-xl font-bold text-red-800">
                              {analysisData.movimentacao_controladores.analise_temporal.ultimos_3_meses.vendas}
                            </div>
                            <div className="text-xs text-red-600">
                              {formatCurrency(analysisData.movimentacao_controladores.analise_temporal.ultimos_3_meses.volume_venda)}
                            </div>
                          </div>
                        </div>
                        <div className="text-center bg-blue-50 rounded-lg p-3">
                          <div className="text-sm font-semibold text-blue-700">Saldo Líquido</div>
                          <div className="text-lg font-bold text-blue-800">
                            {analysisData.movimentacao_controladores.analise_temporal.ultimos_3_meses.saldo_operacoes} operações
                          </div>
                          <div className="text-xs text-blue-600">
                            {formatCurrency(analysisData.movimentacao_controladores.analise_temporal.ultimos_3_meses.saldo_volume)}
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="6m" className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center bg-green-50 rounded-lg p-3">
                            <div className="text-sm font-semibold text-green-700">Compras</div>
                            <div className="text-xl font-bold text-green-800">
                              {analysisData.movimentacao_controladores.analise_temporal.ultimos_6_meses.compras}
                            </div>
                            <div className="text-xs text-green-600">
                              {formatCurrency(analysisData.movimentacao_controladores.analise_temporal.ultimos_6_meses.volume_compra)}
                            </div>
                          </div>
                          <div className="text-center bg-red-50 rounded-lg p-3">
                            <div className="text-sm font-semibold text-red-700">Vendas</div>
                            <div className="text-xl font-bold text-red-800">
                              {analysisData.movimentacao_controladores.analise_temporal.ultimos_6_meses.vendas}
                            </div>
                            <div className="text-xs text-red-600">
                              {formatCurrency(analysisData.movimentacao_controladores.analise_temporal.ultimos_6_meses.volume_venda)}
                            </div>
                          </div>
                        </div>
                        <div className="text-center bg-blue-50 rounded-lg p-3">
                          <div className="text-sm font-semibold text-blue-700">Saldo Líquido</div>
                          <div className="text-lg font-bold text-blue-800">
                            {analysisData.movimentacao_controladores.analise_temporal.ultimos_6_meses.saldo_operacoes} operações
                          </div>
                          <div className="text-xs text-blue-600">
                            {formatCurrency(analysisData.movimentacao_controladores.analise_temporal.ultimos_6_meses.saldo_volume)}
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="12m" className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center bg-green-50 rounded-lg p-3">
                            <div className="text-sm font-semibold text-green-700">Compras</div>
                            <div className="text-xl font-bold text-green-800">
                              {analysisData.movimentacao_controladores.analise_temporal.ultimos_12_meses.compras}
                            </div>
                            <div className="text-xs text-green-600">
                              {formatCurrency(analysisData.movimentacao_controladores.analise_temporal.ultimos_12_meses.volume_compra)}
                            </div>
                          </div>
                          <div className="text-center bg-red-50 rounded-lg p-3">
                            <div className="text-sm font-semibold text-red-700">Vendas</div>
                            <div className="text-xl font-bold text-red-800">
                              {analysisData.movimentacao_controladores.analise_temporal.ultimos_12_meses.vendas}
                            </div>
                            <div className="text-xs text-red-600">
                              {formatCurrency(analysisData.movimentacao_controladores.analise_temporal.ultimos_12_meses.volume_venda)}
                            </div>
                          </div>
                        </div>
                        <div className="text-center bg-blue-50 rounded-lg p-3">
                          <div className="text-sm font-semibold text-blue-700">Saldo Líquido</div>
                          <div className="text-lg font-bold text-blue-800">
                            {analysisData.movimentacao_controladores.analise_temporal.ultimos_12_meses.saldo_operacoes} operações
                          </div>
                          <div className="text-xs text-blue-600">
                            {formatCurrency(analysisData.movimentacao_controladores.analise_temporal.ultimos_12_meses.saldo_volume)}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>

                {/* Executivos em Destaque */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Executivos em Destaque</h4>
                  <div className="space-y-3">
                    {analysisData.movimentacao_controladores.executivos_destaque.map((executivo, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">
                              {executivo.nome !== "N/A" ? executivo.nome : "Executivo Anônimo"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {executivo.cargo || "Cargo não especificado"}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {executivo.movimentacoes} movimentações • {formatCurrency(executivo.volume_total)}
                            </div>
                          </div>
                          <div className="text-center ml-4">
                            <Badge 
                              variant={executivo.tendencia === "Comprando" ? "default" : 
                                     executivo.tendencia === "Vendendo" ? "destructive" : "secondary"}
                            >
                              {executivo.tendencia}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              C: {executivo.compras} | V: {executivo.vendas}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Análise Comportamental */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-semibold text-yellow-800 mb-2">Padrões Identificados</h5>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      {analysisData.movimentacao_controladores.analise_comportamento.padroes_identificados.map((padrao, index) => (
                        <li key={index}>• {padrao}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-800 mb-2">Sinais de Confiança</h5>
                    <ul className="text-purple-700 text-sm space-y-1">
                      {analysisData.movimentacao_controladores.analise_comportamento.sinais_confianca.map((sinal, index) => (
                        <li key={index}>• {sinal}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="font-semibold text-red-800 mb-2">Recomendação</h5>
                  <p className="text-red-700 text-sm">
                    {analysisData.movimentacao_controladores.analise_comportamento.recomendacao}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Eventos Corporativos Expandido */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Eventos Corporativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center bg-blue-50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-blue-700 mb-1">Eventos Relevantes</div>
                    <div className="text-3xl font-bold text-blue-800">
                      {analysisData.eventos_corporativos.total_eventos_relevantes}
                    </div>
                    <div className="text-xs text-blue-600">
                      {analysisData.eventos_corporativos.periodo_analise}
                    </div>
                  </div>
                  <div className="text-center bg-green-50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-green-700 mb-1">Último Evento</div>
                    <div className="text-lg font-bold text-green-800">
                      {analysisData.eventos_corporativos.ultimo_evento}
                    </div>
                  </div>
                  <div className="text-center bg-purple-50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-purple-700 mb-1">Frequência</div>
                    <div className="text-xl font-bold text-purple-800">
                      {analysisData.eventos_corporativos.frequencia_comunicacao}
                    </div>
                  </div>
                  <div className="text-center bg-orange-50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-orange-700 mb-1">Eventos Listados</div>
                    <div className="text-3xl font-bold text-orange-800">
                      {analysisData.eventos_corporativos.eventos_importantes.length}
                    </div>
                  </div>
                </div>

                {/* Legendas de Relevância */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-semibold text-red-800">CRÍTICA</span>
                    </div>
                    <p className="text-red-700 text-xs">{analysisData.eventos_corporativos.legendas.CRÍTICA}</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="font-semibold text-yellow-800">ALTA</span>
                    </div>
                    <p className="text-yellow-700 text-xs">{analysisData.eventos_corporativos.legendas.ALTA}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-semibold text-blue-800">MÉDIA</span>
                    </div>
                    <p className="text-blue-700 text-xs">{analysisData.eventos_corporativos.legendas.MÉDIA}</p>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <h4 className="font-semibold text-gray-800 mb-3">Timeline Detalhada de Eventos</h4>
                  {analysisData.eventos_corporativos.eventos_importantes.map((evento, index) => {
                    const getRelevanciaColor = (relevancia: string) => {
                      switch (relevancia) {
                        case 'CRÍTICA': return 'border-red-400 bg-red-50';
                        case 'ALTA': return 'border-yellow-400 bg-yellow-50';
                        case 'MÉDIA': return 'border-blue-400 bg-blue-50';
                        default: return 'border-gray-400 bg-gray-50';
                      }
                    };

                    const getRelevanciaTextColor = (relevancia: string) => {
                      switch (relevancia) {
                        case 'CRÍTICA': return 'text-red-800';
                        case 'ALTA': return 'text-yellow-800';
                        case 'MÉDIA': return 'text-blue-800';
                        default: return 'text-gray-800';
                      }
                    };

                    return (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${getRelevanciaColor(evento.relevancia)}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`font-bold ${getRelevanciaTextColor(evento.relevancia)}`}>
                                {evento.titulo}
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getRelevanciaTextColor(evento.relevancia)}`}
                              >
                                {evento.relevancia}
                              </Badge>
                            </div>
                            {evento.subtipo && (
                              <div className="text-sm text-gray-600 mb-1">{evento.subtipo}</div>
                            )}
                            <div className="text-sm text-gray-700 mb-2">{evento.descricao}</div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{evento.data}</span>
                              </div>
                              <div>Ano: {evento.ano}</div>
                              {evento.protocolo && (
                                <div>Protocolo: {evento.protocolo}</div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <a 
                              href={evento.link_documento}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" />
                                Ver
                              </Button>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Governança Corporativa Expandida */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Governança Corporativa
                  <LegendTooltip 
                    title="Score de Transparência" 
                    description={analysisData.legendas.transparencia_score}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center bg-emerald-50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-emerald-700 mb-1">Score de Transparência</div>
                    <div className="text-4xl font-bold text-emerald-800 mb-2">
                      {analysisData.governanca_corporativa.transparencia_score}
                    </div>
                    <Progress value={analysisData.governanca_corporativa.transparencia_score} className="w-full" />
                    <div className="text-xs text-emerald-600 mt-1">de 100</div>
                  </div>
                  <div className="text-center bg-blue-50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-blue-700 mb-1">Total Movimentações</div>
                    <div className="text-3xl font-bold text-blue-800">
                      {analysisData.governanca_corporativa.movimentacoes_executivas.total_movimentacoes}
                    </div>
                  </div>
                  <div className="text-center bg-purple-50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-purple-700 mb-1">Volume Total</div>
                    <div className="text-xl font-bold text-purple-800">
                      {formatCurrency(analysisData.governanca_corporativa.movimentacoes_executivas.volume_total)}
                    </div>
                  </div>
                  <div className="text-center bg-amber-50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-amber-700 mb-1">Executivos Ativos</div>
                    <div className="text-3xl font-bold text-amber-800">
                      {analysisData.governanca_corporativa.executivos_ativos}
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-800">Análise de Transparência</span>
                  </div>
                  <p className="text-emerald-700">{analysisData.governanca_corporativa.analise_transparencia}</p>
                </div>
              </CardContent>
            </Card>

            {/* Documentos CVM */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos CVM
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Total de documentos disponíveis: <span className="font-bold">{analysisData.documentos_cvm.total_documentos}</span>
                  </p>
                </div>
                <div className="space-y-3">
                  {analysisData.documentos_cvm.links_download.map((documento, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{documento.tipo}</div>
                        <div className="text-sm text-gray-600">Data: {formatDate(documento.data)}</div>
                        <div className="text-xs text-gray-500">ID: {documento.documento_id}</div>
                      </div>
                      <a 
                        href={documento.link_download}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4"
                      >
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comparação Setorial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Comparação Setorial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {analysisData.comparacao_setorial.setor}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      Total de empresas no setor: {analysisData.comparacao_setorial.total_empresas_setor}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-blue-800 mb-2">Resumo Setorial</h4>
                    <p className="text-blue-700 capitalize">
                      {analysisData.comparacao_setorial.analise_posicionamento.resumo_setorial}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Posição no Ranking */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">Posição no Setor</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium">P/VP</span>
                        <div className="text-right">
                          <div className="font-bold text-purple-700">
                            {analysisData.comparacao_setorial.posicao_setor.p_vp_rank}
                          </div>
                          <div className="text-xs text-purple-600">
                            Percentil: {analysisData.comparacao_setorial.posicao_setor.percentil_p_vp.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium">VPA</span>
                        <div className="text-right">
                          <div className="font-bold text-green-700">
                            {analysisData.comparacao_setorial.posicao_setor.vpa_rank}
                          </div>
                          <div className="text-xs text-green-600">
                            Percentil: {analysisData.comparacao_setorial.posicao_setor.percentil_vpa.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium">Valor de Mercado</span>
                        <div className="text-right">
                          <div className="font-bold text-blue-700">
                            {analysisData.comparacao_setorial.posicao_setor.valor_mercado_rank}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparação vs Média Setorial */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">vs Média Setorial</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">P/VP vs Média</span>
                          <span className="font-bold text-gray-700">
                            {analysisData.comparacao_setorial.comparacao_com_setor.p_vp_vs_media > 0 ? '+' : ''}
                            {analysisData.comparacao_setorial.comparacao_com_setor.p_vp_vs_media.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Média setorial: {analysisData.comparacao_setorial.medias_setor.p_vp_medio.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">VPA vs Média</span>
                          <span className="font-bold text-gray-700">
                            {analysisData.comparacao_setorial.comparacao_com_setor.vpa_vs_media > 0 ? '+' : ''}
                            {analysisData.comparacao_setorial.comparacao_com_setor.vpa_vs_media.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Média setorial: {formatCurrency(analysisData.comparacao_setorial.medias_setor.vpa_medio)}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">VM vs Média</span>
                          <span className="font-bold text-gray-700">
                            {analysisData.comparacao_setorial.comparacao_com_setor.vm_vs_media > 0 ? '+' : ''}
                            {formatNumber(analysisData.comparacao_setorial.comparacao_com_setor.vm_vs_media)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Média setorial: {formatNumber(analysisData.comparacao_setorial.medias_setor.valor_mercado_medio)}M
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Análise de Posicionamento */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-semibold text-yellow-800 mb-2">Posicionamento P/VP</h5>
                    <p className="text-yellow-700 text-sm">
                      {analysisData.comparacao_setorial.analise_posicionamento.posicionamento_p_vp}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-semibold text-green-800 mb-2">Posicionamento VPA</h5>
                    <p className="text-green-700 text-sm">
                      {analysisData.comparacao_setorial.analise_posicionamento.posicionamento_vpa}
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-800 mb-2">Tamanho da Empresa</h5>
                    <p className="text-blue-700 text-sm">
                      {analysisData.comparacao_setorial.analise_posicionamento.posicionamento_tamanho}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Responsáveis por Comunicação */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Diretor de Relações com Investidores (DRI)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p className="font-medium">{analysisData.responsaveis_comunicacao.dri.nome}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-medium">{analysisData.responsaveis_comunicacao.dri.telefone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a 
                        href={`mailto:${analysisData.responsaveis_comunicacao.dri.email}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {analysisData.responsaveis_comunicacao.dri.email}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Contatos Institucionais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone Institucional</p>
                      <p className="font-medium">{analysisData.responsaveis_comunicacao.contatos.telefone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email Institucional</p>
                      <a 
                        href={`mailto:${analysisData.responsaveis_comunicacao.contatos.email}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {analysisData.responsaveis_comunicacao.contatos.email}
                      </a>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-gray-500">
                        Análise realizada em: {formatDate(analysisData.data_analise)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Aviso Legal */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 mb-1">
                      Aviso: Dados para fins educacionais
                    </p>
                    <p className="text-yellow-700">
                      As informações apresentadas são apenas para fins educacionais e não constituem 
                      recomendação de investimento. Consulte sempre um profissional qualificado.
                      Dados extraídos de fontes oficiais da CVM e B3.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!analysisData && !isAnalyzing && !analysisError && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Análise Completa e Profissional de Ações
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Pesquise por um código de ação da B3 para obter análise completa com:
                eventos corporativos, governança, movimentação de controladores, 
                documentos CVM e indicadores fundamentalistas com legendas explicativas.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MarketPremiumGuard>
  );
}