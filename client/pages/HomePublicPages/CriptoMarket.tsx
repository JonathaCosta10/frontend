import React, { useState, useEffect } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { cryptoApi, CoinGeckoCrypto } from "@/services/api/crypto";
import { formatCurrency } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Bitcoin,
  Globe,
  Activity,
  BarChart3,
  DollarSign,
  Zap,
  Star,
  Filter,
  Grid3X3,
  List,
  ArrowUpDown,
  LineChart,
  ArrowRight,
  PieChart
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import PublicLayout from "@/components/PublicLayout";

// Interface para resposta da API
interface CryptoApiResponse {
  data: CoinGeckoCrypto[];
  status: {
    elapsed: number;
    timestamp: string;
  };
}

// Interface para estatísticas globais
interface GlobalStats {
  total_market_cap: number;
  total_volume_24h: number;
  btc_dominance: number;
  eth_dominance: number;
  avgChange: number;
}

// Componente para exibir erros de API
const CryptoErrorHandler = ({ error, onRetry, isPending }: { 
  error: string; 
  onRetry: () => void;
  isPending: boolean;
}) => (
  <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-4 mb-6">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">API Error</h3>
        <div className="mt-2 text-sm text-red-700 dark:text-red-300">
          <p>{error}</p>
        </div>
        <div className="mt-4">
          <Button 
            size="sm"
            variant="outline"
            onClick={onRetry}
            disabled={isPending}
            className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
          >
            {isPending ? "Tentando novamente..." : "Tentar novamente"}
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default function CriptoMarket() {
  const { t } = useTranslation();
  const [cryptoAssets, setCryptoAssets] = useState<CoinGeckoCrypto[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<CoinGeckoCrypto[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("market_cap_rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [apiStatus, setApiStatus] = useState<{status: 'operational' | 'limited' | 'down'; message: string} | null>(null);

  // Função para obter os dados das principais moedas
  const getMarketStats = () => {
    if (cryptoAssets.length === 0) {
      return [
        { name: "Bitcoin", value: "...", change: "...", changeType: "up" },
        { name: "Ethereum", value: "...", change: "...", changeType: "up" },
        { name: "BNB", value: "...", change: "...", changeType: "up" },
        { name: "Solana", value: "...", change: "...", changeType: "up" },
      ];
    }

    const topCoins = ["bitcoin", "ethereum", "binancecoin", "solana"];
    return topCoins.map(coinId => {
      const coin = cryptoAssets.find(c => c.id === coinId);
      if (!coin) {
        return {
          name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
          value: "N/A",
          change: "N/A",
          changeType: "up"
        };
      }
      
      return {
        name: coin.name,
        value: `R$ ${coin.current_price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: `${coin.price_change_percentage_24h >= 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}%`,
        changeType: coin.price_change_percentage_24h >= 0 ? "up" : "down"
      };
    });
  };

  // Função para buscar dados das criptomoedas
  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Consultar API diretamente na URL especificada
      const response = await fetch('http://127.0.0.1:5000/services/api/market/crypto/');
      
      if (!response.ok) {
        throw new Error(`API respondeu com status ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status !== "success" || !result.data?.cryptocurrencies) {
        throw new Error("Formato de resposta inválido");
      }
      
      // Processar os dados recebidos
      const cryptoData = result.data.cryptocurrencies;
      setCryptoAssets(cryptoData);
      
      // Calcular estatísticas globais
      const totalMarketCap = cryptoData.reduce((acc, curr) => acc + (curr.market_cap || 0), 0);
      const totalVolume24h = cryptoData.reduce((acc, curr) => acc + (curr.total_volume || 0), 0);
      
      // Obter BTC e ETH para calcular dominância
      const btc = cryptoData.find(c => c.symbol.toLowerCase() === 'btc');
      const eth = cryptoData.find(c => c.symbol.toLowerCase() === 'eth');
      
      const btcDominance = btc && btc.market_cap ? (btc.market_cap / totalMarketCap) * 100 : 0;
      const ethDominance = eth && eth.market_cap ? (eth.market_cap / totalMarketCap) * 100 : 0;
      
      // Calcular variação média
      const changes = cryptoData
        .filter(c => c.price_change_percentage_24h !== null)
        .map(c => c.price_change_percentage_24h || 0);
      
      const avgChange = changes.length > 0
        ? changes.reduce((a, b) => a + b, 0) / changes.length
        : 0;
      
      setGlobalStats({
        total_market_cap: totalMarketCap,
        total_volume_24h: totalVolume24h,
        btc_dominance: btcDominance,
        eth_dominance: ethDominance,
        avgChange
      });
      
      setApiStatus({
        status: 'operational',
        message: 'API funcionando normalmente'
      });
      
    } catch (err: any) {
      console.error("Erro ao buscar dados de cripto:", err);
      
      // Definir mensagem de erro apropriada
      const errorMessage = err.message || 'Erro desconhecido';
      
      if (errorMessage.includes('429')) {
        setError("Limite de requisições da API excedido. Por favor, tente novamente mais tarde.");
        setApiStatus({
          status: 'limited',
          message: 'Limite de API excedido'
        });
      } else if (errorMessage.includes('500')) {
        setError("API indisponível no momento. Tentando novamente em breve...");
        setApiStatus({
          status: 'down',
          message: 'API indisponível'
        });
      } else {
        setError(`Erro ao carregar dados: ${errorMessage}`);
        setApiStatus({
          status: 'down',
          message: 'Erro de conexão'
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar dados na montagem do componente
  useEffect(() => {
    fetchCryptoData();
    
    // Configurar atualização periódica
    const interval = setInterval(() => {
      fetchCryptoData();
    }, 60000); // Atualizar a cada 1 minuto
    
    return () => clearInterval(interval);
  }, []);

  // Função para tentar novamente em caso de erro
  const handleRetry = async () => {
    setRetrying(true);
    try {
      await fetchCryptoData();
    } finally {
      setRetrying(false);
    }
  };
  
  // Efeito para filtrar e ordenar os ativos quando mudam os critérios
  useEffect(() => {
    if (!cryptoAssets.length) return;
    
    let filtered = [...cryptoAssets];
    
    // Aplicar filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(crypto => 
        crypto.name.toLowerCase().includes(term) || 
        crypto.symbol.toLowerCase().includes(term)
      );
    }
    
    // Aplicar ordenação
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'symbol':
          valueA = a.symbol.toLowerCase();
          valueB = b.symbol.toLowerCase();
          break;
        case 'current_price':
          valueA = a.current_price || 0;
          valueB = b.current_price || 0;
          break;
        case 'price_change_percentage_24h':
          valueA = a.price_change_percentage_24h || 0;
          valueB = b.price_change_percentage_24h || 0;
          break;
        case 'market_cap':
          valueA = a.market_cap || 0;
          valueB = b.market_cap || 0;
          break;
        case 'total_volume':
          valueA = a.total_volume || 0;
          valueB = b.total_volume || 0;
          break;
        default: // market_cap_rank
          valueA = a.market_cap_rank || 999;
          valueB = b.market_cap_rank || 999;
          break;
      }
      
      // Aplicar direção da ordenação
      return sortOrder === 'asc' 
        ? (valueA > valueB ? 1 : -1)
        : (valueA < valueB ? 1 : -1);
    });
    
    setFilteredAssets(filtered);
  }, [cryptoAssets, searchTerm, sortBy, sortOrder]);
  
  // Função para formatar grandes números
  const formatLargeNumber = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    return formatCurrency(value);
  };
  
  const formatPrice = (price: number) => {
    if (price >= 1) return formatCurrency(price);
    
    // Para valores muito pequenos, mostrar mais casas decimais
    if (price < 0.00001) return `$${price.toExponential(2)}`;
    if (price < 0.0001) return `$${price.toFixed(6)}`;
    if (price < 0.001) return `$${price.toFixed(5)}`;
    if (price < 0.01) return `$${price.toFixed(4)}`;
    if (price < 0.1) return `$${price.toFixed(3)}`;
    return formatCurrency(price);
  };

  // Se houver erro mas tiver dados carregados (fallback), mostra os dados com aviso
  if (error && filteredAssets.length > 0) {
    return (
      <PublicLayout>
        {/* Mostrar alerta de aviso */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Dados parcialmente carregados</h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>{error}</p>
                <p className="mt-1">Exibindo os últimos dados disponíveis.</p>
              </div>
              <div className="mt-4">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={handleRetry}
                  disabled={retrying}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-300 dark:hover:bg-yellow-900/20"
                >
                  {retrying ? "Tentando novamente..." : "Tentar novamente"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Market Stats Section */}
        <section className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getMarketStats().map((stat) => (
              <Card key={stat.name} className="border border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{stat.name}</p>
                    {stat.changeType === "up" ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {stat.change}
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Crypto Table */}
        <CryptoTable 
          assets={filteredAssets} 
          loading={loading} 
          formatPrice={formatPrice} 
          formatLargeNumber={formatLargeNumber}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
      </PublicLayout>
    );
  }

  // Se houver erro e não tiver dados, mostrar erro e botão para tentar novamente
  if (error) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="max-w-md w-full">
            <CryptoErrorHandler 
              error={error} 
              onRetry={handleRetry} 
              isPending={retrying} 
            />
            
            <div className="text-center mt-8">
              <Bitcoin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Dados temporariamente indisponíveis</h2>
              <p className="text-muted-foreground mb-6">
                Estamos enfrentando dificuldades para acessar os dados de criptomoedas.
                Por favor, tente novamente em alguns instantes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <Button variant="outline" asChild>
                  <Link to="/">
                    Voltar para Home
                  </Link>
                </Button>
                <Button onClick={handleRetry} disabled={retrying}>
                  {retrying ? "Tentando..." : "Tentar novamente"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Renderização normal
  return (
    <PublicLayout>
      {/* Market Overview */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">CriptoMarket</h1>
            <p className="text-muted-foreground">Acompanhe as tendências e dados do mercado de criptomoedas em tempo real</p>
          </div>
          <div className="relative mt-4 md:mt-0 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar criptomoedas por nome ou símbolo..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background"
            />
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {getMarketStats().map((stat) => (
            <Card key={stat.name} className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">{stat.name}</p>
                  {stat.changeType === "up" ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.change}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {stat.change}
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Global Stats */}
      {globalStats && (
        <section className="mb-12">
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Estatísticas Globais do Mercado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Market Cap Total</p>
                  <p className="text-lg font-bold">{formatLargeNumber(globalStats.total_market_cap)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Volume 24h</p>
                  <p className="text-lg font-bold">{formatLargeNumber(globalStats.total_volume_24h)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dominância BTC</p>
                  <p className="text-lg font-bold">{globalStats.btc_dominance.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dominância ETH</p>
                  <p className="text-lg font-bold">{globalStats.eth_dominance.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Variação Média 24h</p>
                  <div className="flex items-center">
                    {globalStats.avgChange >= 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <p className="text-lg font-bold text-green-500">+{globalStats.avgChange.toFixed(2)}%</p>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        <p className="text-lg font-bold text-red-500">{globalStats.avgChange.toFixed(2)}%</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
        
      {/* API Status */}
      {apiStatus && apiStatus.status !== 'operational' && (
        <div className={`mb-6 py-2 px-3 rounded text-sm flex items-center ${
          apiStatus.status === 'limited' 
            ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' 
            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          <Activity className="h-4 w-4 mr-2" />
          <span>Status da API: {apiStatus.message}</span>
        </div>
      )}

      {/* Crypto Table */}
      <CryptoTable 
        assets={filteredAssets} 
        loading={loading} 
        formatPrice={formatPrice} 
        formatLargeNumber={formatLargeNumber}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
    </PublicLayout>
  );
}

interface CryptoTableProps {
  assets: CoinGeckoCrypto[];
  loading: boolean;
  formatPrice: (price: number) => string;
  formatLargeNumber: (value: number) => string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (field: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

// Componente de Tabela de Criptomoedas
function CryptoTable({ 
  assets, 
  loading, 
  formatPrice, 
  formatLargeNumber,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}: CryptoTableProps) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortOrder === 'asc' ? 
      <TrendingUp className="ml-2 h-4 w-4" /> : 
      <TrendingDown className="ml-2 h-4 w-4" />;
  };
  
  // Componente de Loading Skeleton para tabela
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </div>
      {[...Array(10)].map((_, i) => (
        <div key={i} className="grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, j) => (
            <Skeleton key={j} className="h-12" />
          ))}
        </div>
      ))}
    </div>
  );
  
  // Componente de Loading Skeleton para cards
  const LoadingSkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(12)].map((_, i) => (
        <Card key={i} className="border border-border overflow-hidden">
          <CardContent className="p-4">
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  if (assets.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhuma criptomoeda encontrada</h3>
        <p className="text-muted-foreground mb-4">
          Tente ajustar sua busca ou filtros para ver mais resultados.
        </p>
        <Button variant="outline" onClick={() => setSearchTerm('')}>
          Limpar filtros
        </Button>
      </div>
    );
  }
  
  return (
    <section>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl font-bold">Criptomoedas</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'table' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('table')}
            className="flex items-center"
          >
            <List className="h-4 w-4 mr-2" />
            Tabela
          </Button>
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('grid')}
            className="flex items-center"
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Cards
          </Button>
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <span>Ordenar por</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market_cap_rank">Posição</SelectItem>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="current_price">Preço</SelectItem>
              <SelectItem value="price_change_percentage_24h">Variação 24h</SelectItem>
              <SelectItem value="market_cap">Capitalização</SelectItem>
              <SelectItem value="total_volume">Volume</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Modo Tabela */}
      {viewMode === 'table' ? (
        loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-2 cursor-pointer" onClick={() => handleSort('market_cap_rank')}>
                    <div className="flex items-center">
                      <span>Posição</span>
                      {renderSortIcon('market_cap_rank')}
                    </div>
                  </th>
                  <th className="text-left py-4 px-2 cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center">
                      <span>Nome</span>
                      {renderSortIcon('name')}
                    </div>
                  </th>
                  <th className="text-right py-4 px-2 cursor-pointer" onClick={() => handleSort('current_price')}>
                    <div className="flex items-center justify-end">
                      <span>Preço</span>
                      {renderSortIcon('current_price')}
                    </div>
                  </th>
                  <th className="text-right py-4 px-2 cursor-pointer" onClick={() => handleSort('price_change_percentage_24h')}>
                    <div className="flex items-center justify-end">
                      <span>Variação 24h</span>
                      {renderSortIcon('price_change_percentage_24h')}
                    </div>
                  </th>
                  <th className="text-right py-4 px-2 cursor-pointer" onClick={() => handleSort('market_cap')}>
                    <div className="flex items-center justify-end">
                      <span>Capitalização</span>
                      {renderSortIcon('market_cap')}
                    </div>
                  </th>
                  <th className="text-right py-4 px-2 cursor-pointer" onClick={() => handleSort('total_volume')}>
                    <div className="flex items-center justify-end">
                      <span>Volume</span>
                      {renderSortIcon('total_volume')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {assets.map((crypto) => (
                  <tr key={crypto.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-4 px-2 text-left">
                      {crypto.market_cap_rank || '-'}
                    </td>
                    <td className="py-4 px-2 text-left">
                      <div className="flex items-center space-x-2">
                        {crypto.image ? (
                          <img 
                            src={crypto.image} 
                            alt={crypto.name} 
                            className="w-6 h-6"
                          />
                        ) : (
                          <Bitcoin className="w-6 h-6 text-muted-foreground" />
                        )}
                        <div>
                          <span className="font-medium">{crypto.name}</span>
                          <span className="text-muted-foreground text-xs ml-1">
                            {crypto.symbol.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right font-medium">
                      {crypto.current_price !== null && crypto.current_price !== undefined ? 
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: crypto.current_price < 1 ? 8 : 2
                        }).format(crypto.current_price) 
                        : '-'}
                    </td>
                    <td className={`py-4 px-2 text-right font-medium ${
                      crypto.price_change_percentage_24h > 0
                        ? 'text-green-600 dark:text-green-400'
                        : crypto.price_change_percentage_24h < 0
                        ? 'text-red-600 dark:text-red-400'
                        : ''
                    }`}>
                      {crypto.price_change_percentage_24h !== null ? (
                        <div className="flex items-center justify-end">
                          {crypto.price_change_percentage_24h > 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : crypto.price_change_percentage_24h < 0 ? (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          ) : null}
                          {crypto.price_change_percentage_24h.toFixed(2)}%
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-4 px-2 text-right">
                      {crypto.market_cap ? (
                        crypto.market_cap >= 1e12 ? `${(crypto.market_cap / 1e12).toFixed(2)}T` :
                        crypto.market_cap >= 1e9 ? `${(crypto.market_cap / 1e9).toFixed(2)}B` :
                        crypto.market_cap >= 1e6 ? `${(crypto.market_cap / 1e6).toFixed(2)}M` :
                        crypto.market_cap >= 1e3 ? `${(crypto.market_cap / 1e3).toFixed(2)}K` :
                        crypto.market_cap.toLocaleString('pt-BR')
                      ) : '-'}
                    </td>
                    <td className="py-4 px-2 text-right">
                      {crypto.total_volume ? (
                        crypto.total_volume >= 1e12 ? `${(crypto.total_volume / 1e12).toFixed(2)}T` :
                        crypto.total_volume >= 1e9 ? `${(crypto.total_volume / 1e9).toFixed(2)}B` :
                        crypto.total_volume >= 1e6 ? `${(crypto.total_volume / 1e6).toFixed(2)}M` :
                        crypto.total_volume >= 1e3 ? `${(crypto.total_volume / 1e3).toFixed(2)}K` :
                        crypto.total_volume.toLocaleString('pt-BR')
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        // Modo Grid
        loading ? (
          <LoadingSkeletonGrid />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {assets.map((crypto) => (
              <Card key={crypto.id} className="border border-border overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      {crypto.image ? (
                        <img 
                          src={crypto.image} 
                          alt={crypto.name} 
                          className="w-8 h-8 mr-2"
                        />
                      ) : (
                        <Bitcoin className="w-8 h-8 mr-2 text-muted-foreground" />
                      )}
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">{crypto.name}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            {crypto.symbol.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Rank #{crypto.market_cap_rank || '-'}
                        </div>
                      </div>
                    </div>
                    {crypto.price_change_percentage_24h !== null && (
                      <Badge className={
                        crypto.price_change_percentage_24h > 0
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }>
                        <div className="flex items-center">
                          {crypto.price_change_percentage_24h > 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {crypto.price_change_percentage_24h.toFixed(2)}%
                        </div>
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3">
                    <div className="text-xl font-bold mb-1">
                      {crypto.current_price !== null && crypto.current_price !== undefined ? 
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: crypto.current_price < 1 ? 8 : 2
                        }).format(crypto.current_price) 
                        : '-'}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">Market Cap</div>
                        <div>{crypto.market_cap ? (
                          crypto.market_cap >= 1e12 ? `${(crypto.market_cap / 1e12).toFixed(2)}T` :
                          crypto.market_cap >= 1e9 ? `${(crypto.market_cap / 1e9).toFixed(2)}B` :
                          crypto.market_cap >= 1e6 ? `${(crypto.market_cap / 1e6).toFixed(2)}M` :
                          crypto.market_cap >= 1e3 ? `${(crypto.market_cap / 1e3).toFixed(2)}K` :
                          crypto.market_cap.toLocaleString('pt-BR')
                        ) : '-'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Volume 24h</div>
                        <div>{crypto.total_volume ? (
                          crypto.total_volume >= 1e12 ? `${(crypto.total_volume / 1e12).toFixed(2)}T` :
                          crypto.total_volume >= 1e9 ? `${(crypto.total_volume / 1e9).toFixed(2)}B` :
                          crypto.total_volume >= 1e6 ? `${(crypto.total_volume / 1e6).toFixed(2)}M` :
                          crypto.total_volume >= 1e3 ? `${(crypto.total_volume / 1e3).toFixed(2)}K` :
                          crypto.total_volume.toLocaleString('pt-BR')
                        ) : '-'}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
      
      <div className="mt-8 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Exibindo {assets.length} de {assets.length} criptomoedas
        </div>
        
        <Button variant="outline" size="sm" disabled>
          Mostrar mais
        </Button>
      </div>
      
      <div className="mt-16 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Dados fornecidos pela API local. Atualizado a cada minuto.
        </p>
      </div>
    </section>
  );
}
