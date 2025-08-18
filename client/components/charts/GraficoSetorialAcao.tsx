import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, BarChart3, Building2 } from 'lucide-react';
import { investmentsApi } from '@/services/api/investments';
import type { SetorResponse, SetorData } from '@/services/api/investments';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/TranslationContext';

interface GraficoSetorialAcaoProps {
  tipoSelecionado?: string;
}

// Cores modernas para cada setor
const CORES_SETORES = [
  { bg: 'bg-gradient-to-r from-blue-500 to-blue-600', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-200' },
  { bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200' },
  { bg: 'bg-gradient-to-r from-purple-500 to-purple-600', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-200' },
  { bg: 'bg-gradient-to-r from-orange-500 to-orange-600', text: 'text-orange-600', light: 'bg-orange-50', border: 'border-orange-200' },
  { bg: 'bg-gradient-to-r from-pink-500 to-pink-600', text: 'text-pink-600', light: 'bg-pink-50', border: 'border-pink-200' },
  { bg: 'bg-gradient-to-r from-indigo-500 to-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-200' },
  { bg: 'bg-gradient-to-r from-cyan-500 to-cyan-600', text: 'text-cyan-600', light: 'bg-cyan-50', border: 'border-cyan-200' },
  { bg: 'bg-gradient-to-r from-red-500 to-red-600', text: 'text-red-600', light: 'bg-red-50', border: 'border-red-200' },
];

const GraficoSetorialAcao: React.FC<GraficoSetorialAcaoProps> = ({ tipoSelecionado = 'Acoes' }) => {
  const { formatCurrency } = useTranslation();
  const [data, setData] = useState<SetorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await investmentsApi.getSetores(tipoSelecionado);
        
        // Verificar se é o novo formato
        if ('data' in response && response.success) {
          setData(response as SetorResponse);
        } else {
          // Formato antigo - converter para mock
          console.log("Formato antigo da API de setores detectado");
          setError("Dados não disponíveis no formato atual");
        }
      } catch (err) {
        console.error("Erro ao carregar dados de setores:", err);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [tipoSelecionado]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Carregando setores...</p>
        </div>
      </div>
    );
  }

  if (error || !data || !data.data || !data.data.resumo || !data.data.setores || data.data.setores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Dados não disponíveis
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Não foi possível carregar a análise setorial para {tipoSelecionado}
          </p>
          <Button asChild variant="outline">
            <a href="/dashboard/investimentos/cadastro">
              Cadastrar Investimentos
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
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Análise Setorial - {data.data.tipo_analise}
            </p>
            <p className="text-3xl font-bold text-foreground">
              {formatCurrency(data.data.valor_total)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.data.total_ativos} ativo{data.data.total_ativos > 1 ? 's' : ''} em {data.data.resumo.quantidade_setores} setor{data.data.resumo.quantidade_setores > 1 ? 'es' : ''}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mb-2">
              <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Setores</span>
          </div>
        </div>
      </div>

      {/* Cards de Setores */}
      <div className="space-y-3">
        {data.data.setores
          .sort((a, b) => b.percentual_alocacao - a.percentual_alocacao)
          .map((setor, index) => {
            const cores = CORES_SETORES[index % CORES_SETORES.length];
            
            return (
              <Card key={setor.setor} className={`transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${cores.border} border-l-4`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${cores.bg} shadow-sm`}></div>
                      <div>
                        <h4 className="font-semibold text-foreground text-base">{setor.setor}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {setor.quantidade_ativos} ativo{setor.quantidade_ativos > 1 ? 's' : ''}
                          </p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <p className="text-xs text-muted-foreground">
                            {((setor.valor_total / data.data.valor_total) * 100).toFixed(1)}% do tipo
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${cores.text} mb-1`}>
                        {setor.percentual_alocacao.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">
                        {formatCurrency(setor.valor_total)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Barra de Progresso */}
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className={`h-full ${cores.bg} transition-all duration-1000 ease-out rounded-full relative overflow-hidden`}
                          style={{ width: `${setor.percentual_alocacao}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        </div>
                      </div>
                      <div className="absolute right-2 top-0 h-3 flex items-center">
                        <span className="text-xs font-semibold text-white drop-shadow-sm">
                          {setor.percentual_alocacao > 15 ? `${setor.percentual_alocacao.toFixed(0)}%` : ''}
                        </span>
                      </div>
                    </div>
                    
                    {/* Lista de Ativos */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Ativos no Setor
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {setor.ativos.map((ativo) => (
                          <div key={ativo.ticker} className={`${cores.light} ${cores.border} border rounded-lg p-3`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-sm text-foreground">{ativo.ticker}</p>
                                <p className="text-xs text-muted-foreground">
                                  {ativo.quantidade} cotas
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-bold ${cores.text}`}>
                                  {formatCurrency(ativo.valor_atual)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(ativo.preco_atual)}/cota
                                </p>
                              </div>
                            </div>
                            
                            {/* Ganho/Perda */}
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">G/P:</span>
                                <Badge 
                                  variant={ativo.valor_atual >= ativo.valor_investido ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {ativo.valor_atual >= ativo.valor_investido ? '+' : ''}
                                  {formatCurrency(ativo.valor_atual - ativo.valor_investido)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Badges de Status */}
                    <div className="flex items-center space-x-2">
                      {index === 0 && (
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cores.light} ${cores.text} border ${cores.border} shadow-sm`}>
                          🏆 Maior concentração
                        </div>
                      )}
                      {setor.percentual_alocacao > 50 && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200 shadow-sm">
                          ⚠️ Alta concentração setorial
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Insights Setoriais */}
      {data.data.resumo.quantidade_setores > 1 && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border border-purple-200 dark:border-purple-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
              <span className="text-lg">📊</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Análise Setorial - {data.data.tipo_analise}
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  • Carteira diversificada em <strong>{data.data.resumo.quantidade_setores} setores</strong>
                </p>
                
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  • <strong>Maior concentração:</strong> {data.data.resumo.maior_concentracao.setor} ({data.data.resumo.maior_concentracao.percentual.toFixed(1)}%)
                </p>
                
                {data.data.resumo.quantidade_setores > 1 && (
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    • <strong>Menor concentração:</strong> {data.data.resumo.menor_concentracao.setor} ({data.data.resumo.menor_concentracao.percentual.toFixed(1)}%)
                  </p>
                )}
                
                {data.data.resumo.maior_concentracao.percentual > 60 && (
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    • ⚠️ <strong>Atenção:</strong> Alta concentração em um setor pode aumentar o risco
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

export default GraficoSetorialAcao;
