import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "../contexts/TranslationContext";

interface MarketLayoutProps {
  children: React.ReactNode;
}

export default function MarketLayout({ children }: MarketLayoutProps) {
  const location = useLocation();
  const { t } = useTranslation();

  const marketNavItems = [
    { label: t("market_nav_fiis"), path: "/dashboard/mercado" },
    {
      label: t("market_nav_analysis_fii"),
      path: "/dashboard/mercado/analise-ticker",
    },
    {
      label: t("market_nav_analysis_acoes"),
      path: "/dashboard/mercado/analise-ticker-acoes",
    },
    {
      label: t("market_nav_wishlist"),
      path: "/dashboard/mercado/lista-de-desejo",
    },
    {
      label: t("market_nav_indicators"),
      path: "/dashboard/mercado/indicadores-economicos",
    },
    {
      label: t("market_nav_calculator"),
      path: "/dashboard/mercado/calculadora-financeira",
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("financial_market")}</h1>
          <p className="text-muted-foreground">{t("market_analysis_tools")}</p>
        </div>

        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {t("real_time_data")} (CoinGecko API)
          </span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2">
        {marketNavItems.map((tab) => (
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
