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
import MetaMesAMesChart from "@/components/charts/MetaMesAMesChart";
import { budgetApi, DistribuicaoGastosResponse } from "@/services/api/budget";
import { useTranslation } from "@/contexts/TranslationContext";
import { useMonthYear } from "@/hooks/useMonthYear";

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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Dados não disponíveis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Não há dados disponíveis para {mesKey}/{ano}. 
              {budgetData.meses_disponeis.length > 0 && (
                <>
                  {" "}Meses disponíveis: {budgetData.meses_disponeis.join(", ")}/{budgetData.ano}
                </>
              )}
            </p>
          </CardContent>
        </Card>
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
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(totalEntradas)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("month_income", { month: mes || "--", year: ano || "--" })}
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
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(totalCustos)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("month_expenses", { month: mes || "--", year: ano || "--" })}
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
              <div className="text-2xl font-bold text-primary">
                {saldoMensal >= 0 ? "😊" : "😰"}
              </div>
              <p className="text-xs text-muted-foreground">
                {saldoMensal >= 0
                  ? t("positive_situation")
                  : t("attention_needed")}
              </p>
            </CardContent>
          </Card>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6"></div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Variação de Entrada Mês a Mês */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>{t("income_variation")}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("january_to_december_current_year")}
            </p>
          </CardHeader>
          <CardContent>
            <VariacaoEntradaChart mes={mesInt} ano={anoInt} />
          </CardContent>
        </Card>

        {/* Distribuição de Gastos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>{t("expense_distribution")}</span>
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

      {/* Cards de Alertas e Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>{t("financial_alerts")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>{t("goal_month_by_month")}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("values_should_be_spent_categories")}
            </p>
          </CardHeader>
          <CardContent>
            <MetaMesAMesChart mes={mesInt} ano={anoInt} />
          </CardContent>
        </Card>
      </div>

      {/* Dicas Financeiras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span>{t("personalized_tips")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
