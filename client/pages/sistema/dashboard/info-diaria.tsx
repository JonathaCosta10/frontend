import { useState, useEffect, useMemo, useCallback } from "react";
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
import ReactCountryFlag from "react-country-flag";

// Componente otimizado para lazy loading de imagens
const LazyImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`${className} relative overflow-hidden`}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
          Erro
        </div>
      )}
    </div>
  );
};
// Import das funções básicas necessárias
import {
  isMobileDevice
} from "../../../lib/marketInsights";

// Interfaces para a nova estrutura de dados da API Real
interface ApiInsightsResponse {
  insights_mercado: {
    titulo: string;
    ultima_atualizacao: string;
    maiores_volumes: {
      titulo: string;
      acoes: {
        titulo: string;
        "1D": ApiMarketItem[];
        "7D": ApiMarketItem[];
        "30D": ApiMarketItem[];
      };
      fiis: {
        titulo: string;
        "1D": ApiMarketItem[];
        "7D": ApiMarketItem[];
        "30D": ApiMarketItem[];
      };
    };
    maiores_altas: {
      titulo: string;
      acoes: {
        titulo: string;
        "1D": ApiMarketItem[];
        "7D": ApiMarketItem[];
        "30D": ApiMarketItem[];
      };
      fiis: {
        titulo: string;
        "1D": ApiMarketItem[];
        "7D": ApiMarketItem[];
        "30D": ApiMarketItem[];
      };
    };
    maiores_baixas: {
      titulo: string;
      acoes: {
        titulo: string;
        "1D": ApiMarketItem[];
        "7D": ApiMarketItem[];
        "30D": ApiMarketItem[];
      };
      fiis: {
        titulo: string;
        "1D": ApiMarketItem[];
        "7D": ApiMarketItem[];
        "30D": ApiMarketItem[];
      };
    };
    estatisticas: {
      [key: string]: number;
    };
  };
}

interface ApiMarketItem {
  ticker: string;
  tipo: "ACAO" | "FII";
  volume?: string;
  ultimo_preco: string;
  data: string;
  fonte: string;
  variacao?: {
    valor: string;
    cor: "green" | "red";
    simbolo: "" | "+" | "-";
  };
}

// Interface simplificada para dados processados
interface ProcessedMarketInsight {
  ticker: string;
  tipo: "ACAO" | "FII";
  ultimo_preco: string;
  volume?: string;
  variacao?: {
    valor: string;
    cor: "green" | "red";
    simbolo: string;
  };
  data: string;
  fonte: string;
}

// Interface para dados organizados por categoria
interface OrganizedInsightsData {
  titulo: string;
  ultima_atualizacao: string;
  maiores_volumes: {
    acoes: { [key: string]: ProcessedMarketInsight[] };
    fiis: { [key: string]: ProcessedMarketInsight[] };
  };
  maiores_altas: {
    acoes: { [key: string]: ProcessedMarketInsight[] };
    fiis: { [key: string]: ProcessedMarketInsight[] };
  };
  maiores_baixas: {
    acoes: { [key: string]: ProcessedMarketInsight[] };
    fiis: { [key: string]: ProcessedMarketInsight[] };
  };
}
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

// Tipos e helpers para países
type Iso2 = "US" | "BR" | "GB" | "JP" | "CN" | "IN" | "DE" | "MX" | "GLB";

const COUNTRY_STYLES: Record<Iso2, { name: string; primary: string; header: string; border: string }> = {
  US: { name: "Estados Unidos", primary: "#0A3161", header: "#B31942", border: "#FFFFFF" },
  BR: { name: "Brasil",         primary: "#009C3B", header: "#FFDF00", border: "#002776" },
  GB: { name: "Reino Unido",    primary: "#012169", header: "#C8102E", border: "#FFFFFF" },
  JP: { name: "Japão",          primary: "#FFFFFF", header: "#BC002D", border: "#000000" },
  CN: { name: "China",          primary: "#DE2910", header: "#FFDE00", border: "#FFFFFF" },
  IN: { name: "Índia",          primary: "#FF9933", header: "#138808", border: "#000080" },
  DE: { name: "Alemanha",       primary: "#000000", header: "#DD0000", border: "#FFCE00" },
  MX: { name: "México",         primary: "#006847", header: "#C8102E", border: "#FFFFFF" },
  GLB:{ name: "Internacional",  primary: "#111827", header: "#F59E0B", border: "#10B981" },
};

