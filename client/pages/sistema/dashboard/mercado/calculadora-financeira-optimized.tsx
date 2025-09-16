import React, { useState, Suspense } from "react";
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
import { OptimizedSuspense } from "@/components/OptimizedSuspense";

// Lazy loading para cada calculadora individual
const CompoundInterestCalculator = React.lazy(() => 
  import("./calculators/CompoundInterestCalculator").then(module => ({
    default: module.default
  }))
);

const LoanCalculator = React.lazy(() => 
  import("./calculators/LoanCalculator").then(module => ({
    default: module.default
  }))
);

const InvestmentCalculator = React.lazy(() => 
  import("./calculators/InvestmentCalculator").then(module => ({
    default: module.default
  }))
);

const RetirementCalculator = React.lazy(() => 
  import("./calculators/RetirementCalculator").then(module => ({
    default: module.default
  }))
);

type CalculatorType = "compound-interest" | "loan" | "investment" | "retirement" | "rent-vs-buy";

// Loading skeleton específico para calculadoras
const CalculatorSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
      </div>
    </CardContent>
  </Card>
);

// Component para calculadora não disponível
const ComingSoonCalculator = ({ title, description, icon: Icon }: { 
  title: string; 
  description: string; 
  icon: React.ComponentType<any> 
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Icon className="h-5 w-5 mr-2" />
        {title}
      </CardTitle>
      <CardDescription>
        {description}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-2">Em breve disponível</p>
        <Icon className="h-16 w-16 mx-auto text-muted-foreground/50" />
      </div>
    </CardContent>
  </Card>
);

export default function CalculadoraFinanceiraOptimizada() {
  const { t } = useTranslation();
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>("compound-interest");

  // Preload das calculadoras quando o usuário muda de aba
  const handleTabChange = (value: string) => {
    setActiveCalculator(value as CalculatorType);
    
    // Preload da próxima calculadora mais provável de ser acessada
    const preloadMap: Record<CalculatorType, () => Promise<any>> = {
      "compound-interest": () => import("./calculators/InvestmentCalculator"),
      "investment": () => import("./calculators/LoanCalculator"),
      "loan": () => import("./calculators/RetirementCalculator"),
      "retirement": () => import("./calculators/CompoundInterestCalculator"),
      "rent-vs-buy": () => import("./calculators/CompoundInterestCalculator")
    };

    // Preload com delay para não afetar a performance
    setTimeout(() => {
      preloadMap[value as CalculatorType]?.().catch(() => {
        // Silently fail preload
      });
    }, 500);
  };

  return (
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
          onValueChange={handleTabChange}
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
          
          {/* Conteúdo das abas com lazy loading */}
          <div className="mt-6">
            <TabsContent value="compound-interest">
              <OptimizedSuspense fallback={<CalculatorSkeleton />}>
                <CompoundInterestCalculator />
              </OptimizedSuspense>
            </TabsContent>
            
            <TabsContent value="investment">
              <OptimizedSuspense fallback={<CalculatorSkeleton />}>
                <InvestmentCalculator />
              </OptimizedSuspense>
            </TabsContent>
            
            <TabsContent value="loan">
              <OptimizedSuspense fallback={<CalculatorSkeleton />}>
                <LoanCalculator />
              </OptimizedSuspense>
            </TabsContent>
            
            <TabsContent value="retirement">
              <OptimizedSuspense fallback={<CalculatorSkeleton />}>
                <RetirementCalculator />
              </OptimizedSuspense>
            </TabsContent>
            
            <TabsContent value="rent-vs-buy">
              <ComingSoonCalculator
                title={t("rent_vs_buy_calculator")}
                description={t("rent_vs_buy_calculator_description") || "Compare os custos de alugar versus comprar um imóvel ao longo do tempo."}
                icon={Building}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
