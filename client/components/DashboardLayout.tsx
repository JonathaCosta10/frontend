import React, { useState, useCallback, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, Code, Menu, X, Eye, EyeOff } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";
import Onboarding from "./Onboarding";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../contexts/TranslationContext";
import { usePrivacy } from "../contexts/PrivacyContext";
import { useOnboarding } from "../hooks/useOnboarding";
// LanguageSelector removed - Portuguese only application
import { useIntelligentPreload } from "../hooks/useIntelligentPreload";

const DashboardLayout = React.memo(() => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const { hideValues, toggleHideValues } = usePrivacy();
  
  // Hook de preload inteligente
  useIntelligentPreload();
  
  // Onboarding state
  const { shouldShowOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  // Funções memoizadas para evitar re-renders
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const novo = !prev;
      document.documentElement.classList.toggle("dark", novo);
      return novo;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  // Detecta modo desenvolvimento - memoizado
  const isDevMode = useMemo(() => user?.id === "dev-user-1", [user?.id]);

  // Define título e descrição baseado na rota atual - memoizado
  const pageInfo = useMemo(() => {
    const pathname = location.pathname;
    
    if (pathname.startsWith("/pagamento")) {
      return {
        title: t("premium_upgrade"),
        description: t("choose_your_plan"),
      };
    }
    if (pathname.startsWith("/dashboard/orcamento")) {
      return {
        title: t("budget") + " - " + t("budget_overview"),
        description: t("budget_domestic_description"),
      };
    }
    if (pathname.startsWith("/dashboard/investimentos")) {
      return {
        title: t("investments"),
        description: t("investment_description"),
      };
    }
    if (pathname.startsWith("/dashboard/mercado")) {
      return {
        title: t("market"),
        description: t("market_description"),
      };
    }
    if (pathname.startsWith("/dashboard/cripto")) {
      return {
        title: t("crypto"),
        description: t("crypto_description"),
      };
    }
    if (pathname.startsWith("/dashboard/perfil")) {
      return {
        title: t("my_profile"),
        description: t("profile_description"),
      };
    }
    if (pathname.startsWith("/dashboard/configuracoes")) {
      return {
        title: t("settings"),
        description: t("settings_description"),
      };
    }
    return {
      title: t("dashboard"),
      description: t("dashboard_description"),
    };
  }, [location.pathname, t]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Positioned on the left and fixed */}
      <div className={`
        ${mobileMenuOpen ? 'block' : 'hidden'} md:block
        fixed left-0 top-0 z-50 md:z-30
        ${mobileMenuOpen ? 'w-full max-w-sm' : ''}
      `}>
        <DashboardSidebar 
          onCollapseChange={setSidebarCollapsed} 
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content - Now comes after sidebar */}
      <div className={`flex flex-col flex-1 min-h-screen transition-all duration-300 
        ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} 
        ml-0 /* No margin on mobile */
      `}>
        {/* Top Bar - Responsive positioning */}
        <header className={`sticky top-0 z-40 border-b bg-card px-4 md:px-6 py-4 transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9 md:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>

              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-2xl font-bold truncate">{pageInfo.title}</h1>
                <p className="text-muted-foreground text-sm hidden sm:block">{pageInfo.description}</p>
              </div>
              {isDevMode && (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 hidden sm:flex"
                >
                  <Code className="h-3 w-3 mr-1" />
                  {t("development_mode")}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              {/* Privacy Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleHideValues}
                className="w-9 h-9"
                title={hideValues ? "Mostrar Valores" : "Ocultar Valores"}
              >
                {hideValues ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>

              {/* Language selector removed - Portuguese only */}

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

        {/* Content Area - Responsive padding */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-2 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Onboarding Component */}
      <Onboarding
        isVisible={shouldShowOnboarding}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
      />
    </div>
  );
});

DashboardLayout.displayName = "DashboardLayout";

export default DashboardLayout;
