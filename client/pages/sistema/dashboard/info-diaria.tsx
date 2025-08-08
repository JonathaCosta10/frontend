import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../../contexts/TranslationContext";
import { useAuth } from "../../../contexts/AuthContext";
import { localStorageManager } from "../../../lib/localStorage";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
// Novo import do serviço infoDailyApi
import { infoDailyApi } from "../../../services/api/infoDaily";
import { useProfileVerification } from "../../../hooks/useProfileVerification";
import {
  Calendar,
  BarChart3,
  Star,
  Edit,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  ExternalLink,
  Briefcase,
  Youtube,
  Instagram,
  ChevronLeft,
  ChevronRight,
  Building2,
  Home,
  DollarSign,
  Bitcoin,
  Coins,
} from "lucide-react";

// Interfaces para os novos dados
interface MarketIndex {
  codigo: string;
  nome: string;
  icone: string;
  fechamento: string;
  variacao_semanal: {
    valor: string;
    cor: string;
    simbolo: string;
  };
}

interface MarketIndicesResponse {
  indices_mercado: {
    titulo: string;
    ultima_atualizacao: string;
    dados: MarketIndex[];
  };
}

interface MarketInsightTicker {
  ticker: string;
  nome_companhia: string;
  volume_diario?: string;
  ultimo_preco: string;
  data: string;
  variacao: {
    valor: string;
    cor: string;
    simbolo: string;
  };
}

interface MarketInsightsData {
  titulo: string;
  ultima_atualizacao: string;
  maiores_volumes_negociacao: {
    titulo: string;
    "1D": MarketInsightTicker[];
    "7D": MarketInsightTicker[];
    "1M": MarketInsightTicker[];
  };
  variacao_portfolio: {
    titulo: string;
    "1D": MarketInsightTicker[];
    "7D": MarketInsightTicker[];
    "1M": MarketInsightTicker[];
  };
  oportunidades_preco_medio: {
    titulo: string;
    "1D": MarketInsightTicker[];
    "7D": MarketInsightTicker[];
    "1M": MarketInsightTicker[];
  };
}

interface MarketInsightsResponse {
  insights_mercado: MarketInsightsData;
}

