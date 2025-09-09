import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Moon,
  Sun,
  User,
  LogIn,
  Menu,
  X,
  ArrowUpDown,
} from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import LanguageSelector from "../components/LanguageSelector";

// Interface para os dados globais da API
interface GlobalStats {
  total_market_cap: number;
  total_volume_24h: number;
  btc_dominance: number;
  active_cryptocurrencies: number;
  market_cap_change_percentage_24h: number;
}

function MarketPage() {
  const { t } = useTranslation();
  const [cryptoAssets, setCryptoAssets] = useState<CoinGeckoCrypto[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<CoinGeckoCrypto[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("market_cap_rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [apiStatus, setApiStatus] = useState<{status: 'operational' | 'limited' | 'down'; message: string} | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const novo = !prev;
      document.documentElement.classList.toggle("dark", novo);
      return novo;
    });
  };

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
      
      // Buscar dados da API backend
      const response = await fetch("http://127.0.0.1:8000/market/crypto/", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        console.log(`✅ ${data.data.cryptocurrencies.length} criptomoedas carregadas com sucesso`);
        setCryptoAssets(data.data.cryptocurrencies);
        setFilteredAssets(data.data.cryptocurrencies);
        setGlobalStats(data.data.global_stats);
        setLoading(false);
      } else {
        throw new Error("Dados inválidos recebidos da API");
      }
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

    // Ordenar por critério selecionado
    filtered.sort((a, b) => {
      let valueA: number | string, valueB: number | string;
      
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

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      } else {
        const numA = valueA as number;
        const numB = valueB as number;
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }
    });

    setFilteredAssets(filtered);
  }, [cryptoAssets, searchTerm, sortBy, sortOrder]);

  const formatLargeNumber = (value: number) => {
    if (value >= 1e12) return `R$ ${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `R$ ${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `R$ ${(value / 1e6).toFixed(1)}M`;
    return formatCurrency(value);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
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
      {/* Header padrão como na Home */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/finance-logo.svg" alt="Organizesee Logo" className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-primary">Organizesee</h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <LanguageSelector variant="compact" showCurrency={false} size="sm" />

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="w-9 h-9"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{t('login')}</span>
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{t('signup')}</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="w-9 h-9"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9"
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t">
              <div className="space-y-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    {t('login')}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {t('signup')}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Título da Página */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">TOP 100 - Criptomoedas</h1>
          <p className="text-muted-foreground">
            {t('realtime_crypto_data')} • {filteredAssets.length} moedas
          </p>
          
          {/* Status da API */}
          {apiStatus && (
            <div className="flex items-center space-x-2 mt-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                apiStatus.status === 'operational' ? 'bg-green-500' : 
                apiStatus.status === 'limited' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-muted-foreground">{apiStatus.message}</span>
            </div>
          )}
        </div>

        {/* Stats Globais */}
        {globalStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-primary">
                  {formatLargeNumber(globalStats.total_market_cap)}
                </div>
                <div className="text-sm text-muted-foreground">Market Cap Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-primary">
                  {formatLargeNumber(globalStats.total_volume_24h)}
                </div>
                <div className="text-sm text-muted-foreground">Volume 24h</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-orange-500">
                  {globalStats.btc_dominance.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Dominância BTC</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-primary">
                  {globalStats.active_cryptocurrencies.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Criptomoedas Ativas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-lg font-bold ${
                  globalStats.market_cap_change_percentage_24h > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {globalStats.market_cap_change_percentage_24h > 0 ? '+' : ''}
                  {globalStats.market_cap_change_percentage_24h.toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">Mudança 24h</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Controles de Filtro */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar criptomoedas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Ordenação */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market_cap_rank">Ranking</SelectItem>
              <SelectItem value="name">Nome (A-Z)</SelectItem>
              <SelectItem value="symbol">Símbolo (A-Z)</SelectItem>
              <SelectItem value="current_price">Preço</SelectItem>
              <SelectItem value="price_change_percentage_24h">Variação 24h</SelectItem>
              <SelectItem value="market_cap">Market Cap</SelectItem>
              <SelectItem value="total_volume">Volume</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
          </Button>
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

        {/* Tabela de Criptomoedas */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Criptomoedas</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAssets.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">{t('no_results')}</h3>
                <p className="text-muted-foreground">
                  {t('try_different_search_terms')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th 
                        className="text-left p-3 cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('market_cap_rank')}
                      >
                        Rank
                      </th>
                      <th 
                        className="text-left p-3 cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('name')}
                      >
                        Moeda
                      </th>
                      <th 
                        className="text-right p-3 cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('current_price')}
                      >
                        Preço
                      </th>
                      <th 
                        className="text-right p-3 cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('price_change_percentage_24h')}
                      >
                        24h %
                      </th>
                      <th 
                        className="text-right p-3 cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('market_cap')}
                      >
                        Market Cap
                      </th>
                      <th 
                        className="text-right p-3 cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('total_volume')}
                      >
                        Volume 24h
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map((crypto) => (
                      <tr key={crypto.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">
                          #{crypto.market_cap_rank}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={crypto.image} 
                              alt={crypto.name}
                              className="w-8 h-8 rounded-full"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <div>
                              <div className="font-medium">{crypto.symbol.toUpperCase()}</div>
                              <div className="text-sm text-muted-foreground">{crypto.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium">
                          {formatCurrency(crypto.current_price || 0)}
                        </td>
                        <td className="p-3 text-right">
                          <div className={`flex items-center justify-end space-x-1 ${
                            (crypto.price_change_percentage_24h || 0) > 0 ? 'text-green-600' : 
                            (crypto.price_change_percentage_24h || 0) < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {(crypto.price_change_percentage_24h || 0) > 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (crypto.price_change_percentage_24h || 0) < 0 ? (
                              <TrendingDown className="h-4 w-4" />
                            ) : null}
                            <span className="font-medium">
                              {crypto.price_change_percentage_24h ? 
                                `${crypto.price_change_percentage_24h > 0 ? '+' : ''}${crypto.price_change_percentage_24h.toFixed(2)}%`
                                : '0%'
                              }
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium">
                          {crypto.market_cap ? formatLargeNumber(crypto.market_cap) : 'N/A'}
                        </td>
                        <td className="p-3 text-right text-muted-foreground">
                          {crypto.total_volume ? formatLargeNumber(crypto.total_volume) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MarketPage;
