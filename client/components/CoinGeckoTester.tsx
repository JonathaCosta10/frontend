import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

import { cryptoApi, checkCoinGeckoStatus } from '../../services/api/crypto';

/**
 * Componente de exemplo para testar a integração com a API do CoinGecko
 */
export function CoinGeckoTester() {
  const { toast } = useToast();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiStatus, setApiStatus] = useState<'operational' | 'limited' | 'down' | 'unknown'>('unknown');
  const [coins, setCoins] = useState<any[]>([]);

  // Verifica o status da API do CoinGecko
  const checkStatus = async () => {
    try {
      const result = await checkCoinGeckoStatus();
      setApiStatus(result.status);
      
      toast({
        title: `Status da API: ${result.status}`,
        description: result.message,
        variant: result.status === 'operational' ? 'default' : 'destructive'
      });
    } catch (error) {
      console.error('Erro ao verificar status da API:', error);
      setApiStatus('down');
      
      toast({
        title: 'Erro ao verificar status da API',
        description: 'Não foi possível conectar ao serviço CoinGecko',
        variant: 'destructive'
      });
    }
  };

  // Busca a lista de criptomoedas
  const fetchCoins = async () => {
    setStatus('loading');
    try {
      const data = await cryptoApi.getMarkets();
      setCoins(data.slice(0, 10)); // Limita a 10 para exibição
      setStatus('success');
      
      toast({
        title: 'Dados carregados com sucesso',
        description: `Obtidas ${data.length} criptomoedas`,
      });
    } catch (error) {
      console.error('Erro ao buscar criptomoedas:', error);
      setStatus('error');
      
      toast({
        title: 'Erro ao buscar dados',
        description: 'Não foi possível obter a lista de criptomoedas',
        variant: 'destructive'
      });
    }
  };

  // Verifica o status assim que o componente é montado
  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Teste da API CoinGecko</CardTitle>
          <CardDescription>
            Verifique se a conexão com a API do CoinGecko está funcionando corretamente
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Status da API */}
          <div className="mb-4">
            <Alert variant={apiStatus === 'operational' ? 'default' : 'destructive'}>
              <Info className="h-4 w-4" />
              <AlertTitle>Status da API</AlertTitle>
              <AlertDescription>
                {apiStatus === 'unknown' && 'Verificando status da API...'}
                {apiStatus === 'operational' && 'API está operacional e respondendo corretamente.'}
                {apiStatus === 'limited' && 'API está com limite de requisições atingido. Tente novamente mais tarde.'}
                {apiStatus === 'down' && 'API está fora do ar ou inacessível.'}
              </AlertDescription>
            </Alert>
          </div>
          
          {/* Botões de ação */}
          <div className="flex flex-row gap-4 my-4">
            <Button onClick={checkStatus}>
              Verificar Status
            </Button>
            <Button 
              onClick={fetchCoins} 
              disabled={apiStatus !== 'operational' || status === 'loading'}
              variant="outline"
            >
              Carregar Top 10 Criptomoedas
            </Button>
          </div>
          
          {/* Resultados */}
          {status === 'loading' && (
            <p className="text-center text-muted-foreground">Carregando dados...</p>
          )}
          
          {status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>
                Não foi possível carregar os dados da API do CoinGecko.
              </AlertDescription>
            </Alert>
          )}
          
          {status === 'success' && (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Moeda</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Preço</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">24h %</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Cap. de Mercado</th>
                  </tr>
                </thead>
                <tbody className="bg-popover divide-y divide-border">
                  {coins.map((coin) => (
                    <tr key={coin.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{coin.market_cap_rank}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <img className="h-6 w-6 rounded-full mr-2" src={coin.image} alt={coin.name} />
                          <div>
                            <div className="font-medium">{coin.name}</div>
                            <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        R$ {coin.current_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${coin.price_change_percentage_24h > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        R$ {(coin.market_cap / 1e9).toFixed(2)}B
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
  );
}