interface WishlistAsset {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface MarketInsight {
  title: string;
  assets: {
    symbol: string;
    name: string;
    volume: number;
    price: number;
    change1d: number;
    change7d: number;
    change1m: number;
  }[];
}

interface Influencer {
  id: string;
  name: string;
  expertise: string;
  avatar: string;
  imageUrl: string;
  youtube?: string;
  instagram?: string;
  description: string;
  followers: string;
}

export default function InformacoesSemanais() {
  const { t, formatCurrency } = useTranslation();
  const { user } = useAuth();
  const today = new Date();

  // States
  const [activeTab, setActiveTab] = useState("influencers");
  const [favoriteInfluencers, setFavoriteInfluencers] = useState<Set<string>>(new Set());
  const [currentInfluencerIndex, setCurrentInfluencerIndex] = useState(0);
  const [insightsPeriod, setInsightsPeriod] = useState<"1D" | "7D" | "1M">("1D");
  const [marketIndicesData, setMarketIndicesData] = useState<MarketIndex[]>([]);
  const [marketInsightsData, setMarketInsightsData] = useState<MarketInsightsData | null>(null);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(true);
  const [isLoadingInsightsData, setIsLoadingInsightsData] = useState(true);
  const [insightsPages, setInsightsPages] = useState<{[key: string]: number}>({
    "Maiores Volumes de Negociação": 0,
    "Variação de Portfólio": 0,
    "Oportunidades Preço Médio": 0
  });

  // Dados mockados como fallback para índices
  const mockMarketIndices: MarketIndex[] = [
    {
      codigo: "ibovespa",
      nome: "Ibovespa",
      icone: "📈",
      fechamento: "R$ 126.845,67",
      variacao_semanal: {
        valor: "+2,1%",
        cor: "green",
        simbolo: "+"
      }
    },
    {
      codigo: "ifix",
      nome: "Ifix",
      icone: "🏢",
      fechamento: "R$ 2.756,32",
      variacao_semanal: {
        valor: "+1,2%",
        cor: "green",
        simbolo: "+"
      }
    },
    {
      codigo: "sp500",
      nome: "S&P 500",
      icone: "🇺🇸",
      fechamento: "US$ 4.567,85",
      variacao_semanal: {
        valor: "+0,8%",
        cor: "green",
        simbolo: "+"
      }
    },
    {
      codigo: "nasdaq",
      nome: "Nasdaq",
      icone: "💻",
      fechamento: "US$ 14.258,30",
      variacao_semanal: {
        valor: "-0,3%",
        cor: "red",
        simbolo: "-"
      }
    },
    {
      codigo: "dolar",
      nome: "Dólar",
      icone: "💵",
      fechamento: "R$ 5,13",
      variacao_semanal: {
        valor: "+0,39%",
        cor: "green",
        simbolo: "+"
      }
    }
  ];

  // Dados mockados como fallback para insights
  const mockMarketInsightsData: MarketInsightsData = {
    titulo: "Insights de Mercado",
    ultima_atualizacao: "2025-08-07T10:30:00Z",
    maiores_volumes_negociacao: {
      titulo: "Maiores Volumes de Negociação",
      "1D": [
        {
          ticker: "BBAS3",
          nome_companhia: "BANCO BRASIL",
          volume_diario: "15.2M",
          ultimo_preco: "R$ 45,32",
          data: "2025-08-07",
          variacao: { valor: "+2,15%", cor: "green", simbolo: "+" }
        }
      ],
      "7D": [],
      "1M": []
    },
    variacao_portfolio: {
      titulo: "Variação de Portfólio",
      "1D": [
        {
          ticker: "WEGE3",
          nome_companhia: "WEG ON",
          volume_diario: "8.2M",
          ultimo_preco: "R$ 45,85",
          data: "2025-08-07",
          variacao: { valor: "+5,2%", cor: "green", simbolo: "+" }
        }
      ],
      "7D": [],
      "1M": []
    },
    oportunidades_preco_medio: {
      titulo: "Oportunidades Preço Médio",
      "1D": [
        {
          ticker: "TIMS3",
          nome_companhia: "TIM ON",
          volume_diario: "15.7M",
          ultimo_preco: "R$ 12,80",
          data: "2025-08-07",
          variacao: { valor: "+3,8%", cor: "green", simbolo: "+" }
        }
      ],
      "7D": [],
      "1M": []
    }
  };

  // Função para carregar índices de mercado
  const fetchMarketIndices = async () => {
    try {
      setIsLoadingMarketData(true);
      
      console.log("🔄 Buscando dados dos índices de mercado via API direta...");
      console.log("📍 Endpoint será:", "/api/infodaily/");
      
      const data = await infoDailyApi.getMarketIndices();
      
      console.log("📋 Resposta da API de índices:", data);
      console.log("🏗️ Estrutura dos dados:", data ? Object.keys(data) : 'Sem dados');
      
      if (data) {
        // Verificar diferentes estruturas possíveis de resposta
        const indicesData = data.indices_mercado?.dados || data.dados || data;
        
        console.log("✅ Dados dos índices processados:", {
          temIndicesMercado: !!data.indices_mercado,
          temDados: !!data.dados,
          tipoIndicesData: Array.isArray(indicesData) ? 'array' : typeof indicesData,
          quantidadeItens: Array.isArray(indicesData) ? indicesData.length : 0,
          estruturaResponse: Object.keys(data),
        });
        
        if (Array.isArray(indicesData) && indicesData.length > 0) {
          console.log("✅ Dados dos índices carregados com sucesso:", indicesData);
          setMarketIndicesData(indicesData);
        } else {
          console.warn("⚠️ Dados dos índices não estão no formato de array ou estão vazios");
          setMarketIndicesData(mockMarketIndices);
        }
      } else {
        console.warn("⚠️ Falha ao carregar dados da API, usando fallback");
        // Usar dados mockados como fallback
        setMarketIndicesData(mockMarketIndices);
      }
    } catch (error) {
      console.error("❌ Erro ao conectar com a API:", error);
      // Usar dados mockados como fallback
      setMarketIndicesData(mockMarketIndices);
    } finally {
      setIsLoadingMarketData(false);
    }
  };

  // Função para buscar insights de mercado
  const fetchMarketInsights = async () => {
    try {
      setIsLoadingInsightsData(true);
      
      console.log("🔄 Buscando dados dos insights de mercado via API direta...");
      console.log("📍 Endpoint será:", "/api/insights-mercado/");
      
      const data = await infoDailyApi.getMarketInsights();
      
      console.log("📋 Resposta da API de insights:", data);
      console.log("🏗️ Estrutura dos dados:", data ? Object.keys(data) : 'Sem dados');
      
      if (data) {
        // Verificar diferentes estruturas possíveis de resposta
        const insightsData = data.insights_mercado || data;
        
        console.log("✅ Dados dos insights processados:", {
          temInsightsMercado: !!data.insights_mercado,
          tipoInsightsData: typeof insightsData,
          estruturaInsights: insightsData ? Object.keys(insightsData) : null,
          estruturaResponse: Object.keys(data),
          maioresVolumes: insightsData?.maiores_volumes_negociacao,
          variacaoPortfolio: insightsData?.variacao_portfolio,
          oportunidadesPreco: insightsData?.oportunidades_preco_medio,
        });
        
        if (insightsData && typeof insightsData === 'object') {
          console.log("✅ Dados dos insights carregados com sucesso:", insightsData);
          setMarketInsightsData(insightsData);
        } else {
          console.warn("⚠️ Dados dos insights não estão no formato esperado");
          setMarketInsightsData(mockMarketInsightsData);
        }
      } else {
        console.warn("⚠️ Falha ao carregar insights da API, usando fallback");
        // Usar dados mockados como fallback
        setMarketInsightsData(mockMarketInsightsData);
      }
    } catch (error) {
      console.error("❌ Erro ao conectar com a API de insights:", error);
      // Usar dados mockados como fallback  
      setMarketInsightsData(mockMarketInsightsData);
    } finally {
      setIsLoadingInsightsData(false);
    }
  };

  // useEffect para buscar dados quando o componente montar ou quando o usuário mudar
  useEffect(() => {
    console.log("🚀 INFO-DIARIA - useEffect executado");
    console.log("👤 Usuário logado:", !!user);
    console.log("📧 Email do usuário:", user?.email);
    
    // Verificar se token existe no localStorage
    const authToken = localStorageManager.getAuthToken();
    console.log("🔑 Token no localStorage:", !!authToken);
    console.log("🔑 Token primeiros 20 chars:", authToken ? authToken.substring(0, 20) + "..." : "Não encontrado");
    
    if (user && authToken) {
      console.log("✅ Usuário autenticado e token disponível - iniciando chamadas");
      fetchMarketIndices();
      fetchMarketInsights();
    } else {
      console.log("⌛ Aguardando autenticação completa...");
      // Tentar com um pequeno atraso para dar tempo de carregar o token se estiver em processo
      setTimeout(() => {
        const delayedToken = localStorageManager.getAuthToken();
        if (delayedToken) {
          console.log("✅ Token encontrado após delay - iniciando chamadas");
          fetchMarketIndices();
          fetchMarketInsights();
        } else {
          console.warn("❌ Não foi possível obter token mesmo após delay");
        }
      }, 500);
    }
  }, [user]); // Depende apenas do usuário

  // Hook para detecção de mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Função para paginar insights com responsividade
  const paginateInsights = (data: MarketInsightTicker[], categoryKey: string) => {
    const currentPage = insightsPages[categoryKey] || 0;
    const itemsPerPage = isMobile ? 3 : 5; // 3 para mobile, 5 para desktop
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Função para navegar entre páginas de insights
  const navigateInsights = (categoryKey: string, direction: 'prev' | 'next', data: MarketInsightTicker[]) => {
    const itemsPerPage = isMobile ? 3 : 5;
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const currentPage = insightsPages[categoryKey] || 0;
    
    let newPage = currentPage;
    if (direction === 'next' && currentPage < totalPages - 1) {
      newPage = currentPage + 1;
    } else if (direction === 'prev' && currentPage > 0) {
      newPage = currentPage - 1;
    }
    
    setInsightsPages(prev => ({
      ...prev,
      [categoryKey]: newPage
    }));
  };

  // Wishlist mock data
  const wishlistAssets: WishlistAsset[] = [
    { symbol: "PETR4", name: "Petrobras PN", currentPrice: 32.45, change: 0.85, changePercent: 2.69, volume: 45820000 },
    { symbol: "VALE3", name: "Vale ON", currentPrice: 68.90, change: -1.20, changePercent: -1.71, volume: 32150000 },
    { symbol: "ITUB4", name: "Itaú Unibanco PN", currentPrice: 28.76, change: 0.45, changePercent: 1.59, volume: 28900000 },
    { symbol: "BBDC4", name: "Bradesco PN", currentPrice: 15.83, change: 0.12, changePercent: 0.76, volume: 22100000 },
  ];

  // Dados dos especialistas
  const consultores = [
    {
      id: "1",
      name: "Roberto Silva CFP",
      expertise: "Planejamento Financeiro",
      avatar: import.meta.env.VITE_AVATAR_IMAGE_1 || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      description: "Especialista em planejamento financeiro pessoal e familiar",
      certification: "CFP",
      rating: 4.9
    },
    {
      id: "2",
      name: "Marina Oliveira CGA",
      expertise: "Investimentos",
      avatar: import.meta.env.VITE_AVATAR_IMAGE_2 || "https://images.unsplash.com/photo-1494790108755-2616b612b898?w=150&h=150&fit=crop&crop=face",
      description: "Gestora de investimentos com foco em renda variável",
      certification: "CGA",
      rating: 4.8
    },
    {
      id: "3",
      name: "Carlos Santos CEA",
      expertise: "Previdência",
      avatar: import.meta.env.VITE_AVATAR_IMAGE_3 || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      description: "Consultor especializado em produtos de previdência",
      certification: "CEA",
      rating: 4.7
    },
    {
      id: "4",
      name: "Julia Costa CGA",
      expertise: "Investimentos",
      avatar: import.meta.env.VITE_AVATAR_IMAGE_4 || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      description: "Especialista em carteiras de investimento diversificadas",
      certification: "CGA",
      rating: 4.8
    }
  ];

  // Hook de verificação do perfil premium
  const { isPaidUser, profile } = useProfileVerification();
  
  // Variáveis do componente
  const isPremium = isPaidUser();
  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Log para depuração do status premium
  useEffect(() => {
    console.log("🔍 Status Premium na Lista de Desejos:", {
      isPremiumDirect: user?.subscription_type === "premium",
      isPremiumFromHook: isPremium,
      profileType: profile?.subscriptionType,
      profileStatus: profile?.subscriptionStatus,
      isPaidUser: isPaidUser()
    });
  }, [user, profile, isPremium]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Informações Semanais</h1>
          <p className="text-muted-foreground">
            Acompanhe os principais indicadores e oportunidades do mercado - {todayFormatted}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-8 w-8 text-muted-foreground" />
          {/* Botões de debug */}
          <Button 
            onClick={async () => {
              console.log("🔄 MANUAL - Forçando busca de índices");
              try {
                setIsLoadingMarketData(true);
                const data = await infoDailyApi.getMarketIndices();
                console.log("📊 MANUAL - Resposta índices:", data);
                
                // Atualizar dados se disponíveis
                if (data) {
                  const indicesData = data.indices_mercado?.dados || data.dados || data;
                  if (Array.isArray(indicesData) && indicesData.length > 0) {
                    setMarketIndicesData(indicesData);
                  }
                }
              } catch (error) {
                console.error("❌ MANUAL - Erro índices:", error);
              } finally {
                setIsLoadingMarketData(false);
              }
            }} 
            variant="outline" 
            size="sm"
          >
            Test Índices
          </Button>
          <Button 
            onClick={async () => {
              console.log("🔄 MANUAL - Forçando busca de insights");
              try {
                setIsLoadingInsightsData(true);
                const data = await infoDailyApi.getMarketInsights();
                console.log("💡 MANUAL - Resposta insights:", data);
                
                // Atualizar dados se disponíveis
                if (data) {
                  const insightsData = data.insights_mercado || data;
                  if (insightsData && typeof insightsData === 'object') {
                    setMarketInsightsData(insightsData);
                  }
                }
              } catch (error) {
                console.error("❌ MANUAL - Erro insights:", error);
              } finally {
                setIsLoadingInsightsData(false);
              }
            }} 
            variant="outline" 
            size="sm"
          >
            Test Insights
          </Button>
        </div>
      </div>

      {/* Primeira seção: Índices e Mercado + WishList */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Índices e Mercado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Índices e Mercado</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingMarketData ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Carregando dados dos índices...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {marketIndicesData.map((index, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{index.icone}</span>
                      <div>
                        <div className="font-medium">{index.nome}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {index.fechamento}
                      </div>
                      <div className="flex items-center justify-end">
                        <span className={`flex items-center text-sm ${index.variacao_semanal.cor === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                          {index.variacao_semanal.cor === 'green' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          Semana: {index.variacao_semanal.simbolo}{index.variacao_semanal.valor}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* WishList */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Lista de Desejos</span>
              </CardTitle>
              {isPremium && (
                <Link to="/dashboard/mercado/lista-de-desejo">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!isPremium ? (
              <div className="text-center p-6">
                <Star className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Recurso Premium</h3>
                <p className="text-muted-foreground mb-4">
                  Acesse sua lista de desejos personalizada e acompanhe seus ativos favoritos
                </p>
                <Button variant="default">
                  Se torne Premium
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {wishlistAssets.map((asset) => (
                  <div key={asset.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{asset.symbol}</div>
                      <div className="text-sm text-muted-foreground">{asset.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(asset.currentPrice)}</div>
                      <div className={`text-sm flex items-center ${asset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {asset.changePercent >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {asset.changePercent}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights de Mercado */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Insights de Mercado</span>
            </CardTitle>
            <Tabs value={insightsPeriod} onValueChange={(value) => setInsightsPeriod(value as "1D" | "7D" | "1M")} className="w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="1D">1D</TabsTrigger>
                <TabsTrigger value="7D">7D</TabsTrigger>
                <TabsTrigger value="1M">1M</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingInsightsData ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Carregando insights de mercado...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Maiores Volumes de Negociação */}
              {(() => {
                const data = marketInsightsData?.maiores_volumes_negociacao?.[insightsPeriod] || mockMarketInsightsData.maiores_volumes_negociacao[insightsPeriod];
                const itemsPerPage = window.innerWidth < 768 ? 3 : 5; // Inline mobile detection
                const currentPage = insightsPages["Maiores Volumes de Negociação"] || 0;
                const totalPages = Math.ceil(data.length / itemsPerPage);
                
                // Inline pagination function
                const startIndex = currentPage * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedData = data.slice(startIndex, endIndex);

                // Inline navigation function
                const navigatePage = (direction: 'prev' | 'next') => {
                  const maxPages = Math.ceil(data.length / itemsPerPage);
                  let newPage = currentPage;
                  
                  if (direction === 'prev' && currentPage > 0) {
                    newPage = currentPage - 1;
                  } else if (direction === 'next' && currentPage < maxPages - 1) {
                    newPage = currentPage + 1;
                  }
                  
                  setInsightsPages(prev => ({
                    ...prev,
                    ["Maiores Volumes de Negociação"]: newPage
                  }));
                };

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Maiores Volumes de Negociação</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {currentPage + 1} de {totalPages}
                        </span>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigatePage('prev')}
                            disabled={currentPage === 0}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigatePage('next')}
                            disabled={currentPage === totalPages - 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className={`grid gap-4 ${window.innerWidth < 768 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 md:grid-cols-5'}`}>
                      {paginatedData.map((ticker, index) => (
                        <div key={`${ticker.ticker}-${index}`} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium">{ticker.ticker}</div>
                              <div className="text-sm text-muted-foreground truncate">{ticker.nome_companhia}</div>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Volume:</span>
                              <span className="font-medium">{ticker.volume_diario}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Preço:</span>
                              <span className="font-medium">{ticker.ultimo_preco}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>{insightsPeriod}:</span>
                              <span className={`flex items-center font-medium ${ticker.variacao.cor === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                                {ticker.variacao.cor === 'green' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {ticker.variacao.simbolo}{ticker.variacao.valor}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Variação de Portfólio */}
              {(() => {
                const data = marketInsightsData?.variacao_portfolio?.[insightsPeriod] || mockMarketInsightsData.variacao_portfolio[insightsPeriod];
                const itemsPerPage = window.innerWidth < 768 ? 3 : 5; // Inline mobile detection
                const currentPage = insightsPages["Variação de Portfólio"] || 0;
                const totalPages = Math.ceil(data.length / itemsPerPage);
                
                // Inline pagination function
                const startIndex = currentPage * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedData = data.slice(startIndex, endIndex);

                // Inline navigation function
                const navigatePage = (direction: 'prev' | 'next') => {
                  const maxPages = Math.ceil(data.length / itemsPerPage);
                  let newPage = currentPage;
                  
                  if (direction === 'prev' && currentPage > 0) {
                    newPage = currentPage - 1;
                  } else if (direction === 'next' && currentPage < maxPages - 1) {
                    newPage = currentPage + 1;
                  }
                  
                  setInsightsPages(prev => ({
                    ...prev,
                    ["Variação de Portfólio"]: newPage
                  }));
                };

                return (
                  <div className="space-y-3 mt-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Variação de Portfólio</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {currentPage + 1} de {totalPages}
                        </span>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigatePage('prev')}
                            disabled={currentPage === 0}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigatePage('next')}
                            disabled={currentPage === totalPages - 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className={`grid gap-4 ${window.innerWidth < 768 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 md:grid-cols-5'}`}>
                      {paginatedData.length > 0 ? paginatedData.map((ticker, index) => (
                        <div key={`${ticker.ticker}-${index}`} className="p-4 border rounded-lg border-l-4 border-l-blue-500">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium">{ticker.ticker}</div>
                              <div className="text-sm text-muted-foreground truncate">{ticker.nome_companhia}</div>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Volume:</span>
                              <span className="font-medium">{ticker.volume_diario}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Preço:</span>
                              <span className="font-medium">{ticker.ultimo_preco}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>{insightsPeriod}:</span>
                              <span className={`flex items-center font-medium ${ticker.variacao.cor === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                                {ticker.variacao.cor === 'green' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {ticker.variacao.simbolo}{ticker.variacao.valor}
                              </span>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="col-span-full p-6 text-center text-muted-foreground border rounded-lg">
                          Nenhum dado disponível para Variação de Portfólio no período selecionado.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Oportunidades Preço Médio */}
              {(() => {
                const data = marketInsightsData?.oportunidades_preco_medio?.[insightsPeriod] || mockMarketInsightsData.oportunidades_preco_medio[insightsPeriod];
                const itemsPerPage = window.innerWidth < 768 ? 3 : 5; // Inline mobile detection
                const currentPage = insightsPages["Oportunidades Preço Médio"] || 0;
                const totalPages = Math.ceil(data.length / itemsPerPage);
                
                // Inline pagination function
                const startIndex = currentPage * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedData = data.slice(startIndex, endIndex);

                // Inline navigation function
                const navigatePage = (direction: 'prev' | 'next') => {
                  const maxPages = Math.ceil(data.length / itemsPerPage);
                  let newPage = currentPage;
                  
                  if (direction === 'prev' && currentPage > 0) {
                    newPage = currentPage - 1;
                  } else if (direction === 'next' && currentPage < maxPages - 1) {
                    newPage = currentPage + 1;
                  }
                  
                  setInsightsPages(prev => ({
                    ...prev,
                    ["Oportunidades Preço Médio"]: newPage
                  }));
                };

                return (
                  <div className="space-y-3 mt-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Oportunidades Preço Médio</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {currentPage + 1} de {totalPages}
                        </span>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigatePage('prev')}
                            disabled={currentPage === 0}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigatePage('next')}
                            disabled={currentPage === totalPages - 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className={`grid gap-4 ${window.innerWidth < 768 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 md:grid-cols-5'}`}>
                      {paginatedData.length > 0 ? paginatedData.map((ticker, index) => (
                        <div key={`${ticker.ticker}-${index}`} className="p-4 border rounded-lg border-l-4 border-l-green-500">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium">{ticker.ticker}</div>
                              <div className="text-sm text-muted-foreground truncate">{ticker.nome_companhia}</div>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Volume:</span>
                              <span className="font-medium">{ticker.volume_diario}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Preço:</span>
                              <span className="font-medium">{ticker.ultimo_preco}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>{insightsPeriod}:</span>
                              <span className={`flex items-center font-medium ${ticker.variacao.cor === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                                {ticker.variacao.cor === 'green' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {ticker.variacao.simbolo}{ticker.variacao.valor}
                              </span>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="col-span-full p-6 text-center text-muted-foreground border rounded-lg">
                          Nenhum dado disponível para Oportunidades Preço Médio no período selecionado.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Influencers e Consultores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Especialistas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="influencers">Influencers</TabsTrigger>
              <TabsTrigger value="consultores">Consultores Financeiros</TabsTrigger>
            </TabsList>
            
            <TabsContent value="influencers" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consultores.map((influencer) => (
                  <div key={influencer.id} className="p-4 border rounded-lg">
                    <div className="flex items-start space-x-4">
                      <img
                        src={influencer.avatar}
                        alt={influencer.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{influencer.name}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newFavorites = new Set(favoriteInfluencers);
                              if (newFavorites.has(influencer.id)) {
                                newFavorites.delete(influencer.id);
                              } else {
                                newFavorites.add(influencer.id);
                              }
                              setFavoriteInfluencers(newFavorites);
                            }}
                          >
                            <Star className={`h-4 w-4 ${favoriteInfluencers.has(influencer.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </Button>
                        </div>
                        <Badge variant="secondary" className="mb-2">{influencer.expertise}</Badge>
                        <p className="text-sm text-muted-foreground mb-3">{influencer.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {influencer.certification}
                            </span>
                            <span className="text-sm font-medium">Rating: {influencer.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="consultores" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consultores.map((consultor) => (
                  <div key={consultor.id} className="p-4 border rounded-lg">
                    <div className="flex items-start space-x-4">
                      <img
                        src={consultor.avatar}
                        alt={consultor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{consultor.name}</h3>
                          <Badge variant="outline">{consultor.certification}</Badge>
                        </div>
                        <Badge variant="secondary" className="mb-2">{consultor.expertise}</Badge>
                        <p className="text-sm text-muted-foreground mb-3">{consultor.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{consultor.rating}</span>
                          </div>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Contatar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center p-6 border-2 border-dashed rounded-lg">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Faça parte da nossa equipe</h3>
                <p className="text-muted-foreground mb-4">
                  Conheça nossas condições e se torne um consultor parceiro
                </p>
                <Link to="/dashboard/info-diaria/join-team">
                  <Button variant="default">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Entre em contato para fazer parte da equipe
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
