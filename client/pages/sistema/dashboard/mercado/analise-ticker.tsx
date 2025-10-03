import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Building2, 
  TrendingUp, 
  BarChart3, 
  PieChart
} from "lucide-react";
import MarketPremiumGuard from "@/components/MarketPremiumGuard";
import { buscarTickers } from "@/services/investmentService";

export default function AnaliseTicker() {
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
        console.log('Resultados da busca:', results);
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
    console.log('Selecionando ticker:', ticker, 'tipo:', tipo);
    
    if (!ticker || ticker.trim() === '') {
      console.error('Ticker inválido:', ticker);
      return;
    }
    
    // Se não tem tipo definido, assume que é uma ação se não termina com 11
    const tipoProcessado = tipo || (ticker.endsWith('11') ? 'FII' : 'AÇÃO');
    
    // Limpar os estados de busca
    setSearchTerm('');
    setSearchResults([]);
    
    try {
      if (tipoProcessado.toLowerCase().includes('fii') || tipoProcessado.toLowerCase().includes('fund') || ticker.endsWith('11')) {
        const urlFII = `/dashboard/mercado/analise-ticker/fii?ticker=${ticker.toUpperCase()}`;
        console.log('Navegando para FII:', urlFII);
        navigate(urlFII);
      } else {
        const urlAcao = `/dashboard/mercado/analise-ticker-acoes?ticker=${ticker.toUpperCase()}`;
        console.log('Navegando para Ação:', urlAcao);
        navigate(urlAcao);
      }
    } catch (error) {
      console.error('Erro na navegação:', error);
    }
  };

  return (
    <MarketPremiumGuard marketFeature="ticker-analysis">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Análise Ativos</h1>
          <p className="text-muted-foreground text-lg">Análise detalhada de ativos individuais</p>
        </div>

        {/* Campo de Busca Universal - Maior */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Search className="h-7 w-7" />
              Digite o codigo do ativo
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
                  <span className="ml-2 text-sm text-gray-600">Buscando...</span>
                </div>
              )}

              {/* Resultados da Busca */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Resultados encontrados:</h4>
                  <div className="grid gap-3 max-h-80 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md"
                        onClick={() => {
                          console.log('Clicando no resultado:', result);
                          selectTicker(result.ticker, result.tipo_ativo);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">{result.ticker}</span>
                              <Badge 
                                variant={result.tipo_ativo?.toLowerCase().includes('fii') ? 'default' : 'secondary'}
                                className="px-2 py-1 text-xs"
                              >
                                {result.tipo_ativo || 'AÇÃO'}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{result.descricao || result.nome_empresa || result.razao_social || 'Nome não disponível'}</p>
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
                            <p className="text-xs text-gray-500 mt-1">Clique para analisar</p>
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
                    Nenhum resultado encontrado para "{searchTerm}". Tente outros termos de busca.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Opções de Análise Especializada - Cards Maiores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 hover:border-blue-300 min-h-[280px]">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-4 text-2xl">
                <Building2 className="h-10 w-10 text-blue-600" />
                Análise de FIIs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-xl leading-relaxed">
                Análise especializada em Fundos de Investimento Imobiliário com métricas específicas do setor imobiliário.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="px-3 py-1 text-sm">P/VP</Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm">Dividend Yield</Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm">Liquidez</Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm">Alavancagem</Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm">Composição</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 hover:border-green-300 min-h-[280px]">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-4 text-2xl">
                <TrendingUp className="h-10 w-10 text-green-600" />
                Análise de Ações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-xl leading-relaxed">
                Análise completa de ações com indicadores fundamentalistas e técnicos para decisões de investimento.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="px-3 py-1 text-sm">P/L</Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm">ROE</Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm">Dividend Yield</Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm">Volume</Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm">Setor</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações sobre as Análises - Fonte Maior */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-4 text-3xl">
              <BarChart3 className="h-8 w-8" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="text-center space-y-6">
                <Search className="h-16 w-16 mx-auto text-blue-600" />
                <h4 className="font-semibold text-2xl">1. Busque</h4>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Digite o código ou nome do ativo que deseja analisar. Nossa busca é inteligente e encontra tanto FIIs quanto ações.
                </p>
              </div>
              <div className="text-center space-y-6">
                <PieChart className="h-16 w-16 mx-auto text-green-600" />
                <h4 className="font-semibold text-2xl">2. Analise</h4>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Visualize métricas detalhadas e indicadores específicos para cada tipo de ativo com análises profundas.
                </p>
              </div>
              <div className="text-center space-y-6">
                <TrendingUp className="h-16 w-16 mx-auto text-purple-600" />
                <h4 className="font-semibold text-2xl">3. Decida</h4>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Use os dados e insights para tomar decisões de investimento informadas e estratégicas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MarketPremiumGuard>
  );
}