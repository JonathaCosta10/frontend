import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/contexts/TranslationContext";
import { 
  Calculator, 
  TrendingUp, 
  PiggyBank, 
  Home, 
  Calendar, 
  Building
} from "lucide-react";
import CompoundInterestCalculator from "./calculators/CompoundInterestCalculator";
import LoanCalculator from "./calculators/LoanCalculator";
import InvestmentCalculator from "./calculators/InvestmentCalculator";
import RetirementCalculator from "./calculators/RetirementCalculator";

type CalculatorType = "compound-interest" | "loan" | "investment" | "retirement" | "rent-vs-buy";

export default function CalculadoraFinanceira() {
  const { t } = useTranslation();
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>("compound-interest");

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex flex-col space-y-4">
          {/* Cabeçalho */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              <span className="flex items-center">
                <Calculator className="h-6 w-6 mr-2 text-primary" />
                {t("financial_calculators")}
              </span>
            </h2>
            <div className="text-muted-foreground mb-6">
              {t("financial_calculators_description")}
            </div>
          </div>

          {/* Sistema de abas para as calculadoras */}
          <Tabs 
            defaultValue="compound-interest" 
            value={activeCalculator}
            onValueChange={(value) => setActiveCalculator(value as CalculatorType)}
            className="w-full"
          >
            <div className="border-b">
              <TabsList className="w-full overflow-x-auto flex-nowrap overflow-y-hidden h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="compound-interest"
                  className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none flex items-center"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <span className="whitespace-nowrap">{t("compound_interest_tab")}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="investment"
                  className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none flex items-center"
                >
                  <PiggyBank className="h-4 w-4 mr-2" />
                  <span className="whitespace-nowrap">{t("investment_tab")}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="loan"
                  className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none flex items-center"
                >
                  <Home className="h-4 w-4 mr-2" />
                  <span className="whitespace-nowrap">{t("loan_tab")}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="retirement"
                  className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="whitespace-nowrap">{t("retirement_tab")}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="rent-vs-buy"
                  className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none flex items-center"
                >
                  <Building className="h-4 w-4 mr-2" />
                  <span className="whitespace-nowrap">{t("rent_vs_buy_tab")}</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Conteúdo das abas */}
            <div className="mt-6">
              <TabsContent value="compound-interest">
                <CompoundInterestCalculator />
              </TabsContent>
              <TabsContent value="investment">
                <InvestmentCalculator />
              </TabsContent>
              <TabsContent value="loan">
                <LoanCalculator />
              </TabsContent>
              <TabsContent value="retirement">
                <RetirementCalculator />
              </TabsContent>
              <TabsContent value="rent-vs-buy">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      {t("rent_vs_buy_calculator")}
                    </CardTitle>
                    <CardDescription>
                      {t("rent_vs_buy_calculator_description") || "Compare os custos de alugar versus comprar um imóvel ao longo do tempo."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-2">Em breve disponível</p>
                      <Building className="h-16 w-16 mx-auto text-muted-foreground/50" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
}
