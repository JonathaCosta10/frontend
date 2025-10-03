import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  TrendingUp, 
  Building2, 
  BarChart3, 
  PieChart
} from "lucide-react";
import MarketPremiumGuard from "@/components/MarketPremiumGuard";
import { buscarTickers } from "@/services/investmentService";

export default function AnaliseTickerIndex() {
  const navigate = useNavigate();
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
        setSearchResults(results || []);
      } catch (error) {
        console.error('Erro ao buscar tickers:', error);
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

  // Função para selecionar um ticker e direcionar para análise específica
  const selectTicker = (ticker: string, tipo: string) => {
    if (tipo.toLowerCase().includes('fii') || tipo.toLowerCase().includes('fund')) {
      navigate(`/dashboard/mercado/analise-ticker/fii/${ticker}`);
    } else {
      navigate(`/dashboard/mercado/analise-ticker/acoes/${ticker}`);
    }
  };

  return (
    <MarketPremiumGuard marketFeature="ticker-analysis">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Análise de Ticker</h1>
          <p className="text-muted-foreground text-lg">Análise detalhada de ativos individuais</p>
        </div>

        {/* Campo de Busca Universal */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Search className="h-7 w-7" />
              Buscar Ativo para Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Digite o nome ou código do ativo (ex: PETR4, HGLG11, VALE3, Petrobras, Shopping)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xl h-16 px-8"
              />
              
              {isSearching && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Buscando ativos...</span>
                </div>
              )}

              {/* Resultados da Busca */}
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => selectTicker(result.ticker, result.tipo_ativo)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{result.ticker}</span>
                            <Badge variant={result.tipo_ativo?.toLowerCase().includes('fii') ? 'secondary' : 'default'}>
                              {result.tipo_ativo}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{result.nome_empresa || result.razao_social}</p>
                          {result.setor && (
                            <p className="text-gray-500 text-xs mt-1">Setor: {result.setor}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {result.preco_atual && (
                            <p className="font-semibold text-green-600">
                              R$ {Number(result.preco_atual).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cards de Acesso Direto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card FII */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border-2 hover:border-blue-300 min-h-[280px]" 
                onClick={() => navigate('/dashboard/mercado/analise-ticker-fii-especifico')}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-blue-700">
                <Building2 className="h-8 w-8" />
                Análise de FII
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Análise completa de Fundos de Investimento Imobiliário com:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    Dividend Yield e distribuições
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    Análise de performance
                  </li>
                  <li className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-blue-500" />
                    Composição da carteira
                  </li>
                </ul>
                <div className="pt-4">
                  <span className="text-blue-700 font-semibold">Clique para buscar FIIs →</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Ações */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border-2 hover:border-green-300 min-h-[280px]" 
                onClick={() => navigate('/dashboard/mercado/analise-ticker-acoes-especifico')}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-green-700">
                <TrendingUp className="h-8 w-8" />
                Análise de Ações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Análise fundamentalista completa de ações com:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-green-500" />
                    Indicadores fundamentalistas
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Análise técnica e gráficos
                  </li>
                  <li className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-green-500" />
                    Comparação setorial
                  </li>
                </ul>
                <div className="pt-4">
                  <span className="text-green-700 font-semibold">Clique para buscar ações →</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MarketPremiumGuard>
  );
}