import React, { useState, useEffect } from "react";
import { useTranslation } from "../contexts/TranslationContext";
import { cryptoApi, CoinGeckoCrypto } from "../services/api/crypto";
import { formatCurrency } from "../lib/format";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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
  List
} from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

// Componente para exibir crypto como bubble
interface CryptoBubbleProps {
  crypto: CoinGeckoCrypto;
  size: 'small' | 'medium' | 'large';
}

const CryptoBubble: React.FC<CryptoBubbleProps> = ({ crypto, size }) => {
  const { t } = useTranslation();
  
  const sizeClasses = {
    small: 'w-16 h-16 text-xs',
    medium: 'w-24 h-24 text-sm', 
    large: 'w-32 h-32 text-base'
  };

  const getVariationColor = (change: number) => {
    if (change > 0) return 'text-green-600 bg-green-50 border-green-200';
    if (change < 0) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className={`
      ${sizeClasses[size]}
      ${getVariationColor(crypto.price_change_percentage_24h || 0)}
      rounded-full border-2 flex flex-col items-center justify-center
      cursor-pointer hover:scale-105 transition-all duration-200
      shadow-md hover:shadow-lg font-medium
    `}>
      <div className="text-center leading-tight">
        <div className="font-bold truncate px-1">
          {crypto.symbol.toUpperCase()}
        </div>
        <div className="text-xs opacity-80">
          {crypto.price_change_percentage_24h ? 
            `${crypto.price_change_percentage_24h > 0 ? '+' : ''}${crypto.price_change_percentage_24h.toFixed(1)}%` 
            : '0%'
          }
        </div>
      </div>
    </div>
  );
};

// Componente para card compacto de crypto
interface CryptoCardProps {
  crypto: CoinGeckoCrypto;
  index: number;
}