// Heurísticas para descobrir o país
function resolveCountry(item: {
  ticker?: string;
  nome_companhia?: string;
  icone?: string;
  source?: string;
}): Iso2 {
  const t = (item.ticker || "").toUpperCase();
  const nome = (item.nome_companhia || "").toUpperCase();

  // Brasil (incluindo USDT como cotação brasileira)
  if (t === "IBOVA11" || t === "IFIX" || t === "EWZ" || t === "USDT" || nome.includes("BRASIL") || nome.includes("(BR)")) return "BR";

  // Cripto / global (exceto USDT que agora é Brasil)
  if (["BTC", "ETH"].includes(t)) return "GLB";

  // EUA (índices principais)
  if (["SPY", "QQQ", "DIA", "^DJI", "^IXIC", "^GSPC"].includes(t) || nome.includes("DOW JONES") || nome.includes("NASDAQ") || nome.includes("S&P 500") || nome.includes("(EUA")) return "US";

  // Reino Unido
  if (nome.includes("REINO UNIDO") || t === "EWU" || t === "VUKE.L") return "GB";

  // Japão
  if (nome.includes("JAPÃO") || t === "EWJ") return "JP";

  // China
  if (nome.includes("CHINA") || t === "FXI") return "CN";

  // Índia
  if (nome.includes("ÍNDIA") || t === "INDA") return "IN";

  // Alemanha
  if (nome.includes("ALEMANHA") || t === "EWG") return "DE";

  // México
  if (nome.includes("MÉXICO") || t === "EWW") return "MX";

  return "GLB";
}

function getCountryStyle(item: any) {
  const iso = resolveCountry(item);
  return { iso, ...COUNTRY_STYLES[iso] };
}

// Função para verificar se o ativo deve mostrar indicador "live"
function shouldShowLiveIndicator(ticker: string): boolean {
  const t = (ticker || "").toUpperCase();
  return ["BTC", "ETH", "USDT"].includes(t);
}

// Função para ordenar os dados por ordem específica solicitada
function sortMarketDataByCountry(data: MarketIndex[]) {
  return data.sort((a, b) => {
    const tickerA = (a.ticker || "").toUpperCase();
    const tickerB = (b.ticker || "").toUpperCase();
    
    // Ordem específica solicitada:
    // 1ª linha: IBOVA11, IFIX, USDT, BTC
    // 2ª linha: Dow Jones, Nasdaq, S&P 500, ETH
    // 3ª linha: Alemanha, China, Japão, México
    // 4ª linha: India, Reino Unido, EWZ
    
    const orderMap: Record<string, number> = {
      // Primeira linha
      'IBOVA11': 1,
      'IFIX': 2,
      'USDT': 3,
      'BTC': 4,
      
      // Segunda linha
      '^DJI': 5, // Dow Jones
      '^IXIC': 6, // Nasdaq
      '^GSPC': 7, // S&P 500
      'ETH': 8,
      
      // Terceira linha - índices representativos de cada país
      'EWG': 9, // Alemanha
      'FXI': 10, // China
      'EWJ': 11, // Japão
      'EWW': 12, // México
      
      // Quarta linha
      'INDA': 13, // Índia
      'EWU': 14, // Reino Unido
      'EWZ': 15, // Brasil EWZ
    };
    
    // Buscar também por nomes das empresas para casos especiais
    const getOrderByName = (item: MarketIndex): number => {
      const nome = (item.nome_companhia || "").toUpperCase();
      
      if (nome.includes("DOW JONES")) return 5;
      if (nome.includes("NASDAQ")) return 6;
      if (nome.includes("S&P 500")) return 7;
      if (nome.includes("ALEMANHA")) return 9;
      if (nome.includes("CHINA")) return 10;
      if (nome.includes("JAPÃO")) return 11;
      if (nome.includes("MÉXICO")) return 12;
      if (nome.includes("ÍNDIA")) return 13;
      if (nome.includes("REINO UNIDO")) return 14;
      
      return 999; // Outros vão para o final
    };
    
    const orderA = orderMap[tickerA] || getOrderByName(a);
    const orderB = orderMap[tickerB] || getOrderByName(b);
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // Se mesma ordem, ordena por nome da empresa
    return a.nome_companhia.localeCompare(b.nome_companhia);
  });
}

// Interfaces para os novos dados
interface MarketIndex {
  ticker: string;
  nome_companhia: string;
  icone: string;
  ultimo_preco: string;
  ultimo_preco_brl?: string; // Opcional para cryptos
  variacao: {
    valor: string;
    cor: string;
    simbolo: string;
  };
  source: string;
}

