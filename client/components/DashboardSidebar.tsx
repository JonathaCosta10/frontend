import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Calculator,
  BarChart3,
  TrendingUp,
  Bitcoin,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
  HelpCircle,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useProfileVerification } from "../hooks/useProfileVerification";
import { usePersonalData } from "../hooks/usePersonalData";
import { useTranslation } from "../contexts/TranslationContext";
import SubscriptionGuard from "./SubscriptionGuard";
import LanguageSelector from "./LanguageSelector";

interface SidebarItem {
  labelKey: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

interface DashboardSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
  onMobileClose?: () => void;
}

export default function DashboardSidebar({ onCollapseChange, onMobileClose }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isPaidUser } = useProfileVerification();
  const { personalData } = usePersonalData();
  const { t } = useTranslation();

  // Notifica o parent component quando o estado collapsed muda
  const handleCollapseToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  const mainItems: SidebarItem[] = [
    {
      labelKey: "daily_info",
      path: "/dashboard/info-diaria",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      labelKey: "budget",
      path: "/dashboard/orcamento",
      icon: <Calculator className="h-4 w-4" />,
    },
    {
      labelKey: "investments",
      path: "/dashboard/investimentos",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      labelKey: "market",
      path: "/dashboard/mercado",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      labelKey: "crypto",
      path: "/dashboard/cripto",
      icon: <Bitcoin className="h-4 w-4" />,
    },
  ];

  const trainingItems: SidebarItem[] = [
    {
      labelKey: "investment_funds",
      path: "/dashboard/treinamentos/fundos-investimentos",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      labelKey: "fixed_income_training",
      path: "/dashboard/treinamentos/renda-fixa",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      labelKey: "stocks_training",
      path: "/dashboard/treinamentos/acoes",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      labelKey: "macroeconomics",
      path: "/dashboard/treinamentos/macroeconomia",
      icon: <BarChart3 className="h-4 w-4" />,
    },
  ];

  const systemItems: SidebarItem[] = [
    {
      labelKey: "my_profile",
      path: "/dashboard/perfil",
      icon: <User className="h-4 w-4" />,
    },
    {
      labelKey: "settings",
      path: "/dashboard/configuracoes",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      labelKey: "support",
      path: "/dashboard/suporte",
      icon: <HelpCircle className="h-4 w-4" />,
    },
  ];

  const isActive = (path: string) => {
    // Exact match for main routes
    if (location.pathname === path) return true;

    // For nested routes, check if current path starts with the base path
    if (
      path === "/dashboard/orcamento" &&
      location.pathname.startsWith("/dashboard/orcamento")
    )
      return true;
    if (
      path === "/dashboard/investimentos" &&
      location.pathname.startsWith("/dashboard/investimentos")
    )
      return true;
    if (
      path === "/dashboard/treinamentos" &&
      location.pathname.startsWith("/dashboard/treinamentos")
    )
      return true;

    return false;
  };

  return (
    <div
      className={cn(
        "sidebar-container flex flex-col border-r bg-card transition-all duration-300",
        "fixed left-0 top-0 h-screen z-50",
        collapsed ? "w-16" : "w-64",
        "lg:block", // Always visible on large screens
        "hidden md:block" // Hidden on mobile, visible on tablet and up
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <Link to="/dashboard/info-diaria" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                O
              </span>
            </div>
            <span className="font-bold text-lg">Organizesee</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/dashboard/info-diaria" className="flex items-center justify-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                O
              </span>
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCollapseToggle}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User Info */}
      {!collapsed && user && (
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <p className="font-medium text-sm truncate">
                  {personalData?.nome_completo || 
                   user.full_name || 
                   `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                   user.name || 
                   user.username}
                </p>
                <Link to="/pagamento">
                  <Crown className="h-4 w-4 ml-1 text-gray-800 cursor-pointer" />
                </Link>
              </div>
              {personalData?.nome_completo && (
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              )}
            </div>
          </div>

          {/* Premium Banner for non-paid users */}
          {!isPaidUser() && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-white" />
                <div className="flex-1">
                  <p className="text-white text-xs font-medium">
                    {t("my_plan")}
                  </p>
                  <Link to="/pagamento">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full mt-1 h-6 text-xs bg-white/20 hover:bg-white/30 text-white border-0"
                    >
                      {t("become_premium")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
        <nav className="p-2 space-y-2 pb-20 md:pb-8 lg:pb-4">
          {/* Main Items */}
          <div className="space-y-1">
            {!collapsed && (
              <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("main_section")}
              </h3>
            )}
            {mainItems.map((item) => {
              // Skip crypto item as it will be added separately
              if (item.path === "/dashboard/cripto") {
                return null;
              }

              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => onMobileClose && onMobileClose()}
                >
                  <Button
                    variant={
                      isActive(item.path) ||
                      location.pathname.startsWith(item.path)
                        ? "secondary"
                        : "ghost"
                    }
                    className={cn("w-full justify-start", collapsed && "px-2")}
                  >
                    {item.icon}
                    {!collapsed && (
                      <>
                        <span className="ml-2">{t(item.labelKey)}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                </Link>
              );
            })}

            {/* Crypto Section - Always show for all users */}
            <Link to="/dashboard/cripto" onClick={() => onMobileClose && onMobileClose()}>
              <Button
                variant={
                  location.pathname.startsWith("/dashboard/cripto")
                    ? "secondary"
                    : "ghost"
                }
                className={cn("w-full justify-start", collapsed && "px-2")}
              >
                <Bitcoin className="h-4 w-4" />
                {!collapsed && (
                  <span className="ml-2">{t("cryptocurrencies")}</span>
                )}
              </Button>
            </Link>

            {/* Vire Premium Section - Only show for non-premium users */}
            {!isPaidUser() && (
              <Link to="/pagamento" onClick={() => onMobileClose && onMobileClose()}>
                <Button
                  variant="ghost"
                  className={cn("w-full justify-start", collapsed && "px-2")}
                >
                  <Crown className="h-4 w-4 text-yellow-500" />
                  {!collapsed && (
                    <>
                      <span className="ml-2">
                        {t("become_premium_upgrade")}
                      </span>
                      <Crown className="ml-auto h-3 w-3 text-yellow-500" />
                    </>
                  )}
                </Button>
              </Link>
            )}
          </div>

          {/* Training Items */}
          <div className="space-y-1 pt-4">
            {!collapsed && (
              <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("learn_more")}
              </h3>
            )}
            {trainingItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => onMobileClose && onMobileClose()}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", collapsed && "px-2")}
                >
                  {item.icon}
                  {!collapsed && (
                    <span className="ml-2">{t(item.labelKey)}</span>
                  )}
                </Button>
              </Link>
            ))}
          </div>

          {/* System Items */}
          <div className="space-y-1 pt-4">
            {!collapsed && (
              <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("system_section")}
              </h3>
            )}
            {systemItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => onMobileClose && onMobileClose()}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", collapsed && "px-2")}
                >
                  {item.icon}
                  {!collapsed && (
                    <span className="ml-2">{t(item.labelKey)}</span>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Logout */}
      <div className="sidebar-footer p-2 border-t mt-auto">
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
            collapsed && "px-2",
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">{t("logout")}</span>}
        </Button>
      </div>
    </div>
  );
}
