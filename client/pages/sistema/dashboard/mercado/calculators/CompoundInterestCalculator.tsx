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
  Calculator,
  TrendingUp,
  DollarSign,
  Percent,
  BarChart3,
  Loader2,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { FinancialCalculatorApiService } from "@/services/api/entities/financialCalculatorApi";
import { CompoundInterestInput, CompoundInterestResult } from "@/services/entities/FinancialCalculator";

export default function CompoundInterestCalculator() {
  const { t, formatCurrency, formatNumber } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [compoundResult, setCompoundResult] = useState<CompoundInterestResult | null>(null);
  
  // Form States
  const [compound, setCompound] = useState<CompoundInterestInput>({
    principal: 10000,
    rate: 12,
    time: 10,
    contribution: 500,
    contributionFrequency: "monthly",
  });

  // Calculation handler
  const handleCalculateCompound = async () => {
    setIsLoading(true);
    try {
      const result = await FinancialCalculatorApiService.calculateCompoundInterest(compound);
      setCompoundResult(result);
    } catch (error) {
      console.error("Error calculating compound interest:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Usando formatCurrency do contexto de tradução

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>{t("compound_interest_calculator")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Input Form - Linear Horizontal Layout */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="principal">{t("initial_amount")}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="principal"
                    type="number"
                    className="pl-8"
                    value={compound.principal}
                    onChange={(e) =>
                      setCompound({
                        ...compound,
                        principal: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(compound.principal)}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">{t("annual_interest_rate")}</Label>
                <div className="relative">
                  <Input
                    id="rate"
                    type="number"
                    step="0.1"
                    className="pr-8"
                    value={compound.rate}
                    onChange={(e) =>
                      setCompound({
                        ...compound,
                        rate: Number(e.target.value),
                      })
                    }
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {compound.rate}% {t("per_year")}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">{t("time_period_years")}</Label>
                <div className="relative">
                  <Input
                    id="time"
                    type="number"
                    value={compound.time}
                    onChange={(e) =>
                      setCompound({
                        ...compound,
                        time: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {compound.time} {compound.time === 1 ? t("year") : t("years")}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contribution">
                  {t("monthly_deposit")}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="contribution"
                    type="number"
                    className="pl-8"
                    value={compound.contribution}
                    onChange={(e) =>
                      setCompound({
                        ...compound,
                        contribution: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(compound.contribution)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">{t("deposit_frequency")}</Label>
                <Select 
                  value={compound.contributionFrequency} 
                  onValueChange={(value) => 
                    setCompound({
                      ...compound,
                      contributionFrequency: value as "monthly" | "yearly"
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">{t("monthly")}</SelectItem>
                    <SelectItem value="quarterly">{t("quarterly")}</SelectItem>
                    <SelectItem value="yearly">{t("yearly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={handleCalculateCompound}
                  disabled={isLoading}
                  className="w-full md:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("calculating_result")}
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      {t("calculate_interest")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {compoundResult && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>{t("compound_interest_results")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {t("total_final_value")}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(compoundResult.futureValue)}
                  </div>
                  <p className="text-xs text-green-600/80">
                    {t("accumulated_value_at_period_end")}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {t("total_invested_value")}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(compoundResult.totalContributions)}
                  </div>
                  <p className="text-xs text-blue-600/80">
                    {t("invested_capital_and_contributions")}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <Percent className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      {t("total_interest_earned")}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(compoundResult.earnings)}
                  </div>
                  <p className="text-xs text-purple-600/80">
                    {t("yield")}: {compoundResult.percentageGain.toFixed(2)}
                    % {t("of_investment")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Month by Month Evolution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>{t("monthly_evolution")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("month")}</TableHead>
                      <TableHead>{t("period")}</TableHead>
                      <TableHead>{t("total_balance")}</TableHead>
                      <TableHead>{t("total_invested")}</TableHead>
                      <TableHead>{t("accumulated_interest")}</TableHead>
                      <TableHead>{t("monthly_growth")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compoundResult.monthlyData?.map((month, index) => (
                      <TableRow
                        key={index}
                        className={index % 12 === 11 ? "bg-muted/30" : ""}
                      >
                        <TableCell className="font-medium">
                          {month.month}
                        </TableCell>
                        <TableCell>
                          {month.monthName}/{month.year}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(month.balance)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(month.totalContributed)}
                        </TableCell>
                        <TableCell className="font-semibold text-purple-600">
                          {formatCurrency(month.interest)}
                        </TableCell>
                        <TableCell className="text-blue-600">
                          {month.monthlyGrowth > 0 ? "+" : ""}
                          {formatCurrency(month.monthlyGrowth)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
