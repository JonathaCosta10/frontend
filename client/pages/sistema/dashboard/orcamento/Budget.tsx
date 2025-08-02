import React from "react";
import { Outlet } from "react-router-dom";
import BudgetLayout from "@/components/BudgetLayout";
import { useMonthYear } from "@/hooks/useMonthYear";

export default function Budget() {
  const { mes, ano, setMes, setAno } = useMonthYear();

  return (
    <BudgetLayout mes={mes} ano={ano} onMesChange={setMes} onAnoChange={setAno}>
      <Outlet />
    </BudgetLayout>
  );
}
