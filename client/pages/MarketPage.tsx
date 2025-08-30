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
import CryptoErrorHandler from "../components/CryptoErrorHandler";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import Footer from "../components/Footer";

// Interface para os dados globais da API
interface GlobalStats {
  total_market_cap: number;
  total_volume_24h: number;
  btc_dominance: number;
  active_cryptocurrencies: number;
  market_cap_change_percentage_24h: number;
}

// Interface para resposta da API
interface CryptoApiResponse {
  status: string;
  data: {
    cryptocurrencies?: CoinGeckoCrypto[];
    global_stats?: GlobalStats;
  } | CoinGeckoCrypto[];
}

function MarketPage() {
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
      try {
        const status = await cryptoApi.checkApiStatus();
        setApiStatus(status);
        console.log("📊 Status da API:", status);
      } catch (statusError) {
        console.error("❌ Erro ao verificar status da API:", statusError);
        // Continua mesmo com erro de status
      }
      
      // Construir URL usando variáveis de ambiente
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://www.organizesee.com.br';
      const apiUrl = `${apiBaseUrl}/services/api/market/crypto/`;
      
      console.log("🔗 Conectando à API:", apiUrl);
      
      // Buscar dados da API backend com timeout para evitar espera infinita
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as CryptoApiResponse;
      
      console.log("📄 Resposta da API:", data);
      
      if (data.status === 'success' && data.data) {
        // Verifica se os dados têm a estrutura aninhada com cryptocurrencies
        if (typeof data.data === 'object' && !Array.isArray(data.data) && data.data.cryptocurrencies) {
          const cryptos = data.data.cryptocurrencies;
          console.log(`✅ ${cryptos.length} criptomoedas carregadas com sucesso`);
          setCryptoAssets(cryptos);
          setFilteredAssets(cryptos);
          
          if (data.data.global_stats) {
            setGlobalStats(data.data.global_stats);
          }
        } 
        // Verifica se data.data é um array (formato alternativo)
        else if (Array.isArray(data.data)) {
          const cryptos = data.data as CoinGeckoCrypto[];
          console.log(`✅ ${cryptos.length} criptomoedas carregadas com sucesso`);
          setCryptoAssets(cryptos);
          setFilteredAssets(cryptos);
        } 
        // Nenhum formato reconhecido
        else {
          throw new Error("Formato de dados não reconhecido: " + JSON.stringify(data));
        }
        
        // Se chegou aqui, a carga foi bem sucedida
        setLoading(false);
      } else {
        throw new Error("Dados inválidos recebidos da API: " + JSON.stringify(data));
      }
    } catch (err) {
      console.error("❌ Erro ao buscar dados:", err);
      // Mensagem de erro mais detalhada para ajudar no debug
      setError(`Não foi possível carregar dados de criptomoedas. ${err.name === 'AbortError' ? 'A requisição excedeu o tempo limite.' : err.message}`);
      setLoading(false);
      
      // Tentar usar API alternativa ou dados mockados após falha
      try {
        console.log("🔄 Tentando usar API alternativa...");
        const mockData = await cryptoApi.getMarkets();
        if (mockData && mockData.length > 0) {
          console.log("✅ Dados alternativos carregados com sucesso");
          setCryptoAssets(mockData);
          setFilteredAssets(mockData);
          setError(null); // Limpa o erro se os dados alternativos funcionarem
          setLoading(false);
        }
      } catch (fallbackErr) {
        console.error("❌ Erro ao buscar dados alternativos:", fallbackErr);
      }
    }
  }

  // Carregar dados na inicialização com mecanismo de retry
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const loadData = async () => {
      try {
        await fetchCryptoData();
      } catch (err) {
        if (retryCount < maxRetries) {
          console.log(`🔄 Tentativa ${retryCount + 1} de ${maxRetries} falhou. Tentando novamente em 3 segundos...`);
          retryCount++;
          setTimeout(loadData, 3000);
        }
      }
    };
    
    loadData();
    
    // Atualizar dados a cada 5 minutos (300000ms)
    const interval = setInterval(() => {
      console.log("🔄 Atualizando dados...");
      fetchCryptoData();
    }, 300000);
    
    return () => clearInterval(interval);
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

  const formatPrice = (value: number) => {
    // Formatação com até 8 casas decimais, máximo 10 dígitos total
    if (value === 0) return "R$ 0,00";
    
    // Converter para string e contar dígitos inteiros
    const integerPart = Math.floor(Math.abs(value)).toString();
    const integerDigits = integerPart.length;
    
    // Calcular quantas casas decimais podemos usar (máximo 8, mas limitado por 10 dígitos total)
    const maxDecimalPlaces = Math.min(8, Math.max(0, 10 - integerDigits));
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: maxDecimalPlaces,
    }).format(value);
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
              <div className="text-xs text-muted-foreground">
                Conectando à API... Por favor, aguarde.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Se houver erro mas tiver dados carregados (fallback), mostra os dados com aviso
  if (error && filteredAssets.length > 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          {/* Mostrar alerta de aviso */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Aviso:</span>
              <span className="ml-2">Os dados apresentados podem não estar atualizados. Estamos usando uma fonte alternativa de dados.</span>
            </div>
          </div>
          
          {/* Continua com o resto do conteúdo */}
          {/* O resto do conteúdo da página será renderizado normalmente */}
        </div>
      </div>
    );
  }

  const handleRetry = async () => {
    setRetrying(true);
    setError(null); // Clear previous error
    
    try {
      await fetchCryptoData();
    } catch (err) {
      console.error("Retry failed:", err);
    } finally {
      setRetrying(false);
    }
  };
  
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
        {/* Error Handler Component - only shown when there's an error */}
        {error && (
          <CryptoErrorHandler 
            error={error}
            onRetry={handleRetry}
            isPending={retrying}
          />
        )}
        
        {/* Status da API */}
        {apiStatus && apiStatus.status !== 'operational' && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <TrendingDown className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Aviso de API</h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>{apiStatus.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Título da Página */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">TOP 100 - Criptomoedas</h1>
              <p className="text-muted-foreground">
                {t('realtime_crypto_data')} • {filteredAssets.length} moedas
              </p>
            </div>
            <Link to="/demo">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transform transition-transform hover:scale-105"
              >
                Conheça nosso sistema
              </Button>
            </Link>
          </div>
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
                          {formatPrice(crypto.current_price || 0)}
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
      
      <Footer />
    </div>
  );
}

export default MarketPage;
