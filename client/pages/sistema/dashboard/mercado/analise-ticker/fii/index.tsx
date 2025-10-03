import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  ArrowLeft, 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  LineChart,
  Minus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import MarketPremiumGuard from "@/components/MarketPremiumGuard";
import { analisarAtivoFII, buscarTickers } from "@/services/investmentService";
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function FIIAnalise() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedTicker, setSelectedTicker] = useState(searchParams.get('ticker') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search function
  const debouncedSearch = useCallback(
    async (term: string) => {
      if (!term || term.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const results = await buscarTickers(term);
        // Filtrar apenas FIIs
        const fiiResults = results.filter(result => 
          result.tipo_ativo?.toLowerCase().includes('fii') || 
          result.tipo_ativo?.toLowerCase().includes('fund')
        );
        setSearchResults(fiiResults || []);
      } catch (error) {
        console.error('Erro ao buscar FIIs:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // Effect for auto-search with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(searchTerm);
    }, 500); // 0.5 segundo de delay

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  // Função para selecionar um FII
  const selectTicker = (ticker: string) => {
    setSelectedTicker(ticker);
    setSearchTerm('');
    setSearchResults([]);
    navigate(`/dashboard/mercado/analise-ticker/fii?ticker=${ticker}`);
  };

  // Query para análise do FII
  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    error: analysisError,
    refetch: refetchAnalysis
  } = useQuery({
    queryKey: ['fii-analysis', selectedTicker],
    queryFn: () => {
      console.log('🚀 Chamando API de FII para:', selectedTicker);
      console.log('📡 URL completa:', `http://127.0.0.1:5000/api/investimentos/analise-ativo/fii/?ticker=${selectedTicker}`);
      console.log('🔍 Iniciando chamada da API...');
      return analisarAtivoFII(selectedTicker);
    },
    enabled: !!selectedTicker && selectedTicker.length >= 3,
    staleTime: 5 * 60 * 1000,
  });

  // Funções de formatação
  const formatCurrency = (value: number | string | null | undefined) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatPercentage = (value: number | string | null | undefined) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return '0,00%';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue / 100);
  };

  const formatNumberWithDecimals = (value: number | string | null | undefined, decimals: number = 2) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return '0';
    }
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(numValue);
  };

  const formatLargeNumber = (value: number | string | null | undefined) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return '0';
    }
    
    const absValue = Math.abs(numValue);
    if (absValue >= 1000000000) {
      return `${formatNumberWithDecimals(numValue / 1000000000, 1)}B`;
    } else if (absValue >= 1000000) {
      return `${formatNumberWithDecimals(numValue / 1000000, 1)}M`;
    } else if (absValue >= 1000) {
      return `${formatNumberWithDecimals(numValue / 1000, 1)}K`;
    }
    return formatNumberWithDecimals(numValue, 0);
  };

  return (
    <MarketPremiumGuard marketFeature="ticker-analysis">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Análise de FIIs</h1>
          <p className="text-muted-foreground">Análise especializada em Fundos Imobiliários</p>
          {selectedTicker && (
            <div className="mt-2 p-2 bg-green-50 rounded">
              <p className="text-sm text-green-800">
                <strong>Ticker Ativo:</strong> {selectedTicker} | 
                <strong>API:</strong> http://127.0.0.1:5000/api/investimentos/analise-ativo/fii/?ticker={selectedTicker}
              </p>
              <div className="mt-1 text-xs">
                {isAnalysisLoading && (
                  <span className="text-blue-600">🔄 Carregando dados da API...</span>
                )}
                {analysisError && (
                  <span className="text-red-600">❌ Erro na API: {analysisError.message}</span>
                )}
                {analysisData && !isAnalysisLoading && (
                  <span className="text-green-600">✅ Dados carregados com sucesso!</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Campo de Busca */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Search className="h-6 w-6" />
              Buscar FII para Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Digite o nome ou código do FII (ex: HGLG11, XPLG11, Shopping Iguatemi)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-lg h-14 px-6"
              />

              {/* Botões de Teste */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSelectedTicker('HGLG11');
                    console.log('🧪 Teste manual: Selecionando HGLG11');
                  }}
                >
                  Testar HGLG11
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSelectedTicker('XPLG11');
                    console.log('🧪 Teste manual: Selecionando XPLG11');
                  }}
                >
                  Testar XPLG11
                </Button>
                {selectedTicker && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      console.log('🔄 Forçando atualização dos dados...');
                      refetchAnalysis();
                    }}
                  >
                    Recarregar Dados
                  </Button>
                )}
              </div>
              
              {isSearching && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Buscando FIIs...</span>
                </div>
              )}

              {/* Resultados da Busca */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">FIIs encontrados:</h4>
                  <div className="grid gap-3 max-h-80 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md"
                        onClick={() => selectTicker(result.ticker)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-bold text-lg">{result.ticker}</span>
                            <span className="ml-3 text-gray-600 text-base">{result.descricao}</span>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="default" className="px-3 py-1">
                              {result.tipo_ativo}
                            </Badge>
                            {result.setor && <Badge variant="outline" className="px-3 py-1">{result.setor}</Badge>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.length === 0 && searchTerm && !isSearching && searchTerm.length >= 2 && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800">
                    Nenhum FII encontrado para "{searchTerm}". Tente outros termos de busca.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* FII Selecionado */}
        {selectedTicker && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  <span className="text-lg font-semibold">
                    <strong>FII Selecionado:</strong> {selectedTicker.toUpperCase()}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedTicker('')}
                >
                  Trocar FII
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Análise do FII */}
        {selectedTicker && (
          <>
            {isAnalysisLoading && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="ml-3 text-gray-600">Carregando análise detalhada do FII {selectedTicker.toUpperCase()}...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {analysisError && (
              <Card>
                <CardContent className="p-8 text-center text-red-600">
                  <p>Erro ao carregar análise: {analysisError.message}</p>
                  <Button onClick={() => refetchAnalysis()} className="mt-4">
                    Tentar Novamente
                  </Button>
                </CardContent>
              </Card>
            )}

            {analysisData && (
              <div className="space-y-6">
                {/* Métricas Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Preço Atual</p>
                          <p className="text-2xl font-bold">{formatCurrency(analysisData.last_price)}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">P/VP</p>
                          <p className="text-2xl font-bold">{formatNumberWithDecimals(analysisData.p_vp, 2)}</p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Dividend Yield Mensal</p>
                          <p className="text-2xl font-bold">{formatPercentage(analysisData.rentab_mensal)}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Último Dividendo</p>
                          <p className="text-2xl font-bold">{formatCurrency(analysisData.ultimo_dividendo)}</p>
                        </div>
                        <PieChart className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Botões de Ação */}
                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/dashboard/mercado')}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para o Dashboard
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => {
                      const newTicker = prompt('Digite o ticker do FII que deseja analisar:');
                      if (newTicker && newTicker.trim()) {
                        navigate(`/dashboard/mercado/analise-ticker/fii?ticker=${newTicker.toUpperCase().trim()}`);
                      }
                    }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Search className="h-4 w-4" />
                    Consultar Novo FII
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MarketPremiumGuard>
  );
}