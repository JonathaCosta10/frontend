import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, PieChart, TrendingUp, Loader2 } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { usePrivacy } from "@/contexts/PrivacyContext";
import PieChartWithLegend from "@/components/charts/PieChartWithLegend";
import GraficoSetorialAcao from "@/components/charts/GraficoSetorialAcao";
import GraficoDividendosFII from "@/components/charts/GraficoDividendosFII";
import InvestmentDividendPremiumGuard from "@/components/InvestmentDividendPremiumGuard";
import { investmentsApi } from '@/services/api/investments';
import type { AlocacaoTipoResponse } from '@/services/api/investments';
import investmentService, { InvestmentAsset } from "@/services/investmentService";
import { InvestmentsNoDataGuidance } from "@/components/NewUserGuidance";

// Funções auxiliares para cálculos
const toNumber = (value: string | number | undefined | null): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Calcula a rentabilidade com base no valor investido e no valor atual
const calcularRentabilidade = (valorInvestido: number, valorAtual: number): number => {
  if (valorInvestido <= 0) return 0;
  return ((valorAtual - valorInvestido) / valorInvestido) * 100;
};

export default function Investimentos() {
  const { t, formatCurrency } = useTranslation();
  const { formatValue, shouldHideCharts } = usePrivacy();
  const [tipoSelecionado, setTipoSelecionado] = useState("Acoes");
  const [alocacaoData, setAlocacaoData] = useState<AlocacaoTipoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [investimentos, setInvestimentos] = useState<InvestmentAsset[]>([]);
  const [rentabilidadeTotal, setRentabilidadeTotal] = useState<number>(0);
  const [dadosSetoriais, setDadosSetoriais] = useState<{totalAtivos: number; quantidadeSetores: number}>({
    totalAtivos: 0,
    quantidadeSetores: 0
  });

  // Obter mês e ano do localStorage para os gráficos de dividendos
  const mes = localStorage.getItem("mes") || String(new Date().getMonth() + 1).padStart(2, "0");
  const ano = localStorage.getItem("ano") || String(new Date().getFullYear());

  // Carregar dados da API
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        
        // Obter dados de alocação
        try {
          const data = await investmentsApi.getAlocacaoTipo();
          
          // Verificar se é o novo formato
          if (data && 'alocacao_por_tipo' in data) {
            setAlocacaoData(data as AlocacaoTipoResponse);
          }
        } catch (alocacaoError) {
          console.error("Erro ao carregar dados de alocação:", alocacaoError);
          // Não interrompemos completamente o fluxo, apenas registramos o erro
        }
        
        // Obter dados setoriais para diversificação
        try {
          const setoresData = await investmentsApi.getSetores(tipoSelecionado);
          
          if (setoresData && 'data' in setoresData && setoresData.success) {
            // Formato novo da API
            console.log("Formato API novo detectado:", setoresData.data);
            setDadosSetoriais({
              totalAtivos: setoresData.data.total_ativos || 0,
              quantidadeSetores: setoresData.data.resumo.quantidade_setores || 0
            });
          } else if (setoresData && 'setores' in setoresData) {
            // Formato antigo (mock para desenvolvimento)
            console.log("Formato API antigo detectado:", setoresData);
            const setores = setoresData.setores || [];
            // Contagem explícita de todos os ativos em todos os setores
            const totalAtivos = setores.reduce((sum, setor) => {
              // Garantir que acoes existe e é um array
              return sum + (Array.isArray(setor.acoes) ? setor.acoes.length : 0);
            }, 0);
            setDadosSetoriais({
              totalAtivos: totalAtivos,
              quantidadeSetores: setores.length
            });
          } else {
            // Fallback seguro para evitar exibição de dados incorretos
            console.log("Formato de dados não reconhecido:", setoresData);
            setDadosSetoriais({
              totalAtivos: 0,
              quantidadeSetores: 0
            });
          }
        } catch (setoresError) {
          console.error("Erro ao carregar dados de setores:", setoresError);
        }
        
        // Buscar ativos pessoais para calcular rentabilidade e diversificação
        try {
          const ativosData = await investmentService.buscarAtivosPessoais();
          
          if (ativosData) {
            setInvestimentos(ativosData);
            
            // Calcular rentabilidade total
            if (ativosData.length > 0) {
              const totalInvestido = ativosData.reduce((acc, inv) => acc + toNumber(inv.valor_investido), 0);
              const totalAtual = ativosData.reduce((acc, inv) => acc + toNumber(inv.valor_atual), 0);
              const rentabilidade = calcularRentabilidade(totalInvestido, totalAtual);
              setRentabilidadeTotal(rentabilidade);
              
              // Salvar no localStorage para uso futuro se necessário
              localStorage.setItem("rentabilidadeTotal", rentabilidade.toFixed(2));
              
              // Calcular diversificação baseada nos ativos pessoais (combinando ACAO e FII)
              const setoresPorTipo = new Map<string, Set<string>>();
              const ativosAcoesFII = ativosData.filter(ativo => 
                ativo.tipo === "ACAO" || ativo.tipo === "FII" || 
                ativo.tipo === "Acoes" || ativo.tipo === "Fundos Imobiliários");
                
              // Vamos usar o ticker como identificador de setor (simplificado)
              // Em um cenário real, precisaríamos de um mapeamento de tickers para setores
              ativosAcoesFII.forEach(ativo => {
                const tipo = ativo.tipo || "Desconhecido";
                if (!setoresPorTipo.has(tipo)) {
                  setoresPorTipo.set(tipo, new Set());
                }
                // Considerar cada ticker como um "setor" diferente para este exemplo
                // Em um caso real, usaríamos um campo específico de setor
                setoresPorTipo.get(tipo)?.add(ativo.ticker);
              });
              
              // Total de ativos únicos considerando ACAO e FII
              const totalAtivos = ativosAcoesFII.length;
              
              // Total de "setores" (nesse caso usamos tickers como proxy)
              const setoresUnicos = new Set<string>();
              ativosAcoesFII.forEach(ativo => {
                setoresUnicos.add(ativo.ticker.substring(0, 4)); // Usar prefixo como aproximação de setor
              });
              
              // Atualizar dados setoriais com base nos ativos pessoais
              setDadosSetoriais({
                totalAtivos: totalAtivos,
                quantidadeSetores: setoresUnicos.size
              });
            }
          }
        } catch (ativosError) {
          console.error("Erro ao carregar ativos pessoais:", ativosError);
          // Não interrompemos completamente o fluxo, apenas registramos o erro
        }
      } catch (error) {
        console.error("Erro geral ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [tipoSelecionado]);

  // Verificar se há investimentos cadastrados
  const temInvestimentos = !loading && investimentos && investimentos.length > 0;
  const temAlocacaoData = !loading && alocacaoData && alocacaoData.total_carteira > 0;
  
  // Se estiver carregando, mostrar o loader
  if (loading) {
    return (
      <div className="space-y-3 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Se não houver investimentos cadastrados, mostrar orientação
  if (!temInvestimentos && !temAlocacaoData) {
    return <InvestmentsNoDataGuidance />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('investment_dashboard')}</h2>
          <p className="text-muted-foreground">
            {t('track_performance_distribution')}
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {t('updated_real_time')}
        </Badge>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!shouldHideCharts() && (
          <Card className="md:col-span-1 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('diversification')}</CardTitle>
              <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full">
                <PieChart className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Por Tipo</span>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Carregando dados...</p>
                  </div>
                </div>
              ) : !alocacaoData || alocacaoData.alocacao_por_tipo.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-6">
                  <PieChart className="h-12 w-12 text-muted-foreground mb-3" />
                  <div className="text-xl font-bold text-center">Nenhum investimento</div>
                  <p className="text-sm text-muted-foreground mt-1 text-center">
                    Adicione investimentos para ver sua diversificação
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Carteira total em destaque */}
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-muted-foreground">Carteira Total</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold">{formatValue(alocacaoData.total_carteira)}</span>
                      <span className="text-sm text-muted-foreground">{alocacaoData.resumo.tipos_diferentes} tipos</span>
                    </div>
                  </div>
                  
                  {/* Lista com Barras de Progresso - Layout Aprimorado */}
                  <div className="space-y-3">
                    {alocacaoData.alocacao_por_tipo.map((item, index) => {
                      const tipoTraduzido = item.tipo === "ACAO" ? "Ação" : 
                                            item.tipo === "FII" ? "Fundos Imobiliários" : 
                                            item.tipo;
                      
                      const bgColor = index === 0 ? "bg-blue-500" : 
                                    index === 1 ? "bg-emerald-500" : 
                                    "bg-purple-500";
                      
                      const bgLight = index === 0 ? "bg-blue-50" : 
                                    index === 1 ? "bg-emerald-50" : 
                                    "bg-purple-50";
                                    
                      const textColor = index === 0 ? "text-blue-700" : 
                                       index === 1 ? "text-emerald-700" : 
                                       "text-purple-700";
                      
                      const borderColor = index === 0 ? "border-blue-200" : 
                                        index === 1 ? "border-emerald-200" : 
                                        "border-purple-200";
                      
                      return (
                        <div key={item.tipo} className={`p-3 rounded-lg ${bgLight} border ${borderColor} transition-all duration-200 hover:shadow-md`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full ${bgColor} mr-2.5`}></div>
                              <span className={`font-medium text-base ${textColor}`}>{tipoTraduzido}</span>
                            </div>
                            <div className={`font-bold text-lg ${textColor}`}>
                              {item.percentual_alocacao.toFixed(1)}%
                            </div>
                          </div>
                          
                          {/* Barra de progresso */}
                          <div className="w-full bg-white dark:bg-slate-700 rounded-full h-2 mb-2">
                            <div 
                              className={`${bgColor} h-2 rounded-full`} 
                              style={{ width: `${item.percentual_alocacao}%` }}
                            ></div>
                          </div>
                          
                          {/* Grid de detalhes */}
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Ativos</p>
                              <p className={`font-semibold ${textColor}`}>
                                {item.quantidade_ativos} {item.quantidade_ativos === 1 ? "ativo" : "ativos"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Valor</p>
                              <p className={`font-semibold ${textColor}`}>
                                {formatValue(item.valor_atual)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Insights de diversificação */}
                  {alocacaoData.resumo.tipos_diferentes > 1 && (
                    <div className="text-xs text-muted-foreground p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-1.5">
                        <span>💡</span>
                        <span>
                          {alocacaoData.alocacao_por_tipo[0].percentual_alocacao > 70 ? (
                            <span>Considere diversificar mais para reduzir riscos</span>
                          ) : (
                            <span>Boa distribuição entre diferentes tipos de ativos</span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!shouldHideCharts() && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('profitability')}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Carregando...</span>
                </div>
              ) : (
                <>
                  <div className={`text-2xl font-bold ${rentabilidadeTotal >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {rentabilidadeTotal >= 0 ? '+' : ''}{rentabilidadeTotal.toFixed(2)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('accumulated_year')}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <InvestmentDividendPremiumGuard feature="dividends_card">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dividends')}</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatValue(2830)}</div>
              <p className="text-xs text-muted-foreground">
                {t('received_month')}
              </p>
            </CardContent>
          </Card>
        </InvestmentDividendPremiumGuard>
      </div>

      {/* Gráficos principais */}
      {!shouldHideCharts() && (
        <div className="grid grid-cols-1 gap-6">
          {/* Alocação Setorial */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>{t('sector_allocation')}</span>
                </CardTitle>
                <Select value={tipoSelecionado} onValueChange={setTipoSelecionado}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Acoes">{t('stocks')}</SelectItem>
                    <SelectItem value="Fundos Imobiliários">{t('reits')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('investments_distributed_sector')}
              </p>
            </CardHeader>
            <CardContent>
              <GraficoSetorialAcao tipoSelecionado={tipoSelecionado} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Histórico de Dividendos */}
      <InvestmentDividendPremiumGuard feature="dividends_history">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>{t('dividend_history')} - {tipoSelecionado}</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('dividend_evolution_over_time')}
                </p>
              </div>
              <Badge variant="secondary">
                {mes}/{ano}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <GraficoDividendosFII
              mes={mes}
              ano={ano}
              tipoSelecionado={tipoSelecionado}
            />
          </CardContent>
        </Card>
      </InvestmentDividendPremiumGuard>

      {/* Insights e Recomendações */}
      {!shouldHideCharts() && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('performance_analysis')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>{t('diversification_goal')}:</strong> {t('well_diversified_score', { score: '85' })}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>{t('profitability_performance')}:</strong> {t('investments_performing_above_cdi', { percentage: '2.3' })}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>{t('attention_warning')}:</strong> {t('consider_rebalancing_portfolio')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('next_steps')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InvestmentDividendPremiumGuard feature="dividends_insights">
                <div className="p-3 border-l-4 border-l-primary bg-primary/5 rounded-r-lg">
                  <p className="text-sm">
                    <strong>{t('leverage_dividends')}:</strong> {t('received_this_month_consider_reinvest', { amount: formatCurrency(2830) })}
                  </p>
                </div>
              </InvestmentDividendPremiumGuard>
              <div className="p-3 border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-950 rounded-r-lg">
                <p className="text-sm">
                  <strong>{t('explore_new_sectors')}:</strong> {t('portfolio_concentrated_diversify')}
                </p>
              </div>
              <div className="p-3 border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950 rounded-r-lg">
                <p className="text-sm">
                  <strong>{t('increase_contributions')}:</strong> {t('positive_performance_increase_monthly')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
