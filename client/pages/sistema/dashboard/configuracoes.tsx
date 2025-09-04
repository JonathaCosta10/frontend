import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import SubscriptionGuard from "../../../components/SubscriptionGuard";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Moon,
  Sun,
  Monitor,
  Mail,
  Repeat,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  PlayCircle,
  Calculator, 
  TrendingUp, 
  Home,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function Configuracoes() {
  const { toast } = useToast();
  const { language, currency, setLanguage, setCurrency, t } = useTranslation();
  const { 
    resetOnboarding, 
    hasSeenOnboarding,
    resetTutorial,
    hasTutorialBeenCompleted,
    completeTutorial
  } = useOnboarding();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      marketing: false,
      announcements: true,
      portfolioReports: false,
      marketNews: true,
    },
    theme: "system",
    language: "pt-BR",
    currency: "BRL",
    dataBackup: true,
    twoFactor: false,
    b3Integration: false,
    premiumSettings: {
      autoRenewal: true,
      paymentMethod: "**** 1234",
    },
    repetitionFlags: {
      budgetAutoRenew: false,
      monthlyReport: true,
      expenseCategories: false,
      incomeTracking: true,
    },
  });

  // Estado para rastrear quais métodos de 2FA estão configurados
  const [twoFactorStatus, setTwoFactorStatus] = useState({
    
    email: true,
    app: false,   // Simulação - App authenticator não est�� configurado
  });

  const handleSettingChange = (
    category: string,
    setting: string,
    value: any,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));

    toast({
      title: t('configuration_updated'),
      description: t('preferences_saved_successfully'),
    });
  };

  const handleSimpleSettingChange = (setting: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));

    toast({
      title: t('configuration_updated'),
      description: t('preferences_saved_successfully'),
    });
  };

  const themes = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Escuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Monitor },
  ];

  return (
    <div className="space-y-3 md:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t('settings')}</h1>
            <p className="text-muted-foreground">
              {t('manage_preferences')}
            </p>
          </div>
        </div>

        {/* Quick Language and Currency Toggles */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <select
              className="h-8 px-2 rounded border border-input bg-background text-sm"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                handleSimpleSettingChange("language", e.target.value);
              }}
            >
              <option value="pt-BR">🇧🇷 PT</option>
              <option value="en-US">🇺🇸 EN</option>
              <option value="es-ES">🇪🇸 ES</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <select
              className="h-8 px-2 rounded border border-input bg-background text-sm"
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                handleSimpleSettingChange("currency", e.target.value);
              }}
            >
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>{t('notifications')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">
                {t('email_notifications')}
              </Label>
              <Switch
                id="email-notifications"
                checked={settings.notifications.email}
                onCheckedChange={(value) =>
                  handleSettingChange("notifications", "email", value)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">{t('push_notifications')}</Label>
              <Switch
                id="push-notifications"
                checked={settings.notifications.push}
                onCheckedChange={(value) =>
                  handleSettingChange("notifications", "push", value)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="marketing-notifications">
                {t('marketing_emails')}
              </Label>
              <Switch
                id="marketing-notifications"
                checked={settings.notifications.marketing}
                onCheckedChange={(value) =>
                  handleSettingChange("notifications", "marketing", value)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="announcements-notifications">
                {t('receive_announcements')}
              </Label>
              <Switch
                id="announcements-notifications"
                checked={settings.notifications.announcements}
                onCheckedChange={(value) =>
                  handleSettingChange("notifications", "announcements", value)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="portfolio-reports">
                {t('receive_portfolio_reports')}
              </Label>
              <Switch
                id="portfolio-reports"
                checked={settings.notifications.portfolioReports}
                onCheckedChange={(value) =>
                  handleSettingChange("notifications", "portfolioReports", value)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="market-news">
                {t('receive_market_news')}
              </Label>
              <Switch
                id="market-news"
                checked={settings.notifications.marketNews}
                onCheckedChange={(value) =>
                  handleSettingChange("notifications", "marketNews", value)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Aparência e Regionalização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>{t('appearance_regionalization')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tema */}
            <div className="space-y-3">
              <Label>{t('theme')}</Label>
              <div className="grid grid-cols-3 gap-2">
                {themes.map((theme) => {
                  const IconComponent = theme.icon;
                  return (
                    <Button
                      key={theme.value}
                      variant={
                        settings.theme === theme.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        handleSimpleSettingChange("theme", theme.value);
                        // Apply theme immediately like moon button click
                        if (theme.value === "dark") {
                          document.documentElement.classList.add("dark");
                        } else if (theme.value === "light") {
                          document.documentElement.classList.remove("dark");
                        } else if (theme.value === "system") {
                          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                          document.documentElement.classList.toggle("dark", prefersDark);
                        }
                      }}
                      className="flex flex-col items-center space-y-1 h-auto p-3"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-xs">{t(theme.value === 'light' ? 'light' : theme.value === 'dark' ? 'dark' : 'system')}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Regionalização */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">{t('language')}</Label>
                <select
                  id="language"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    handleSimpleSettingChange("language", e.target.value);
                  }}
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">{t('currency')}</Label>
                <select
                  id="currency"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.target.value);
                    handleSimpleSettingChange("currency", e.target.value);
                  }}
                >
                  <option value="BRL">Real (BRL)</option>
                  <option value="USD">Dólar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tutorial e Orientação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Tutorial e Orientação</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Apresentação Geral do Sistema */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Apresentação do Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    {hasSeenOnboarding 
                      ? "Você já visualizou a apresentação do sistema" 
                      : "Você ainda não visualizou a apresentação completa"}
                  </p>
                </div>
                <Badge variant={hasSeenOnboarding ? "default" : "secondary"}>
                  {hasSeenOnboarding ? "Concluído" : "Pendente"}
                </Badge>
              </div>
              
              <Button 
                onClick={() => {
                  resetTutorial('general');
                  toast({
                    title: "Apresentação reiniciada",
                    description: "A apresentação geral do sistema será exibida novamente.",
                  });
                }}
                className="w-full"
                variant="outline"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                {hasSeenOnboarding ? "Ver Apresentação Novamente" : "Iniciar Apresentação"}
              </Button>
            </div>

            <Separator />

            {/* Tutoriais Específicos */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Tutoriais por Seção</h3>
              
              {/* Resumo Diário */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium">Resumo Diário</span>
                  </div>
                  <Badge variant={hasTutorialBeenCompleted('dailyInfo') ? "default" : "outline"}>
                    {hasTutorialBeenCompleted('dailyInfo') ? "Visto" : "Novo"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Entenda como usar a visualização principal do seu painel financeiro
                </p>
                <Button 
                  onClick={() => {
                    resetTutorial('dailyInfo');
                    toast({
                      title: "Tutorial iniciado",
                      description: "Vamos conhecer o resumo diário!",
                    });
                  }}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <PlayCircle className="h-3 w-3 mr-1" />
                  Ver Tutorial
                </Button>
              </div>
              
              {/* Gestão de Orçamento */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Calculator className="h-4 w-4 mr-2 text-green-600" />
                    <span className="font-medium">Gestão de Orçamento</span>
                  </div>
                  <Badge variant={hasTutorialBeenCompleted('budget') ? "default" : "outline"}>
                    {hasTutorialBeenCompleted('budget') ? "Visto" : "Novo"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Aprenda a cadastrar entradas, saídas e controlar seu orçamento mensal
                </p>
                <Button 
                  onClick={() => {
                    resetTutorial('budget');
                    toast({
                      title: "Tutorial iniciado",
                      description: "Vamos aprender sobre o gerenciamento de orçamento!",
                    });
                  }}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <PlayCircle className="h-3 w-3 mr-1" />
                  Ver Tutorial
                </Button>
              </div>
              
              {/* Renda Variável */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                    <span className="font-medium">Renda Variável</span>
                  </div>
                  <Badge variant={hasTutorialBeenCompleted('variableIncome') ? "default" : "outline"}>
                    {hasTutorialBeenCompleted('variableIncome') ? "Visto" : "Novo"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Saiba como acompanhar seus investimentos e analisar por setor
                </p>
                <Button 
                  onClick={() => {
                    resetTutorial('variableIncome');
                    toast({
                      title: "Tutorial iniciado",
                      description: "Vamos explorar o acompanhamento de investimentos!",
                    });
                  }}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <PlayCircle className="h-3 w-3 mr-1" />
                  Ver Tutorial
                </Button>
              </div>
            </div>

            <Separator />

            {/* Ações Globais de Tutorial */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Ações Globais</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => {
                    // Resetar todos os tutoriais
                    ['general', 'dailyInfo', 'budget', 'variableIncome'].forEach(tutorial => {
                      resetTutorial(tutorial as any);
                    });
                    toast({
                      title: "Todos os tutoriais resetados",
                      description: "Você pode visualizar novamente todos os tutoriais.",
                    });
                  }}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Resetar Todos
                </Button>
                
                <Button 
                  onClick={() => {
                    // Marcar todos como concluídos
                    ['general', 'dailyInfo', 'budget', 'variableIncome'].forEach(tutorial => {
                      completeTutorial(tutorial as any);
                    });
                    toast({
                      title: "Todos os tutoriais marcados como vistos",
                      description: "Os tutoriais não serão mais exibidos automaticamente.",
                    });
                  }}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Marcar Todos como Vistos
                </Button>
              </div>
            </div>

            <Separator />

            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-1">
                💡 Sobre os Tutoriais
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Os tutoriais guiam você pelas principais funcionalidades do sistema, 
                mostrando como usar cada seção para organizar suas finanças de forma eficiente.
                Você pode revisar qualquer tutorial a qualquer momento.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Integração Portal Investidor */}
        <SubscriptionGuard>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Integração Portal Investidor</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('authorize_b3_data_integration')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('allows_access_b3_data')}
                  </p>
              </div>
              <Switch
                checked={settings.b3Integration || false}
                onCheckedChange={(value) =>
                  handleSimpleSettingChange("b3Integration", value)
                }
              />
            </div>

            {settings.b3Integration && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1 text-yellow-800 dark:text-yellow-200">Aviso Importante:</p>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      Para integração com B3, é necessário fornecer apenas seu CPF.
                      Seus dados são protegidos e utilizados exclusivamente para análises financeiras.
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <Label htmlFor="cpf-b3">CPF para integração B3</Label>
                  <Input
                    id="cpf-b3"
                    placeholder="000.000.000-00"
                    className="max-w-xs"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </SubscriptionGuard>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>{t('security')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>{t('two_factor_authentication')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('add_extra_security_layer')}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link to="/2fa/email">
                  <div className={`border-2 rounded-lg p-3 transition-colors ${
                    twoFactorStatus.email
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-300 bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <Button variant="ghost" size="sm" className="w-full h-auto flex-col space-y-2 p-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        {twoFactorStatus.email ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{t('two_fa_by_email')}</p>
                        <Badge
                          variant={twoFactorStatus.email ? "default" : "destructive"}
                          className="text-xs mt-1"
                        >
                          {twoFactorStatus.email ? t('configured') : t('not_configured')}
                        </Badge>
                      </div>
                    </Button>
                  </div>
                </Link>
              </div>



              <Separator />

              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  {t('change_password')}
                </Button>
                <Button variant="outline" className="w-full">
                  {t('manage_active_sessions')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flags de Repetição */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Repeat className="h-5 w-5" />
              <span>{t('repetition_settings')}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('configure_automatic_behaviors')}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="budget-auto-renew"
                    checked={settings.repetitionFlags.budgetAutoRenew}
                    onCheckedChange={(value) =>
                      handleSettingChange("repetitionFlags", "budgetAutoRenew", value)
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="budget-auto-renew" className="text-sm font-medium">
                      {t('automatic_budget_renewal')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t('automatically_renews_budget_categories')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="monthly-report"
                    checked={settings.repetitionFlags.monthlyReport}
                    onCheckedChange={(value) =>
                      handleSettingChange("repetitionFlags", "monthlyReport", value)
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="monthly-report" className="text-sm font-medium">
                      {t('monthly_report')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t('automatically_generates_monthly_reports')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="expense-categories"
                    checked={settings.repetitionFlags.expenseCategories}
                    onCheckedChange={(value) =>
                      handleSettingChange("repetitionFlags", "expenseCategories", value)
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="expense-categories" className="text-sm font-medium">
                      {t('fixed_expense_categories')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t('maintains_predefined_categories')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="income-tracking"
                    checked={settings.repetitionFlags.incomeTracking}
                    onCheckedChange={(value) =>
                      handleSettingChange("repetitionFlags", "incomeTracking", value)
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="income-tracking" className="text-sm font-medium">
                      {t('recurring_income_tracking')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t('automatically_adds_fixed_monthly_income')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-sm flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>{t('how_repetition_flags_work')}</span>
              </h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>{t('budget_flag_description')}</p>
                <p>{t('investments_flag_description')}</p>
                <p>{t('expenses_flag_description')}</p>
                <p>{t('income_flag_description')}</p>
              </div>
            </div>
          </CardContent>
        </Card>




      </div>
    </div>
  );
}
