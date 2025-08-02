import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import VariacaoEntradaChart from "@/components/charts/VariacaoEntradaChart";
import DistribuicaoGastosChart from "@/components/charts/DistribuicaoGastosChart";
import MetaMesAMesChart from "@/components/charts/MetaMesAMesChart";
import { budgetApi, BudgetResponse } from "@/services/api/budget";
import { useTranslation } from "@/contexts/TranslationContext";
import { useMonthYear } from "@/hooks/useMonthYear";

export default function BudgetOverview() {
  const { t, formatCurrency } = useTranslation();
  const { mes, ano } = useMonthYear();

  // Convert to integers for API calls
  const mesInt = parseInt(mes);
  const anoInt = parseInt(ano);

  const [budgetData, setBudgetData] = useState<BudgetResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBudgetData = async () => {
      setLoading(true);
      try {
        const data = await budgetApi.getBudgetOverview(mesInt, anoInt);
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

  const saldoMensal =
    (budgetData?.total_entrada || 0) - (budgetData?.total_gastos || 0);
  const totalPatrimonio = 0; // Será implementado com API de patrimônio
  const metasAtingidas = 0; // Será implementado com API de metas

  return (
    <div className="space-y-6">
      {/* Cards de Resumo Principal */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("total_income")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(budgetData?.total_entrada || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("month_income", { month: mes || "--", year: ano || "--" })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("total_expenses")}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(budgetData?.total_gastos || 0)}
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
            <CardTitle className="text-sm font-medium">
              {t("monthly_balance")}
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
            <CardTitle className="text-sm font-medium">
              {t("financial_health")}
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
            <VariacaoEntradaChart mes={mes} ano={ano} />
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
              {t("how_expenses_distributed_month", {
                month: mes || "--",
                year: ano || "--",
              })}
            </p>
          </CardHeader>
          <CardContent>
            <DistribuicaoGastosChart mes={mes} ano={ano} />
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

            {budgetData?.total_gastos === 0 && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  {t("configure_expenses_complete_analysis")}
                </span>
              </div>
            )}

            {saldoMensal >= 0 && budgetData?.total_gastos > 0 && (
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
            <MetaMesAMesChart mes={mes} ano={ano} />
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
  );
}
