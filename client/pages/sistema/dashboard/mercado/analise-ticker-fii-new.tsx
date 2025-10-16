import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { analisarAtivoFII, buscarTickers } from "@/services/investmentService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import MarketPremiumGuard from "../../../../components/MarketPremiumGuard";
import { 
  Search, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Building2, 
  Calendar, 
  Shield, 
  Building, 
  Phone,
  DollarSign,
  Target,
  LineChart,
  Users,
  Home
} from "lucide-react";

export default function FIIAnalise() {
  const [searchParams] = useSearchParams();
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

      try {
        setIsSearching(true);
        const results = await buscarTickers(term);
        const fiis = results.filter((item: any) => 
          item.tipo_ativo === 'FII' || item.tipo_ativo === 'Fii'
        );
        setSearchResults(fiis);
      } catch (error) {
        console.error('Erro na busca:', error);
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Análise do FII */}
        {selectedTicker && (
          <>
            {isAnalysisLoading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p>Carregando análise detalhada do FII {selectedTicker.toUpperCase()}...</p>
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
                {/* Header com Status */}
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-3 rounded-full">
                          <Building2 className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{analysisData.ticker}</h2>
                          <p className="text-lg text-gray-600">{analysisData.nome_fundo}</p>
                          <p className="text-sm text-gray-500">Segmento: {analysisData.segmento}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600">
                          {formatCurrency(analysisData.last_price)}
                        </p>
                        <p className="text-sm text-gray-500">Preço Atual</p>
                        <Badge variant="secondary" className="mt-1">
                          P/VP: {formatNumberWithDecimals(analysisData.p_vp, 2)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Insights e Recomendação */}
                {analysisData.insights && (
                  <Card className="border-2 border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Target className="h-6 w-6 text-blue-600" />
                        Análise e Recomendação
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {analysisData.insights.recomendacao}
                          </div>
                          <div className="text-lg font-semibold text-gray-700">
                            Score: {formatNumberWithDecimals(analysisData.insights.score_detalhado?.score_total * 10, 1)}/100
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-green-700 mb-2">✅ Pontos Positivos:</h4>
                            <ul className="space-y-1">
                              {analysisData.insights.pontos_positivos?.map((ponto, index) => (
                                <li key={index} className="text-sm text-green-600">{ponto}</li>
                              ))}
                            </ul>
                          </div>
                          
                          {analysisData.insights.alertas && analysisData.insights.alertas.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-orange-700 mb-2">⚠️ Alertas:</h4>
                              <ul className="space-y-1">
                                {analysisData.insights.alertas.map((alerta, index) => (
                                  <li key={index} className="text-sm text-orange-600">{alerta}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Métricas Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(analysisData.last_price)}
                      </div>
                      <p className="text-sm text-muted-foreground">Preço Atual</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatNumberWithDecimals(analysisData.p_vp, 3)}
                      </div>
                      <p className="text-sm text-muted-foreground">P/VP</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(analysisData.ultimo_dividendo)}
                      </div>
                      <p className="text-sm text-muted-foreground">Último Dividendo</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatPercentage(analysisData.rentab_mensal || 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">Rentabilidade Mensal</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Informações do Fundo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Informações do Fundo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Nome do Fundo</p>
                          <p className="font-semibold">{analysisData.nome_fundo}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">CNPJ</p>
                          <p className="font-semibold">{analysisData.cnpj}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Segmento</p>
                          <Badge variant="outline">{analysisData.segmento}</Badge>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Data de Início</p>
                          <p className="font-semibold">{analysisData.data_inicio}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Administrador</p>
                          <p className="font-semibold">{analysisData.administrador}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Gestão</p>
                          <Badge variant={analysisData.gestao === 'Ativa' ? 'default' : 'secondary'}>
                            {analysisData.gestao}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Quantidade de Cotas</p>
                          <p className="font-semibold">{formatLargeNumber(analysisData.qt_de_cotas)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Cotistas PF</p>
                          <p className="font-semibold">{formatLargeNumber(analysisData.cotistas_pf)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Cotistas PJ</p>
                          <p className="font-semibold">{formatLargeNumber(analysisData.cotistas_pj)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Métricas Financeiras */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Métricas Financeiras
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded">
                        <div className="font-bold text-blue-600">
                          {formatLargeNumber(analysisData.patrimonio_liquido)}
                        </div>
                        <p className="text-xs text-muted-foreground">Patrimônio Líquido</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded">
                        <div className="font-bold text-green-600">
                          {formatLargeNumber(analysisData.valor_mercado)}
                        </div>
                        <p className="text-xs text-muted-foreground">Valor de Mercado</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded">
                        <div className="font-bold text-purple-600">
                          {formatPercentage(analysisData.alavancagem_percentual)}
                        </div>
                        <p className="text-xs text-muted-foreground">Alavancagem</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded">
                        <div className="font-bold text-orange-600">
                          {formatCurrency(analysisData.valor_patrimonial_cotas)}
                        </div>
                        <p className="text-xs text-muted-foreground">Valor Patrimonial</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Composição do Ativo */}
                {analysisData.composicao_ativo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Composição do Ativo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">% Imobiliário:</span>
                              <span className="font-semibold text-green-600">
                                {formatPercentage(analysisData.composicao_ativo.metrics?.percent_imobiliario * 100)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Total Investido:</span>
                              <span className="font-semibold">
                                {formatLargeNumber(analysisData.composicao_ativo.raw?.total_investido)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {analysisData.composicao_ativo.detalhamento_ativos && (
                          <div className="space-y-2">
                            <h4 className="font-semibold">Detalhamento dos Ativos:</h4>
                            <div className="space-y-2">
                              {analysisData.composicao_ativo.detalhamento_ativos.map((ativo, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <span className="text-sm">{ativo.tipo_ativo}</span>
                                  <div className="text-right">
                                    <span className="font-semibold">{formatPercentage(ativo.percentual)}</span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                      ({formatLargeNumber(ativo.valor)})
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Liquidez */}
                {analysisData.liquidez && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Análise de Liquidez
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded">
                          <div className="font-bold text-blue-600">
                            {formatLargeNumber(analysisData.liquidez.raw?.disponibilidades)}
                          </div>
                          <p className="text-xs text-muted-foreground">Disponibilidades</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded">
                          <div className="font-bold text-green-600">
                            {formatLargeNumber(analysisData.liquidez.raw?.fundos_renda_fixa)}
                          </div>
                          <p className="text-xs text-muted-foreground">Fundos Renda Fixa</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded">
                          <div className="font-bold text-purple-600">
                            {formatNumberWithDecimals(analysisData.liquidez.metrics?.gap_liquidez, 4)}
                          </div>
                          <p className="text-xs text-muted-foreground">Gap de Liquidez</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Histórico de Preços */}
                {analysisData.ultima_semana && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LineChart className="h-5 w-5" />
                        Histórico de Preços (Última Semana)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-3 bg-red-50 rounded">
                            <div className="font-bold text-red-600">{formatCurrency(analysisData.min_mes)}</div>
                            <p className="text-xs text-muted-foreground">Mínima do Mês</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded">
                            <div className="font-bold text-green-600">{formatCurrency(analysisData.max_mes)}</div>
                            <p className="text-xs text-muted-foreground">Máxima do Mês</p>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded">
                            <div className="font-bold text-blue-600">{formatLargeNumber(analysisData.volume)}</div>
                            <p className="text-xs text-muted-foreground">Volume</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {analysisData.ultima_semana.slice(0, 4).map((dia, index) => (
                            <div key={index} className="flex justify-between items-center p-2 border rounded">
                              <span className="text-sm font-semibold">{dia.data}</span>
                              <div className="text-right">
                                <span className="font-semibold">{formatCurrency(dia.preco)}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  Vol: {formatLargeNumber(dia.volume)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Data da Análise */}
                <Card>
                  <CardContent className="py-4">
                    <div className="text-center text-sm text-muted-foreground">
                      Análise realizada em: {analysisData.data_analise || 'N/A'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </MarketPremiumGuard>
  );
}