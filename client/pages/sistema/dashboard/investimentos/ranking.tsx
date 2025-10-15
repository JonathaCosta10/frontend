import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Medal,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Target,
  Zap,
  Loader2,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Activity,
  Shield,
  Eye,
  Info
} from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import InvestmentPremiumGuard from '@/components/InvestmentPremiumGuard';
import { 
  getRanking, 
  RankingResponse,
  RankingItem
} from '@/services/api/rankingService';

// Componente para Badge da Recomendação com Tooltip
interface RecommendationBadgeProps {
  recomendacao: {
    acao: string;
    motivo?: string;
    justificativa?: string;
    insight?: string;
    risco?: string;
  };
  getRecommendationColor: (acao: string) => string;
  className?: string;
}

const RecommendationBadge: React.FC<RecommendationBadgeProps> = ({ 
  recomendacao, 
  getRecommendationColor, 
  className = "" 
}) => {
  const formatAction = (action: string) => {
    if (!action) return '';
    return action.toLowerCase() === 'comprar' ? 'Comprar' :
           action.toLowerCase() === 'vender' ? 'Vender' :
           action.toLowerCase() === 'manter' ? 'Manter' :
           action.toLowerCase() === 'observar' ? 'Observar' :
           action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <Badge className={`cursor-pointer hover:opacity-90 ${getRecommendationColor(recomendacao.acao)} ${className}`}>
          {formatAction(recomendacao.acao)}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm p-4 z-50" sideOffset={5}>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm">
              {formatAction(recomendacao.acao)}
            </span>
            {recomendacao.risco && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {recomendacao.risco}
              </Badge>
            )}
          </div>
          
          {recomendacao.motivo && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">📋 Motivo:</p>
              <p className="text-sm leading-relaxed">{recomendacao.motivo}</p>
            </div>
          )}
          
          {recomendacao.justificativa && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">⚖️ Justificativa:</p>
              <p className="text-sm leading-relaxed">{recomendacao.justificativa}</p>
            </div>
          )}
          
          {recomendacao.insight && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">💡 Insight:</p>
              <p className="text-sm leading-relaxed">{recomendacao.insight}</p>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default function Ranking() {
  const { t, formatCurrency } = useTranslation();
  const [currentView, setCurrentView] = useState<string>('portfolio');
  const [selectedAsset, setSelectedAsset] = useState<RankingItem | null>(null);
  
  // Estados para dados da API - sem dados mockados
  const [rankingData, setRankingData] = useState<RankingItem[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros e ordenação
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recomendacao');

  // Função para carregar dados do ranking
  const loadRankingData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🏆 [Ranking] Carregando dados da API");
      
      // Carregar dados da API
      const rankingResponse = await getRanking();

      if (rankingResponse.success && rankingResponse.data) {
        const data = rankingResponse.data;
        setRankingData(data.ranking_completo || []);
        setInsights(data.insights);
        
        console.log("✅ [Ranking] Dados carregados:", {
          ranking: rankingResponse.data.ranking_completo?.length || 0,
          insights: !!rankingResponse.data.insights
        });
      } else {
        // Reset todos os dados em caso de erro
        setRankingData([]);
        setInsights(null);
        console.warn("⚠️ [Ranking] Resposta da API não contém dados válidos");
      }
      
    } catch (err) {
      console.error("❌ [Ranking] Erro ao carregar dados:", err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o componente monta
  useEffect(() => {
    loadRankingData();
  }, []);

  // Função para mapear tipos de forma amigável
  const getTipoFriendlyName = (tipo: string): string => {
    const mapeamento: Record<string, string> = {
      'ACAO': 'Ação',
      'FII': 'Fundo Imobiliário'
    };
    return mapeamento[tipo] || tipo;
  };

  // Mapeamento de setores específicos para FIIs conhecidos
  const getFIISetor = (ticker: string): string | null => {
    const fiiSetores: Record<string, string> = {
      // Logística
      'HSLG11': 'Logística',
      'XPLG11': 'Logística',
      'BTLG11': 'Logística',
      'ALZR11': 'Logística',
      'VILG11': 'Logística',
      'RLOG11': 'Logística',
      'LOG11': 'Logística',
      'CXAG11': 'Logística',
      
      // Shopping Centers
      'XPML11': 'Shopping Centers',
      'HSML11': 'Shopping Centers',
      'MALL11': 'Shopping Centers',
      'VISC11': 'Shopping Centers',
      'SEQR11': 'Shopping Centers',
      'SPTW11': 'Shopping Centers',
      'OUJP11': 'Shopping Centers',
      
      // Lajes Corporativas
      'MXRF11': 'Lajes Corporativas',
      'BCFF11': 'Lajes Corporativas',
      'KNCR11': 'Lajes Corporativas',
      'HGRE11': 'Lajes Corporativas',
      'HCTR11': 'Lajes Corporativas',
      'GGRC11': 'Lajes Corporativas',
      'XPCI11': 'Lajes Corporativas',
      'BRCO11': 'Lajes Corporativas',
      'RECT11': 'Lajes Corporativas',
      'EDGA11': 'Lajes Corporativas',
      'TGAR11': 'Lajes Corporativas',
      'GALZ11': 'Lajes Corporativas',
      
      // Híbrido
      'HGRU11': 'Híbrido',
      'HGBS11': 'Híbrido',
      'URPR11': 'Híbrido',
      'JSRE11': 'Híbrido',
      'BPFF11': 'Híbrido',
      'RBHG11': 'Híbrido',
      
      // Hospitalar
      'VSLH11': 'Hospitalar',
      'CARE11': 'Hospitalar',
      
      // Agronegócio
      'RBRF11': 'Agronegócio',
      'BTRA11': 'Agronegócio',
      
      // Papel e Celulose
      'FIIP11': 'Papel e Celulose',
      
      // Residencial
      'HGCR11': 'Residencial',
      'RBRS11': 'Residencial',
      'PVBI11': 'Residencial',
      'KNRI11': 'Residencial',
      
      // Educação
      'VINO11': 'Educação',
      
      // Hoteleiro
      'HTMX11': 'Hoteleiro',
      
      // Outros
      'XPPR11': 'Fundos de Papel',
      'MFII11': 'Multissetorial'
    };
    
    return fiiSetores[ticker] || null;
  };

  // Função para filtrar e ordenar dados
  const getFilteredAndSortedData = () => {
    let filteredData = [...rankingData];
    
    // Aplicar filtro por tipo
    if (filterType !== 'all') {
      filteredData = filteredData.filter(item => item.tipo === filterType);
    }
    
    // Aplicar ordenação
    switch (sortBy) {
      case 'recomendacao':
        filteredData.sort((a, b) => {
          const scoreA = getScoreGrade(a.score?.percentual || 0).grade;
          const scoreB = getScoreGrade(b.score?.percentual || 0).grade;
          // Ordem: A, B, C, D, E
          const order: { [key: string]: number } = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
          return (order[scoreA] || 6) - (order[scoreB] || 6);
        });
        break;
      case 'rentabilidade':
        filteredData.sort((a, b) => b.rentabilidade_percentual - a.rentabilidade_percentual);
        break;
      case 'score':
        filteredData.sort((a, b) => (b.score?.percentual || 0) - (a.score?.percentual || 0));
        break;
      case 'ticker':
        filteredData.sort((a, b) => a.ticker.localeCompare(b.ticker));
        break;
      default:
        filteredData.sort((a, b) => a.posicao - b.posicao);
    }
    
    return filteredData;
  };

  // Função para navegar para análise específica
  const handleDetailsClick = (item: RankingItem) => {
    let analysisUrl;
    if (item.tipo === 'FII') {
      analysisUrl = `/dashboard/mercado/analise-ticker/fii?ticker=${item.ticker}`;
    } else {
      analysisUrl = `/dashboard/mercado/analise-ticker-acoes?ticker=${item.ticker}`;
    }
    window.location.href = analysisUrl;
  };

  // Funções utilitárias para análise
  const getPortfolioMetrics = () => {
    if (!rankingData.length) return null;
    
    const totalInvestido = rankingData.reduce((sum, item) => sum + item.valor_investido, 0);
    const totalAtual = rankingData.reduce((sum, item) => sum + item.valor_atual, 0);
    const rentabilidadeTotal = ((totalAtual - totalInvestido) / totalInvestido) * 100;
    const ativos = rankingData.length;
    const ativosPositivos = rankingData.filter(item => item.rentabilidade_percentual > 0).length;
    const ativosNegativos = ativos - ativosPositivos;
    const melhorAtivo = rankingData.reduce((best, current) => 
      current.rentabilidade_percentual > best.rentabilidade_percentual ? current : best
    );
    const piorAtivo = rankingData.reduce((worst, current) => 
      current.rentabilidade_percentual < worst.rentabilidade_percentual ? current : worst
    );
    
    // Aplicar mapeamento de setor aos melhores e piores ativos
    const melhorAtivoComSetor = {
      ...melhorAtivo,
      setor: getFIISetor(melhorAtivo.ticker) || melhorAtivo.dados_mercado?.setor || melhorAtivo.setor || 'A definir'
    };
    const piorAtivoComSetor = {
      ...piorAtivo,
      setor: getFIISetor(piorAtivo.ticker) || piorAtivo.dados_mercado?.setor || piorAtivo.setor || 'A definir'
    };
    
    return {
      totalInvestido,
      totalAtual,
      rentabilidadeTotal,
      lucroTotal: totalAtual - totalInvestido,
      ativos,
      ativosPositivos,
      ativosNegativos,
      melhorAtivo: melhorAtivoComSetor,
      piorAtivo: piorAtivoComSetor,
      volatillidadeMedia: rankingData.reduce((sum, item) => sum + item.volatilidade, 0) / ativos,
      dividendYieldMedio: rankingData.reduce((sum, item) => sum + (item.dividend_yield?.percentual_anual || 0), 0) / ativos
    };
  };

  const getAnalysisData = () => {
    if (!rankingData.length) return { crescimento: [], dividendos: [], baixoRisco: [], oportunidades: [] };
    
    // Função para mapear setor corretamente
    const mapItemWithSetor = (item: RankingItem) => {
      const setorFII = getFIISetor(item.ticker);
      const setor = setorFII || item.dados_mercado?.setor || item.setor || 'A definir';
      return { ...item, setor };
    };
    
    return {
      crescimento: [...rankingData]
        .map(mapItemWithSetor)
        .sort((a, b) => b.rentabilidade_percentual - a.rentabilidade_percentual)
        .slice(0, 5),
      dividendos: [...rankingData]
        .map(mapItemWithSetor)
        .filter(item => item.dividend_yield?.percentual_anual && item.dividend_yield.percentual_anual > 0)
        .sort((a, b) => (b.dividend_yield?.percentual_anual || 0) - (a.dividend_yield?.percentual_anual || 0))
        .slice(0, 5),
      baixoRisco: [...rankingData]
        .map(mapItemWithSetor)
        .sort((a, b) => a.volatilidade - b.volatilidade)
        .slice(0, 5),
      oportunidades: [...rankingData]
        .map(mapItemWithSetor)
        .filter(item => 
          item.score?.classificacao === 'oportunidade_excelente' || 
          item.score?.classificacao === 'oportunidade_boa' ||
          (item.score?.recomendacao?.acao === 'comprar') ||
          (item.oportunidade?.principal?.score && item.oportunidade.principal.score > 7)
        )
        .sort((a, b) => (b.score?.score_total || 0) - (a.score?.score_total || 0))
        .slice(0, 10)
    };
  };

  const getMedalIcon = (posicao: number) => {
    if (posicao === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (posicao === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (posicao === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">{posicao}</span>;
  };

  const getVariationIcon = (value: number) => {
    return value >= 0 ? 
      <ArrowUpRight className="h-4 w-4 text-success" /> : 
      <ArrowDownRight className="h-4 w-4 text-destructive" />;
  };

  const getVariationColor = (value: number) => {
    return value >= 0 ? 'text-success' : 'text-destructive';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  // Funções de formatação e utilidades
  const formatMoney = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return formatCurrency(value);
  };

  const getRecommendationColor = (recomendacao: string) => {
    switch (recomendacao) {
      case 'comprar': return 'bg-green-500';
      case 'manter': return 'bg-blue-500';
      case 'vender': return 'bg-red-500';
      case 'nao_comprar': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreGrade = (score: number) => {
    if (score >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 20) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getTrendIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'alta': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'baixa': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // Função para renderizar estado de loading
  const renderLoading = () => (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-lg">{t('loading')}...</span>
      </div>
    </div>
  );

  // Função para renderizar estado de erro
  const renderError = () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-destructive">
            {t('error_loading_data')}
          </h3>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            onClick={loadRankingData}
            variant="outline"
            className="mt-4"
          >
            {t('try_again')}
          </Button>
        </div>
      </div>
    </div>
  );

  const portfolioMetrics = getPortfolioMetrics();
  const analysisData = getAnalysisData();

  return (
    <TooltipProvider>
      <InvestmentPremiumGuard featureType="ranking">
        <div className="w-full min-h-screen space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Header - Completamente responsivo */}
        <div className="w-full flex flex-col space-y-2 md:space-y-0 md:flex-row md:justify-between md:items-center">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold break-words">
              Análise Profissional de Investimentos
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Dashboard completo com análise detalhada do seu portfólio
            </p>
          </div>
        </div>

        {/* Estados de Loading e Erro */}
        {loading && renderLoading()}
        {error && renderError()}

        {/* Estado quando não há dados */}
        {!loading && !error && rankingData.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum dado disponível</h3>
            <p className="text-muted-foreground">
              Carregue seus dados de investimentos para ver a análise
            </p>
          </div>
        )}

        {/* Dashboard Principal */}
        {!loading && !error && rankingData.length > 0 && portfolioMetrics && (
          <>
            {/* Resumo Executivo do Portfolio - Completamente responsivo */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              <Card className="border-l-4 border-l-blue-600 min-h-0">
                <CardContent className="p-3 md:p-4 lg:p-6">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <BarChart3 className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm text-muted-foreground truncate">Valor Total Investido</p>
                      <p className="text-lg md:text-xl lg:text-2xl font-bold truncate">{formatMoney(portfolioMetrics.totalInvestido)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-600 min-h-0">
                <CardContent className="p-3 md:p-4 lg:p-6">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <DollarSign className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-green-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm text-muted-foreground truncate">Valor Atual</p>
                      <p className="text-lg md:text-xl lg:text-2xl font-bold text-green-600 truncate">{formatMoney(portfolioMetrics.totalAtual)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-600 min-h-0">
                <CardContent className="p-3 md:p-4 lg:p-6">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <TrendingUp className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm text-muted-foreground truncate">Rentabilidade Total</p>
                      <p className={`text-lg md:text-xl lg:text-2xl font-bold truncate ${portfolioMetrics.rentabilidadeTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {portfolioMetrics.rentabilidadeTotal.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-600 min-h-0">
                <CardContent className="p-3 md:p-4 lg:p-6">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <Star className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-orange-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm text-muted-foreground truncate">Lucro/Prejuízo</p>
                      <p className={`text-lg md:text-xl lg:text-2xl font-bold truncate ${portfolioMetrics.lucroTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(portfolioMetrics.lucroTotal)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exposição Setorial e Insights */}
            {insights && insights.exposicao_setorial && (
              <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-6 w-6 text-slate-600" />
                    <span>Análise Setorial do Portfolio</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(insights.exposicao_setorial).map(([setor, dados]: [string, any]) => (
                      <div key={setor} className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">{setor}</Badge>
                            <span className="text-lg font-bold text-blue-600">{dados.percentual.toFixed(1)}%</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <p className="text-muted-foreground">
                              Valor: {formatCurrency(dados.valor_total)}
                            </p>
                            <p className="text-muted-foreground">
                              Ativos: {dados.quantidade_ativos}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {dados.ativos.map((ticker: string) => (
                                <Badge key={ticker} variant="outline" className="text-xs">
                                  {ticker}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Insights gerais */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{insights.ativos_positivos}</p>
                        <p className="text-sm text-muted-foreground">Ativos em Alta</p>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{insights.ativos_negativos}</p>
                        <p className="text-sm text-muted-foreground">Ativos em Baixa</p>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{insights.oportunidades_total}</p>
                        <p className="text-sm text-muted-foreground">Oportunidades</p>
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Análise de Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Melhor Performance */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                    <Trophy className="h-6 w-6" />
                    <span>🏆 Melhor Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{portfolioMetrics.melhorAtivo.ticker}</p>
                      <Badge variant="outline">{portfolioMetrics.melhorAtivo.tipo}</Badge>
                    </div>
                    <Badge className="bg-green-600 text-white text-lg p-2">
                      +{portfolioMetrics.melhorAtivo.rentabilidade_percentual.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Valor Investido</p>
                      <p className="font-semibold">{formatCurrency(portfolioMetrics.melhorAtivo.valor_investido)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valor Atual</p>
                      <p className="font-semibold text-green-600">{formatCurrency(portfolioMetrics.melhorAtivo.valor_atual)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lucro</p>
                      <p className="font-semibold text-green-600">+{formatCurrency(portfolioMetrics.melhorAtivo.rentabilidade_rs)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">D.Y. Anual</p>
                      <p className="font-semibold">{portfolioMetrics.melhorAtivo.dividend_yield?.percentual_anual?.toFixed(1) || '0.0'}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pior Performance */}
              <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                    <AlertTriangle className="h-6 w-6" />
                    <span>📉 Maior Oscilação Negativa</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{portfolioMetrics.piorAtivo.ticker}</p>
                      <Badge variant="outline">{portfolioMetrics.piorAtivo.tipo}</Badge>
                    </div>
                    <Badge variant="destructive" className="text-lg p-2">
                      {portfolioMetrics.piorAtivo.rentabilidade_percentual.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Valor Investido</p>
                      <p className="font-semibold">{formatCurrency(portfolioMetrics.piorAtivo.valor_investido)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valor Atual</p>
                      <p className="font-semibold text-red-600">{formatCurrency(portfolioMetrics.piorAtivo.valor_atual)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Prejuízo</p>
                      <p className="font-semibold text-red-600">{formatCurrency(portfolioMetrics.piorAtivo.rentabilidade_rs)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Risco</p>
                      {portfolioMetrics.piorAtivo.score?.recomendacao?.risco ? (
                        <Badge variant="outline" className="text-xs">
                          {portfolioMetrics.piorAtivo.score.recomendacao.risco}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Não informado
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Análise Detalhada em Abas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-6 w-6" />
                  <span>Análise Detalhada por Categoria</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={currentView} onValueChange={setCurrentView} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 p-1">
                    <TabsTrigger value="portfolio" className="text-xs sm:text-sm">Portfolio</TabsTrigger>
                    <TabsTrigger value="crescimento" className="text-xs sm:text-sm">Crescimento</TabsTrigger>
                    <TabsTrigger value="dividendos" className="text-xs sm:text-sm">Dividendos</TabsTrigger>
                    <TabsTrigger value="risco" className="text-xs sm:text-sm">Baixo Risco</TabsTrigger>
                    <TabsTrigger value="oportunidades" className="text-xs sm:text-sm">Oportunidades</TabsTrigger>
                  </TabsList>

                  {/* Visão Geral do Portfolio */}
                  <TabsContent value="portfolio" className="mt-4 md:mt-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-blue-600">{portfolioMetrics.ativos}</p>
                            <p className="text-sm text-muted-foreground">Total de Ativos</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-green-600">{portfolioMetrics.ativosPositivos}</p>
                            <p className="text-sm text-muted-foreground">Ativos em Alta</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-red-600">{portfolioMetrics.ativosNegativos}</p>
                            <p className="text-sm text-muted-foreground">Ativos em Baixa</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Filtros e Controles */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">Portfolio Completo - Análise Detalhada</h3>
                            <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                              <span className="text-green-600 font-medium">
                                💰 {getFilteredAndSortedData().filter(item => ['A', 'B'].includes(getScoreGrade(item.score?.percentual || 0).grade)).length} Comprar
                              </span>
                              <span className="text-orange-600 font-medium">
                                ⚠️ {getFilteredAndSortedData().filter(item => getScoreGrade(item.score?.percentual || 0).grade === 'C').length} Observar
                              </span>
                              <span className="text-red-600 font-medium">
                                🚫 {getFilteredAndSortedData().filter(item => ['D', 'E'].includes(getScoreGrade(item.score?.percentual || 0).grade)).length} Evitar
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <select 
                              className="px-3 py-2 border rounded-md text-sm"
                              value={filterType}
                              onChange={(e) => setFilterType(e.target.value)}
                            >
                              <option value="all">Todos os Tipos</option>
                              <option value="ACAO">Ações</option>
                              <option value="FII">Fundos Imobiliários</option>
                            </select>
                            <select 
                              className="px-3 py-2 border rounded-md text-sm"
                              value={sortBy}
                              onChange={(e) => setSortBy(e.target.value)}
                            >
                              <option value="recomendacao">Por Recomendação</option>
                              <option value="rentabilidade">Por Rentabilidade</option>
                              <option value="score">Por Score IA</option>
                              <option value="ticker">Por Ticker</option>
                            </select>
                          </div>
                        </div>
                        <div className="overflow-x-auto rounded-lg border">
                            <Table className="min-w-full">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs px-2 py-2 min-w-[50px]">Rank</TableHead>
                                <TableHead className="text-xs px-2 py-2 min-w-[80px]">Ativo</TableHead>
                                <TableHead className="text-xs px-2 py-2 min-w-[80px]">Porte</TableHead>
                                <TableHead className="text-xs px-2 py-2 min-w-[90px]">Preço</TableHead>
                                <TableHead className="text-xs px-2 py-2 min-w-[100px]">Rentabilidade</TableHead>
                                <TableHead className="text-xs px-2 py-2 min-w-[90px]">Valor Atual</TableHead>
                                <TableHead className="text-xs px-2 py-2 min-w-[80px]">D.Y. Anual</TableHead>
                                <TableHead className="text-xs px-2 py-2 min-w-[90px]">Volatilidade</TableHead>
                                <TableHead className="text-xs px-2 py-2 min-w-[80px]">% Carteira</TableHead>
                                <TableHead className="text-xs px-2 py-2 min-w-[100px]">Preço/Dist.</TableHead>
                                <TableHead className="text-xs px-2 py-2 min-w-[100px]">Fundamentos</TableHead>
                                <TableHead className="text-xs px-2 py-2 min-w-[80px]">Score IA</TableHead>
                                <TableHead className="text-xs px-2 py-2 min-w-[120px]">Recomendação</TableHead>
                                <TableHead className="text-xs px-2 py-2 min-w-[90px]">Total Investido</TableHead>
                                <TableHead className="text-xs px-2 py-2 min-w-[80px]">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getFilteredAndSortedData().map((item) => {
                                const scoreGrade = getScoreGrade(item.score?.percentual || 0);
                                // Mapear setor corretamente da API - priorizar mapeamento específico de FIIs
                                const setorFII = getFIISetor(item.ticker);
                                const setor = setorFII || item.dados_mercado?.setor || item.setor || 'A definir';
                                const itemWithSetor = { ...item, setor };
                                return (
                                  <TableRow key={item.ticker} className="hover:bg-muted/50">
                                    <TableCell className="px-2 py-2">
                                      <div className="flex items-center space-x-1">
                                        {getMedalIcon(item.posicao)}
                                        <span className="text-xs md:text-sm font-medium">#{item.posicao}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-2 py-2">
                                      <div className="space-y-1">
                                        <p className="font-bold text-sm md:text-lg">{item.ticker}</p>
                                        <div className="flex items-center space-x-1">
                                          <Badge variant="outline" className="text-xs">{getTipoFriendlyName(item.tipo)}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {item.quantidade} cotas
                                        </p>
                                      </div>
                                    </TableCell>
                                    {/* Nova coluna do Porte */}
                                    <TableCell className="px-2 py-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {item.porte.descricao}
                                      </Badge>
                                    </TableCell>
                                    {/* Nova coluna do Preço */}
                                    <TableCell className="px-2 py-2">
                                      <div className="text-right">
                                        <p className="font-semibold text-sm">{formatCurrency(item.preco_atual)}</p>
                                        <p className="text-xs text-muted-foreground">
                                          Médio: {formatCurrency(item.preco_medio)}
                                        </p>
                                      </div>
                                    </TableCell>
                                    {/* Rentabilidade */}
                                    <TableCell className="px-2 py-2">
                                      <div className="text-right">
                                        <div className="flex items-center justify-end space-x-1">
                                          {getVariationIcon(item.rentabilidade_percentual)}
                                          <span className={`font-bold text-lg ${getVariationColor(item.rentabilidade_percentual)}`}>
                                            {item.rentabilidade_percentual.toFixed(1)}%
                                          </span>
                                        </div>
                                        <p className={`text-sm font-medium ${item.rentabilidade_rs >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {formatCurrency(item.rentabilidade_rs)}
                                        </p>
                                      </div>
                                    </TableCell>
                                    {/* Valor Atual */}
                                    <TableCell className="px-2 py-2">
                                      <div className="text-right">
                                        <p className="font-semibold text-base">{formatCurrency(item.valor_atual)}</p>
                                      </div>
                                    </TableCell>
                                    {/* D.Y. Anual */}
                                    <TableCell className="px-2 py-2">
                                      <div className="text-center">
                                        <p className="text-xs text-muted-foreground mb-1">
                                          Mensal: {item.dividend_yield?.percentual_mensal?.toFixed(2) || '0.00'}%
                                        </p>
                                        <p className="font-semibold text-blue-600 text-base">
                                          {item.dividend_yield?.percentual_anual?.toFixed(1) || '0.0'}%
                                        </p>
                                      </div>
                                    </TableCell>
                                    {/* Volatilidade */}
                                    <TableCell className="px-2 py-2">
                                      <div className="text-center">
                                        <Badge variant={item.volatilidade < 1.5 ? 'default' : item.volatilidade < 2.5 ? 'secondary' : 'destructive'}>
                                          {item.volatilidade.toFixed(1)}%
                                        </Badge>
                                        <div className="flex items-center justify-center space-x-1 mt-1">
                                          <span className="text-xs">30d:</span>
                                          {getTrendIcon(item.tendencia_30_dias.tendencia)}
                                          <span className={`text-xs ${getVariationColor(item.tendencia_30_dias.variacao_30d)}`}>
                                            {item.tendencia_30_dias.variacao_30d.toFixed(1)}%
                                          </span>
                                        </div>
                                      </div>
                                    </TableCell>
                                    {/* % Carteira */}
                                    <TableCell className="px-2 py-2">
                                      <div className="text-center">
                                        <p className="text-sm font-semibold">
                                          {((item.valor_investido / portfolioMetrics.totalInvestido) * 100).toFixed(1)}%
                                        </p>
                                      </div>
                                    </TableCell>
                                    {/* Preço/Dist. */}
                                    <TableCell className="px-2 py-2">
                                      <div className="text-center space-y-1">
                                        <div className="text-xs text-muted-foreground">
                                          Min: {formatCurrency(item.minima_mensal)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Max: {formatCurrency(item.maxima_mensal)}
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                          {item.distancia_minima_percentual >= 0 ? '+' : ''}{item.distancia_minima_percentual.toFixed(1)}%
                                        </Badge>
                                      </div>
                                    </TableCell>
                                    {/* Fundamentos */}
                                    <TableCell className="px-2 py-2">
                                      <div className="text-center space-y-1">
                                        {item.pvp && (
                                          <div className="text-xs">
                                            <span className="text-muted-foreground">P/VP:</span> {item.pvp.toFixed(2)}
                                          </div>
                                        )}
                                        {item.pe_ratio && (
                                          <div className="text-xs">
                                            <span className="text-muted-foreground">P/L:</span> {item.pe_ratio.toFixed(1)}
                                          </div>
                                        )}
                                        {item.roe && (
                                          <div className="text-xs">
                                            <span className="text-muted-foreground">ROE:</span> {item.roe.toFixed(1)}%
                                          </div>
                                        )}
                                        {itemWithSetor.setor && itemWithSetor.setor !== 'A definir' && (
                                          <Badge variant="secondary" className="text-xs">
                                            {itemWithSetor.setor}
                                          </Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                    {/* Score IA */}
                                    <TableCell className="px-2 py-2">
                                      <div className="text-center">
                                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${scoreGrade.bg} ${scoreGrade.color} font-bold text-lg border-2 ${scoreGrade.grade === 'A' || scoreGrade.grade === 'B' ? 'border-yellow-400 shadow-md' : 'border-transparent'}`}>
                                          {scoreGrade.grade}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {item.score?.percentual?.toFixed(0) || '0'}/100
                                        </p>
                                      </div>
                                    </TableCell>
                                    {/* Recomendação */}
                                    <TableCell className="px-2 py-2">
                                      <div className="flex justify-center">
                                        {item.score?.recomendacao ? (
                                          <RecommendationBadge 
                                            recomendacao={item.score.recomendacao}
                                            getRecommendationColor={getRecommendationColor}
                                            className="text-xs"
                                          />
                                        ) : (
                                          <Badge className={`${getRecommendationColor('manter')} text-xs`}>
                                            Analisar
                                          </Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                    {/* Total Investido */}
                                    <TableCell className="px-2 py-2">
                                      <div className="text-right">
                                        <p className="text-sm font-semibold">{formatCurrency(item.valor_investido)}</p>
                                      </div>
                                    </TableCell>
                                    {/* Ações */}
                                    <TableCell className="px-2 py-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDetailsClick(item)}
                                      >
                                        <Eye className="h-4 w-4" />
                                        Detalhes
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                            </Table>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Análise de Crescimento */}
                  <TabsContent value="crescimento" className="mt-4 md:mt-6">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
                        <h3 className="text-lg md:text-xl font-semibold">Top 5 - Maior Crescimento</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
                        {analysisData.crescimento.map((item, index) => (
                          <Card key={item.ticker} className="border-l-4 border-l-green-500 hover:shadow-lg transition-all">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <p className="text-2xl font-bold">{item.ticker}</p>
                                  <Badge variant="outline">{item.tipo}</Badge>
                                </div>
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 font-bold">#{index + 1}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Rentabilidade</span>
                                  <span className="text-xl font-bold text-green-600">
                                    +{item.rentabilidade_percentual.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Lucro</span>
                                  <span className="font-semibold text-green-600">
                                    +{formatCurrency(item.rentabilidade_rs)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Valor Atual</span>
                                  <span className="font-semibold">
                                    {formatCurrency(item.valor_atual)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Volatilidade</span>
                                  <Badge variant={item.volatilidade < 2 ? 'default' : 'secondary'}>
                                    {item.volatilidade.toFixed(1)}%
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Análise de Dividendos */}
                  <TabsContent value="dividendos" className="mt-4 md:mt-6">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-6 w-6 text-blue-500" />
                        <h3 className="text-xl font-semibold">Top 5 - Maiores Dividend Yields</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {analysisData.dividendos.map((item, index) => (
                          <Card key={item.ticker} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <p className="text-2xl font-bold">{item.ticker}</p>
                                  <Badge variant="outline">{item.tipo}</Badge>
                                </div>
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-bold">#{index + 1}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">D.Y. Anual</span>
                                  <span className="text-xl font-bold text-blue-600">
                                    {item.dividend_yield?.percentual_anual?.toFixed(1) || '0.0'}%
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">D.Y. Mensal</span>
                                  <span className="font-semibold">
                                    {item.dividend_yield?.percentual_mensal?.toFixed(2) || '0.00'}%
                                  </span>
                                </div>
                                {item.dividend_yield?.valor_mensal_estimado ? (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Pagamento Mensal</span>
                                    <span className="font-semibold text-blue-600">
                                      {formatCurrency(item.dividend_yield.valor_mensal_estimado)}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Estimativa Mensal</span>
                                    <span className="font-semibold text-blue-600">
                                      {formatCurrency((item.valor_atual * (item.dividend_yield?.percentual_mensal || 0)) / 100)}
                                    </span>
                                  </div>
                                )}
                                {item.dividend_yield?.valor_anual_estimado && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Pagamento Anual</span>
                                    <span className="font-semibold text-green-600">
                                      {formatCurrency(item.dividend_yield.valor_anual_estimado)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Rentabilidade</span>
                                  <span className={`font-semibold ${getVariationColor(item.rentabilidade_percentual)}`}>
                                    {item.rentabilidade_percentual.toFixed(1)}%
                                  </span>
                                </div>
                                
                                {/* Informações específicas de FIIs */}
                                {item.tipo === 'FII' && (
                                  <div className="pt-2 border-t space-y-2">
                                    <div className="text-xs font-medium text-gray-700">
                                      Informações do FII
                                    </div>
                                    {item.dividend_yield && (
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Rendimento Mensal</span>
                                        <span className="text-xs font-medium">
                                          {formatCurrency(item.dividend_yield.valor_mensal_estimado || 0)}
                                        </span>
                                      </div>
                                    )}
                                    {item.dividend_yield && (
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Yield Mensal</span>
                                        <span className="text-xs font-medium">{item.dividend_yield.percentual_mensal?.toFixed(2)}%</span>
                                      </div>
                                    )}
                                    {item.patrimonio_liquido_estimado && (
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Patrimônio Líquido</span>
                                        <span className="text-xs font-medium">{formatCurrency(item.patrimonio_liquido_estimado)}</span>
                                      </div>
                                    )}
                                    {item.valor_mercado_estimado && (
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Valor de Mercado</span>
                                        <span className="text-xs font-medium">{formatCurrency(item.valor_mercado_estimado)}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {item.dividend_yield?.fonte && (
                                  <div className="text-xs text-muted-foreground pt-2 border-t">
                                    Fonte: {item.dividend_yield.fonte}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Análise de Baixo Risco */}
                  <TabsContent value="risco" className="mt-4 md:mt-6">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-6 w-6 text-purple-500" />
                        <h3 className="text-xl font-semibold">Top 5 - Menor Volatilidade (Baixo Risco)</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {analysisData.baixoRisco.map((item, index) => (
                          <Card key={item.ticker} className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <p className="text-2xl font-bold">{item.ticker}</p>
                                  <Badge variant="outline">{item.tipo}</Badge>
                                </div>
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 font-bold">#{index + 1}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Volatilidade</span>
                                  <Badge className="bg-purple-500 text-white">
                                    {item.volatilidade.toFixed(1)}%
                                  </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Rentabilidade</span>
                                  <span className={`font-semibold ${getVariationColor(item.rentabilidade_percentual)}`}>
                                    {item.rentabilidade_percentual.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Valor Atual</span>
                                  <span className="font-semibold">
                                    {formatCurrency(item.valor_atual)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">D.Y. Anual</span>
                                  <span className="font-semibold text-blue-600">
                                    {item.dividend_yield?.percentual_anual?.toFixed(1) || '0.0'}%
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Análise de Oportunidades */}
                  <TabsContent value="oportunidades" className="mt-4 md:mt-6">
                    <div className="space-y-4 md:space-y-6">
                      <div className="flex items-center space-x-2">
                        <Target className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />
                        <h3 className="text-lg md:text-xl font-semibold">Oportunidades Identificadas pela IA</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                        {analysisData.oportunidades.map((item) => (
                          <Card key={item.ticker} className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-all">
                            <CardContent className="p-4 md:p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="min-w-0 flex-1">
                                  <p className="text-xl md:text-2xl font-bold truncate">{item.ticker}</p>
                                  <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">{item.tipo}</Badge>
                                    {item.score?.recomendacao ? (
                                      <RecommendationBadge 
                                        recomendacao={item.score.recomendacao}
                                        getRecommendationColor={getRecommendationColor}
                                        className="text-xs"
                                      />
                                    ) : (
                                      <Badge className={`text-xs ${getRecommendationColor('manter')}`}>
                                        Analisar
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <span className="text-yellow-600 font-bold text-sm">
                                      {item.oportunidade.principal.score.toFixed(0)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">Score IA</p>
                                </div>
                              </div>
                              
                              <div className="space-y-3 md:space-y-4">
                                {/* Métricas Principais */}
                                <div className="grid grid-cols-2 gap-3 md:gap-4 text-sm">
                                  <div>
                                    <p className="text-xs md:text-sm text-muted-foreground">Rentabilidade</p>
                                    <p className={`text-sm md:text-base font-semibold ${getVariationColor(item.rentabilidade_percentual)}`}>
                                      {item.rentabilidade_percentual.toFixed(1)}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs md:text-sm text-muted-foreground">Valor Atual</p>
                                    <p className="text-sm md:text-base font-semibold truncate">{formatCurrency(item.valor_atual)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs md:text-sm text-muted-foreground">Oportunidades</p>
                                    <p className="text-sm md:text-base font-semibold">{item.oportunidade.total}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs md:text-sm text-muted-foreground">Score Geral</p>
                                    <div className={`inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs font-bold ${getScoreGrade(item.score?.percentual || 0).bg} ${getScoreGrade(item.score?.percentual || 0).color}`}>
                                      {getScoreGrade(item.score?.percentual || 0).grade}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Detalhamento do Score IA */}
                                {item.score?.detalhamento && (
                                  <div className="pt-3 border-t">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Critérios de Avaliação</h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      {item.score.detalhamento.oportunidade_preco && (
                                        <div className="p-2 bg-gray-50 rounded">
                                          <p className="text-muted-foreground">Oportunidade de Preço</p>
                                          <p className="font-semibold">{item.score.detalhamento.oportunidade_preco.pontos} pts</p>
                                          <p className="text-xs text-muted-foreground">{item.score.detalhamento.oportunidade_preco.nivel}</p>
                                        </div>
                                      )}
                                      {item.score.detalhamento.pvp_favoravel && (
                                        <div className="p-2 bg-gray-50 rounded">
                                          <p className="text-muted-foreground">P/VP</p>
                                          <p className="font-semibold">{item.score.detalhamento.pvp_favoravel.pontos} pts</p>
                                          <p className="text-xs text-muted-foreground">P/VP: {item.score.detalhamento.pvp_favoravel.pvp}</p>
                                        </div>
                                      )}
                                      {item.score.detalhamento.diversificacao_setorial && (
                                        <div className="p-2 bg-gray-50 rounded">
                                          <p className="text-muted-foreground">Diversificação</p>
                                          <p className="font-semibold">{item.score.detalhamento.diversificacao_setorial.pontos} pts</p>
                                          <p className="text-xs text-muted-foreground">{item.score.detalhamento.diversificacao_setorial.nivel}</p>
                                        </div>
                                      )}
                                      {item.score.detalhamento.posicionamento_tecnico && (
                                        <div className="p-2 bg-gray-50 rounded">
                                          <p className="text-muted-foreground">Posição Técnica</p>
                                          <p className="font-semibold">{item.score.detalhamento.posicionamento_tecnico.pontos} pts</p>
                                          <p className="text-xs text-muted-foreground">{item.score.detalhamento.posicionamento_tecnico.posicao}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Tendências e Análise Técnica */}
                                {(item.tendencia_7_dias || item.tendencia_14_dias || item.tendencia_30_dias || item.dados_mercado) && (
                                  <div className="pt-3 border-t space-y-3">
                                    <h4 className="text-xs md:text-sm font-medium text-gray-700">Análise de Tendências</h4>
                                    
                                    {(item.tendencia_7_dias || item.tendencia_14_dias || item.tendencia_30_dias) && (
                                      <div className="grid grid-cols-3 gap-1 md:gap-2 text-xs">
                                        {item.tendencia_7_dias && (
                                          <div className="text-center p-1 md:p-2 bg-gray-50 rounded">
                                            <p className="text-muted-foreground text-xs">7d</p>
                                            <p className={`text-xs md:text-sm font-semibold ${getVariationColor(item.tendencia_7_dias.variacao_7d)}`}>
                                              {item.tendencia_7_dias.variacao_7d.toFixed(1)}%
                                            </p>
                                          </div>
                                        )}
                                        {item.tendencia_14_dias && (
                                          <div className="text-center p-1 md:p-2 bg-gray-50 rounded">
                                            <p className="text-muted-foreground text-xs">14d</p>
                                            <p className={`text-xs md:text-sm font-semibold ${getVariationColor(item.tendencia_14_dias.variacao_14d)}`}>
                                              {item.tendencia_14_dias.variacao_14d.toFixed(1)}%
                                            </p>
                                          </div>
                                        )}
                                        {item.tendencia_30_dias && (
                                          <div className="text-center p-1 md:p-2 bg-gray-50 rounded">
                                            <p className="text-muted-foreground text-xs">30d</p>
                                            <p className={`text-xs md:text-sm font-semibold ${getVariationColor(item.tendencia_30_dias.variacao_30d)}`}>
                                              {item.tendencia_30_dias.variacao_30d.toFixed(1)}%
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {item.dados_mercado && (
                                      <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs">
                                        {item.dados_mercado.preco_minimo && (
                                          <div>
                                            <p className="text-muted-foreground text-xs">Preço Mín.</p>
                                            <p className="text-xs md:text-sm font-semibold text-red-600 truncate">{formatCurrency(item.dados_mercado.preco_minimo.valor)}</p>
                                          </div>
                                        )}
                                        {item.dados_mercado.preco_maximo && (
                                          <div>
                                            <p className="text-muted-foreground text-xs">Preço Máx.</p>
                                            <p className="text-xs md:text-sm font-semibold text-green-600 truncate">{formatCurrency(item.dados_mercado.preco_maximo.valor)}</p>
                                          </div>
                                        )}
                                        {item.dados_mercado.volatilidade && (
                                          <div>
                                            <p className="text-muted-foreground text-xs">Volatilidade</p>
                                            <p className="text-xs md:text-sm font-semibold">{item.dados_mercado.volatilidade.toFixed(1)}%</p>
                                          </div>
                                        )}
                                        {item.dados_mercado.volume_medio && (
                                          <div>
                                            <p className="text-muted-foreground text-xs">Volume</p>
                                            <p className="text-xs md:text-sm font-semibold truncate">{formatCurrency(item.dados_mercado.volume_medio)}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </InvestmentPremiumGuard>
    </TooltipProvider>
  );
}
