import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Loader2, PieChart as PieChartIcon, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { investmentsApi } from '@/services/api/investments';
import type { AlocacaoTipoResponse } from '@/services/api/investments';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/TranslationContext';
import CompactLegend from '@/components/ui/CompactLegend';
import { assetTypeMap } from '@/utils/mappings';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

// Cores para os diferentes tipos de investimentos
const CORES_TIPOS = [
  { bg: 'bg-gradient-to-r from-blue-500 to-blue-600', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-200', color: '#3B82F6' }, // Ações
  { bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200', color: '#10B981' }, // FIIs
  { bg: 'bg-gradient-to-r from-purple-500 to-purple-600', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-200', color: '#8B5CF6' }, // Outros
];

const GraficoAlocacaoTipo = () => {
  const { formatCurrency, t } = useTranslation();
  const [data, setData] = useState<AlocacaoTipoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detalhesMinimizados, setDetalhesMinimizados] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await investmentsApi.getAlocacaoTipo();
        
        if ('alocacao_por_tipo' in response) {
          setData(response as AlocacaoTipoResponse);
        }
      } catch (err) {
        console.error("Erro ao carregar dados de alocação:", err);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

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
  const valorTotalFiltrado = filteredData.reduce((acc, item) => acc + (item.valor_atual || 0), 0);

  // Preparar os dados para o gráfico de pizza com cores
  const chartData = filteredData.map((item, index) => ({
    ...item,
    tipo: item.tipo.toUpperCase(),
    valor: item.valor_atual || 0,
    percentual: item.percentual_alocacao || 0,
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
              {filteredData.reduce((acc, item) => acc + (item.quantidade_ativos || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico de Pizza */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-foreground">Distribuição por Tipo</h3>
          <div className="flex items-center text-xs text-muted-foreground bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-full">
            <PieChartIcon className="h-3.5 w-3.5 mr-1" />
            <span>{filteredData.length} tipos</span>
          </div>
        </div>

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
      
      {/* Cabeçalho da seção de detalhes com toggle */}
      <div className="flex items-center justify-between px-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-foreground">Detalhes por Tipo</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setDetalhesMinimizados(!detalhesMinimizados)} 
          className="h-7 px-2"
        >
          {detalhesMinimizados ? (
            <span className="flex items-center text-xs">
              <ChevronDown className="h-3 w-3 mr-1" /> Expandir
            </span>
          ) : (
            <span className="flex items-center text-xs">
              <ChevronUp className="h-3 w-3 mr-1" /> Minimizar
            </span>
          )}
        </Button>
      </div>
      
      {/* Cards de Tipos - com opção de minimizar */}
      <div className={`space-y-3 transition-all duration-500 ${detalhesMinimizados ? 'max-h-0 overflow-hidden opacity-0 mb-0' : 'max-h-[5000px] opacity-100 mb-4'}`}>
        {chartData
          .sort((a, b) => b.percentual - a.percentual)
          .map((item, index) => {
            const cores = CORES_TIPOS[index % CORES_TIPOS.length];
            const tipoTraduzido = assetTypeMap[item.tipo] || item.tipo;
            
            return (
              <Card key={item.tipo} className={`transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${cores.border} border-l-4`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${cores.bg} shadow-sm`}></div>
                      <div>
                        <h4 className="font-semibold text-foreground text-base">{tipoTraduzido}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {item.quantidade_ativos} ativo{item.quantidade_ativos > 1 ? 's' : ''}
                          </p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <p className="text-xs text-muted-foreground">
                            {item.percentual.toFixed(1)}% do total
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${cores.text} mb-1`}>
                        {item.percentual.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">
                        {formatCurrency(item.valor)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Barra de Progresso */}
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className={`h-full ${cores.bg} transition-all duration-1000 ease-out rounded-full relative overflow-hidden`}
                          style={{ width: `${item.percentual}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        </div>
                      </div>
                      <div className="absolute right-2 top-0 h-3 flex items-center">
                        <span className="text-xs font-semibold text-white drop-shadow-sm">
                          {item.percentual > 15 ? `${item.percentual.toFixed(0)}%` : ''}
                        </span>
                      </div>
                    </div>
                    
                    {/* Badges de Status */}
                    <div className="flex items-center space-x-2 mt-2">
                      {index === 0 && (
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cores.light} ${cores.text} border ${cores.border} shadow-sm`}>
                          🏆 Maior alocação
                        </div>
                      )}
                      {item.percentual > 70 && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200 shadow-sm">
                          ⚠️ Alta concentração
                        </div>
                      )}
                      {item.percentual < 10 && chartData.length > 1 && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200 shadow-sm">
                          ⚠️ Baixa alocação
                        </div>
                      )}
                    </div>
                    
                    {/* Estatísticas adicionais */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className={`${cores.light} rounded-lg p-3 border ${cores.border}`}>
                        <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                          Quantidade de Ativos
                        </h5>
                        <p className={`text-lg font-semibold ${cores.text}`}>
                          {item.quantidade_ativos} {item.quantidade_ativos === 1 ? 'ativo' : 'ativos'}
                        </p>
                      </div>
                      <div className={`${cores.light} rounded-lg p-3 border ${cores.border}`}>
                        <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                          Valor Total
                        </h5>
                        <p className={`text-lg font-semibold ${cores.text}`}>
                          {formatCurrency(item.valor)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
      
      {/* Insights sobre Alocação por Tipo */}
      {chartData.length > 1 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <span className="text-lg">💡</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Análise de Alocação por Tipo
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  • Sua carteira está dividida em <strong>{chartData.length} {chartData.length > 1 ? 'tipos' : 'tipo'}</strong> de investimentos
                </p>
                
                {chartData.length > 0 && (
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    • <strong>Maior concentração:</strong> {assetTypeMap[chartData[0].tipo] || chartData[0].tipo} ({chartData[0].percentual.toFixed(1)}%)
                  </p>
                )}
                
                {chartData.length > 1 && (
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    • <strong>Menor concentração:</strong> {assetTypeMap[chartData[chartData.length-1].tipo] || chartData[chartData.length-1].tipo} ({chartData[chartData.length-1].percentual.toFixed(1)}%)
                  </p>
                )}
                
                {chartData.length > 0 && chartData[0].percentual > 70 && (
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    • ⚠️ <strong>Atenção:</strong> Alta concentração em um tipo pode aumentar o risco
                  </p>
                )}
                
                {chartData.length === 1 && (
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    • 💡 <strong>Dica:</strong> Considere diversificar em mais tipos de ativos para reduzir riscos
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraficoAlocacaoTipo;
