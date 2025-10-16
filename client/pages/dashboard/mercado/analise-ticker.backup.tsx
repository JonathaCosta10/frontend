import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, TrendingDown, BarChart3, DollarSign } from 'lucide-react';
import investmentService, { TickerSearchResult } from '@/services/investmentService';

interface AnalysisData {
  ticker: string;
  cnpj?: string;
  razao_social?: string;
  nome_fundo?: string;
  segmento?: string;
  objetivo?: string;
  gestao?: string;
  administrador?: string;
  last_price?: number;
  volume?: number;
  min_mes?: number;
  max_mes?: number;
  p_vp?: number;
  valor_patrimonial?: number;
  rentab_mensal?: number;
  ultimo_dividendo?: number;
  patrimonio_liquido?: number;
  valor_ativos?: number;
  quantidade_ativos_fundo?: number;
  cotistas_pf?: number;
  cotistas_pj?: number;
  data_analise?: string;
  status?: string;
  ultima_semana?: Array<{
    preco: number;
    data: string;
  }>;
}

export default function AnaliseTicker() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<TickerSearchResult[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<TickerSearchResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar tickers
  const buscarTickers = async (term: string) => {
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await investmentService.buscarTickers(term);
      setSuggestions(response || []);
    } catch (err) {
      console.error('Erro ao buscar tickers:', err);
      setError('Erro ao buscar tickers. Verifique sua conexão.');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para analisar ticker selecionado
  const analisarTicker = async (ticker: TickerSearchResult) => {
    try {
      setAnalyzing(true);
      setError(null);
      const analysisResult = await investmentService.analisarAtivo(ticker.ticker);
      setAnalysis(analysisResult);
    } catch (err) {
      console.error('Erro ao analisar ticker:', err);
      setError('Erro ao analisar o ativo. Tente novamente.');
      setAnalysis(null);
    } finally {
      setAnalyzing(false);
    }
  };

  // Debounce para busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        buscarTickers(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleTickerSelect = (ticker: TickerSearchResult) => {
    setSelectedTicker(ticker);
    setSuggestions([]);
    setSearchTerm(ticker.ticker);
    analisarTicker(ticker);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análise de Ações</h1>
          <p className="text-gray-600 mt-1">Busque e analise ações em tempo real</p>
        </div>
        <BarChart3 className="h-8 w-8 text-blue-600" />
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Digite o código da ação (ex: PETR4, VALE3, ITUB4...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={() => buscarTickers(searchTerm)}
                disabled={loading || searchTerm.length < 2}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>

            {/* Sugestões */}
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {suggestions.map((ticker) => (
                  <div
                    key={ticker.ticker}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleTickerSelect(ticker)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900">{ticker.ticker}</div>
                        <div className="text-sm text-gray-600">{ticker.descricao}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-blue-600">{ticker.tipo_ativo}</div>
                        {ticker.setor && (
                          <div className="text-xs text-gray-500">{ticker.setor}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dados do Ticker Selecionado */}
      {selectedTicker && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              {selectedTicker.ticker} - {selectedTicker.descricao}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tipo de Ativo</p>
                <p className="text-lg font-semibold">{selectedTicker.tipo_ativo}</p>
              </div>
              {selectedTicker.setor && (
                <div>
                  <p className="text-sm text-gray-600">Setor</p>
                  <p className="text-lg font-semibold">{selectedTicker.setor}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análise */}
      {analyzing && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Analisando {selectedTicker?.ticker}...</p>
          </CardContent>
        </Card>
      )}

      {analysis && selectedTicker && (
        <div className="space-y-6">
          {/* Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Ativo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Preço Atual</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analysis.last_price ? formatCurrency(analysis.last_price) : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Volume</p>
                  <p className="text-lg font-semibold">
                    {analysis.volume ? formatCurrency(analysis.volume) : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">P/VP</p>
                  <p className="text-lg font-semibold">
                    {analysis.p_vp ? analysis.p_vp.toFixed(4) : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Último Dividendo</p>
                  <p className="text-lg font-semibold">
                    {analysis.ultimo_dividendo ? formatCurrency(analysis.ultimo_dividendo) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Fundo */}
          {analysis.nome_fundo && (
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Fundo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nome do Fundo</p>
                    <p className="font-semibold">{analysis.nome_fundo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Segmento</p>
                    <p className="font-semibold">{analysis.segmento || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Objetivo</p>
                    <p className="font-semibold">{analysis.objetivo || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gestão</p>
                    <p className="font-semibold">{analysis.gestao || 'N/A'}</p>
                  </div>
                </div>
                {analysis.administrador && (
                  <div>
                    <p className="text-sm text-gray-600">Administrador</p>
                    <p className="font-semibold">{analysis.administrador}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Métricas Financeiras */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas Financeiras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Patrimônio Líquido</p>
                  <p className="text-lg font-bold">
                    {analysis.patrimonio_liquido ? formatCurrency(analysis.patrimonio_liquido) : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Valor dos Ativos</p>
                  <p className="text-lg font-bold">
                    {analysis.valor_ativos ? formatCurrency(analysis.valor_ativos) : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Valor Patrimonial</p>
                  <p className="text-lg font-bold">
                    {analysis.valor_patrimonial ? formatCurrency(analysis.valor_patrimonial) : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Rentab. Mensal</p>
                  <p className="text-lg font-bold">
                    {analysis.rentab_mensal ? `${analysis.rentab_mensal.toFixed(2)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variação de Preços */}
          {analysis.min_mes && analysis.max_mes && (
            <Card>
              <CardHeader>
                <CardTitle>Variação do Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Mínimo do Mês</p>
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency(analysis.min_mes)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Máximo do Mês</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(analysis.max_mes)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Histórico da Semana */}
          {analysis.ultima_semana && analysis.ultima_semana.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Histórico da Última Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.ultima_semana.map((day, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">{day.data}</span>
                      <span className="font-semibold">{formatCurrency(day.preco)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações Adicionais */}
          {(analysis.cotistas_pf || analysis.cotistas_pj) && (
            <Card>
              <CardHeader>
                <CardTitle>Cotistas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Pessoas Físicas</p>
                    <p className="text-lg font-bold">
                      {analysis.cotistas_pf?.toLocaleString('pt-BR') || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Pessoas Jurídicas</p>
                    <p className="text-lg font-bold">
                      {analysis.cotistas_pj?.toLocaleString('pt-BR') || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data da Análise */}
          {analysis.data_analise && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-xs text-gray-500 text-center">
                  Dados atualizados em: {analysis.data_analise}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Estado inicial */}
      {!selectedTicker && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Busque uma ação para começar</h3>
            <p className="text-gray-500">Digite o código da ação no campo acima para ver dados e análises em tempo real</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
