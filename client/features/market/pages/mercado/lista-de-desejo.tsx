import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Heart, 
  Plus, 
  Search, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Star,
  Eye,
  AlertCircle
} from "lucide-react";
import MarketPremiumGuard from "@/core/security/guards/MarketPremiumGuard";
import investmentService from "@/features/investments/services/investmentService";

export default function ListaDeDesejo() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [wishlist, setWishlist] = useState<any[]>([
    // Dados de exemplo para demonstração
    {
      id: 1,
      ticker: 'PETR4',
      nome: 'Petróleo Brasileiro S.A.',
      tipo: 'Ação',
      precoAtual: 38.45,
      precoTarget: 40.00,
      variacao: 2.15,
      adicionadoEm: '2024-01-15'
    },
    {
      id: 2,
      ticker: 'HGLG11',
      nome: 'CSHG Logística',
      tipo: 'FII',
      precoAtual: 125.30,
      precoTarget: 130.00,
      variacao: -1.45,
      adicionadoEm: '2024-01-10'
    }
  ]);

  // Função para buscar tickers
  const handleSearch = async () => {
    if (!searchTerm || searchTerm.length < 2) return;
    
    setIsSearching(true);
    try {
      const results = await investmentService.buscarTickers(searchTerm);
      setSearchResults(results || []);
    } catch (error) {
      console.error('Erro ao buscar tickers:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Função para adicionar à lista
  const addToWishlist = (ticker: any) => {
    const exists = wishlist.find(item => item.ticker === ticker.ticker);
    if (exists) {
      alert('Este ativo já está na sua lista de desejos!');
      return;
    }

    const newItem = {
      id: Date.now(),
      ticker: ticker.ticker,
      nome: ticker.descricao,
      tipo: ticker.tipo_ativo,
      precoAtual: Math.random() * 100 + 20, // Preço simulado
      precoTarget: Math.random() * 100 + 20, // Target simulado
      variacao: (Math.random() - 0.5) * 10, // Variação simulada
      adicionadoEm: new Date().toISOString().split('T')[0]
    };

    setWishlist([...wishlist, newItem]);
    setSearchTerm('');
    setSearchResults([]);
  };

  // Função para remover da lista
  const removeFromWishlist = (id: number) => {
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  // Funções de formatação
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getVariationColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVariationIcon = (value: number) => {
    if (value > 0) return TrendingUp;
    if (value < 0) return TrendingDown;
    return DollarSign;
  };

  return (
    <MarketPremiumGuard marketFeature="wishlist">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Lista de Desejos</h1>
          <p className="text-muted-foreground">Acompanhe seus ativos favoritos e monitore oportunidades</p>
        </div>

        {/* Campo de Busca para Adicionar Ativos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Adicionar Ativo à Lista
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Digite o nome ou código do ativo (ex: PETR4, HGLG11)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>

            {/* Resultados da Busca */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold">Adicionar à lista:</h4>
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold">{result.ticker}</span>
                          <span className="ml-2 text-gray-600">{result.descricao}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{result.tipo_ativo}</Badge>
                          <Button
                            size="sm"
                            onClick={() => addToWishlist(result)}
                            className="flex items-center gap-1"
                          >
                            <Heart className="h-3 w-3" />
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Desejos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Minha Lista de Desejos ({wishlist.length} ativos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wishlist.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Sua lista está vazia
                </h3>
                <p className="text-gray-500">
                  Adicione ativos para acompanhar e receber alertas sobre oportunidades.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticker</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Preço Atual</TableHead>
                      <TableHead className="text-right">Variação</TableHead>
                      <TableHead className="text-right">Target</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wishlist.map((item) => {
                      const VariationIcon = getVariationIcon(item.variacao);
                      const distanceToTarget = ((item.precoTarget - item.precoAtual) / item.precoAtual) * 100;
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-semibold">{item.ticker}</TableCell>
                          <TableCell className="max-w-48 truncate">{item.nome}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={item.tipo.toLowerCase().includes('fii') ? 'default' : 'secondary'}
                            >
                              {item.tipo}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(item.precoAtual)}
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${getVariationColor(item.variacao)}`}>
                            <div className="flex items-center justify-end gap-1">
                              <VariationIcon className="h-3 w-3" />
                              {formatPercentage(item.variacao)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-mono">{formatCurrency(item.precoTarget)}</span>
                              <span className={`text-xs ${distanceToTarget > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercentage(distanceToTarget)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {/* Implementar análise do ativo */}}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                Ver
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeFromWishlist(item.id)}
                                className="flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                Remover
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo da Lista */}
        {wishlist.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Ativos</p>
                    <p className="text-2xl font-bold">{wishlist.length}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Em Alta</p>
                    <p className="text-2xl font-bold text-green-600">
                      {wishlist.filter(item => item.variacao > 0).length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Em Baixa</p>
                    <p className="text-2xl font-bold text-red-600">
                      {wishlist.filter(item => item.variacao < 0).length}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alertas de Oportunidades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Alertas de Oportunidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wishlist.filter(item => {
                const distanceToTarget = ((item.precoTarget - item.precoAtual) / item.precoAtual) * 100;
                return Math.abs(distanceToTarget) < 5; // Próximo do target (dentro de 5%)
              }).map(item => {
                const distanceToTarget = ((item.precoTarget - item.precoAtual) / item.precoAtual) * 100;
                return (
                  <div key={item.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold">{item.ticker}</span>
                        <span className="ml-2 text-sm text-gray-600">
                          está {Math.abs(distanceToTarget).toFixed(1)}% {distanceToTarget > 0 ? 'abaixo' : 'acima'} do seu target
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-yellow-100">
                        Oportunidade
                      </Badge>
                    </div>
                  </div>
                );
              })}
              
              {wishlist.filter(item => {
                const distanceToTarget = ((item.precoTarget - item.precoAtual) / item.precoAtual) * 100;
                return Math.abs(distanceToTarget) < 5;
              }).length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nenhum alerta no momento. Continue acompanhando!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MarketPremiumGuard>
  );
}