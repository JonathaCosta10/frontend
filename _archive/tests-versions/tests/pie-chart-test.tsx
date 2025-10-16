import React from 'react';
import PieChartTest from '@/components/charts/PieChartTest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TestPage: React.FC = () => {
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
      <h1 className="text-2xl font-bold mb-6">Teste do Componente PieChart</h1>
      
      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Com Dados de Teste</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartTest data={mockData} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>2. Estado de Carregamento</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartTest isLoading={true} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>3. Estado de Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartTest hasError={true} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>4. Dados Vazios</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartTest data={{
              resumo: {
                valor_total: 0,
                qtd_ativos: 0
              },
              alocacao_por_tipo: []
            }} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>5. Apenas com Renda Fixa (Deve mostrar mensagem)</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartTest data={{
              resumo: {
                valor_total: 50000,
                qtd_ativos: 2
              },
              alocacao_por_tipo: [
                { tipo: 'RENDA_FIXA', valor: 30000, percentual: 60 },
                { tipo: 'CRYPTO', valor: 20000, percentual: 40 }
              ]
            }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestPage;
