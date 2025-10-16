import React, { useEffect, useState } from "react";
import { investmentsApi } from '@/services/api/investments';

const TesteRentabilidade: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🧪 Teste: Iniciando busca de dados");
        setLoading(true);
        setError(null);
        
        const response = await investmentsApi.getRentabilidadeGeral();
        console.log("🧪 Teste: Dados recebidos:", response);
        setData(response);
      } catch (error) {
        console.error("🧪 Teste: Erro:", error);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>⏳ Carregando teste...</div>;
  }

  if (error) {
    return <div>❌ Erro: {error}</div>;
  }

  if (!data) {
    return <div>⚠️ Nenhum dado recebido</div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>🧪 Teste de Rentabilidade</h3>
      <p><strong>Success:</strong> {data.success ? 'true' : 'false'}</p>
      <p><strong>Meses analisados:</strong> {data.data?.periodo_analise?.meses_analisados || 'N/A'}</p>
      <p><strong>Patrimônio final:</strong> R$ {data.data?.metricas_periodo?.patrimonio_final?.toLocaleString('pt-BR') || 'N/A'}</p>
      <p><strong>Total dividendos:</strong> R$ {data.data?.metricas_periodo?.total_dividendos_periodo?.toLocaleString('pt-BR') || 'N/A'}</p>
      <p><strong>Qtd meses evolução:</strong> {data.data?.evolucao_mensal_consolidada?.length || 0}</p>
      
      <details>
        <summary>Ver dados completos</summary>
        <pre style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default TesteRentabilidade;