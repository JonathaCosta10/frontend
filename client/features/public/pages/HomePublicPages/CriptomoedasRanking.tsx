import React, { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Moon,
  Sun,
  User,
  LogIn,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Menu,
  X,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from '../../../../contexts/TranslationContext';

export default function CriptomoedasRanking() {
  const [darkMode, setDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("rank");
  const [sortDirection, setSortDirection] = useState("asc");

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

  const cryptocurrencies = [
    { rank: 1, name: "Bitcoin", symbol: "BTC", price: "R$ 329.451,82", price_usd: 58241.43, market_cap: "R$ 1.14 T", volume_24h: "R$ 15.2 B", change_24h: "+2.45%", positive: true },
    { rank: 2, name: "Ethereum", symbol: "ETH", price: "R$ 18.235,64", price_usd: 3225.18, market_cap: "R$ 389.5 B", volume_24h: "R$ 8.7 B", change_24h: "+1.32%", positive: true },
    { rank: 3, name: "Tether", symbol: "USDT", price: "R$ 5,65", price_usd: 1.00, market_cap: "R$ 101.3 B", volume_24h: "R$ 34.9 B", change_24h: "+0.01%", positive: true },
    { rank: 4, name: "BNB", symbol: "BNB", price: "R$ 2.423,56", price_usd: 428.61, market_cap: "R$ 66.8 B", volume_24h: "R$ 1.4 B", change_24h: "-0.95%", positive: false },
    { rank: 5, name: "Solana", symbol: "SOL", price: "R$ 1.052,78", price_usd: 186.17, market_cap: "R$ 43.2 B", volume_24h: "R$ 2.1 B", change_24h: "+5.38%", positive: true },
    { rank: 6, name: "XRP", symbol: "XRP", price: "R$ 3,36", price_usd: 0.59, market_cap: "R$ 31.1 B", volume_24h: "R$ 1.5 B", change_24h: "-1.27%", positive: false },
    { rank: 7, name: "USD Coin", symbol: "USDC", price: "R$ 5,66", price_usd: 1.00, market_cap: "R$ 29.7 B", volume_24h: "R$ 3.8 B", change_24h: "+0.02%", positive: true },
    { rank: 8, name: "Cardano", symbol: "ADA", price: "R$ 2,48", price_usd: 0.44, market_cap: "R$ 15.3 B", volume_24h: "R$ 301.2 M", change_24h: "+1.75%", positive: true },
    { rank: 9, name: "Avalanche", symbol: "AVAX", price: "R$ 181,18", price_usd: 32.05, market_cap: "R$ 11.5 B", volume_24h: "R$ 412.5 M", change_24h: "+2.33%", positive: true },
    { rank: 10, name: "Dogecoin", symbol: "DOGE", price: "R$ 0,78", price_usd: 0.14, market_cap: "R$ 10.9 B", volume_24h: "R$ 581.6 M", change_24h: "-0.85%", positive: false },
  ];

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedData = [...cryptocurrencies].sort((a, b) => {
    if (sortColumn === "rank") {
      return sortDirection === "asc" ? a.rank - b.rank : b.rank - a.rank;
    } else if (sortColumn === "name") {
      return sortDirection === "asc" 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortColumn === "price_usd") {
      return sortDirection === "asc" 
        ? a.price_usd - b.price_usd 
        : b.price_usd - a.price_usd;
    } else if (sortColumn === "change_24h") {
      const aValue = parseFloat(a.change_24h.replace("%", "").replace("+", ""));
      const bValue = parseFloat(b.change_24h.replace("%", "").replace("+", ""));
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const filteredData = sortedData.filter(crypto => 
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSortIcon = (column) => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />;
    }
    return <ArrowUpDown className="h-4 w-4 ml-1" />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className={`border-b bg-card transition-all duration-300 ${
        isScrolled ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : ''
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
            <div className="md:hidden flex items-center">
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Ranking de Criptomoedas</h1>
          
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="stats flex flex-wrap gap-4">
              <div className="stat-item bg-card p-3 rounded-lg">
                <span className="text-sm text-muted-foreground">Criptomoedas</span>
                <p className="text-xl font-semibold">18,342</p>
              </div>
              <div className="stat-item bg-card p-3 rounded-lg">
                <span className="text-sm text-muted-foreground">Exchanges</span>
                <p className="text-xl font-semibold">513</p>
              </div>
              <div className="stat-item bg-card p-3 rounded-lg">
                <span className="text-sm text-muted-foreground">Cap. de Mercado</span>
                <p className="text-xl font-semibold">R$ 2.8 T</p>
              </div>
              <div className="stat-item bg-card p-3 rounded-lg">
                <span className="text-sm text-muted-foreground">Volume 24h</span>
                <p className="text-xl font-semibold">R$ 98.5 B</p>
              </div>
            </div>
            
            <div className="search-box w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Buscar criptomoeda..." 
                  className="pl-10 pr-4 py-2 rounded-md border border-input bg-background w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-4 px-4 font-medium cursor-pointer" onClick={() => handleSort("rank")}>
                    <div className="flex items-center">
                      <span># Rank</span>
                      {getSortIcon("rank")}
                    </div>
                  </th>
                  <th className="py-4 px-4 font-medium cursor-pointer" onClick={() => handleSort("name")}>
                    <div className="flex items-center">
                      <span>Nome</span>
                      {getSortIcon("name")}
                    </div>
                  </th>
                  <th className="py-4 px-4 font-medium text-right cursor-pointer" onClick={() => handleSort("price_usd")}>
                    <div className="flex items-center justify-end">
                      <span>Preço</span>
                      {getSortIcon("price_usd")}
                    </div>
                  </th>
                  <th className="py-4 px-4 font-medium text-right cursor-pointer" onClick={() => handleSort("change_24h")}>
                    <div className="flex items-center justify-end">
                      <span>24h %</span>
                      {getSortIcon("change_24h")}
                    </div>
                  </th>
                  <th className="py-4 px-4 font-medium text-right">
                    Market Cap
                  </th>
                  <th className="py-4 px-4 font-medium text-right">
                    Volume (24h)
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((crypto) => (
                  <tr key={crypto.rank} className="border-b border-border hover:bg-muted/50">
                    <td className="py-4 px-4">{crypto.rank}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                          <span className="text-xs font-bold">{crypto.symbol.charAt(0)}</span>
                        </div>
                        <div>
                          <span className="font-medium">{crypto.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">{crypto.symbol}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">{crypto.price}</td>
                    <td className={`py-4 px-4 text-right ${
                      crypto.positive ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {crypto.change_24h}
                    </td>
                    <td className="py-4 px-4 text-right">{crypto.market_cap}</td>
                    <td className="py-4 px-4 text-right">{crypto.volume_24h}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Informações de Mercado</h3>
              <p className="text-sm text-muted-foreground">
                Os dados de mercado são atualizados a cada 5 minutos. Os valores mostrados são em Reais (BRL).
                Para análises mais detalhadas, alertas de preço e carteira personalizada, faça login ou crie uma conta.
              </p>
              <div className="mt-4 flex gap-4">
                <Button variant="default" asChild>
                  <Link to="/login">{t("login")}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/signup">{t("signup")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Organizesee</h3>
              <p className="text-muted-foreground">
                Plataforma para organização e análise de investimentos.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-foreground">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-foreground">
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link to="/market" className="text-muted-foreground hover:text-foreground">
                    Mercado
                  </Link>
                </li>
                <li>
                  <Link to="/cripto-market" className="text-muted-foreground hover:text-foreground">
                    CriptoMarket
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/terms"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Termos de Serviço
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy-policy"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Política de Privacidade
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contato</h3>
              <p className="text-muted-foreground">contato@organizesee.com.br</p>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} Organizesee. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
