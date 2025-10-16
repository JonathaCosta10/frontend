import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import MarketPremiumGuard from "@/components/MarketPremiumGuard";
import { useTranslation } from "@/contexts/TranslationContext";
import investmentService from "@/services/investmentService";

interface TickerSearchResult {
  ticker: string;
  descricao: string;
  tipo_ativo: string;
}

// Basic analysis data interface
interface AnalysisData {
  ticker: string;
  cnpj?: string;
  razao_social?: string;
  segmento?: string;
  administrador?: string;
  data_inicio?: string;
  objetivo?: string;
  gestao?: string;
  prazo_duracao?: string;
  site_administrador?: string;
  last_price?: number;
  p_vp?: number;
  rentab_mensal?: number;
  ultimo_dividendo?: number;
  volume?: number;
  patrimonio_liquido?: number;
  valor_patrimonial?: number;
  total_investido?: number;
  quantidade_ativos_fundo?: number;
  qt_de_cotas?: number;
  custo_mensal_administracao?: number;
  [key: string]: any;
}

function AnaliseTicker() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [searchTicker, setSearchTicker] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicker, setSelectedTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [tickerSearchResults, setTickerSearchResults] = useState<TickerSearchResult[]>([]);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  // Formatting functions
  const formatCurrency = (value?: number | null): string => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value?: number | null): string => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatPercentage = (value?: number | null): string => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    const tickerFromUrl = searchParams.get("ticker");
    if (tickerFromUrl) {
      setSelectedTicker(tickerFromUrl);
      setSearchTicker(tickerFromUrl);
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
      const results = await investmentService.buscarTickers(searchTerm);
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
    setSearchTicker(ticker.ticker);
    setSearchTerm("");
    setTickerSearchResults([]);
  };

  const performAnalysisForTicker = async (ticker: string) => {
    if (!ticker.trim()) return;

    setLoading(true);
    
    try {
      const data = await investmentService.analisarAtivo(ticker.toUpperCase());
      setAnalysisData(data);
    } catch (error) {
      console.error('Erro ao buscar análise do ticker:', error);
      setAnalysisData(null);
    } finally {
      setLoading(false);
    }
  };

  const performAnalysis = () => {
    const tickerToAnalyze = selectedTicker || searchTicker;
    if (tickerToAnalyze.trim()) {
      performAnalysisForTicker(tickerToAnalyze);
    }
  };

  return (
    <MarketPremiumGuard marketFeature="ticker-analysis">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Análise de FII</h1>
          <p className="text-muted-foreground">
            Análise completa e profissional de Fundos de Investimento Imobiliário
          </p>
        </div>

        {/* Search Section */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={!selectedTicker ? "Digite o código do ticker (ex: HGLG11)" : `${selectedTicker} selecionado - Digite para alterar`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                  {searchLoading && (
                    <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin" />
                  )}
                </div>

                {selectedTicker && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-green-800 font-medium">Ticker selecionado: {selectedTicker}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTicker("");
                          setSearchTicker("");
                          setSearchTerm("");
                        }}
                        className="text-green-600 hover:text-green-700"
                      >
                        Alterar
                      </Button>
                    </div>
                  </div>
                )}
                
                {tickerSearchResults.length > 0 && (
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {tickerSearchResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                        onClick={() => selecionarTicker(result)}
                      >
                        <div className="font-medium">{result.ticker}</div>
                        <div className="text-sm text-muted-foreground">{result.descricao}</div>
                        <Badge variant="outline" className="text-xs">{result.tipo_ativo}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={performAnalysis} 
                  disabled={loading || (!selectedTicker && !searchTicker.trim())}
                  className="min-w-[120px]"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Analisando..." : "Analisar"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisData && (
          <div className="space-y-6">
            {/* Header Section - Ticker and Company Info */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-2 border-blue-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Ticker and Sector */}
                  <div className="text-center lg:text-left">
                    <h1 className="text-5xl font-bold text-blue-800 mb-2">
                      {analysisData.ticker}
                    </h1>
                    <div className="inline-flex items-center gap-2 mb-4">
                      <Badge variant="default" className="text-lg px-4 py-2">
                        {analysisData.segmento || "FII"}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Company Info */}
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-gray-700">Razão Social</h3>
                      <p className="text-sm">{analysisData.razao_social || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">CNPJ</h3>
                      <p className="text-sm font-mono">{analysisData.cnpj || "N/A"}</p>
                    </div>
                    {analysisData.site_administrador && (
                      <div>
                        <h3 className="font-semibold text-gray-700">Site do Administrador</h3>
                        <a
                          href={analysisData.site_administrador}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-sm"
                        >
                          {analysisData.site_administrador}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Preço Atual</p>
                      <p className="text-xl font-bold">{formatCurrency(analysisData.last_price)}</p>
                      {analysisData.rentab_mensal !== undefined && (
                        <p className={`text-xs ${analysisData.rentab_mensal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {analysisData.rentab_mensal >= 0 ? '▲' : '▼'} {formatPercentage(Math.abs(analysisData.rentab_mensal))}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">P/VP</p>
                      <p className="text-xl font-bold">{analysisData.p_vp?.toFixed(2) || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Dividend Yield</p>
                      <p className="text-xl font-bold">{formatPercentage(analysisData.rentab_mensal)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Último Dividendo</p>
                      <p className="text-xl font-bold">{formatCurrency(analysisData.ultimo_dividendo)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Volume Diário</p>
                      <p className="text-xl font-bold">{formatCurrency(analysisData.volume)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Patrimônio Líquido</p>
                      <p className="text-xl font-bold">{formatCurrency(analysisData.patrimonio_liquido)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fund Summary Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informações do Fundo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Data de Início</h4>
                      <p className="font-semibold">{formatDate(analysisData.data_inicio)}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Prazo</h4>
                      <p className="font-semibold">{analysisData.prazo_duracao || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Objetivo</h4>
                      <p className="font-semibold">{analysisData.objetivo || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Gestão</h4>
                      <p className="font-semibold">{analysisData.gestao || "N/A"}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Administrador</h4>
                    <p className="font-semibold">{analysisData.administrador || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Quantidade de Cotas</h4>
                    <p className="font-semibold">{formatNumber(analysisData.qt_de_cotas)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Métricas Financeiras
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Patrimônio Líquido</h4>
                      <p className="font-semibold">{formatCurrency(analysisData.patrimonio_liquido)}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Valor Patrimonial</h4>
                      <p className="font-semibold">{formatCurrency(analysisData.valor_patrimonial)}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Total Investido</h4>
                      <p className="font-semibold">{formatCurrency(analysisData.total_investido)}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Quantidade de Ativos</h4>
                      <p className="font-semibold">{analysisData.quantidade_ativos_fundo || "N/A"}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Custo Mensal Administração</h4>
                    <p className="font-semibold">{formatCurrency(analysisData.custo_mensal_administracao)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analysisData && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Análise Profissional de FII
              </h3>
              <p className="text-muted-foreground">
                Digite o código de um ticker para começar a análise completa
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MarketPremiumGuard>
  );
}

export default AnaliseTicker;
