import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  PiggyBank,
  TrendingUp,
  Target,
  Calendar,
  Percent,
  DollarSign,
  BarChart3,
  Loader2,
} from "lucide-react";
import { FinancialCalculatorApiService } from "@/services/api/entities/financialCalculatorApi";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  CompoundInterestInput,
  CompoundInterestResult,
  LoanInput,
  LoanResult,
  InvestmentInput,
  InvestmentResult,
} from "@/src/entities/FinancialCalculator";
import MarketPremiumGuard from "@/components/MarketPremiumGuard";

export default function CalculadoraFinanceira() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Results
  const [compoundResult, setCompoundResult] =
    useState<CompoundInterestResult | null>(null);
  const [loanResult, setLoanResult] = useState<LoanResult | null>(null);
  const [investmentResult, setInvestmentResult] =
    useState<InvestmentResult | null>(null);

  // Form States
  const [compound, setCompound] = useState<CompoundInterestInput>({
    principal: 10000,
    rate: 12,
    time: 10,
    contribution: 500,
    frequency: "monthly",
  });

  const [loan, setLoan] = useState<LoanInput>({
    amount: 300000,
    rate: 8.5,
    term: 30,
    type: "price",
  });

  // Additional loan states
  const [loanType, setLoanType] = useState<"car" | "house">("house");
  const [operationType, setOperationType] = useState<"buy" | "rent">("buy");
  const [installments, setInstallments] = useState(60); // Number of installments
  const [financingRate, setFinancingRate] = useState(8.5); // Financing interest rate

  const [investment, setInvestment] = useState<InvestmentInput>({
    monthlyAmount: 1000,
    years: 20,
    expectedReturn: 10,
    goal: 1000000,
  });

  // Financial independence calculation
  const [retirement, setRetirement] = useState({
    desiredSalary: 5000,
    currentAge: 30,
    interestRate: 8,
    currentValue: 0,
  });
  const [retirementResult, setRetirementResult] = useState<any>(null);

  // Calculation handlers
  const handleCalculateCompound = async () => {
    setIsLoading("compound");
    try {
      const result =
        await FinancialCalculatorApiService.calculateCompoundInterest(compound);
      setCompoundResult(result);
    } catch (error) {
      console.error("Error calculating compound interest:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleCalculateLoan = async () => {
    setIsLoading("loan");
    try {
      const result = await FinancialCalculatorApiService.calculateLoan(loan);
      setLoanResult(result);
    } catch (error) {
      console.error("Error calculating loan:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleCalculateInvestment = async () => {
    setIsLoading("investment");
    try {
      const result =
        await FinancialCalculatorApiService.calculateInvestment(investment);
      setInvestmentResult(result);
    } catch (error) {
      console.error("Error calculating investment:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleCalculateRetirement = () => {
    setIsLoading("retirement");

    try {
      const monthlyRate = retirement.interestRate / 100 / 12;

      // Valor necessário para gerar salário desejado mensalmente
      const requiredCapital = retirement.desiredSalary / monthlyRate;

      // Verifica se já atingiu o objetivo
      if (retirement.currentValue >= requiredCapital) {
        setRetirementResult({
          requiredCapital,
          alreadyAchieved: true,
          currentValue: retirement.currentValue,
          monthlyIncome: retirement.currentValue * monthlyRate,
        });
      } else {
        // Calcula quanto tempo falta para atingir o objetivo
        const remainingNeeded = requiredCapital - retirement.currentValue;

        // Assumindo um aporte mensal médio baseado no salário desejado (30% do salário desejado como aporte)
        const estimatedMonthlyContribution = retirement.desiredSalary * 0.3;

        // Cálculo do tempo necessário para atingir o capital com aportes mensais
        let monthsNeeded = 0;
        let currentCapital = retirement.currentValue;

        while (currentCapital < requiredCapital && monthsNeeded < 600) {
          // limite de 50 anos
          currentCapital =
            currentCapital * (1 + monthlyRate) + estimatedMonthlyContribution;
          monthsNeeded++;
        }

        const yearsNeeded = Math.floor(monthsNeeded / 12);
        const monthsRemainder = monthsNeeded % 12;

        setRetirementResult({
          requiredCapital,
          alreadyAchieved: false,
          remainingNeeded,
          estimatedMonthlyContribution,
          monthsNeeded,
          yearsNeeded,
          monthsRemainder,
          currentValue: retirement.currentValue,
        });
      }
    } catch (error) {
      console.error("Error calculating financial independence:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <MarketPremiumGuard marketFeature="financial-calculator">
      <div className="space-y-3 md:space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">{t("financial_calc_header")}</h2>
          <p className="text-muted-foreground">{t("financial_tools_desc")}</p>
        </div>

        <Tabs defaultValue="compound" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="compound">
              {t("compound_interest_tab")}
            </TabsTrigger>
            <TabsTrigger value="loan">{t("financing_tab")}</TabsTrigger>
            <TabsTrigger value="investment">{t("investment_tab")}</TabsTrigger>
            <TabsTrigger value="retirement">
              {t("financial_independence_tab")}
            </TabsTrigger>
          </TabsList>

          {/* COMPOUND INTEREST CALCULATOR - LINEAR LAYOUT */}
          <TabsContent value="compound" className="space-y-3 md:space-y-6">
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
                      <Input
                        id="principal"
                        type="number"
                        value={compound.principal}
                        onChange={(e) =>
                          setCompound({
                            ...compound,
                            principal: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rate">{t("annual_interest_rate")}</Label>
                      <Input
                        id="rate"
                        type="number"
                        step="0.1"
                        value={compound.rate}
                        onChange={(e) =>
                          setCompound({
                            ...compound,
                            rate: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">{t("time_period_years")}</Label>
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
                    <div className="space-y-2">
                      <Label htmlFor="contribution">
                        {t("monthly_deposit")}
                      </Label>
                      <Input
                        id="contribution"
                        type="number"
                        value={compound.contribution}
                        onChange={(e) =>
                          setCompound({
                            ...compound,
                            contribution: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCalculateCompound}
                    disabled={isLoading === "compound"}
                    className="w-full md:w-auto"
                  >
                    {isLoading === "compound" ? (
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
              </CardContent>
            </Card>

            {/* Results Section */}
            {compoundResult && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Resultados dos Juros Compostos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            Valor Total Final
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(compoundResult.futureValue)}
                        </div>
                        <p className="text-xs text-green-600/80">
                          Valor acumulado ao final do período
                        </p>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-center space-x-2 mb-2">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Valor Total Investido
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(compoundResult.totalContributions)}
                        </div>
                        <p className="text-xs text-blue-600/80">
                          Capital aportado + contribuições mensais
                        </p>
                      </div>

                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                        <div className="flex items-center space-x-2 mb-2">
                          <Percent className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                            Valor Total em Juros
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(compoundResult.earnings)}
                        </div>
                        <p className="text-xs text-purple-600/80">
                          Rendimento: {compoundResult.percentageGain.toFixed(2)}
                          % do investido
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
                      <span>Evolução Mês a Mês</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mês</TableHead>
                            <TableHead>Período</TableHead>
                            <TableHead>Saldo Total</TableHead>
                            <TableHead>Total Investido</TableHead>
                            <TableHead>Juros Acumulados</TableHead>
                            <TableHead>Crescimento Mensal</TableHead>
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
          </TabsContent>

          {/* LOAN CALCULATOR - LINEAR LAYOUT */}
          <TabsContent value="loan" className="space-y-3 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PiggyBank className="h-5 w-5" />
                  <span>Calculadora de Financiamento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Type Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select
                        value={loanType}
                        onValueChange={(value: "car" | "house") =>
                          setLoanType(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="house">🏠 Casa</SelectItem>
                          <SelectItem value="car">🚗 Carro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Financial inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="loanAmount">
                        Valor do {loanType === "house" ? "Imóvel" : "Veículo"}{" "}
                        (R$)
                      </Label>
                      <Input
                        id="loanAmount"
                        type="number"
                        value={loan.amount}
                        onChange={(e) =>
                          setLoan({ ...loan, amount: Number(e.target.value) })
                        }
                        placeholder={loanType === "house" ? "300000" : "50000"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="installments">
                        Quantidade de Parcelas
                      </Label>
                      <Input
                        id="installments"
                        type="number"
                        value={installments}
                        onChange={(e) =>
                          setInstallments(Number(e.target.value))
                        }
                        placeholder={loanType === "house" ? "360" : "60"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="loanRate">
                        Taxa de Juros do Bem (% ao ano)
                      </Label>
                      <Input
                        id="loanRate"
                        type="number"
                        step="0.1"
                        value={loan.rate}
                        onChange={(e) =>
                          setLoan({ ...loan, rate: Number(e.target.value) })
                        }
                        placeholder="12.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="financingRate">
                        Taxa de Juros Financiamento (% ao ano)
                      </Label>
                      <Input
                        id="financingRate"
                        type="number"
                        step="0.1"
                        value={financingRate}
                        onChange={(e) =>
                          setFinancingRate(Number(e.target.value))
                        }
                        placeholder="8.5"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCalculateLoan}
                    disabled={isLoading === "loan"}
                    className="w-full md:w-auto"
                  >
                    {isLoading === "loan" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Calculando...
                      </>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4 mr-2" />
                        Calcular Financiamento
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Loan Results */}
            {loanResult && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>
                        {operationType === "buy"
                          ? `Resultado do Financiamento ${loanType === "house" ? "Imobiliário" : "Automotivo"}`
                          : `Análise de ${loanType === "house" ? "Aluguel" : "Financiamento"}`}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-sm text-muted-foreground">
                          {operationType === "buy"
                            ? "Parcela Mensal"
                            : "Valor Mensal"}
                        </div>
                        <div className="text-xl font-bold text-blue-600">
                          {formatCurrency(
                            operationType === "buy"
                              ? loanResult.monthlyPayment
                              : loan.amount,
                          )}
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                        <div className="text-sm text-muted-foreground">
                          {operationType === "buy"
                            ? "Total a Pagar"
                            : "Total do Período"}
                        </div>
                        <div className="text-xl font-bold">
                          {formatCurrency(
                            operationType === "buy"
                              ? loanResult.totalPayment
                              : loan.amount * 12 * loan.term,
                          )}
                        </div>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-sm text-muted-foreground">
                          {operationType === "buy"
                            ? "Total de Juros"
                            : "Total de Reajustes"}
                        </div>
                        <div className="text-xl font-bold text-red-600">
                          {formatCurrency(
                            operationType === "buy"
                              ? loanResult.totalInterest
                              : loan.amount * 12 * loan.term - loan.amount * 12,
                          )}
                        </div>
                      </div>
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <div className="text-sm text-muted-foreground">
                          {operationType === "buy"
                            ? "Taxa Efetiva"
                            : "Valor Final Mensal"}
                        </div>
                        <div className="text-xl font-bold text-amber-600">
                          {operationType === "buy"
                            ? `${loanResult.effectiveRate.toFixed(2)}%`
                            : formatCurrency(
                                loan.amount *
                                  Math.pow(1 + loan.rate / 100, loan.term),
                              )}
                        </div>
                      </div>
                    </div>

                    {/* Buy vs Rent Comparison */}
                    {operationType === "buy" && (
                      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-semibold mb-3 text-green-800 dark:text-green-200">
                          💡 Comparação: Comprar vs Alugar
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium mb-2">
                              Comprando (
                              {loanType === "house" ? "Imóvel" : "Veículo"})
                            </p>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>
                                • Parcela mensal:{" "}
                                {formatCurrency(loanResult.monthlyPayment)}
                              </li>
                              <li>
                                • Total pago:{" "}
                                {formatCurrency(loanResult.totalPayment)}
                              </li>
                              <li>• Bem fica seu após {loan.term} anos</li>
                              {loanType === "house" && (
                                <li>• Possível valorização do imóvel</li>
                              )}
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium mb-2">
                              Alugando (Estimativa)
                            </p>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>
                                • Aluguel estimado:{" "}
                                {formatCurrency(
                                  loanResult.monthlyPayment * 0.6,
                                )}
                              </li>
                              <li>
                                • Total no período:{" "}
                                {formatCurrency(
                                  loanResult.monthlyPayment *
                                    0.6 *
                                    12 *
                                    loan.term,
                                )}
                              </li>
                              <li>• Bem não fica seu</li>
                              <li>• Maior flexibilidade para mudanças</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Amortization Table */}
                {loanResult.amortizationTable && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Tabela de Amortização (Primeiros 12 meses)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mês</TableHead>
                            <TableHead>Parcela</TableHead>
                            <TableHead>Principal</TableHead>
                            <TableHead>Juros</TableHead>
                            <TableHead>Saldo Devedor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loanResult.amortizationTable.map(
                            (payment, index) => (
                              <TableRow key={index}>
                                <TableCell>{payment.month}</TableCell>
                                <TableCell>
                                  {formatCurrency(payment.payment)}
                                </TableCell>
                                <TableCell className="text-green-600">
                                  {formatCurrency(payment.principal)}
                                </TableCell>
                                <TableCell className="text-red-600">
                                  {formatCurrency(payment.interest)}
                                </TableCell>
                                <TableCell>
                                  {formatCurrency(payment.balance)}
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* RETIREMENT CALCULATOR - LINEAR LAYOUT */}
          <TabsContent value="retirement" className="space-y-3 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PiggyBank className="h-5 w-5" />
                  <span>Calculadora de Independência Financeira</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="desiredSalary">
                        Salário Desejado (R$)
                      </Label>
                      <Input
                        id="desiredSalary"
                        type="number"
                        value={retirement.desiredSalary}
                        onChange={(e) =>
                          setRetirement({
                            ...retirement,
                            desiredSalary: Number(e.target.value),
                          })
                        }
                        onBlur={(e) => {
                          const value =
                            e.target.value.replace(/^0+/, "") || "0";
                          setRetirement({
                            ...retirement,
                            desiredSalary: Number(value),
                          });
                        }}
                        placeholder="5000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentAge">Idade Atual</Label>
                      <Input
                        id="currentAge"
                        type="number"
                        value={retirement.currentAge}
                        onChange={(e) =>
                          setRetirement({
                            ...retirement,
                            currentAge: Number(e.target.value),
                          })
                        }
                        placeholder="30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interestRate">
                        Taxa de Juros (% ao ano)
                      </Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.1"
                        value={retirement.interestRate}
                        onChange={(e) =>
                          setRetirement({
                            ...retirement,
                            interestRate: Number(e.target.value),
                          })
                        }
                        placeholder="8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentValue">Valor Atual (R$)</Label>
                      <Input
                        id="currentValue"
                        type="number"
                        value={retirement.currentValue}
                        onChange={(e) =>
                          setRetirement({
                            ...retirement,
                            currentValue: Number(e.target.value),
                          })
                        }
                        onBlur={(e) => {
                          const value =
                            e.target.value.replace(/^0+/, "") || "0";
                          setRetirement({
                            ...retirement,
                            currentValue: Number(value),
                          });
                        }}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCalculateRetirement}
                    disabled={isLoading === "retirement"}
                    className="w-full md:w-auto"
                  >
                    {isLoading === "retirement" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Calculando...
                      </>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4 mr-2" />
                        Calcular Independência Financeira
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Financial Independence Results */}
            {retirementResult && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PiggyBank className="h-5 w-5" />
                      <span>Resultado da Independência Financeira</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {retirementResult.alreadyAchieved ? (
                      // Já atingiu o objetivo
                      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-500">
                        <div className="text-center space-y-4">
                          <div className="text-6xl">🎉</div>
                          <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">
                            Parabéns você chegou lá!
                          </h3>
                          <p className="text-lg text-green-600 dark:text-green-400">
                            Nesse momento você já é alguém que pode viver
                            conforme seus próprios desejos e vontades. Parabéns!
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="p-4 bg-white/60 dark:bg-black/20 rounded-lg">
                              <div className="text-sm text-muted-foreground">
                                Seu patrimônio atual
                              </div>
                              <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(retirementResult.currentValue)}
                              </div>
                            </div>
                            <div className="p-4 bg-white/60 dark:bg-black/20 rounded-lg">
                              <div className="text-sm text-muted-foreground">
                                Renda mensal possível
                              </div>
                              <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(retirementResult.monthlyIncome)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Ainda não atingiu o objetivo
                      <div className="space-y-6">
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-l-4 border-blue-500">
                          <div className="text-center">
                            <div className="text-4xl mb-4">🎯</div>
                            <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                              Faltam {retirementResult.yearsNeeded} anos e{" "}
                              {retirementResult.monthsRemainder} meses
                            </h3>
                            <p className="text-blue-600 dark:text-blue-400">
                              para você atingir o salário desejado com
                              investimento
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-sm text-muted-foreground">
                              Capital Necessário
                            </div>
                            <div className="text-lg font-bold text-green-600">
                              {formatCurrency(retirementResult.requiredCapital)}
                            </div>
                          </div>
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-sm text-muted-foreground">
                              Valor Atual
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              {formatCurrency(retirementResult.currentValue)}
                            </div>
                          </div>
                          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <div className="text-sm text-muted-foreground">
                              Ainda Falta
                            </div>
                            <div className="text-lg font-bold text-amber-600">
                              {formatCurrency(retirementResult.remainingNeeded)}
                            </div>
                          </div>
                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="text-sm text-muted-foreground">
                              Aporte Mensal Estimado
                            </div>
                            <div className="text-lg font-bold text-purple-600">
                              {formatCurrency(
                                retirementResult.estimatedMonthlyContribution,
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* INVESTMENT CALCULATOR - LINEAR LAYOUT */}
          <TabsContent value="investment" className="space-y-3 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Calculadora de Metas de Investimento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyAmount">Aporte Mensal (R$)</Label>
                      <Input
                        id="monthlyAmount"
                        type="number"
                        value={investment.monthlyAmount}
                        onChange={(e) =>
                          setInvestment({
                            ...investment,
                            monthlyAmount: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="years">Período (anos)</Label>
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
                      <Label htmlFor="expectedReturn">
                        Rentabilidade (% ao ano)
                      </Label>
                      <Input
                        id="expectedReturn"
                        type="number"
                        step="0.1"
                        value={investment.expectedReturn}
                        onChange={(e) =>
                          setInvestment({
                            ...investment,
                            expectedReturn: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCalculateInvestment}
                    disabled={isLoading === "investment"}
                    className="w-full md:w-auto"
                  >
                    {isLoading === "investment" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Calculando...
                      </>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4 mr-2" />
                        Calcular Investimento
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Investment Results */}
            {investmentResult && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Projeção de Investimento</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-sm text-muted-foreground">
                          Valor Acumulado
                        </div>
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(investmentResult.futureValue)}
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-sm text-muted-foreground">
                          Total Investido
                        </div>
                        <div className="text-xl font-bold text-blue-600">
                          {formatCurrency(investmentResult.totalInvested)}
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-sm text-muted-foreground">
                          Lucro
                        </div>
                        <div className="text-xl font-bold text-purple-600">
                          {formatCurrency(investmentResult.profit)}
                        </div>
                      </div>
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <div className="text-sm text-muted-foreground">
                          Rentabilidade
                        </div>
                        <div className="text-xl font-bold text-amber-600">
                          {investmentResult.profitPercentage.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Investment Projection Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Projeção Anual do Investimento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ano</TableHead>
                          <TableHead>Total Investido</TableHead>
                          <TableHead>Valor Acumulado</TableHead>
                          <TableHead>Lucro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {investmentResult.investmentProjection?.map(
                          (projection, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {projection.year}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(projection.invested)}
                              </TableCell>
                              <TableCell className="font-semibold text-green-600">
                                {formatCurrency(projection.value)}
                              </TableCell>
                              <TableCell className="text-purple-600">
                                {formatCurrency(projection.profit)}
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MarketPremiumGuard>
  );
}
