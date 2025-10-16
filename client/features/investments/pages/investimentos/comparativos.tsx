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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
} from "lucide-react";
import { useTranslation } from '../../../../contexts/TranslationContext';
import InvestmentPremiumGuard from "@/core/security/guards/InvestmentPremiumGuard";

export default function Comparativos() {
  const { t } = useTranslation();
  const [periodo, setPeriodo] = useState("1ano");
  const [categoria, setCategoria] = useState("todas");

  // Mock data para comparações
  const comparacoes = [
    {
      ativo: "HGLG11",
      tipo: "FII",
      rentabilidade12m: 15.8,
      rentabilidadeAno: 12.3,
      dividendYield: 8.9,
      volatilidade: 12.1,
      sharpe: 1.2,
      beta: 0.8,
    },
    {
      ativo: "VALE3",
      tipo: t("stocks_category"),
      rentabilidade12m: 22.4,
      rentabilidadeAno: 18.7,
      dividendYield: 12.5,
      volatilidade: 28.4,
      sharpe: 0.9,
      beta: 1.4,
    },
    {
      ativo: "KNRI11",
      tipo: "FII",
      rentabilidade12m: 9.2,
      rentabilidadeAno: 7.8,
      dividendYield: 7.2,
      volatilidade: 8.7,
      sharpe: 1.1,
      beta: 0.6,
    },
    {
      ativo: "ITUB4",
      tipo: t("stocks_category"),
      rentabilidade12m: 18.6,
      rentabilidadeAno: 14.2,
      dividendYield: 8.1,
      volatilidade: 22.3,
      sharpe: 0.8,
      beta: 1.1,
    },
  ];

  const benchmarks = [
    { nome: "CDI", valor: 11.75, periodo: "12m" },
    { nome: "IBOVESPA", valor: 16.8, periodo: "12m" },
    { nome: "IFIX", valor: 8.2, periodo: "12m" },
    { nome: "IPCA", valor: 4.6, periodo: "12m" },
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

  const getRiskLevel = (volatilidade: number) => {
    if (volatilidade < 10) return { level: t("low_risk"), color: "bg-success" };
    if (volatilidade < 20)
      return { level: t("medium_risk"), color: "bg-warning" };
    return { level: t("high_risk"), color: "bg-destructive" };
  };

  return (
    <InvestmentPremiumGuard featureType="comparativos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t("comparative_analysis")}</h1>
            <p className="text-muted-foreground">
              {t("compare_different_assets_strategies")}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t("period")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1mes">{t("one_month")}</SelectItem>
                <SelectItem value="3meses">{t("three_months")}</SelectItem>
                <SelectItem value="6meses">{t("six_months")}</SelectItem>
                <SelectItem value="1ano">{t("one_year")}</SelectItem>
                <SelectItem value="3anos">{t("three_years")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder={t("category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">{t("all_categories")}</SelectItem>
                <SelectItem value="acoes">{t("stocks_category")}</SelectItem>
                <SelectItem value="fiis">{t("reits_category")}</SelectItem>
                <SelectItem value="rf">{t("fixed_income_category")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cards de Benchmarks */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {benchmarks.map((benchmark, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {benchmark.nome}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {getVariationIcon(benchmark.valor)}
                  <span
                    className={`text-2xl font-bold ${getVariationColor(benchmark.valor)}`}
                  >
                    {benchmark.valor}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("profitability")} {benchmark.periodo}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráfico de Performance Comparativa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>{t("comparative_performance")}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("assets_vs_benchmarks_profitability")} - {periodo}
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {t("comparative_performance_chart")}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("visualization_in_development")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Análise Detalhada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>{t("detailed_asset_analysis")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("asset")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead>{t("profitability_12m")}</TableHead>
                  <TableHead>{t("profitability_year")}</TableHead>
                  <TableHead>{t("dividend_yield")}</TableHead>
                  <TableHead>{t("volatility")}</TableHead>
                  <TableHead>{t("sharpe_ratio")}</TableHead>
                  <TableHead>{t("beta")}</TableHead>
                  <TableHead>{t("risk")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparacoes.map((item, index) => {
                  const risk = getRiskLevel(item.volatilidade);
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.ativo}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.tipo}</Badge>
                      </TableCell>
                      <TableCell
                        className={getVariationColor(item.rentabilidade12m)}
                      >
                        {item.rentabilidade12m}%
                      </TableCell>
                      <TableCell
                        className={getVariationColor(item.rentabilidadeAno)}
                      >
                        {item.rentabilidadeAno}%
                      </TableCell>
                      <TableCell className="text-success">
                        {item.dividendYield}%
                      </TableCell>
                      <TableCell>{item.volatilidade}%</TableCell>
                      <TableCell>{item.sharpe}</TableCell>
                      <TableCell>{item.beta}</TableCell>
                      <TableCell>
                        <Badge className={`${risk.color} text-white`}>
                          {risk.level}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Cards de Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-warning" />
                <span>{t("automatic_insights")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-sm font-medium text-success">
                    {t("best_performance")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("vale3_best_profitability")}
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-primary">
                    {t("best_risk_return")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("hglg11_best_sharpe")}
                  </p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <p className="text-sm font-medium text-warning">
                    {t("attention")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("portfolio_concentrated_diversify")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>{t("correlation_analysis")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t("correlation_matrix")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("in_development")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </InvestmentPremiumGuard>
  );
}
