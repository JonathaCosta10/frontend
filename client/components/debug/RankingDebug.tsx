/**
 * Debug component para testar a integração da API de ranking
 */
import React, { useState, useEffect } from 'react';
import { rankingService } from '@/services/api/rankingService';

export default function RankingDebug() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔍 [Debug] Testando API de ranking...");
      const response = await rankingService.getRanking({
        criterio: 'rentabilidade',
        categoria: 'todas',
        periodo: '12m'
      });
      
      console.log("📊 [Debug] Resposta recebida:", response);
      setData(response);
    } catch (err) {
      console.error("❌ [Debug] Erro:", err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">🔍 Debug API Ranking</h3>
      
      <button 
        onClick={testAPI}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Carregando...' : 'Testar API'}
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Status:</h4>
            <p className={data.success ? 'text-green-600' : 'text-red-600'}>
              {data.success ? '✅ Sucesso' : '❌ Falha'}
            </p>
          </div>

          {data.data && (
            <div>
              <h4 className="font-semibold">Dados:</h4>
              <div className="text-sm">
                <p>• Ranking completo: {data.data.ranking_completo?.length || 0} itens</p>
                <p>• Top 5 melhores: {data.data.top_5_melhores?.length || 0} itens</p>
                <p>• Total de ativos: {data.data.insights?.total_ativos || 0}</p>
                <p>• Ativos positivos: {data.data.insights?.ativos_positivos || 0}</p>
              </div>
            </div>
          )}

          <details className="mt-4">
            <summary className="cursor-pointer font-semibold">Ver JSON completo</summary>
            <pre className="mt-2 p-2 bg-gray-800 text-green-400 text-xs overflow-auto max-h-96 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}