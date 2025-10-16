import React from 'react';
import PieChartWithLegend from '@/components/charts/PieChartWithLegend';

const TestPieChartWithLegend = () => {
  // Dados de teste para simular a resposta da API
  const mockData = {
    resumo: {
      valor_total: 100000,
      qtd_ativos: 5
    },
    alocacao_por_tipo: [
      { tipo: 'ACAO', valor: 45000, percentual: 45 },
      { tipo: 'FII', valor: 25000, percentual: 25 },
      { tipo: 'RENDA_FIXA', valor: 20000, percentual: 20 },
      { tipo: 'CRYPTO', valor: 10000, percentual: 10 }
    ]
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Teste do Componente PieChartWithLegend</h1>
      
      <div className="grid grid-cols-1 gap-8">
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">1. Com Dados de Teste</h2>
          <PieChartWithLegend testData={mockData} />
        </div>
        
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">2. Estado de Carregamento</h2>
          <PieChartWithLegend isLoading={true} />
        </div>
        
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">3. Estado de Erro</h2>
          <PieChartWithLegend hasError={true} />
        </div>
        
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">4. Dados Vazios</h2>
          <PieChartWithLegend testData={{
            resumo: {
              valor_total: 0,
              qtd_ativos: 0
            },
            alocacao_por_tipo: []
          }} />
        </div>
      </div>
    </div>
  );
};

export default TestPieChartWithLegend;
