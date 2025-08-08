import React, { useState, useEffect } from "react";
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
import { budgetApi, DistribuicaoGastosResponse } from "@/services/api/budget";
import { useTranslation } from "@/contexts/TranslationContext";
import { useMonthYear } from "@/hooks/useMonthYear";
import { BudgetNoDataGuidance } from "@/components/NewUserGuidance";

export default function BudgetOverview() {
  const { t, formatCurrency } = useTranslation();
  const { mes, ano } = useMonthYear();

  // Convert to integers for API calls
  const mesInt = parseInt(mes);
  const anoInt = parseInt(ano);

  const [budgetData, setBudgetData] = useState<DistribuicaoGastosResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBudgetData = async () => {
      setLoading(true);
      try {
        const data = await budgetApi.getDistribuicaoGastosCompleta(mesInt, anoInt);
        setBudgetData(data);
      } catch (error) {
        console.error("Erro ao carregar dados do orçamento:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBudgetData();
  }, [mesInt, anoInt]);

  const getVariationIcon = (variacao: number) => {
    if (variacao > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (variacao < 0) return <ArrowDownRight className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getVariationColor = (variacao: number, isExpense = false) => {
    if (variacao === 0) return "text-muted-foreground";

    const isPositive = variacao > 0;
    if (isExpense) {
      return isPositive ? "text-destructive" : "text-success";
    }
    return isPositive ? "text-success" : "text-destructive";
  };

  // Dados específicos do mês selecionado
  // Remover zero à esquerda do mês para compatibilidade com a API
  const mesKey = mesInt.toString(); // "8" ao invés de "08"
  const dadosMes = budgetData?.dados_mensais?.[mesKey];
  const mesDisponivel = budgetData?.meses_disponeis?.includes(mesKey) || false;
  
  // Calcular variação entre os últimos dois meses
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

  // Função para obter o nome do mês
  const getNomeMes = (numeroMes: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[numeroMes - 1] || '';
  };

  const mesAtualNome = getNomeMes(mesInt);
  const mesAnteriorNum = mesInt === 1 ? 12 : mesInt - 1;
  const mesAnteriorNome = getNomeMes(mesAnteriorNum);
  
  const variacaoEntradas = calcularVariacaoMensalEntradas();
  const variacaoCustos = calcularVariacaoMensalCustos();
  
  const saldoMensal = dadosMes?.resumo_financeiro?.saldo_liquido_mensal || 0;
  const totalEntradas = dadosMes?.resumo_financeiro?.total_entradas || 0;
  const totalGastos = dadosMes?.resumo_financeiro?.total_gastos || 0;
  const totalDividasMensais = dadosMes?.resumo_financeiro?.total_dividas_mensais || 0;
  const totalCustos = dadosMes?.resumo_financeiro?.total_custos || 0; // gastos + dívidas mensais
  const totalPatrimonio = 0; // Será implementado com API de patrimônio
  const metasAtingidas = 0; // Será implementado com API de metas

  if (loading) {
    return (
      <div className="space-y-6">
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

  // Verificar se há dados para o mês selecionado
  if (budgetData && !mesDisponivel) {
    return (
      <div className="space-y-6">
        {/* Orientação específica para o módulo de orçamento */}
        <BudgetNoDataGuidance />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Cards de Resumo Principal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-success">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-1">
                <span>{t("total_income")}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total de entradas registradas no mês {mes}/{ano}</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <div className="flex items-center space-x-2">
                {variacaoEntradas !== 0 && (
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
                {formatCurrency(totalEntradas)}
              </div>
              <p className="text-xs text-muted-foreground">
                {mesAtualNome} <span className="text-blue-500">vs</span> {mesAnteriorNome}
                {variacaoEntradas !== 0 && (
                  <span className={`ml-2 ${getVariationColor(variacaoEntradas)}`}>
                    ({Math.abs(variacaoEntradas).toFixed(1)}%)
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-destructive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-1">
                <span>{t("total_expenses")}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total de gastos ({formatCurrency(totalGastos)}) + dívidas mensais ({formatCurrency(totalDividasMensais)})</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <div className="flex items-center space-x-2">
                {variacaoCustos !== 0 && (
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
                {formatCurrency(totalCustos)}
              </div>
              <p className="text-xs text-muted-foreground">
                {mesAtualNome} <span className="text-blue-500">vs</span> {mesAnteriorNome}
                {variacaoCustos !== 0 && (
                  <span className={`ml-2 ${getVariationColor(variacaoCustos, true)}`}>
                    ({Math.abs(variacaoCustos).toFixed(1)}%)
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card
            className={`border-l-4 ${saldoMensal >= 0 ? "border-l-success" : "border-l-destructive"}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-1">
                <span>{t("monthly_balance")}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Entradas ({formatCurrency(totalEntradas)}) - Total de custos ({formatCurrency(totalCustos)})</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <DollarSign
                className={`h-4 w-4 ${saldoMensal >= 0 ? "text-success" : "text-destructive"}`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${saldoMensal >= 0 ? "text-success" : "text-destructive"}`}
              >
                {formatCurrency(saldoMensal)}
              </div>
              <p className="text-xs text-muted-foreground">
                {saldoMensal >= 0 ? t("left_in_month") : t("monthly_deficit")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-1">
                <span>{t("financial_health")}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Indicador da situação financeira baseado no saldo mensal</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="text-4xl">
                  {saldoMensal >= 0 ? "😊" : "😰"}
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    saldoMensal >= 0 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {saldoMensal >= 0
                      ? t("positive_situation")
                      : t("attention_needed")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {saldoMensal >= 0 ? "Situação controlada" : "Revisar gastos"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6"></div>

      {/* Gráficos Principais */}
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
                year: ano || "--",
              })} - {budgetData?.meses_disponeis?.length || 0} meses considerados
            </p>
          </CardHeader>
          <CardContent>
            <DistribuicaoGastosChart mes={mesInt} ano={anoInt} />
          </CardContent>
        </Card>
      </div>

      {/* Dicas Financeiras Personalizadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-600" />
            <span>Dicas Personalizadas</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Insights baseados nos seus dados financeiros
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">🚀 Metas Financeiras</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Defina metas específicas, mensuráveis e com prazo. Monitore seu progresso regularmente e 
                celebre as conquistas para manter a motivação.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Alertas e Metas */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Meta x Realidade</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("values_should_be_spent_categories")}
            </p>
          </CardHeader>
          <CardContent>
            <MetaRealidadeChart mes={mesInt} ano={anoInt} />
          </CardContent>
        </Card>
      </div>

      {/* Dicas Financeiras e Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span>{t("personalized_tips")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Alertas Financeiros */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span>{t("financial_alerts")}</span>
            </h4>
            <div className="space-y-3">
              {saldoMensal < 0 && (
                <div className="flex items-center space-x-2 p-3 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm">{t("spent_more_than_earned")}</span>
                </div>
              )}

              {totalCustos === 0 && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">
                    {t("configure_expenses_complete_analysis")}
                  </span>
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
                      {t("invest_your_money")}
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {t("investment_options_tip")}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
