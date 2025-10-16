import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  TrendingUp, 
  BarChart3, 
  PieChart
} from "lucide-react";
import MarketPremiumGuard from "@/core/security/guards/MarketPremiumGuard";
import { buscarTickersAcoes } from "@/features/investments/services/investmentService";

export default function AnaliseTickerAcoes() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search function - apenas Ações
  const debouncedSearch = useCallback(
    async (term: string) => {
      if (!term || term.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const results = await buscarTickersAcoes(term);
        setSearchResults(results || []);
      } catch (error) {
        console.error('Erro ao buscar ações:', error);
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

  // Função para selecionar uma ação e ir para análise
  const selectTicker = (ticker: string) => {
    navigate(`/dashboard/mercado/analise-ticker-acoes?ticker=${ticker}`);
  };

  return (
    <MarketPremiumGuard marketFeature="ticker-analysis">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Análise de Ações</h1>
          <p className="text-muted-foreground text-lg">Busca especializada em ações da bolsa brasileira</p>
        </div>

        {/* Campo de Busca Específico para Ações */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Search className="h-7 w-7" />
              Buscar Ação para Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Digite o nome ou código da ação (ex: PETR4, VALE3, ITUB4, Petrobras, Vale)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xl h-16 px-8"
              />
              
              {isSearching && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Buscando ações...</span>
                </div>
              )}

              {/* Resultados da Busca */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Ações encontradas:</h4>
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
                            <Badge variant="secondary" className="px-3 py-1">
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
                    Nenhuma ação encontrada para "{searchTerm}". Tente outros termos de busca.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botão para voltar */}
        <div className="flex justify-center">
          <Button 
            onClick={() => navigate('/dashboard/mercado/analise-ticker')}
            variant="outline"
            className="text-lg px-8 py-3"
          >
            Voltar para Análise Geral
          </Button>
        </div>
      </div>
    </MarketPremiumGuard>
  );
}