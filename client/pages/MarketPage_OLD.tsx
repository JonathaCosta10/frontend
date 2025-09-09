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

  useEffect(() => {
    fetchCryptoData();
    
    // Atualizar a cada 2 minutos
    const interval = setInterval(fetchCryptoData, 120000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar e ordenar moedas
  useEffect(() => {
    if (cryptoAssets.length === 0) return;
    
    let filtered = [...cryptoAssets];
    
    // Aplicar filtro de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        crypto => 
          crypto.name.toLowerCase().includes(searchLower) || 
          crypto.symbol.toLowerCase().includes(searchLower)
      );
    }
    
    // Aplicar filtro por tab
    if (activeTab === 'gainers') {
      filtered = filtered.filter(crypto => crypto.price_change_percentage_24h > 0);
    } else if (activeTab === 'losers') {
      filtered = filtered.filter(crypto => crypto.price_change_percentage_24h < 0);
    } else if (activeTab === 'top10') {
      filtered = filtered.filter(crypto => crypto.market_cap_rank <= 10);
    }
    
    // Aplicar ordenação
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'name':
          valueA = a.name;
          valueB = b.name;
          break;
        case 'price':
          valueA = a.current_price;
          valueB = b.current_price;
          break;
        case 'change':
          valueA = a.price_change_percentage_24h;
          valueB = b.price_change_percentage_24h;
          break;
        case 'volume':
          valueA = a.total_volume;
          valueB = b.total_volume;
          break;
        case 'market_cap':
          valueA = a.market_cap;
          valueB = b.market_cap;
          break;
        default:
          valueA = a.market_cap_rank;
          valueB = b.market_cap_rank;
      }
      
      if (valueA < valueB) return sortDir === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredAssets(filtered);
  }, [cryptoAssets, searchTerm, sortBy, sortDir, activeTab]);

  async function fetchCryptoData() {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Buscando dados da API do CoinGecko...");
      console.log("VITE_USE_MOCK_DATA =", import.meta.env.VITE_USE_MOCK_DATA);
      
      // Verificar status da API
      const status = await cryptoApi.checkApiStatus();
      setApiStatus(status);
      
      if (status.status === 'down') {
        setError("API indisponível no momento. Tentando novamente em instantes...");
        setTimeout(fetchCryptoData, 30000);
        return;
      }
      
      // Buscar dados de mercado
      const markets = await cryptoApi.getMarkets();
      
      if (!markets || markets.length === 0) {
        setError("API retornou dados vazios.");
        return;
      }
      
      setCryptoAssets(markets);
      setFilteredAssets(markets);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao buscar dados de criptomoedas:", err);
      setError("Não foi possível carregar dados de criptomoedas. Tente novamente mais tarde.");
      setLoading(false);
    }
  }

  // Função para atualização manual dos dados
  const handleRefresh = async () => {
    setRefreshing(true);
    clearCache();
    await fetchCryptoData();
    setRefreshing(false);
  };

  // Alternar a direção da ordenação
  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  // Formatadores
  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return formatCurrency(value, 'USD');
  };
  
  const formatVolume = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return formatCurrency(value, 'USD');
  };

  // Classes de variação
  const getVariationClass = (value: number) => {
    if (value > 0) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
    if (value < 0) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };
  
  const getVariationIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-emerald-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header com navegação - Modelo Binance */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">O</span>
                </div>
                <span className="font-bold text-xl">Organizesee</span>
              </Link>
              
              {/* Navegação principal */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link to="/market" className="text-foreground font-medium border-b-2 border-yellow-400 pb-1">
                  {t("Mercados")}
                </Link>
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
                  {t("Trading")}
                </Link>
                <Link to="/dashboard/orcamento" className="text-muted-foreground hover:text-foreground">
                  {t("Finanças")}
                </Link>
                <Link to="/dashboard/investimentos" className="text-muted-foreground hover:text-foreground">
                  {t("Investimentos")}
                </Link>
              </nav>
            </div>

            {/* Ações do usuário */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="hidden md:flex"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? t("Atualizando...") : t("Atualizar")}
              </Button>
              
              <Link to="/login">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {t("Entrar")}
                </Button>
              </Link>
              
              <Link to="/signup">
                <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  {t("Cadastrar")}
                </Button>
              </Link>
              
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-6">
        {/* Título da página */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{t("Mercados de Criptomoedas")}</h1>
          <p className="text-muted-foreground">
            {t("Acompanhe os preços e tendências das principais criptomoedas em tempo real")}
          </p>
        </div>

        {/* Status da API */}
        {apiStatus && apiStatus.status !== 'operational' && (
          <div className={`text-sm p-3 rounded-md mb-4 ${
            apiStatus.status === 'limited' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
          }`}>
            <p>{apiStatus.message}</p>
          </div>
        )}

        {/* Controles e filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Barra de pesquisa */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("Buscar por nome ou símbolo...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Botão de atualizar (mobile) */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="md:hidden w-fit"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? t("Atualizando...") : t("Atualizar")}
          </Button>
        </div>

        {/* Tabs de filtros */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full md:w-auto grid-cols-4 md:flex">
            <TabsTrigger value="all">{t("Todas")}</TabsTrigger>
            <TabsTrigger value="top10">{t("Top 10")}</TabsTrigger>
            <TabsTrigger value="gainers">{t("Em alta")}</TabsTrigger>
            <TabsTrigger value="losers">{t("Em baixa")}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {Array(10).fill(0).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-12 px-4 border rounded-lg bg-destructive/10">
            <p className="text-destructive font-medium mb-4">{error}</p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={handleRefresh}>
                {t("Tentar novamente")}
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                {t("Recarregar página")}
              </Button>
            </div>
          </div>
        )}

        {/* Tabela de criptomoedas */}
        {!loading && !error && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>{t("Mercado de Criptomoedas")}</span>
                <Badge variant="secondary">
                  {filteredAssets.length} {t("moedas")}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b">
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead className="min-w-[200px]">
                        <Button 
                          variant="ghost" 
                          className="h-auto p-0 font-semibold"
                          onClick={() => toggleSort('name')}
                        >
                          {t("Nome")}
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button 
                          variant="ghost" 
                          className="h-auto p-0 font-semibold"
                          onClick={() => toggleSort('price')}
                        >
                          {t("Preço")}
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button 
                          variant="ghost" 
                          className="h-auto p-0 font-semibold"
                          onClick={() => toggleSort('change')}
                        >
                          {t("24h %")}
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right hidden md:table-cell">
                        <Button 
                          variant="ghost" 
                          className="h-auto p-0 font-semibold"
                          onClick={() => toggleSort('volume')}
                        >
                          {t("Volume 24h")}
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right hidden lg:table-cell">
                        <Button 
                          variant="ghost" 
                          className="h-auto p-0 font-semibold"
                          onClick={() => toggleSort('market_cap')}
                        >
                          {t("Market Cap")}
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          {searchTerm
                            ? t("Nenhuma criptomoeda encontrada para '{{searchTerm}}'", { searchTerm })
                            : t("Nenhuma criptomoeda disponível")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssets.map((crypto) => (
                        <TableRow key={crypto.id} className="hover:bg-muted/50">
                          <TableCell className="text-center font-medium text-muted-foreground">
                            {crypto.market_cap_rank || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img
                                src={crypto.image}
                                alt={crypto.name}
                                className="w-8 h-8 rounded-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder.svg';
                                }}
                              />
                              <div>
                                <div className="font-medium">{crypto.name}</div>
                                <div className="text-sm text-muted-foreground uppercase">
                                  {crypto.symbol}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(crypto.current_price, 'BRL')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              {getVariationIcon(crypto.price_change_percentage_24h)}
                              <Badge 
                                variant="secondary" 
                                className={getVariationClass(crypto.price_change_percentage_24h)}
                              >
                                {crypto.price_change_percentage_24h > 0 ? '+' : ''}
                                {crypto.price_change_percentage_24h.toFixed(2)}%
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right hidden md:table-cell">
                            {formatVolume(crypto.total_volume)}
                          </TableCell>
                          <TableCell className="text-right hidden lg:table-cell">
                            {formatMarketCap(crypto.market_cap)}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Star className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
