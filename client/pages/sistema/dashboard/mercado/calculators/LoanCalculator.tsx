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
  PiggyBank,
  DollarSign,
  Calendar,
  Percent,
  BarChart3,
  Loader2,
  Home,
  Car,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { FinancialCalculatorApiService } from "@/services/api/entities/financialCalculatorApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LoanInput {
  amount: number;
  rate: number;
  term: number;
  type: string;
}

interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  amortizationTable: {
    period: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
}

export default function LoanCalculator() {
  const { t, formatCurrency, formatNumber } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [loanResult, setLoanResult] = useState<LoanResult | null>(null);
  const [loanType, setLoanType] = useState<"car" | "house" | "other">("house");
  const [operationType, setOperationType] = useState<"buy" | "rent">("buy");
  
  // Form States
  const [loan, setLoan] = useState<LoanInput>({
    amount: 300000,
    rate: 8.5,
    term: 30,
    type: "price", // price (Tabela Price) ou sac (Sistema de Amortização Constante)
  });

  // Calculation handler
  const handleCalculateLoan = async () => {
    setIsLoading(true);
    try {
      // Normalizando o valor do term em meses (para cálculos)
      const termInMonths = loanType === "house" ? loan.term * 12 : loan.term;
      
      const result = await FinancialCalculatorApiService.calculateLoan({
        ...loan,
        term: termInMonths,
      });
      
      setLoanResult(result);
    } catch (error) {
      console.error("Error calculating loan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Usando formatCurrency do contexto de tradução

  return (
    <div className="space-y-4">
      <Tabs defaultValue="financiamento" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="financiamento">
            <Home className="h-4 w-4 mr-2" /> {t("financing_tab")}
          </TabsTrigger>
          <TabsTrigger value="rent-vs-buy">
            <Car className="h-4 w-4 mr-2" /> {t("rent_vs_buy_tab")}
          </TabsTrigger>
        </TabsList>

        {/* FINANCIAMENTO CALCULADORA */}
        <TabsContent value="financiamento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PiggyBank className="h-5 w-5" />
                <span>{t("loan_calculator")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Financiamento</Label>
                    <Select
                      value={loanType}
                      onValueChange={(value: "car" | "house" | "other") =>
                        setLoanType(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">🏠 Imóvel</SelectItem>
                        <SelectItem value="car">🚗 Veículo</SelectItem>
                        <SelectItem value="other">📦 Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sistema de Amortização</Label>
                    <Select
                      value={loan.type}
                      onValueChange={(value: string) =>
                        setLoan({ ...loan, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Tabela Price</SelectItem>
                        <SelectItem value="sac">SAC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Financial inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loanAmount">
                      Valor do {loanType === "house" ? "Imóvel" : loanType === "car" ? "Veículo" : "Bem"}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                      <Input
                        id="loanAmount"
                        type="number"
                        className="pl-9"
                        value={loan.amount}
                        onChange={(e) =>
                          setLoan({ ...loan, amount: Number(e.target.value) })
                        }
                        placeholder={loanType === "house" ? "300000" : "50000"}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{formatCurrency(loan.amount)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loanRate">
                      Taxa de Juros Anual
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      <Input
                        id="loanRate"
                        type="number"
                        step="0.1"
                        className="pl-7"
                        value={loan.rate}
                        onChange={(e) =>
                          setLoan({ ...loan, rate: Number(e.target.value) })
                        }
                        placeholder={loanType === "house" ? "8.5" : "12"}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{loan.rate}% {t("excluding_taxes")}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loanTerm">
                      {loanType === "house" ? "Prazo (anos)" : "Prazo (meses)"}
                    </Label>
                    <Input
                      id="loanTerm"
                      type="number"
                      value={loan.term}
                      onChange={(e) =>
                        setLoan({ ...loan, term: Number(e.target.value) })
                      }
                      placeholder={loanType === "house" ? "30" : "60"}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleCalculateLoan}
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
                        <PiggyBank className="h-4 w-4 mr-2" />
                        {t("calculate_loan")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {loanResult && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>{t("loan_results")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {t("monthly_payment")}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(loanResult.monthlyPayment)}
                      </div>
                      <p className="text-xs text-blue-600/80">
                        {loan.type === 'price' ? 
                          t("fixed_payment_price") : 
                          t("decreasing_payment_sac")}
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          {t("total_payment")}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(loanResult.totalPayment)}
                      </div>
                      <p className="text-xs text-green-600/80">
                        {t("total_value_paid")}
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                      <div className="flex items-center space-x-2 mb-2">
                        <Percent className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                          {t("total_interest")}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(loanResult.totalInterest)}
                      </div>
                      <p className="text-xs text-purple-600/80">
                        {((loanResult.totalInterest / loan.amount) * 100).toFixed(2)}% {t("of_loan_value")}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="max-h-96 overflow-y-auto mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("period")}</TableHead>
                          <TableHead>{t("payment")}</TableHead>
                          <TableHead>{t("principal")}</TableHead>
                          <TableHead>{t("interest")}</TableHead>
                          <TableHead>{t("balance")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loanResult.amortizationTable?.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{row.period}</TableCell>
                            <TableCell>{formatCurrency(row.payment)}</TableCell>
                            <TableCell>{formatCurrency(row.principal)}</TableCell>
                            <TableCell>{formatCurrency(row.interest)}</TableCell>
                            <TableCell>{formatCurrency(row.balance)}</TableCell>
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

        {/* COMPARAÇÃO ALUGAR X COMPRAR */}
        <TabsContent value="rent-vs-buy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5" />
                <span>{t("rent_vs_buy_calculator")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* COMPRAR */}
                  <div className="space-y-4 border-r pr-4">
                    <h3 className="font-medium text-lg flex items-center gap-2">
                      <Home className="h-4 w-4" /> {t("buy_option")}
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="propertyValue">{t("property_value")}</Label>
                      <Input
                        id="propertyValue"
                        type="number"
                        placeholder="300000"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="downPayment">{t("down_payment")}</Label>
                      <Input
                        id="downPayment"
                        type="number"
                        placeholder="60000"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mortgageRate">{t("mortgage_rate")}</Label>
                      <Input
                        id="mortgageRate"
                        type="number"
                        step="0.1"
                        placeholder="8.5"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mortgageTerm">{t("mortgage_term")}</Label>
                      <Input
                        id="mortgageTerm"
                        type="number"
                        placeholder="30"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="propertyTax">{t("property_tax")}</Label>
                      <Input
                        id="propertyTax"
                        type="number"
                        step="0.1"
                        placeholder="0.5"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="propertyAppreciation">{t("property_appreciation")}</Label>
                      <Input
                        id="propertyAppreciation"
                        type="number"
                        step="0.1"
                        placeholder="3"
                      />
                    </div>
                  </div>
                  
                  {/* ALUGAR */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> {t("rent_option")}
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="monthlyRent">{t("monthly_rent")}</Label>
                      <Input
                        id="monthlyRent"
                        type="number"
                        placeholder="1500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rentIncrease">{t("annual_rent_increase")}</Label>
                      <Input
                        id="rentIncrease"
                        type="number"
                        step="0.1"
                        placeholder="4"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="investmentReturn">{t("investment_return_rate")}</Label>
                      <Input
                        id="investmentReturn"
                        type="number"
                        step="0.1"
                        placeholder="7"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timeHorizon">{t("time_horizon_years")}</Label>
                      <Input
                        id="timeHorizon"
                        type="number"
                        placeholder="10"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    className="w-full md:w-auto"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    {t("compare_options")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