const CryptoCard: React.FC<CryptoCardProps> = ({ crypto, index }) => {
  const { t } = useTranslation();

  const getVariationColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVariationIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    return formatCurrency(value);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {crypto.symbol.substring(0, 2).toUpperCase()}
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                #{index + 1}
              </div>
            </div>
            <div>
              <div className="font-bold text-base">{crypto.symbol.toUpperCase()}</div>
              <div className="text-sm text-muted-foreground truncate max-w-24">
                {crypto.name}
              </div>
            </div>
          </div>
          <Star className="h-4 w-4 text-gray-400 hover:text-yellow-500 cursor-pointer" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">
              {formatCurrency(crypto.current_price || 0)}
            </span>
            <div className={`flex items-center space-x-1 ${getVariationColor(crypto.price_change_percentage_24h || 0)}`}>
              {getVariationIcon(crypto.price_change_percentage_24h || 0)}
              <span className="text-sm font-medium">
                {crypto.price_change_percentage_24h ? 
                  `${crypto.price_change_percentage_24h > 0 ? '+' : ''}${crypto.price_change_percentage_24h.toFixed(2)}%`
                  : '0%'
                }
              </span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>{t('market_cap')}</span>
              <span className="font-medium">
                {crypto.market_cap ? formatMarketCap(crypto.market_cap) : 'N/A'}
              </span>
            </div>
            {crypto.total_volume && (
              <div className="flex justify-between">
                <span>{t('volume_24h')}</span>
                <span className="font-medium">
                  {formatMarketCap(crypto.total_volume)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function MarketPage() {
  const { t } = useTranslation();
  const [cryptoAssets, setCryptoAssets] = useState<CoinGeckoCrypto[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<CoinGeckoCrypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'bubbles' | 'list'>('grid');
  const [sortBy, setSortBy] = useState("market_cap_rank");
  const [apiStatus, setApiStatus] = useState<{status: 'operational' | 'limited' | 'down'; message: string} | null>(null);

  // Função para buscar dados do backend
  async function fetchCryptoData() {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🎯 Buscando dados do backend...");
      
      // Verificar status da API do backend
      const status = await cryptoApi.checkApiStatus();
      setApiStatus(status);
      
      console.log("📊 Status da API:", status);
      
      // Buscar dados (usa backend primeiro, depois fallback)
      const markets = await cryptoApi.getMarkets();
      
      if (!markets || markets.length === 0) {
        setError("Nenhum dado de criptomoeda encontrado.");
        return;
      }
      
      console.log(`✅ ${markets.length} criptomoedas carregadas com sucesso`);
      setCryptoAssets(markets);
      setFilteredAssets(markets);
      setLoading(false);
    } catch (err) {
      console.error("❌ Erro ao buscar dados:", err);
      setError("Não foi possível carregar dados de criptomoedas.");
      setLoading(false);
    }
  }

  // Carregar dados na inicialização
  useEffect(() => {
    fetchCryptoData();
  }, []);

  // Filtrar e ordenar dados
  useEffect(() => {
    if (cryptoAssets.length === 0) return;

    let filtered = [...cryptoAssets];

    // Aplicar busca por nome/símbolo
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(crypto => 
        crypto.name.toLowerCase().includes(searchLower) ||
        crypto.symbol.toLowerCase().includes(searchLower)
      );
    }

    // Aplicar filtros por categoria
    if (activeCategory === 'gainers') {
      filtered = filtered.filter(crypto => (crypto.price_change_percentage_24h || 0) > 0);
    } else if (activeCategory === 'losers') {
      filtered = filtered.filter(crypto => (crypto.price_change_percentage_24h || 0) < 0);
    } else if (activeCategory === 'top10') {
      filtered = filtered.slice(0, 10);
    }

    // Ordenar por critério selecionado
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_desc':
          return (b.current_price || 0) - (a.current_price || 0);
        case 'price_asc':
          return (a.current_price || 0) - (b.current_price || 0);
        case 'change_desc':
          return (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0);
        case 'change_asc':
          return (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0);
        case 'market_cap_desc':
          return (b.market_cap || 0) - (a.market_cap || 0);
        case 'market_cap_asc':
          return (a.market_cap || 0) - (b.market_cap || 0);
        case 'volume_desc':
          return (b.total_volume || 0) - (a.total_volume || 0);
        default: // market_cap_rank
          return (a.market_cap_rank || 999) - (b.market_cap_rank || 999);
      }
    });

    setFilteredAssets(filtered);
  }, [cryptoAssets, searchTerm, activeCategory, sortBy]);

  // Calcular estatísticas globais
  const globalStats = {
    totalMarketCap: cryptoAssets.reduce((sum, crypto) => sum + (crypto.market_cap || 0), 0),
    totalVolume24h: cryptoAssets.reduce((sum, crypto) => sum + (crypto.total_volume || 0), 0),
    gainersCount: cryptoAssets.filter(crypto => (crypto.price_change_percentage_24h || 0) > 0).length,
    losersCount: cryptoAssets.filter(crypto => (crypto.price_change_percentage_24h || 0) < 0).length,
    avgChange: cryptoAssets.reduce((sum, crypto) => sum + (crypto.price_change_percentage_24h || 0), 0) / cryptoAssets.length
  };

  const formatLargeNumber = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    return formatCurrency(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <div className="text-lg font-medium">{t('loading')}</div>
              <div className="text-sm text-muted-foreground">
                {t('loading_crypto_market')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header com stats globais */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <Bitcoin className="h-8 w-8" />
                <span>{t('crypto_market')}</span>
              </h1>
              <p className="text-blue-100 mt-1">
                {t('realtime_crypto_data')} • {filteredAssets.length} {t('cryptocurrencies')}
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              {apiStatus && (
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    apiStatus.status === 'operational' ? 'bg-green-400' : 
                    apiStatus.status === 'limited' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  <span>{apiStatus.message}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>{globalStats.gainersCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingDown className="h-4 w-4" />
                <span>{globalStats.losersCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white dark:bg-gray-900 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatLargeNumber(globalStats.totalMarketCap)}
              </div>
              <div className="text-sm text-muted-foreground">{t('total_market_cap')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatLargeNumber(globalStats.totalVolume24h)}
              </div>
              <div className="text-sm text-muted-foreground">{t('volume_24h')}</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                globalStats.avgChange > 0 ? 'text-green-600' : 
                globalStats.avgChange < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {globalStats.avgChange > 0 ? '+' : ''}{globalStats.avgChange.toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">{t('avg_change_24h')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                #{cryptoAssets.length}
              </div>
              <div className="text-sm text-muted-foreground">{t('tracked_coins')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder={t('search_cryptocurrencies')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-auto">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">{t('all')}</TabsTrigger>
              <TabsTrigger value="top10">Top 10</TabsTrigger>
              <TabsTrigger value="gainers" className="text-green-600">{t('gainers')}</TabsTrigger>
              <TabsTrigger value="losers" className="text-red-600">{t('losers')}</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('sort_by')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market_cap_rank">{t('market_cap_rank')}</SelectItem>
              <SelectItem value="market_cap_desc">{t('market_cap_desc')}</SelectItem>
              <SelectItem value="price_desc">{t('price_desc')}</SelectItem>
              <SelectItem value="change_desc">{t('change_desc')}</SelectItem>
              <SelectItem value="volume_desc">{t('volume_desc')}</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'bubbles' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('bubbles')}
            >
              <Activity className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Views */}
        <div className="space-y-6">
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAssets.map((crypto, index) => (
                <CryptoCard key={crypto.id} crypto={crypto} index={index} />
              ))}
            </div>
          )}

          {/* Bubbles View */}
          {viewMode === 'bubbles' && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">{t('crypto_bubbles')}</h3>
                <p className="text-muted-foreground mb-6">
                  {t('bubble_size_represents_market_cap')}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center items-center min-h-96 p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
                {filteredAssets.slice(0, 50).map((crypto, index) => {
                  let size: 'small' | 'medium' | 'large' = 'medium';
                  if (index < 5) size = 'large';
                  else if (index < 15) size = 'medium';
                  else size = 'small';
                  
                  return (
                    <CryptoBubble key={crypto.id} crypto={crypto} size={size} />
                  );
                })}
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>{t('cryptocurrency_list')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredAssets.map((crypto, index) => (
                    <div key={crypto.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-muted-foreground min-w-8">
                          #{index + 1}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                          {crypto.symbol.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{crypto.symbol.toUpperCase()}</div>
                          <div className="text-sm text-muted-foreground">{crypto.name}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="font-bold">
                            {formatCurrency(crypto.current_price || 0)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {crypto.market_cap ? formatLargeNumber(crypto.market_cap) : 'N/A'}
                          </div>
                        </div>
                        
                        <div className={`text-right min-w-20 ${
                          (crypto.price_change_percentage_24h || 0) > 0 ? 'text-green-600' : 
                          (crypto.price_change_percentage_24h || 0) < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          <div className="flex items-center space-x-1">
                            {(crypto.price_change_percentage_24h || 0) > 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (crypto.price_change_percentage_24h || 0) < 0 ? (
                              <TrendingDown className="h-4 w-4" />
                            ) : (
                              <Activity className="h-4 w-4" />
                            )}
                            <span className="font-medium">
                              {crypto.price_change_percentage_24h ? 
                                `${crypto.price_change_percentage_24h > 0 ? '+' : ''}${crypto.price_change_percentage_24h.toFixed(2)}%`
                                : '0%'
                              }
                            </span>
                          </div>
                        </div>
                        
                        <Star className="h-4 w-4 text-gray-400 hover:text-yellow-500 cursor-pointer" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {filteredAssets.length === 0 && !loading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">{t('no_results')}</h3>
                <p className="text-muted-foreground">
                  {t('try_different_search_terms')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
