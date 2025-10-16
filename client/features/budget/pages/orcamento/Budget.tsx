import React from "react";
import { Outlet } from "react-router-dom";
import BudgetLayout from "@/features/budget/components/BudgetLayout";
import { useMonthYear } from '@/shared/hooks/useMonthYear';

export default function Budget() {
  const { mes, ano, setMes, setAno } = useMonthYear();

  return (
    <BudgetLayout mes={mes} ano={ano} onMesChange={setMes} onAnoChange={setAno}>
      <Outlet />
    </BudgetLayout>
  );
}
