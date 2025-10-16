import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  AlertCircle,
  Zap,
} from "lucide-react";
import { useTranslation } from '../../../../contexts/TranslationContext';
import InvestmentPremiumGuard from "@/core/security/guards/InvestmentPremiumGuard";

interface PatrimonioItem {
  categoria: string;
  valorAtual: number;
  valorInvestido: number;
  ganhoPerda: number;
  percentual: number;
  ativos: number;
}

export default function Patrimonio() {
  const { t, formatCurrency } = useTranslation();
  const [periodo, setPeriodo] = useState("total");
  const [moeda, setMoeda] = useState("BRL");

  // Mock data do patrimônio
  const patrimonioData: PatrimonioItem[] = [
    {
      categoria: t("real_estate_funds"),
      valorAtual: 45850.0,
      valorInvestido: 42000.0,
      ganhoPerda: 3850.0,
      percentual: 38.5,
      ativos: 8,
    },
    {
      categoria: t("stocks"),
      valorAtual: 38200.0,
      valorInvestido: 35000.0,
      ganhoPerda: 3200.0,
      percentual: 32.1,
      ativos: 12,
    },
    {
      categoria: t("fixed_income"),
      valorAtual: 22500.0,
      valorInvestido: 22000.0,
      ganhoPerda: 500.0,
      percentual: 18.9,
      ativos: 5,
    },
    {
      categoria: t("etfs"),
      valorAtual: 8900.0,
      valorInvestido: 8500.0,
      ganhoPerda: 400.0,
      percentual: 7.5,
      ativos: 3,
    },
    {
      categoria: t("cryptocurrencies"),
      valorAtual: 3600.0,
      valorInvestido: 4000.0,
      ganhoPerda: -400.0,
      percentual: 3.0,
      ativos: 4,
    },
  ];

  const totalValorAtual = patrimonioData.reduce(
    (sum, item) => sum + item.valorAtual,
    0,
  );
  const totalInvestido = patrimonioData.reduce(
    (sum, item) => sum + item.valorInvestido,
    0,
  );
  const totalGanhoPerda = totalValorAtual - totalInvestido;
  const percentualGanhoTotal = (totalGanhoPerda / totalInvestido) * 100;

  const evolucaoMensal = [
    { mes: "Jan", valor: 95000 },
    { mes: "Fev", valor: 98200 },
    { mes: "Mar", valor: 102500 },
    { mes: "Abr", valor: 108900 },
    { mes: "Mai", valor: 112300 },
    { mes: "Jun", valor: 119050 },
  ];

  const metas = [
    {
      nome: t("annual_goal_2024"),
      valorAlvo: 150000,
      valorAtual: totalValorAtual,
      progresso: (totalValorAtual / 150000) * 100,
      prazo: "31/12/2024",
    },
    {
      nome: t("financial_independence"),
      valorAlvo: 500000,
      valorAtual: totalValorAtual,
      progresso: (totalValorAtual / 500000) * 100,
      prazo: "31/12/2030",
    },
  ];

  const getVariationIcon = (value: number) => {
    return value >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-success" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-destructive" />
    );
  };

  const getVariationColor = (value: number) => {
    return value >= 0 ? "text-success" : "text-destructive";
  };

  return (
    <InvestmentPremiumGuard featureType="patrimonio">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("wealth_management")}</h1>
          <p className="text-muted-foreground">
            {t("track_portfolio_evolution_performance")}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t("period")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">{t("total")}</SelectItem>
              <SelectItem value="1ano">{t("one_year")}</SelectItem>
              <SelectItem value="6meses">{t("six_months")}</SelectItem>
              <SelectItem value="3meses">{t("three_months")}</SelectItem>
              <SelectItem value="1mes">{t("one_month")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de Resumo do Patrimônio */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("total_wealth")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(totalValorAtual)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("current_portfolio_value")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("total_invested")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {formatCurrency(totalInvestido)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("capital_invested")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("gain_loss")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getVariationIcon(totalGanhoPerda)}
              <span
                className={`text-2xl font-bold ${getVariationColor(totalGanhoPerda)}`}
              >
                {formatCurrency(totalGanhoPerda)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className={getVariationColor(percentualGanhoTotal)}>
                {percentualGanhoTotal >= 0 ? "+" : ""}
                {percentualGanhoTotal.toFixed(2)}%
              </span>{" "}
              {t("profitability")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("diversification")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <PieChart className="h-4 w-4 text-warning" />
              <span className="text-2xl font-bold">
                {patrimonioData.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {patrimonioData.reduce((sum, item) => sum + item.ativos, 0)}{" "}
              {t("total_assets")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolu��ão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>{t("wealth_evolution")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {t("wealth_evolution_chart")}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t("growth_from")} {formatCurrency(evolucaoMensal[0].valor)}{" "}
                {t("to")}{" "}
                {formatCurrency(
                  evolucaoMensal[evolucaoMensal.length - 1].valor,
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>{t("distribution_by_category")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patrimonioData.map((item, index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium">{item.categoria}</div>
                    <Badge variant="outline">
                      {item.ativos} {t("assets")}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(item.valorAtual)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.percentual}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("invested")} {formatCurrency(item.valorInvestido)}
                  </span>
                  <div className="flex items-center space-x-1">
                    {getVariationIcon(item.ganhoPerda)}
                    <span className={getVariationColor(item.ganhoPerda)}>
                      {formatCurrency(item.ganhoPerda)}(
                      {((item.ganhoPerda / item.valorInvestido) * 100).toFixed(
                        1,
                      )}
                      %)
                    </span>
                  </div>
                </div>

                <Progress value={item.percentual} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metas de Patrimônio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>{t("wealth_goals")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {metas.map((meta, index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{meta.nome}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("deadline")}: {meta.prazo}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(meta.valorAtual)} /{" "}
                      {formatCurrency(meta.valorAlvo)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {meta.progresso.toFixed(1)}% {t("completed")}
                    </div>
                  </div>
                </div>

                <Progress value={meta.progresso} className="h-3" />

                <div className="text-sm text-muted-foreground">
                  {t("missing")}{" "}
                  {formatCurrency(meta.valorAlvo - meta.valorAtual)}{" "}
                  {t("to_reach_goal")}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análises e Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-warning" />
              <span>{t("wealth_insights")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                <p className="text-sm font-medium text-success">
                  {t("excellent_performance")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("your_wealth_grew")} {percentualGanhoTotal.toFixed(1)}%
                  {t("above_invested")}
                </p>
              </div>

              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-primary">
                  {t("adequate_diversification")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("portfolio_well_distributed_between")}{" "}
                  {patrimonioData.length} {t("different_categories")}
                </p>
              </div>

              <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                <p className="text-sm font-medium text-warning">
                  {t("opportunity")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("consider_increasing_fixed_income_stability")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span>{t("alerts_recommendations")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <TrendingDown className="h-4 w-4 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("crypto_down")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("crypto_lost_10_percent_consider_rebalancing")}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    {t("upcoming_dividends")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("hglg11_knri11_dividends_next_week")}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <Target className="h-4 w-4 text-success mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("annual_goal")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("you_are")} {metas[0].progresso.toFixed(0)}%{" "}
                    {t("of_way_to_2024_goal")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </InvestmentPremiumGuard>
  );
}
