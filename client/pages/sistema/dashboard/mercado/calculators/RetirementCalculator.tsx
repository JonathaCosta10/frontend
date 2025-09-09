import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Percent,
  DollarSign,
  Calendar,
  Loader2,
  Heart,
  TrendingUp,
  Coins,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

// Mock API para cálculos de aposentadoria
// Seria substituída pelo serviço de API real quando implementado
const calculateRetirement = (formData) => {
  // Simulação de delay para simular chamada de API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Extração dos dados do formulário
      const {
        currentAge,
        retirementAge,
        lifeExpectancy,
        initialSavings,
        monthlyContribution,
        expectedReturn,
        inflationRate,
        desiredIncome,
      } = formData;

      // Variáveis para cálculos
      const yearsToRetirement = retirementAge - currentAge;
      const yearsInRetirement = lifeExpectancy - retirementAge;
      const monthlyReturnRate = expectedReturn / 100 / 12;
      const monthlyInflationRate = inflationRate / 100 / 12;
      const realReturnRate = (1 + monthlyReturnRate) / (1 + monthlyInflationRate) - 1;
      
      // Cálculo do montante acumulado até a aposentadoria
      let accumulatedAmount = initialSavings;
      let totalContributed = initialSavings;
      const yearlyResults = [];
      
      // Período de acumulação (antes da aposentadoria)
      for (let year = 1; year <= yearsToRetirement; year++) {
        let yearlyContributions = monthlyContribution * 12;
        totalContributed += yearlyContributions;
        
        // Simula crescimento mensal durante o ano
        for (let month = 1; month <= 12; month++) {
          accumulatedAmount = accumulatedAmount * (1 + monthlyReturnRate) + monthlyContribution;
        }
        
        yearlyResults.push({
          year,
          age: currentAge + year,
          balance: accumulatedAmount,
          contributions: yearlyContributions,
          earnings: accumulatedAmount - totalContributed,
        });
      }
      
      // Cálculo da renda mensal considerando a inflação
      const monthlyIncomeAtRetirement = accumulatedAmount * (realReturnRate * Math.pow(1 + realReturnRate, yearsInRetirement * 12)) / 
                                      (Math.pow(1 + realReturnRate, yearsInRetirement * 12) - 1) / 12;
      
      const sufficientFunds = monthlyIncomeAtRetirement >= desiredIncome;
      
      // Simulação do período de retirada (após aposentadoria)
      const withdrawalPhase = [];
      let retirementBalance = accumulatedAmount;
      let yearlyWithdrawal = desiredIncome * 12;
      let fundDepletionAge = null;
      
      for (let year = 1; year <= yearsInRetirement; year++) {
        const age = retirementAge + year;
        
        // Simula retiradas e crescimento mensal durante o ano
        for (let month = 1; month <= 12; month++) {
          retirementBalance = retirementBalance * (1 + monthlyReturnRate) - desiredIncome;
          
          // Verifica se o fundo acabou
          if (retirementBalance <= 0 && !fundDepletionAge) {
            fundDepletionAge = age + (month / 12);
            break;
          }
        }
        
        if (retirementBalance <= 0) {
          retirementBalance = 0;
        }
        
        withdrawalPhase.push({
          year,
          age,
          withdrawal: yearlyWithdrawal,
          balance: retirementBalance,
        });
        
        if (retirementBalance <= 0) {
          break;
        }
        
        // Ajuste da retirada pela inflação para o próximo ano
        yearlyWithdrawal = yearlyWithdrawal * Math.pow(1 + inflationRate / 100, 1);
      }
      
      resolve({
        retirementFund: accumulatedAmount,
        totalContributed,
        yearsOfIncome: fundDepletionAge ? fundDepletionAge - retirementAge : yearsInRetirement,
        sufficientFunds,
        monthlyIncomeAtRetirement,
        fundDepletion: fundDepletionAge,
        yearlyResults,
        withdrawalPhase,
      });
    }, 1200);
  });
};

