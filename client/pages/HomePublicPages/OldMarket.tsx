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
  TrendingDown,
  BarChart3,
  PieChart,
  ArrowRight,
  Menu,
  X,
  Search,
  LineChart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";

export default function OldMarket() {
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

  const marketStats = [
    {
      name: "IBOV",
      value: "128.782",
      change: "+1.45%",
      changeType: "up",
    },
    {
      name: "S&P 500",
      value: "5,219.38",
      change: "+0.87%",
      changeType: "up",
    },
    {
      name: "NASDAQ",
      value: "16,384.21",
      change: "+1.23%",
      changeType: "up",
    },
    {
      name: "Bitcoin",
      value: "R$ 329,451.82",
      change: "+2.45%",
      changeType: "up",
    },
  ];

  const trendingAssets = [
    {
      name: "MGLU3",
      fullName: "Magazine Luiza",
      price: "R$ 15,48",
      change: "+5.32%",
      changeType: "up",
      volume: "R$ 1,2B"
    },
    {
      name: "PETR4",
      fullName: "Petrobras",
      price: "R$ 37,29",
      change: "+3.15%",
      changeType: "up",
      volume: "R$ 3,4B"
    },
    {
      name: "VALE3",
      fullName: "Vale",
      price: "R$ 68,24",
      change: "-1.25%",
      changeType: "down",
      volume: "R$ 2,8B"
    },
    {
      name: "ITUB4",
      fullName: "Itaú Unibanco",
      price: "R$ 34,92",
      change: "+2.08%",
      changeType: "up",
      volume: "R$ 1,5B"
    },
  ];

  const cryptoAssets = [
    {
      name: "BTC",
      fullName: "Bitcoin",
      price: "R$ 329,451.82",
      change: "+2.45%",
      changeType: "up",
      volume: "R$ 15,2B"
    },
    {
      name: "ETH",
      fullName: "Ethereum",
      price: "R$ 18,235.64",
      change: "+1.32%",
      changeType: "up",
      volume: "R$ 8,7B"
    },
    {
      name: "BNB",
      fullName: "Binance Coin",
      price: "R$ 2,423.56",
      change: "-0.95%",
      changeType: "down",
      volume: "R$ 1,4B"
    },
    {
      name: "SOL",
      fullName: "Solana",
      price: "R$ 1,052.78",
      change: "+5.38%",
      changeType: "up",
      volume: "R$ 2,1B"
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className={`border-b bg-card transition-all duration-300 ${
        isScrolled ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : 'sticky top-0 z-50'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/finance-logo.svg" alt="Organizesee Logo" className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-primary">Organizesee</h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <nav className="mr-4">
                <ul className="flex space-x-6">
                  <li>
                    <Link to="/about" className="text-muted-foreground hover:text-foreground">
                      Sobre
                    </Link>
                  </li>
                  <li>
                    <Link to="/whitepaper" className="text-muted-foreground hover:text-foreground">
                      Whitepaper
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground">
                      Política de Privacidade
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-muted-foreground hover:text-foreground">
                      Termos
                    </Link>
                  </li>
                </ul>
              </nav>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="mr-2"
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login" className="flex items-center space-x-1">
                    <LogIn className="h-4 w-4 mr-1" />
                    <span>{t("login")}</span>
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">{t("signup")}</Link>
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="mr-2"
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden p-4 bg-background border-t">
            <nav>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/about"
                    className="text-muted-foreground hover:text-foreground block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link
                    to="/whitepaper"
                    className="text-muted-foreground hover:text-foreground block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Whitepaper
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy-policy"
                    className="text-muted-foreground hover:text-foreground block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-muted-foreground hover:text-foreground block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Termos
                  </Link>
                </li>
                <li className="pt-4 border-t">
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{t("login")}</span>
                  </Link>
                </li>
                <li className="pt-2">
                  <Button size="sm" asChild className="w-full">
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("signup")}
                    </Link>
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>

      {/* Market Overview */}
      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Mercado Financeiro</h1>
              <p className="text-muted-foreground">Acompanhe as tendências e dados do mercado em tempo real</p>
            </div>
            <div className="relative mt-4 md:mt-0 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar ações, criptomoedas, índices..."
                className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background"
              />
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {marketStats.map((stat) => (
              <Card key={stat.name} className="border border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{stat.name}</p>
                    {stat.changeType === "up" ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {stat.change}
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trending Stocks */}
          <section>
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Ações em Alta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendingAssets.map((asset) => (
                    <div key={asset.name} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">{asset.fullName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{asset.price}</div>
                        <div className={`text-sm ${
                          asset.changeType === "up" 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {asset.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="link" className="mt-4 w-full" asChild>
                  <Link to="/stocks">Ver todas as ações</Link>
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Crypto */}
          <section>
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Criptomoedas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cryptoAssets.map((asset) => (
                    <div key={asset.name} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">{asset.fullName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{asset.price}</div>
                        <div className={`text-sm ${
                          asset.changeType === "up" 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {asset.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="link" className="mt-4 w-full" asChild>
                  <Link to="/crypto">Ver todas as criptomoedas</Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* CTA Section */}
        <section className="mt-12 mb-6">
          <div className="bg-primary/5 border border-border rounded-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-6 md:mb-0 md:mr-8">
                <h2 className="text-2xl font-bold mb-2">Acompanhe seu portfólio</h2>
                <p className="text-muted-foreground">
                  Cadastre-se para monitorar seus investimentos, criar alertas personalizados e receber análises detalhadas.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Button size="lg" asChild>
                  <Link to="/signup" className="flex items-center justify-center">
                    <span>Começar gratuitamente</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/demo">Conhecer a plataforma</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img src="/finance-logo.svg" alt="Organizesee Logo" className="w-6 h-6" />
              <span className="font-semibold">Organizesee</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                © 2024 Organizesee. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
