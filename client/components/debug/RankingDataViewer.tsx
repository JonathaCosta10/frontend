import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, RefreshCw, Download } from 'lucide-react';
import { getRanking } from '@/services/api/rankingService';

export default function RankingDataViewer() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getRanking();
      setData(response);
      
      console.log("🔍 [Debug] Dados completos da API:", response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error("❌ [Debug] Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const downloadJson = () => {
    if (!data) return;
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ranking-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Debug: Dados da API de Ranking</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Button onClick={loadData} disabled={loading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Recarregar
            </Button>
            {data && (
              <Button onClick={downloadJson} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-8">
              <p>Carregando dados...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8 text-red-500">
              <p>Erro: {error}</p>
            </div>
          )}
          
          {data && (
            <div className="space-y-4">
              {/* Resumo dos dados */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-2xl font-bold">{data.data?.ranking_completo?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Ativos no Ranking</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <p className="text-2xl font-bold">{data.data?.top_5_melhores?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Top Melhores</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <p className="text-2xl font-bold">{data.data?.top_5_piores?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Top Piores</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <p className="text-2xl font-bold">
                      {data.data?.insights?.oportunidades_total || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Oportunidades</p>
                  </CardContent>
                </Card>
              </div>

              {/* Estrutura dos campos */}
              {data.data?.ranking_completo?.[0] && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Campos Disponíveis (Primeiro Item):</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Object.keys(data.data.ranking_completo[0]).map((key) => (
                      <Badge key={key} variant="outline" className="justify-start">
                        {key}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights disponíveis */}
              {data.data?.insights && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Insights Disponíveis:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Object.keys(data.data.insights).map((key) => (
                      <Badge key={key} variant="secondary" className="justify-start">
                        {key}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Exemplo de estrutura de oportunidade */}
              {data.data?.ranking_completo?.[0]?.oportunidade && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Estrutura das Oportunidades:</h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(data.data.ranking_completo[0].oportunidade, null, 2)}
                  </pre>
                </div>
              )}

              {/* JSON completo (colapsável) */}
              <details className="mt-6">
                <summary className="cursor-pointer text-lg font-semibold mb-2">
                  Ver JSON Completo (Clique para expandir)
                </summary>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-xs overflow-x-auto max-h-96 overflow-y-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}