interface MarketIndicesResponse {
  mercado_semanal: {
    titulo: string;
    ultima_atualizacao: string;
    dados: MarketIndex[];
    fontes: Record<string, string>;
    estatisticas: {
      total_etfs_alpha: number;
      total_etfs_b3: number;
      total_cryptos: number;
      total_itens: number;
    };
  };
}

interface MarketInsightsResponse {
  insights_mercado: NewMarketInsightsData;
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
  const { t } = useTranslation();
  const { user } = useAuth();
  const today = new Date();

  // States
  const [activeTab, setActiveTab] = useState("influencers");
  const [favoriteInfluencers, setFavoriteInfluencers] = useState<Set<string>>(new Set());
  const [currentInfluencerIndex, setCurrentInfluencerIndex] = useState(0);
  
  // Estados para dados dos índices de mercado
  const [marketIndicesData, setMarketIndicesData] = useState<MarketIndex[]>([]);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(true);

  // Estados para os novos insights de mercado
  const [marketInsightsData, setMarketInsightsData] = useState<OrganizedInsightsData | null>(null);
  const [isLoadingInsightsData, setIsLoadingInsightsData] = useState(true);

  // Cache simples para melhorar performance
  const [dataCache, setDataCache] = useState<Map<string, OrganizedInsightsData>>(new Map());

  // Estados para controle da interface dos insights
  const [selectedCategory, setSelectedCategory] = useState<"maiores_volumes" | "maiores_altas" | "maiores_baixas">("maiores_volumes");
  const [selectedAssetType, setSelectedAssetType] = useState<"acoes" | "fiis">("acoes");
  const [selectedPeriod, setSelectedPeriod] = useState<"1D" | "7D" | "30D">("1D");
  const [currentPage, setCurrentPage] = useState(0);

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
        // Verificar diferentes estruturas possíveis de resposta - a API retorna mercado_semanal.dados
        const indicesData = data.mercado_semanal?.dados || data.indices_mercado?.dados || data.dados || data;
        
        console.log("✅ Dados dos índices processados:", {
          temMercadoSemanal: !!data.mercado_semanal,
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
          setMarketIndicesData([]); // Array vazio se não houver dados da API
        }
      } else {
        console.warn("⚠️ Falha ao carregar dados da API");
        setMarketIndicesData([]); // Array vazio se não houver dados da API
      }
    } catch (error) {
      console.error("❌ Erro ao conectar com a API:", error);
      setMarketIndicesData([]); // Array vazio se houver erro na API
    } finally {
      setIsLoadingMarketData(false);
    }
  };

// Função para processar dados da API Real
const processApiInsights = (apiData: ApiInsightsResponse): OrganizedInsightsData => {
  console.log("🔄 Processando estrutura da API Real:", apiData);
  
  try {
    const insights = apiData.insights_mercado;
    
    const processItems = (items: ApiMarketItem[]): ProcessedMarketInsight[] => {
      return items
        .filter(item => item && item.ticker) // Filtrar items válidos
        .map(item => ({
          ticker: item.ticker,
          tipo: item.tipo,
          ultimo_preco: item.ultimo_preco,
          volume: item.volume,
          variacao: item.variacao,
          data: item.data,
          fonte: item.fonte
        }));
    };

    const result: OrganizedInsightsData = {
      titulo: insights.titulo,
      ultima_atualizacao: insights.ultima_atualizacao,
      maiores_volumes: {
        acoes: {
          "1D": processItems(insights.maiores_volumes.acoes["1D"]),
          "7D": processItems(insights.maiores_volumes.acoes["7D"]),
          "30D": processItems(insights.maiores_volumes.acoes["30D"])
        },
        fiis: {
          "1D": processItems(insights.maiores_volumes.fiis["1D"]),
          "7D": processItems(insights.maiores_volumes.fiis["7D"]),
          "30D": processItems(insights.maiores_volumes.fiis["30D"])
        }
      },
      maiores_altas: {
        acoes: {
          "1D": processItems(insights.maiores_altas.acoes["1D"]),
          "7D": processItems(insights.maiores_altas.acoes["7D"]),
          "30D": processItems(insights.maiores_altas.acoes["30D"])
        },
        fiis: {
          "1D": processItems(insights.maiores_altas.fiis["1D"]),
          "7D": processItems(insights.maiores_altas.fiis["7D"]),
          "30D": processItems(insights.maiores_altas.fiis["30D"])
        }
      },
      maiores_baixas: {
        acoes: {
          "1D": processItems(insights.maiores_baixas.acoes["1D"]),
          "7D": processItems(insights.maiores_baixas.acoes["7D"]),
          "30D": processItems(insights.maiores_baixas.acoes["30D"])
        },
        fiis: {
          "1D": processItems(insights.maiores_baixas.fiis["1D"]),
          "7D": processItems(insights.maiores_baixas.fiis["7D"]),
          "30D": processItems(insights.maiores_baixas.fiis["30D"])
        }
      }
    };

    console.log("✅ Processamento concluído:", {
      titulo: result.titulo,
      atualizacao: result.ultima_atualizacao,
      volumesAcoes1D: result.maiores_volumes.acoes["1D"].length,
      altasAcoes1D: result.maiores_altas.acoes["1D"].length
    });

    return result;
  } catch (error) {
    console.error("❌ Erro no processamento:", error);
    throw error;
  }
};

