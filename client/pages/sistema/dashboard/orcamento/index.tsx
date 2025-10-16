import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Target,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
} from "lucide-react";
import VariacaoEntradaChart from "@/components/charts/VariacaoEntradaChart";
import DistribuicaoGastosChart from "@/components/charts/DistribuicaoGastosChart";
import MetaRealidadeChart from "@/components/charts/MetaRealidadeChart";
import { useTranslation } from "@/contexts/TranslationContext";
import { usePrivacy } from "@/contexts/PrivacyContext";
import { useMonthYear } from "@/hooks/useMonthYear";
import { BudgetNoDataGuidance } from "@/components/NewUserGuidance";
import { useBudgetCache } from "@/hooks/useApiCache";
import { budgetApi } from "@/services/api/budget";

export default function BudgetOverview() {
  const { t, formatCurrency } = useTranslation();
  const { formatValue, shouldHideCharts } = usePrivacy();
  const { mes, ano } = useMonthYear();

  // Convert to integers for API calls
  const mesInt = parseInt(mes);
  const anoInt = parseInt(ano);

  // Usar cache inteligente para dados principais
  const { 
    data: budgetData, 
    loading,
    error,
    isStale 
  } = useBudgetCache(
    (mes: number, ano: number) => budgetApi.getDistribuicaoGastosCompleta(mes, ano),
    mesInt,
    anoInt,
    {
      ttl: 5 * 60 * 1000, // 5 minutos para dados principais
      staleWhileRevalidate: true
    }
  );

  // Memoizar cálculos pesados para evitar re-execução desnecessária
  const dadosComputados = useMemo(() => {
    if (!budgetData) return null;

    const mesKey = mesInt.toString();
    const dadosMes = budgetData?.dados_mensais?.[mesKey];
    const mesDisponivel = budgetData?.meses_disponeis?.includes(mesKey) || false;

    const calcularVariacaoMensalEntradas = () => {
      if (!budgetData?.dados_mensais) return 0;
      
      const mesAtual = mesInt;
      const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
      const anoAnterior = mesAtual === 1 ? anoInt - 1 : anoInt;
      
      const chaveAtual = mesAtual.toString();
      const chaveAnterior = mesAnterior.toString();
      
      const entradasAtual = budgetData.dados_mensais[chaveAtual]?.resumo_financeiro?.total_entradas || 0;
      const entradasAnterior = budgetData.dados_mensais[chaveAnterior]?.resumo_financeiro?.total_entradas || 0;
      
      if (entradasAnterior === 0) return 0;
      return ((entradasAtual - entradasAnterior) / entradasAnterior) * 100;
    };

    const calcularVariacaoMensalCustos = () => {
      if (!budgetData?.dados_mensais) return 0;
      
      const mesAtual = mesInt;
      const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
      const anoAnterior = mesAtual === 1 ? anoInt - 1 : anoInt;
      
      const chaveAtual = mesAtual.toString();
      const chaveAnterior = mesAnterior.toString();
      
      const custosAtual = budgetData.dados_mensais[chaveAtual]?.resumo_financeiro?.total_custos || 0;
      const custosAnterior = budgetData.dados_mensais[chaveAnterior]?.resumo_financeiro?.total_custos || 0;
      
      if (custosAnterior === 0) return 0;
      return ((custosAtual - custosAnterior) / custosAnterior) * 100;
    };

    return {
      mesKey,
      dadosMes,
      mesDisponivel,
      variacaoEntradas: calcularVariacaoMensalEntradas(),
      variacaoCustos: calcularVariacaoMensalCustos()
    };
  }, [budgetData, mesInt, anoInt]);

  const getVariationIcon = (variacao: number) => {
    if (variacao > 0) return <ArrowUpRight className="h-3 w-3" />;
    if (variacao < 0) return <ArrowDownRight className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getVariationColor = (variacao: number, isExpense = false) => {
    if (variacao === 0) return "text-muted-foreground";
    
    if (isExpense) {
      // Para gastos: aumento é ruim (vermelho), diminuição é bom (verde)
      return variacao > 0 ? "text-destructive" : "text-success";
    } else {
      // Para entradas: aumento é bom (verde), diminuição é ruim (vermelho)
      return variacao > 0 ? "text-success" : "text-destructive";
    }
  };

  const getNomeMes = (numeroMes: number): string => {
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return meses[numeroMes - 1] || "";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {isStale && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                Dados podem estar desatualizados - recarregando...
              </span>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
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

  // Se não temos dados computados, mostrar erro ou loading
  if (!dadosComputados) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
              <p className="text-muted-foreground">
                Não foi possível carregar os dados do orçamento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { dadosMes, mesDisponivel, variacaoEntradas, variacaoCustos } = dadosComputados;

  // Verificar se há dados para o mês selecionado
  if (budgetData && !mesDisponivel) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Dados não disponíveis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetNoDataGuidance />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dados calculados do mês atual
  const saldoMensal = dadosMes?.resumo_financeiro?.saldo_liquido_mensal || 0;
  const totalEntradas = dadosMes?.resumo_financeiro?.total_entradas || 0;
  const totalGastos = dadosMes?.resumo_financeiro?.total_gastos || 0;
  const totalDividasMensais = dadosMes?.resumo_financeiro?.total_dividas_mensais || 0;
  const totalCustos = dadosMes?.resumo_financeiro?.total_custos || 0;
  const totalPatrimonio = 0; // Será implementado com API de patrimônio
  const metasAtingidas = 0; // Será implementado com API de metas

  // Nome do mês anterior para contexto
  const mesAnteriorNum = mesInt === 1 ? 12 : mesInt - 1;
  const mesAnteriorNome = getNomeMes(mesAnteriorNum);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Indicador de dados stale */}
        {isStale && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                Dados sendo atualizados em segundo plano...
              </span>
            </div>
          </div>
        )}

        {/* Cards resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Entradas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <span>{t("total_income")}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total de entradas do mês atual</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <div className="flex items-center space-x-2">
                {!shouldHideCharts() && variacaoEntradas !== 0 && (
                  <div className={`flex items-center text-xs ${getVariationColor(variacaoEntradas)}`}>
                    {getVariationIcon(variacaoEntradas)}
                    <span className="ml-1">{Math.abs(variacaoEntradas).toFixed(1)}%</span>
                  </div>
                )}
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatValue(totalEntradas)}
              </div>
              {!shouldHideCharts() && (
                <p className="text-xs text-muted-foreground mt-1">
                  {variacaoEntradas !== 0 && (
                    <>vs {mesAnteriorNome}: {variacaoEntradas > 0 ? '+' : ''}{variacaoEntradas.toFixed(1)}%</>
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Card Gastos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <span>{t("total_expenses")}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total de gastos ({formatValue(totalGastos)}) + dívidas mensais ({formatValue(totalDividasMensais)})</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <div className="flex items-center space-x-2">
                {!shouldHideCharts() && variacaoCustos !== 0 && (
                  <div className={`flex items-center text-xs ${getVariationColor(variacaoCustos, true)}`}>
                    {getVariationIcon(variacaoCustos)}
                    <span className="ml-1">{Math.abs(variacaoCustos).toFixed(1)}%</span>
                  </div>
                )}
                <TrendingDown className="h-4 w-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatValue(totalCustos)}
              </div>
              {!shouldHideCharts() && (
                <p className="text-xs text-muted-foreground mt-1">
                  {variacaoCustos !== 0 && (
                    <>vs {mesAnteriorNome}: {variacaoCustos > 0 ? '+' : ''}{variacaoCustos.toFixed(1)}%</>
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Card Saldo */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <span>{t("monthly_balance")}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Entradas - Custos totais</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <DollarSign className={`h-4 w-4 ${saldoMensal >= 0 ? 'text-success' : 'text-destructive'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${saldoMensal >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatValue(saldoMensal)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {saldoMensal >= 0 ? t("positive_balance") : t("attention_negative_balance")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Grid principal com gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Histórico anual de entradas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Histórico anual de entradas</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("january_to_december_current_year")}
              </p>
            </CardHeader>
            <CardContent>
              <VariacaoEntradaChart mes={mesInt} ano={anoInt} />
            </CardContent>
          </Card>

          {/* Distribuição anual de gastos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Distribuição anual de gastos</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("how_expenses_distributed_annual", {
                  year: anoInt
                })}
              </p>
            </CardHeader>
            <CardContent>
              <DistribuicaoGastosChart mes={mesInt} ano={anoInt} />
            </CardContent>
          </Card>
        </div>

        {/* Análise Meta vs Realidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Meta vs Realidade</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Comparação entre orçamento planejado e gastos reais
            </p>
          </CardHeader>
          <CardContent>
            <MetaRealidadeChart mes={mesInt} ano={anoInt} />
          </CardContent>
        </Card>

        {/* Seção de insights e dicas */}
        {!shouldHideCharts() && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Financeiro */}
            <div>
              <h4 className="font-semibold mb-3">Status Financeiro</h4>
              <div className="space-y-3">
                {saldoMensal < 0 && (
                  <div className="flex items-center space-x-2 p-3 bg-destructive/10 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-sm">{t("warning_negative_balance")}</span>
                  </div>
                )}

                {saldoMensal >= 0 && totalCustos > 0 && (
                  <div className="flex items-center space-x-2 p-3 bg-success/10 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-sm">{t("congratulations_in_green")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dicas Personalizadas */}
            <div>
              <h4 className="font-semibold mb-3">Dicas Personalizadas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {saldoMensal < 0 ? (
                  <>
                    <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                      <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                        {t("expense_control_tip")}
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {t("expense_control_description")}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        {t("detailed_analysis_tip")}
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {t("detailed_analysis_description")}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                        {t("reserve_for_emergencies")}
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {t("emergency_reserve_tip")}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                        {t("investment_opportunity")}
                      </h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        {t("investment_opportunity_description")}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dicas Educativas */}
        <div>
          <h4 className="font-semibold mb-4">💡 Dicas Financeiras</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dica sobre Entradas */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">💡 Entrada Financeira</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Mantenha suas entradas consistentes ao longo do ano para ter maior previsibilidade financeira. 
                Considere criar uma reserva de emergência equivalente a 6 meses de gastos.
              </p>
            </div>

            {/* Dica sobre Gastos */}
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800 dark:text-orange-200">🎯 Controle de Gastos</span>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Identifique suas categorias de maior gasto e analise se estão alinhadas com seus objetivos. 
                Pequenos ajustes podem gerar grandes economias ao longo do tempo.
              </p>
            </div>

            {/* Dica sobre Planejamento */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-800 dark:text-purple-200">📊 Planejamento Mensal</span>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Use a regra 50/30/20: 50% para necessidades, 30% para desejos e 20% para poupança e investimentos. 
                Ajuste conforme sua realidade financeira.
              </p>
            </div>

            {/* Dica sobre Metas */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">🎯 Estabeleça Metas</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Defina objetivos financeiros claros e mensuráveis. 
                Acompanhe seu progresso mensalmente para manter a motivação e ajustar estratégias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
