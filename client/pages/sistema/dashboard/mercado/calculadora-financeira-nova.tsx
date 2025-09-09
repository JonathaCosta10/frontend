import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  PiggyBank, 
  Target, 
  Calendar,
  Home,
  Car,
  Briefcase,
  CreditCard
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

// Componentes de calculadoras
import CompoundInterestCalculator from "./calculators/CompoundInterestCalculator";
import LoanCalculator from "./calculators/LoanCalculator";
import InvestmentCalculator from "./calculators/InvestmentCalculator";
import RetirementCalculator from "./calculators/RetirementCalculator";

export default function CalculadoraFinanceira() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Obtém o tipo de calculadora da URL ou usa "compound" como padrão
  const currentCalculator = location.hash.replace("#", "") || "compound";
  
  // Função para mudar a calculadora
  const navigateToCalculator = (calculator: string) => {
    navigate(`#${calculator}`);
  };

  // Lista de calculadoras disponíveis
  const calculators = [
    {
      id: "compound",
      name: t("compound_interest_tab"),
      icon: <Calculator className="h-4 w-4 mr-2" />,
      description: t("compound_interest_desc")
    },
    {
      id: "loan",
      name: t("financing_tab"),
      icon: <CreditCard className="h-4 w-4 mr-2" />,
      description: t("loan_calculator_desc")
    },
    {
      id: "investment",
      name: t("investment_tab"),
      icon: <Briefcase className="h-4 w-4 mr-2" />,
      description: t("investment_calculator_desc")
    },
    {
      id: "retirement",
      name: t("financial_independence_tab"),
      icon: <Target className="h-4 w-4 mr-2" />,
      description: t("retirement_calculator_desc")
    }
  ];

  // Renderiza o componente da calculadora atual
  const renderCalculator = () => {
    switch (currentCalculator) {
      case "compound":
        return <CompoundInterestCalculator />;
      case "loan":
        return <LoanCalculator />;
      case "investment":
        return <InvestmentCalculator />;
      case "retirement":
        return <RetirementCalculator />;
      default:
        return <CompoundInterestCalculator />;
    }
  };

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">{t("financial_calc_header")}</h2>
        <p className="text-muted-foreground">{t("financial_tools_desc")}</p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2">
        {calculators.map((calculator) => (
          <Button
            key={calculator.id}
            variant={currentCalculator === calculator.id ? "default" : "outline"}
            size="sm"
            onClick={() => navigateToCalculator(calculator.id)}
          >
            {calculator.icon}
            {calculator.name}
          </Button>
        ))}
      </div>

      {/* Descrição da calculadora atual */}
      <div className="text-sm text-muted-foreground">
        {calculators.find(calc => calc.id === currentCalculator)?.description || ""}
      </div>
      
      {/* Renderiza a calculadora selecionada */}
      {renderCalculator()}
    </div>
  );
}
