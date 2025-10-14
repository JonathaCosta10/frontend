import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { analisarAtivoAcoes, buscarTickers } from "@/services/investmentService";
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
  Users, 
  Calendar, 
  Shield, 
  Building, 
  Phone,
  DollarSign 
} from "lucide-react";

export default function AcaoAnalise() {
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
        const acoes = results.filter((item: any) => 
          item.tipo_ativo === 'AÇÃO' || item.tipo_ativo === 'Ação'
        );
        setSearchResults(acoes);
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

  // Função para selecionar uma ação
  const selectTicker = (ticker: string) => {
    setSelectedTicker(ticker);
    setSearchTerm('');
    setSearchResults([]);
  };

  // Query para análise da ação
  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    error: analysisError,
    refetch: refetchAnalysis
  } = useQuery({
    queryKey: ['acao-analysis', selectedTicker],
    queryFn: () => {

      console.log('🔍 Iniciando chamada da API...');
      return analisarAtivoAcoes(selectedTicker);
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
          <h1 className="text-2xl font-bold">Análise de Ações</h1>
          <p className="text-muted-foreground">Análise especializada em ações da bolsa brasileira</p>
        </div>

        {/* Campo de Busca */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Ação para Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Digite o nome ou código da ação (ex: PETR4, VALE3, ITUB4)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && debouncedSearch(searchTerm)}
                className="flex-1"
              />
              <Button onClick={() => debouncedSearch(searchTerm)} disabled={isSearching}>
                {isSearching ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>

            {/* Botões de Teste */}
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSelectedTicker('PETR4');

                }}
              >
                Testar PETR4
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSelectedTicker('VALE3');

                }}
              >
                Testar VALE3
              </Button>
              {selectedTicker && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {

                    refetchAnalysis();
                  }}
                >
                  Recarregar Dados
                </Button>
              )}
            </div>

            {/* Resultados da Busca */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold">Resultados encontrados:</h4>
                <div className="grid gap-2">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => selectTicker(result.ticker)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold">{result.ticker}</span>
                          <span className="ml-2 text-gray-600">{result.descricao}</span>
                        </div>
                        <Badge variant="outline">{result.tipo_ativo}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </CardContent>
        </Card>

        {/* Análise da Ação */}
        {selectedTicker && (
          <>
            {isAnalysisLoading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Carregando análise detalhada da ação {selectedTicker.toUpperCase()}...</p>
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
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <TrendingUp className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{analysisData.ticker}</h2>
                          <p className="text-lg text-gray-600">{analysisData.empresa?.nome}</p>
                          <p className="text-sm text-gray-500">{analysisData.empresa?.setor}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">
                          {formatCurrency(analysisData.metricas_financeiras?.preco_atual)}
                        </p>
                        <p className="text-sm text-gray-500">Preço Atual</p>
                        <Badge variant="secondary" className="mt-1">
                          {analysisData.status || 'Ativo'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Métricas Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatLargeNumber(analysisData.metricas_financeiras?.valor_mercado_milhoes * 1000000)}
                      </div>
                      <p className="text-sm text-muted-foreground">Valor de Mercado</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatNumberWithDecimals(analysisData.metricas_financeiras?.p_vp, 2)}
                      </div>
                      <p className="text-sm text-muted-foreground">P/VP</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(analysisData.metricas_financeiras?.vpa)}
                      </div>
                      <p className="text-sm text-muted-foreground">VPA</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatLargeNumber(analysisData.metricas_financeiras?.patrimonio_liquido_milhoes * 1000000)}
                      </div>
                      <p className="text-sm text-muted-foreground">Patrimônio Líquido</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Estrutura Acionária */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Estrutura Acionária
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total de Ações</span>
                          <span className="font-semibold">
                            {formatLargeNumber(analysisData.estrutura_acionaria?.total_acoes)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">% Ordinárias</span>
                          <span className="font-semibold text-blue-600">
                            {formatNumberWithDecimals(analysisData.estrutura_acionaria?.pct_ordinarias, 2)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">% Preferenciais</span>
                          <span className="font-semibold text-green-600">
                            {formatNumberWithDecimals(analysisData.estrutura_acionaria?.pct_preferenciais, 2)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-semibold mb-2">Composição</div>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                              <span className="text-sm">Ordinárias ({formatNumberWithDecimals(analysisData.estrutura_acionaria?.pct_ordinarias, 1)}%)</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                              <span className="text-sm">Preferenciais ({formatNumberWithDecimals(analysisData.estrutura_acionaria?.pct_preferenciais, 1)}%)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Movimentação de Controladores */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Movimentação de Controladores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {analysisData.movimentacao_controladores?.confianca_score || 0}/10
                        </div>
                        <p className="text-sm text-muted-foreground">Score de Confiança</p>
                        <p className="text-xs text-green-600 mt-1">
                          {analysisData.movimentacao_controladores?.tendencia_geral}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Compras (12m)</span>
                          <span className="font-semibold text-green-600">
                            {analysisData.movimentacao_controladores?.analise_temporal?.ultimos_12_meses?.compras || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Vendas (12m)</span>
                          <span className="font-semibold text-red-600">
                            {analysisData.movimentacao_controladores?.analise_temporal?.ultimos_12_meses?.vendas || 0}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold">Última Movimentação:</p>
                        <p className="text-sm text-muted-foreground">
                          {analysisData.movimentacao_controladores?.ultima_movimentacao || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Eventos Corporativos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Eventos Corporativos Recentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="font-bold text-blue-600">
                          {analysisData.eventos_corporativos?.total_eventos_relevantes || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Eventos (12m)</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="font-bold text-green-600">
                          {analysisData.eventos_corporativos?.frequencia_comunicacao || 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">Frequência</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <div className="font-bold text-purple-600">
                          {analysisData.eventos_corporativos?.ultimo_evento || 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">Último Evento</p>
                      </div>
                    </div>
                    
                    {analysisData.eventos_corporativos?.eventos_importantes && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Eventos Recentes:</h4>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {analysisData.eventos_corporativos.eventos_importantes.slice(0, 5).map((evento, index) => (
                            <div key={index} className="border rounded p-3 bg-gray-50">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-semibold text-sm">{evento.titulo}</p>
                                  <p className="text-xs text-muted-foreground">{evento.descricao}</p>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="text-xs font-semibold">{evento.data}</p>
                                  <Badge 
                                    variant={evento.relevancia === 'CRÍTICA' ? 'destructive' : 
                                            evento.relevancia === 'ALTA' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {evento.relevancia}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Governança Corporativa */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Governança Corporativa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-600">
                          {analysisData.governanca_corporativa?.transparencia_score || 0}/100
                        </div>
                        <p className="text-sm text-muted-foreground">Score de Transparência</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">
                          {analysisData.governanca_corporativa?.movimentacoes_executivas?.total_movimentacoes || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Movimentações</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatLargeNumber(analysisData.governanca_corporativa?.movimentacoes_executivas?.volume_total || 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">Volume Total</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Informações da Empresa */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Informações da Empresa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Razão Social</p>
                          <p className="font-semibold">{analysisData.empresa?.nome || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">CNPJ</p>
                          <p className="font-semibold">{analysisData.cnpj || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Código CVM</p>
                          <p className="font-semibold">{analysisData.empresa?.codigo_cvm || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Setor</p>
                          <p className="font-semibold">{analysisData.empresa?.setor || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Situação</p>
                          <Badge variant="secondary">
                            {analysisData.empresa?.situacao_registro || 'N/A'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Website</p>
                          {analysisData.empresa?.site ? (
                            <a 
                              href={analysisData.empresa.site} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {analysisData.empresa.site}
                            </a>
                          ) : (
                            <p className="text-muted-foreground">N/A</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contatos DRI */}
                {analysisData.responsaveis_comunicacao && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Relações com Investidores
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">DRI (Diretor de Relações com Investidores)</p>
                          <div className="space-y-2">
                            <p className="font-semibold">{analysisData.responsaveis_comunicacao.dri?.nome || 'N/A'}</p>
                            <p className="text-sm">📞 {analysisData.responsaveis_comunicacao.dri?.telefone || 'N/A'}</p>
                            <p className="text-sm">✉️ {analysisData.responsaveis_comunicacao.dri?.email || 'N/A'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Contatos</p>
                          <div className="space-y-2">
                            <p className="text-sm">📞 {analysisData.responsaveis_comunicacao.contatos?.telefone || 'N/A'}</p>
                            <p className="text-sm">✉️ {analysisData.responsaveis_comunicacao.contatos?.email || 'N/A'}</p>
                          </div>
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