export default function RetirementCalculator() {
  const { t, formatCurrency, formatNumber } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [retirementResult, setRetirementResult] = useState(null);
  const [activeTab, setActiveTab] = useState("accumulation");

  // Estado do formulário
  const [formData, setFormData] = useState({
    currentAge: 30,
    retirementAge: 65,
    lifeExpectancy: 85,
    initialSavings: 50000,
    monthlyContribution: 1000,
    expectedReturn: 8,
    inflationRate: 4,
    desiredIncome: 5000,
  });

  // Atualização de dados do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  // Cálculo de aposentadoria
  const handleCalculateRetirement = async () => {
    setIsLoading(true);
    try {
      const result = await calculateRetirement(formData);
      setRetirementResult(result);
    } catch (error) {
      console.error("Erro ao calcular aposentadoria:", error);
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
            <Calendar className="h-5 w-5" />
            <span>{t("retirement_calculator")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Idade e Expectativa */}
            <div className="space-y-2">
              <Label htmlFor="currentAge">{t("current_age")}</Label>
              <Input
                id="currentAge"
                name="currentAge"
                type="number"
                value={formData.currentAge}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retirementAge">{t("retirement_age")}</Label>
              <Input
                id="retirementAge"
                name="retirementAge"
                type="number"
                value={formData.retirementAge}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lifeExpectancy">{t("life_expectancy")}</Label>
              <Input
                id="lifeExpectancy"
                name="lifeExpectancy"
                type="number"
                value={formData.lifeExpectancy}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialSavings">{t("current_savings")}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="initialSavings"
                  name="initialSavings"
                  type="number"
                  className="pl-8"
                  value={formData.initialSavings}
                  onChange={handleChange}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(formData.initialSavings)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyContribution">{t("monthly_contribution")}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="monthlyContribution"
                  name="monthlyContribution"
                  type="number"
                  className="pl-8"
                  value={formData.monthlyContribution}
                  onChange={handleChange}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(formData.monthlyContribution)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desiredIncome">{t("desired_monthly_income")}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="desiredIncome"
                  name="desiredIncome"
                  type="number"
                  className="pl-8"
                  value={formData.desiredIncome}
                  onChange={handleChange}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(formData.desiredIncome)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedReturn">{t("expected_annual_return")}</Label>
              <div className="relative">
                <Input
                  id="expectedReturn"
                  name="expectedReturn"
                  type="number"
                  step="0.1"
                  className="pr-8"
                  value={formData.expectedReturn}
                  onChange={handleChange}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.expectedReturn}% {t("per_year")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inflationRate">{t("inflation_rate")}</Label>
              <div className="relative">
                <Input
                  id="inflationRate"
                  name="inflationRate"
                  type="number"
                  step="0.1"
                  className="pr-8"
                  value={formData.inflationRate}
                  onChange={handleChange}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.inflationRate}% {t("per_year")}
              </p>
            </div>

            <div className="col-span-1 md:col-span-2">
              <Button
                onClick={handleCalculateRetirement}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("calculating")}
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    {t("calculate_retirement")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {retirementResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>{t("retirement_projections")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                <div className="flex items-center space-x-2 mb-2">
                  <Coins className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    {t("retirement_fund")}
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(retirementResult.retirementFund)}
                </div>
                <p className="text-xs text-green-600/80">
                  {t("at_age")} {formData.retirementAge}
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {t("monthly_income")}
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(retirementResult.monthlyIncomeAtRetirement)}
                </div>
                <p className="text-xs text-blue-600/80">
                  {retirementResult.sufficientFunds ? (
                    <span className="text-green-600">✓ {t("meets_goal")}</span>
                  ) : (
                    <span className="text-red-600">✗ {t("below_goal")}</span>
                  )}
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    {t("retirement_duration")}
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {retirementResult.yearsOfIncome.toFixed(1)} {t("years")}
                </div>
                <p className="text-xs text-purple-600/80">
                  {retirementResult.fundDepletion
                    ? t("funds_deplete_at_age", { age: retirementResult.fundDepletion.toFixed(1) })
                    : t("funds_last_lifetime")}
                </p>
              </div>
            </div>

            {/* Tabs para escolher entre acumulação e retiradas */}
            <div className="mt-6">
              <div className="flex space-x-2 mb-4">
                <Button
                  variant={activeTab === "accumulation" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("accumulation")}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {t("accumulation_phase")}
                </Button>
                <Button
                  variant={activeTab === "withdrawal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("withdrawal")}
                >
                  <Coins className="h-4 w-4 mr-2" />
                  {t("withdrawal_phase")}
                </Button>
              </div>

              {/* Tabela de projeção anual */}
              <div className="max-h-96 overflow-y-auto">
                {activeTab === "accumulation" ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("year")}</TableHead>
                        <TableHead>{t("age")}</TableHead>
                        <TableHead>{t("balance")}</TableHead>
                        <TableHead>{t("contributions")}</TableHead>
                        <TableHead>{t("earnings")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {retirementResult.yearlyResults.map((year, index) => (
                        <TableRow key={index}>
                          <TableCell>{year.year}</TableCell>
                          <TableCell>{year.age}</TableCell>
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
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("year")}</TableHead>
                        <TableHead>{t("age")}</TableHead>
                        <TableHead>{t("yearly_withdrawal")}</TableHead>
                        <TableHead>{t("remaining_balance")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {retirementResult.withdrawalPhase.map((year, index) => (
                        <TableRow key={index}>
                          <TableCell>{year.year}</TableCell>
                          <TableCell>{year.age}</TableCell>
                          <TableCell className="font-semibold text-blue-600">
                            {formatCurrency(year.withdrawal)}
                          </TableCell>
                          <TableCell
                            className={
                              year.balance > 0 ? "text-green-600" : "text-red-600"
                            }
                          >
                            {formatCurrency(year.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