// Função otimizada para buscar insights de mercado
const fetchMarketInsights = useCallback(async () => {
  try {
    // Verificar cache primeiro
    const cacheKey = 'market_insights_v2';
    const cachedData = dataCache.get(cacheKey);
    
    if (cachedData) {
      console.log("📦 Usando dados do cache");
      setMarketInsightsData(cachedData);
      setIsLoadingInsightsData(false);
      return;
    }

    setIsLoadingInsightsData(true);
    
    console.log("🔄 Buscando insights de mercado via API...");
    
    const data = await infoDailyApi.getMarketInsights();
    
    console.log("📋 Resposta da API:", data);
    
    if (data && data.insights_mercado) {
      console.log("� Estrutura da API detectada");
      const processedData = processApiInsights(data as ApiInsightsResponse);
      
      setMarketInsightsData(processedData);
      
      // Salvar no cache
      const newCache = new Map(dataCache);
      newCache.set(cacheKey, processedData);
      setDataCache(newCache);
      
      console.log("✅ Insights carregados com sucesso");
    } else {
      console.warn("⚠️ API não retornou dados válidos");
      // Criar dados fallback vazios mas com estrutura correta
      const fallbackData: OrganizedInsightsData = {
        titulo: "Insights de Mercado",
        ultima_atualizacao: new Date().toLocaleString(),
        maiores_volumes: {
          acoes: { "1D": [], "7D": [], "30D": [] },
          fiis: { "1D": [], "7D": [], "30D": [] }
        },
        maiores_altas: {
          acoes: { "1D": [], "7D": [], "30D": [] },
          fiis: { "1D": [], "7D": [], "30D": [] }
        },
        maiores_baixas: {
          acoes: { "1D": [], "7D": [], "30D": [] },
          fiis: { "1D": [], "7D": [], "30D": [] }
        }
      };
      setMarketInsightsData(fallbackData);
    }
  } catch (error) {
    console.error("❌ Erro ao buscar insights:", error);
    // Em caso de erro, criar estrutura vazia
    const errorData: OrganizedInsightsData = {
      titulo: "Insights de Mercado",
      ultima_atualizacao: "Dados indisponíveis",
      maiores_volumes: {
        acoes: { "1D": [], "7D": [], "30D": [] },
        fiis: { "1D": [], "7D": [], "30D": [] }
      },
      maiores_altas: {
        acoes: { "1D": [], "7D": [], "30D": [] },
        fiis: { "1D": [], "7D": [], "30D": [] }
      },
      maiores_baixas: {
        acoes: { "1D": [], "7D": [], "30D": [] },
        fiis: { "1D": [], "7D": [], "30D": [] }
      }
    };
    setMarketInsightsData(errorData);
  } finally {
    setIsLoadingInsightsData(false);
  }
}, [dataCache]);

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
  }, [user, fetchMarketInsights]); // Depende do usuário e da função de busca

  // Função para resetar página quando mudança de categoria/filtro
  const resetPage = () => {
    setCurrentPage(0);
  };

  // Dados atuais dos insights com memoização
  const currentInsightData = useMemo(() => {
    if (!marketInsightsData) return [];
    
    try {
      const categoryData = marketInsightsData[selectedCategory];
      const assetTypeData = categoryData[selectedAssetType];
      const periodData = assetTypeData[selectedPeriod];
      
      return periodData || [];
    } catch (error) {
      console.error("❌ Erro ao obter dados dos insights:", error);
      return [];
    }
  }, [marketInsightsData, selectedCategory, selectedAssetType, selectedPeriod]);

  // Função otimizada para navegar entre páginas usando useCallback
  const navigatePage = useCallback((direction: 'prev' | 'next', totalPages: number) => {
    if (direction === 'prev' && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage]);

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

  // Reset page quando muda categoria, período ou tipo de ativo (com debounce para performance)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      resetPage();
    }, 100); // Debounce de 100ms para evitar múltiplos resets rápidos

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, selectedPeriod, selectedAssetType]);

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
        </div>
      </div>

      {/* Seção: Índices e Mercado */}
      <div className="grid grid-cols-1 gap-6">
        {/* Índices e Mercado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Mercado Semanal - Visão Global</span>
              </div>
              {marketIndicesData.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {marketIndicesData.length} ativos
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingMarketData ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Carregando dados dos índices...</div>
              </div>
            ) : marketIndicesData.length > 0 ? (
              <div className="space-y-3">
                <div className={`grid gap-3 ${window.innerWidth < 768 ? 'grid-cols-2' : 'grid-cols-4'}`}>
                  {sortMarketDataByCountry(marketIndicesData).map((index, idx) => {
                    const { iso, name, primary, header, border } = getCountryStyle(index);
                    const varUp = index.variacao?.simbolo === "+";
                    const varColor = varUp ? "text-emerald-600" : "text-red-600";
                    const badgeBg = varUp ? "bg-emerald-100" : "bg-red-100";
                    const showLive = shouldShowLiveIndicator(index.ticker);

                    return (
                      <div
                        key={idx}
                        className="rounded-lg overflow-hidden border shadow-sm h-48 flex flex-col"
                        style={{ borderColor: border }}
                      >
                        {/* Topo com bandeira + nome do país + live indicator */}
                        <div
                          className="flex items-center justify-center gap-2 py-1.5 text-white font-medium relative"
                          style={{ 
                            backgroundColor: header,
                            color: iso === 'JP' ? '#333' : 'white' // Japão precisa texto escuro
                          }}
                        >
                          <ReactCountryFlag 
                            svg 
                            countryCode={iso === "GLB" ? "UN" : iso} 
                            style={{ fontSize: '1em' }}
                          />
                          <span className="text-xs">{name}</span>
                          {showLive && (
                            <div className="absolute right-2 top-1 flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></div>
                              <span className="text-xs font-bold">LIVE</span>
                            </div>
                          )}
                        </div>

                        {/* Corpo do card com cor sólida */}
                        <div 
                          className="p-3 flex-1 flex flex-col" 
                          style={{ 
                            backgroundColor: primary,
                            color: iso === 'JP' ? '#333' : 'white' // Japão precisa texto escuro
                          }}
                        >
                          <div className="rounded-md bg-white/95 p-3 flex-1 flex flex-col justify-center">
                            {/* Nome da companhia (sem ticker) */}
                            <h4 className="text-xs font-semibold text-gray-800 text-center mb-2 leading-tight">
                              {index.nome_companhia}
                            </h4>

                            {/* Preço principal */}
                            <div className="text-center mb-2">
                              <div className="text-xs text-gray-500 mb-1">Preço</div>
                              <div className="text-lg font-bold text-gray-900">
                                {index.ultimo_preco}
                              </div>
                            </div>

                            {/* Preço BRL (quando existir) */}
                            {index.ultimo_preco_brl && (
                              <div className="text-center mb-2">
                                <div className="text-xs text-gray-500 mb-1">BRL</div>
                                <div className="text-xs text-gray-600">
                                  {index.ultimo_preco_brl}
                                </div>
                              </div>
                            )}

                            {/* Variação 7D */}
                            <div className="text-center pt-2 border-t border-gray-200">
                              <div className="text-xs text-gray-500 mb-1">Variação 7D</div>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeBg} ${varColor}`}>
                                {varUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {index.variacao?.valor}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Dados indisponíveis</h3>
                  <p className="text-muted-foreground">
                    Os dados do mercado não estão disponíveis no momento. Tente novamente mais tarde.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights de Mercado - Versão Reescrita */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <CardTitle>
                {marketInsightsData?.titulo || "Insights de Mercado"}
              </CardTitle>
              {marketInsightsData?.ultima_atualizacao && (
                <span className="text-sm text-muted-foreground ml-2">
                  • {marketInsightsData.ultima_atualizacao}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Tabs para Período */}
              <Tabs 
                value={selectedPeriod} 
                onValueChange={(value) => {
                  setSelectedPeriod(value as "1D" | "7D" | "30D");
                  resetPage();
                }} 
                className="w-auto"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="1D">1D</TabsTrigger>
                  <TabsTrigger value="7D">7D</TabsTrigger>
                  <TabsTrigger value="30D">30D</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Tabs para Tipo de Ativo */}
              <Tabs 
                value={selectedAssetType} 
                onValueChange={(value) => {
                  setSelectedAssetType(value as "acoes" | "fiis");
                  resetPage();
                }} 
                className="w-auto"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="acoes">
                    <Building2 className="h-4 w-4 mr-1" />
                    Ações
                  </TabsTrigger>
                  <TabsTrigger value="fiis">
                    <Home className="h-4 w-4 mr-1" />
                    FIIs
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Tabs para Categoria */}
              <Tabs 
                value={selectedCategory} 
                onValueChange={(value) => {
                  setSelectedCategory(value as "maiores_volumes" | "maiores_altas" | "maiores_baixas");
                  resetPage();
                }} 
                className="w-auto"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="maiores_volumes">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Volumes
                  </TabsTrigger>
                  <TabsTrigger value="maiores_altas">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Altas
                  </TabsTrigger>
                  <TabsTrigger value="maiores_baixas">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    Baixas
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingInsightsData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Carregando insights de mercado...</div>
              </div>
              {/* Loading skeleton */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="p-4 border rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {(() => {
                const itemsPerPage = isMobile ? 3 : 5;
                const startIndex = currentPage * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedData = currentInsightData.slice(startIndex, endIndex);
                const totalPages = Math.ceil(currentInsightData.length / itemsPerPage);

                return (
                  <div className="space-y-4">
                    {/* Header com navegação */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {selectedCategory === 'maiores_volumes' && 'Maiores Volumes de Negociação'}
                        {selectedCategory === 'maiores_altas' && 'Maiores Altas'}
                        {selectedCategory === 'maiores_baixas' && 'Maiores Baixas'}
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          ({selectedAssetType === 'acoes' ? 'Ações' : 'FIIs'} - {selectedPeriod})
                        </span>
                      </h3>
                      {totalPages > 1 && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {currentPage + 1} de {totalPages}
                          </span>
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigatePage('prev', totalPages)}
                              disabled={currentPage === 0}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigatePage('next', totalPages)}
                              disabled={currentPage === totalPages - 1}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Grid de dados */}
                    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 md:grid-cols-5'}`}>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((item, index) => {
                          if (!item || !item.ticker) {
                            return null;
                          }
                          
                          const ticker = item.ticker;
                          const tipo = item.tipo;
                          const fonte = item.fonte;
                          const ultimo_preco = item.ultimo_preco;
                          const volume = item.volume;
                          const variacao = item.variacao;
                          
                          return (
                            <div key={`${ticker}-${index}-${selectedPeriod}`} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <div className="font-medium text-sm">{ticker}</div>
                                  <Badge variant="outline" className="text-xs">
                                    {tipo} • {fonte}
                                  </Badge>
                                </div>
                              </div>
                              <div className="space-y-2 text-sm">
                                {selectedCategory === 'maiores_volumes' && volume && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Volume:</span>
                                    <span className="font-medium">{volume}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Preço:</span>
                                  <span className="font-medium">{ultimo_preco}</span>
                                </div>
                                {variacao && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">{selectedPeriod}:</span>
                                    <span className={`flex items-center font-medium ${
                                      variacao.cor === 'green' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {variacao.cor === 'green' ? (
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                      ) : (
                                        <TrendingDown className="h-3 w-3 mr-1" />
                                      )}
                                      {variacao.simbolo}{variacao.valor}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }).filter(Boolean)
                      ) : (
                        <div className="col-span-full p-6 text-center text-muted-foreground border rounded-lg">
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Nenhum dado disponível para esta combinação de filtros.</p>
                          <p className="text-xs mt-1">
                            {selectedCategory.replace(/_/g, ' ')} • {selectedAssetType === 'acoes' ? 'Ações' : 'FIIs'} • {selectedPeriod}
                          </p>
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
          {!isPremium ? (
            <div className="text-center p-6">
              <Users className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Recurso Premium</h3>
              <p className="text-muted-foreground mb-4">
                Acesse nossa rede de especialistas, influencers e consultores financeiros
              </p>
              <Button variant="default">
                Se torne Premium
              </Button>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
