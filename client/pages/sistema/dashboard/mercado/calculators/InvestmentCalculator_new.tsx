import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  Percent,
  Loader2,
  Calendar,
  Target,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { FinancialCalculatorApiService } from "@/services/api/entities/financialCalculatorApi";

interface InvestmentInput {
  monthlyAmount: number;
  years: number;
  expectedReturn: number;
  goal: number;
}

interface InvestmentResult {
  monthlyContribution: number;
  yearsToReachGoal: number;
  finalBalance: number;
  totalContributed: number;
  totalEarnings: number;
  yearlyResults: {
    year: number;
    balance: number;
    contributions: number;
    earnings: number;
  }[];
}

export default function InvestmentCalculator() {
  const { t, formatCurrency, formatNumber } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [calculationType, setCalculationType] = useState<"time" | "contribution">("contribution");
  const [investmentResult, setInvestmentResult] = useState<InvestmentResult | null>(null);
  
  // Form States
  const [investment, setInvestment] = useState<InvestmentInput>({
    monthlyAmount: 1000,
    years: 20,
    expectedReturn: 10,
    goal: 1000000,
  });

  // Calculation handler
  const handleCalculateInvestment = async () => {
    setIsLoading(true);
    try {
      // Calculando conforme o tipo selecionado
      if (calculationType === "time") {
        // Calcular quanto tempo para chegar ao objetivo
        const result = await FinancialCalculatorApiService.calculateTimeToReachGoal({
          ...investment,
          type: "time",
        });
        setInvestmentResult(result);
      } else {
        // Calcular quanto preciso investir para atingir o objetivo
        const result = await FinancialCalculatorApiService.calculateRequiredContribution({
          ...investment,
          type: "contribution",
        });
        setInvestmentResult(result);
      }
    } catch (error) {
      console.error("Error calculating investment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5" />
            <span>{t("investment_calculator")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Tipo de cálculo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <Label>{t("calculation_type")}</Label>
                <div className="flex space-x-2 mt-1">
                  <Button
                    variant={calculationType === "contribution" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCalculationType("contribution")}
                    className="flex-1"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    {t("how_much_to_invest")}
                  </Button>
                  <Button
                    variant={calculationType === "time" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCalculationType("time")}
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {t("how_long_to_goal")}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Campos do formulário conforme o tipo selecionado */}
            {calculationType === "contribution" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">{t("desired_assets")}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <Input
                      id="goal"
                      type="number"
                      className="pl-9"
                      value={investment.goal}
                      onChange={(e) =>
                        setInvestment({
                          ...investment,
                          goal: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500">{formatCurrency(investment.goal)}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="years">{t("time_period_years")}</Label>
                  <Input
                    id="years"
                    type="number"
                    value={investment.years}
                    onChange={(e) =>
                      setInvestment({
                        ...investment,
                        years: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedReturn">{t("investment_annual_rate")}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    <Input
                      id="expectedReturn"
                      type="number"
                      step="0.1"
                      className="pl-7"
                      value={investment.expectedReturn}
                      onChange={(e) =>
                        setInvestment({
                          ...investment,
                          expectedReturn: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500">{investment.expectedReturn}% {t("excluding_taxes")}</p>
                </div>

                <div className="space-y-2 flex items-end">
                  <Button
                    onClick={handleCalculateInvestment}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("calculating_result")}
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        {t("calculate_contribution_needed")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyAmount">{t("monthly_deposit")}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <Input
                      id="monthlyAmount"
                      type="number"
                      className="pl-9"
                      value={investment.monthlyAmount}
                      onChange={(e) =>
                        setInvestment({
                          ...investment,
                          monthlyAmount: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500">{formatCurrency(investment.monthlyAmount)}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">{t("investment_desired_salary")}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <Input
                      id="goal"
                      type="number"
                      className="pl-9"
                      value={investment.goal}
                      onChange={(e) =>
                        setInvestment({
                          ...investment,
                          goal: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500">{formatCurrency(investment.goal)}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedReturn">{t("investment_annual_rate")}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    <Input
                      id="expectedReturn"
                      type="number"
                      step="0.1"
                      className="pl-7"
                      value={investment.expectedReturn}
                      onChange={(e) =>
                        setInvestment({
                          ...investment,
                          expectedReturn: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500">{investment.expectedReturn}% {t("excluding_taxes")}</p>
                </div>

                <div className="space-y-2 flex items-end">
                  <Button
                    onClick={handleCalculateInvestment}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("calculating_result")}
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        {t("calculate_time_to_goal")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {investmentResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>{t("investment_results")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {calculationType === "contribution" ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {t("monthly_contribution_needed")}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(investmentResult.monthlyContribution)}
                  </div>
                  <p className="text-xs text-green-600/80">
                    {t("to_reach_goal_in_x_years", { years: investment.years })}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {t("years_to_reach_goal")}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {investmentResult.yearsToReachGoal.toFixed(1)} {t("years")}
                  </div>
                  <p className="text-xs text-green-600/80">
                    {t("with_monthly_contribution", { amount: formatCurrency(investment.monthlyAmount) })}
                  </p>
                </div>
              )}

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {t("total_contributions")}
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(investmentResult.totalContributed)}
                </div>
                <p className="text-xs text-blue-600/80">
                  {t("money_you_invested")}
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                <div className="flex items-center space-x-2 mb-2">
                  <Percent className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    {t("total_earnings")}
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(investmentResult.totalEarnings)}
                </div>
                <p className="text-xs text-purple-600/80">
                  {((investmentResult.totalEarnings / investmentResult.totalContributed) * 100).toFixed(2)}% {t("return_on_investment")}
                </p>
              </div>
            </div>

            {/* Evolução anual */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">{t("yearly_progression")}</h3>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("year")}</TableHead>
                      <TableHead>{t("balance")}</TableHead>
                      <TableHead>{t("contributions")}</TableHead>
                      <TableHead>{t("earnings")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investmentResult.yearlyResults?.map((year, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{year.year}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(year.balance)}
                        </TableCell>
                        <TableCell>{formatCurrency(year.contributions)}</TableCell>
                        <TableCell className="text-purple-600">
                          {formatCurrency(year.earnings)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
