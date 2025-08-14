import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Moon,
  Sun,
  User,
  LogIn,
  TrendingUp,
  BarChart3,
  PieChart,
  ArrowRight,
  Shield,
  Zap,
  Users,
  Menu,
  X,
  Play,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import LanguageSelector from "@/components/LanguageSelector";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const novo = !prev;
      document.documentElement.classList.toggle("dark", novo);
      return novo;
    });
  };

  const features = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: t('market_analysis'),
      description: t('market_analysis_description'),
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: t('detailed_reports'),
      description: t('detailed_reports_description'),
    },
    {
      icon: <PieChart className="h-8 w-8" />,
      title: t('diversified_portfolio'),
      description: t('diversified_portfolio_description'),
    },
  ];

  const stats = [
    { label: t('quick_response'), value: "24h" },
    { label: t('user_satisfaction'), value: "98%" },
    { label: t('platform_updates'), value: "Semanal" },
    { label: t('financial_insights'), value: "Diário" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className={`border-b bg-card transition-all duration-300 ${
        isScrolled ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : ''
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  O
                </span>
              </div>
              <h1 className="text-2xl font-bold text-primary">Organizesee</h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Language and Currency Selector */}
              <LanguageSelector variant="compact" showCurrency={false} size="sm" />

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

              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{t('login')}</span>
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{t('signup')}</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-2">
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
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9"
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-border">
              <div className="flex flex-col space-y-4">
                {/* Main Action Buttons */}
                <div className="flex flex-col space-y-3 px-2">
                  <Link to="/login" className="w-full">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full justify-center flex items-center space-x-2 text-lg py-6"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogIn className="h-5 w-5" />
                      <span>{t("login")}</span>
                    </Button>
                  </Link>
                  <Link to="/signup" className="w-full">
                    <Button
                      size="lg"
                      className="w-full justify-center flex items-center space-x-2 text-lg py-6 bg-primary hover:bg-primary/90"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>{t("signup")}</span>
                    </Button>
                  </Link>
                </div>
                
                {/* Quick Actions */}
                <div className="px-2 pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">Navegação:</p>
                  <div className="grid grid-cols-1 gap-2">
                    <Link to="/demo" className="w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Demonstração
                      </Button>
                    </Link>
                    <Link to="/market" className="w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Mercado
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className={`container mx-auto px-4 pb-32 md:pb-8 ${isScrolled ? 'pt-20' : ''}`}>
        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              🚀 Organizesee
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t('organize_investments')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('complete_platform_description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/market">
                <Button size="lg" className="flex items-center space-x-2">
                  <span>{t('explore_market')}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg">
                  {t('watch_demo')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('everything_need_invest_better')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('professional_tools_maximize_returns')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t('why_choose_organizesee')}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t('reliable_data')}</h3>
                    <p className="text-muted-foreground">
                      {t('reliable_data_description')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t('intuitive_interface')}</h3>
                    <p className="text-muted-foreground">
                      {t('intuitive_interface_description')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t('active_community')}</h3>
                    <p className="text-muted-foreground">
                      {t('active_community_description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">{t('start_today')}</h3>
                  <p className="text-muted-foreground mb-6">
                    {t('thousands_investors_trust')}
                  </p>
                  <Link to="/market">
                    <Button size="lg" className="w-full">
                      {t('explore_platform')}
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">
                  O
                </span>
              </div>
              <span className="font-semibold">Organizesee</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Organizesee. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons for Mobile */}
      <div className="fixed bottom-6 left-4 right-4 md:hidden z-40">
        <div className="flex flex-col space-y-3">
          {/* Primary CTA - Signup */}
          <Link to="/signup" className="w-full">
            <Button
              size="lg"
              className="w-full justify-center flex items-center space-x-2 text-lg py-4 bg-primary hover:bg-primary/90 shadow-lg transform transition-transform hover:scale-105"
            >
              <User className="h-5 w-5" />
              <span className="font-semibold">{t("signup")}</span>
              <Badge variant="secondary" className="ml-2 bg-white text-primary text-xs px-2">
                GRÁTIS
              </Badge>
            </Button>
          </Link>
          
          {/* Secondary CTA - Login */}
          <Link to="/login" className="w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-center flex items-center space-x-2 text-lg py-4 bg-background hover:bg-muted shadow-lg border-2 transform transition-transform hover:scale-105"
            >
              <LogIn className="h-5 w-5" />
              <span className="font-semibold">{t("login")}</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
