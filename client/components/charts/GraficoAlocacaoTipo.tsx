import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, PieChart } from 'lucide-react';
import { investmentsApi } from '@/services/api/investments';
import type { AlocacaoTipoResponse } from '@/services/api/investments';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/TranslationContext';

// Cores modernas para cada tipo de investimento
const CORES_TIPOS = {
  'Acoes': {
    bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
    text: 'text-blue-600',
    light: 'bg-blue-50',
    border: 'border-blue-200'
  },
  'Fundos Imobiliários': {
    bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600', 
    text: 'text-emerald-600',
    light: 'bg-emerald-50',
    border: 'border-emerald-200'
  },
  'Renda Fixa': {
    bg: 'bg-gradient-to-r from-amber-500 to-amber-600',
    text: 'text-amber-600', 
    light: 'bg-amber-50',
    border: 'border-amber-200'
  },
  'Criptomoedas': {
    bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
    text: 'text-purple-600',
    light: 'bg-purple-50', 
    border: 'border-purple-200'
  }
};

const GraficoAlocacaoTipo = () => {
  const { formatCurrency } = useTranslation();
  const [data, setData] = useState<AlocacaoTipoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
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

  return (
    <div className="space-y-4">
      {/* Resumo Total */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-5 border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total da Carteira</p>
            <p className="text-3xl font-bold text-foreground">
              {formatCurrency(data.total_carteira)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Distribuído em {data.resumo.tipos_diferentes} categoria{data.resumo.tipos_diferentes > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-2">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Portfolio</span>
          </div>
        </div>
      </div>

      {/* Cards de Alocação */}
      <div className="space-y-3">
        {data.alocacao_por_tipo
          .sort((a, b) => b.percentual_alocacao - a.percentual_alocacao)
          .map((item, index) => {
            const cores = CORES_TIPOS[item.tipo as keyof typeof CORES_TIPOS] || CORES_TIPOS['Acoes'];
            
            return (
              <Card key={item.tipo} className={`transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${cores.border} border-l-4`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${cores.bg} shadow-sm`}></div>
                      <div>
                        <h4 className="font-semibold text-foreground text-base">{item.tipo}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {item.quantidade_ativos} ativo{item.quantidade_ativos > 1 ? 's' : ''}
                          </p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <p className="text-xs text-muted-foreground">
                            {((item.valor_atual / data.total_carteira) * 100).toFixed(1)}% do total
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${cores.text} mb-1`}>
                        {item.percentual_alocacao.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">
                        {formatCurrency(item.valor_atual)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Barra de Progresso Moderna */}
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className={`h-full ${cores.bg} transition-all duration-1000 ease-out rounded-full relative overflow-hidden`}
                          style={{ width: `${item.percentual_alocacao}%` }}
                        >
                          {/* Efeito de brilho na barra */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        </div>
                      </div>
                      {/* Porcentagem na barra */}
                      <div className="absolute right-2 top-0 h-3 flex items-center">
                        <span className="text-xs font-semibold text-white drop-shadow-sm">
                          {item.percentual_alocacao > 15 ? `${item.percentual_alocacao.toFixed(0)}%` : ''}
                        </span>
                      </div>
                    </div>
                    
                    {/* Indicadores e badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {index === 0 && (
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cores.light} ${cores.text} border ${cores.border} shadow-sm`}>
                            🏆 Maior alocação
                          </div>
                        )}
                        {item.percentual_alocacao < 10 && data.alocacao_por_tipo.length > 1 && (
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200 shadow-sm">
                            ⚠️ Baixa alocação
                          </div>
                        )}
                        {item.percentual_alocacao > 60 && (
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200 shadow-sm">
                            📊 Alta concentração
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Insights Inteligentes */}
      {data.alocacao_por_tipo.length > 1 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <span className="text-lg">💡</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Análise Inteligente da Carteira
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  • Sua carteira possui <strong>{data.resumo.tipos_diferentes} categoria{data.resumo.tipos_diferentes > 1 ? 's' : ''}</strong> de investimento
                </p>
                
                {data.resumo.maior_alocacao.percentual_alocacao > 70 && (
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    • ⚠️ <strong>Alta concentração:</strong> {data.resumo.maior_alocacao.tipo} representa {data.resumo.maior_alocacao.percentual_alocacao.toFixed(1)}% da carteira
                  </p>
                )}
                
                {data.resumo.maior_alocacao.percentual_alocacao <= 70 && data.resumo.tipos_diferentes >= 2 && (
                  <p className="text-sm text-green-700 dark:text-green-300">
                    • ✅ <strong>Boa diversificação:</strong> Nenhuma categoria domina mais de 70% da carteira
                  </p>
                )}
                
                {data.resumo.tipos_diferentes < 3 && (
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    • 💡 <strong>Dica:</strong> Considere diversificar em mais categorias (Renda Fixa, Criptomoedas, etc.)
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
