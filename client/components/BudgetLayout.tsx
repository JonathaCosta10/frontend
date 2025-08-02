import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "../contexts/TranslationContext";

interface BudgetLayoutProps {
  mes: string;
  ano: string;
  onMesChange: (mes: string) => void;
  onAnoChange: (ano: string) => void;
  children: React.ReactNode;
}

export default function BudgetLayout({
  mes,
  ano,
  onMesChange,
  onAnoChange,
  children,
}: BudgetLayoutProps) {
  const location = useLocation();
  const { t } = useTranslation();

  const budgetNavItems = [
    { label: t("budget_nav_overview"), path: "/dashboard/orcamento" },
    { label: t("budget_nav_income"), path: "/dashboard/orcamento/entradas" },
    { label: t("budget_nav_expenses"), path: "/dashboard/orcamento/custos" },
    { label: t("budget_nav_debts"), path: "/dashboard/orcamento/dividas" },
    { label: t("budget_nav_goals"), path: "/dashboard/orcamento/metas" },
  ];

  const meses = [
    t("january"),
    t("february"),
    t("march"),
    t("april"),
    t("may"),
    t("june"),
    t("july"),
    t("august"),
    t("september"),
    t("october"),
    t("november"),
    t("december"),
  ];

  const anos = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("domestic_budget")}</h1>
          <p className="text-muted-foreground">
            {t("manage_personal_finances")}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={mes} onValueChange={onMesChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t("month_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {meses.map((month, index) => (
                <SelectItem
                  key={index}
                  value={String(index + 1).padStart(2, "0")}
                >
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={ano} onValueChange={onAnoChange}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder={t("year_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {anos.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2">
        {budgetNavItems.map((tab) => (
          <Link key={tab.path} to={tab.path}>
            <Button
              variant={isActive(tab.path) ? "default" : "outline"}
              size="sm"
            >
              {tab.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
