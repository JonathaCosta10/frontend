import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, Code } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../contexts/TranslationContext";
import LanguageSelector from "./LanguageSelector";

export default function DashboardLayout() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const novo = !prev;
      document.documentElement.classList.toggle("dark", novo);
      return novo;
    });
  };

  // Detecta se está em modo desenvolvimento baseado no ID do usuário
  const isDevMode = user?.id === "dev-user-1";

  // Define título e descrição baseado na rota atual
  const getPageInfo = () => {
    if (location.pathname.startsWith("/dashboard/orcamento")) {
      return {
        title: t("budget") + " - " + t("budget_overview"),
        description: t("budget_domestic_description"),
      };
    }
    if (location.pathname.startsWith("/dashboard/investimentos")) {
      return {
        title: t("investments"),
        description: t("investment_description"),
      };
    }
    if (location.pathname.startsWith("/dashboard/mercado")) {
      return {
        title: t("market"),
        description: t("market_description"),
      };
    }
    if (location.pathname.startsWith("/dashboard/cripto")) {
      return {
        title: t("crypto"),
        description: t("crypto_description"),
      };
    }
    if (location.pathname.startsWith("/dashboard/perfil")) {
      return {
        title: t("my_profile"),
        description: t("profile_description"),
      };
    }
    if (location.pathname.startsWith("/dashboard/configuracoes")) {
      return {
        title: t("settings"),
        description: t("settings_description"),
      };
    }
    return {
      title: t("dashboard"),
      description: t("dashboard_description"),
    };
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <DashboardSidebar onCollapseChange={setSidebarCollapsed} />

      {/* Main Content - Responsive design */}
      <div className={`flex flex-col overflow-hidden transition-all duration-300 
        ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} 
        ml-0 /* No margin on mobile */
      `}>
        {/* Top Bar - Responsive positioning */}
        <header className={`fixed top-0 right-0 z-40 border-b bg-card px-6 py-4 transition-all duration-300
          ${sidebarCollapsed ? 'md:left-16' : 'md:left-64'}
          left-0 /* Full width on mobile */
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold">{pageInfo.title}</h1>
                <p className="text-muted-foreground">{pageInfo.description}</p>
              </div>
              {isDevMode && (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                >
                  <Code className="h-3 w-3 mr-1" />
                  {t("development_mode")}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Language and Currency Selector */}
              <LanguageSelector
                variant="compact"
                showCurrency={true}
                size="sm"
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="w-9 h-9"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area - Add top padding for fixed header */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6 pt-24">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
