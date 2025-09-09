import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from '@/contexts/TranslationContext';
import { Loader2, PieChart as PieChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { assetTypeMap } from '@/utils/mappings';
import CompactLegend from '@/components/ui/CompactLegend';
import { investmentsApi } from '@/services/api/investments';

// Interface para os itens de alocação
interface AlocacaoItem {
  tipo: string;
  valor: number;
  percentual: number;
}

// Interface para os dados esperados pelo componente
interface AlocacaoTipoData {
  resumo: {
    valor_total: number;
    qtd_ativos: number;
  };
  alocacao_por_tipo: AlocacaoItem[];
}

// Array de cores para o gráfico
const COLORS = [
  "#3B82F6", // blue-500
  "#10B981", // emerald-500
  "#8B5CF6", // violet-500
  "#F59E0B", // amber-500
  "#EC4899", // pink-500
  "#6366F1", // indigo-500
  "#14B8A6", // teal-500
  "#EF4444", // red-500
  "#A855F7", // purple-500
  "#06B6D4", // cyan-500
];

interface PieChartWithLegendProps {
  testData?: AlocacaoTipoData;
  isLoading?: boolean;
  hasError?: boolean;
}

const PieChartWithLegend: React.FC<PieChartWithLegendProps> = ({ 
  testData = null, 
  isLoading = false, 
  hasError = false 
}) => {
  const { formatCurrency, t } = useTranslation();
  const [data, setData] = useState<AlocacaoTipoData | null>(testData);
  const [loading, setLoading] = useState(isLoading || (testData ? false : true));
  const [error, setError] = useState<string | null>(hasError ? "Erro de teste" : null);

  useEffect(() => {
    // Se dados de teste foram fornecidos, não precisamos buscar da API
    if (testData || isLoading || hasError) return;
    
    const carregarDados = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Chamar API para obter dados de alocação
        const response = await investmentsApi.getAlocacaoTipo();
        
        if (response && response.alocacao_por_tipo) {
          // Calcular o valor total a partir dos dados recebidos
          const valorTotal = response.alocacao_por_tipo.reduce(
            (acc, item) => acc + (typeof item.valor_atual === 'number' ? item.valor_atual : 0), 
            0
          );
          const qtdAtivos = response.alocacao_por_tipo.length;
          
          // Transformar os dados para o formato esperado
          const formattedData: AlocacaoTipoData = {
            resumo: {
              valor_total: valorTotal,
              qtd_ativos: qtdAtivos
            },
            alocacao_por_tipo: response.alocacao_por_tipo.map(item => ({
              tipo: item.tipo,
              valor: item.valor_atual || 0,
              percentual: item.percentual_alocacao || 0
            }))
          };
          
          setData(formattedData);
        }
      } catch (err) {
        console.error("Erro ao carregar dados de alocação:", err);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [testData, isLoading, hasError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Carregando alocação...</p>
        </div>
      </div>
    );
  }

  if (error || !data || !data.resumo || !data.alocacao_por_tipo || data.alocacao_por_tipo.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center">
          <PieChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhum investimento cadastrado
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Cadastre seus investimentos para ver a distribuição por tipo
          </p>
          <Button asChild>
            <a href="/dashboard/investimentos/cadastro">
              Cadastrar Investimento
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // Filtrar apenas FIIs e Ações conforme solicitado
  const filteredData = data.alocacao_por_tipo.filter(item => 
    ['ACAO', 'acao', 'FII', 'fii'].includes(item.tipo)
  );

  // Se não houver dados após a filtragem, mostrar mensagem
  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center">
          <PieChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhuma ação ou fundo imobiliário cadastrado
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Cadastre ações ou fundos imobiliários para ver a distribuição por tipo
          </p>
          <Button asChild>
            <a href="/dashboard/investimentos/cadastro">
              Cadastrar Investimento
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // Calcular o valor total dos itens filtrados
  const valorTotalFiltrado = filteredData.reduce((acc, item) => acc + item.valor, 0);

  // Preparar os dados para o gráfico de pizza com cores
  const chartData = filteredData.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
  }));
  
  // Preparar os dados para a legenda compacta
  const legendItems = chartData.map((item) => ({
    color: item.color,
    label: assetTypeMap[item.tipo] || item.tipo,
    percentage: item.percentual.toFixed(1),
    value: formatCurrency(item.valor)
  }));

  return (
    <div className="space-y-4">
      {/* Resumo Total */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-5 border shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Total em FIIs e Ações
            </h4>
            <p className="text-2xl font-bold">
              {formatCurrency(valorTotalFiltrado)}
            </p>
          </div>
          <div className="text-right">
            <h4 className="text-sm font-medium text-muted-foreground">
              Quantidade de Ativos
            </h4>
            <p className="text-2xl font-bold">
              {filteredData.length}
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico de Pizza */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 min-h-[240px]">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="valor"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(index: number) => assetTypeMap[chartData[index].tipo] || chartData[index].tipo}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1">
          <CompactLegend 
            items={legendItems}
            showPercentages={true}
            orientation="vertical"
            columns={1}
            size="md"
          />
        </div>
      </div>
    </div>
  );
};

export default PieChartWithLegend;
