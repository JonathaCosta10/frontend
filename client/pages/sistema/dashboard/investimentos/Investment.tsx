import React from "react";
import { Outlet } from "react-router-dom";
import InvestmentLayout from "@/components/InvestmentLayout";
import { useMonthYear } from "@/hooks/useMonthYear";

export default function Investment() {
  const { mes, ano, setMes, setAno } = useMonthYear();

  return (
    <InvestmentLayout
      mes={mes}
      ano={ano}
      onMesChange={setMes}
      onAnoChange={setAno}
    >
      <Outlet />
    </InvestmentLayout>
  );
}
