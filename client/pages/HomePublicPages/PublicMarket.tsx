import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, User, LogIn, Search, Menu, X, Play, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/TranslationContext";
// LanguageSelector removed - Portuguese only application
import { fetchTop10Ranking } from "@/services/api/PublicPages/ranking/pesquisaRankingporTipoPublic";

interface FinancialData {
  ticker: string;
  preco: number;
  variacao: number;
  marketCap: string;
  setor: string;
  volume?: string;
}

export default function PublicMarket() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Using useAuth hook
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const [setorSelecionado, setSetorSelecionado] = useState("all_sectors");
  const [tipoAtivo, setTipoAtivo] = useState<"fiis" | "acoes">("fiis");
  const [dados, setDados] = useState<FinancialData[]>([]);
  const [periodoVariacao, setPeriodoVariacao] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("daily");
  const [sortBy, setSortBy] = useState<"marketCap" | "preco" | "variacao">(
    "marketCap",
  );

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const novo = !prev;
      document.documentElement.classList.toggle("dark", novo);
      return novo;
    });
  };

  const handleAnalysisClick = (ticker: string) => {
    if (user) {
      // Se logado, vai para a análise do ticker no dashboard
      navigate(`/dashboard/mercado/analise-ticker?ticker=${ticker}`);
    } else {
      // Se não logado, vai para a página de login com redirect
      navigate(
        `/login?redirect=${encodeURIComponent(`/dashboard/mercado/analise-ticker?ticker=${ticker}`)}`,
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rankingData = await fetchTop10Ranking(tipoAtivo, 10);
        setDados(rankingData);
      } catch (error) {
        console.error("Error fetching ranking data:", error);
      }
    };

    fetchData();
  }, [tipoAtivo]);

  const setoresFiis = [
    "all_sectors",
    "logistics",
    "corporate",
    "hybrid",
    "paper",
    "malls",
  ];
  const setoresAcoes = [
    "all_sectors",
    "technology",
    "banking",
    "oil_gas",
    "mining",
    "retail",
  ];

  const setoresAtivos = tipoAtivo === "fiis" ? setoresFiis : setoresAcoes;

  const dadosFiltrados =
    setorSelecionado === "all_sectors"
      ? dados
      : dados.filter((item) => {
          const setorOriginal = item.setor.toLowerCase();
          const setorSelecionadoTraduzido = t(setorSelecionado).toLowerCase();
          return (
            setorOriginal.includes(setorSelecionadoTraduzido) ||
            setorSelecionadoTraduzido.includes(setorOriginal)
          );
        });

  // Sort by market cap (highest to lowest)
  const dadosOrdenados = [...dadosFiltrados].sort((a, b) => {
    const aValue = parseFloat(a.marketCap.replace(/[^0-9.]/g, ""));
    const bValue = parseFloat(b.marketCap.replace(/[^0-9.]/g, ""));
    return bValue - aValue;
  });

  const getVariationClass = (variacao: number) => {
    if (variacao > 0) return "text-success bg-success/10";
    if (variacao < 0) return "text-destructive bg-destructive/10";
    return "text-muted-foreground bg-muted/10";
  };

  const getTopByCategory = (category: string) => {
    switch (category) {
      case "biggest":
        return dados
          .sort(
            (a, b) =>
              parseFloat(b.marketCap.replace("B", "")) -
              parseFloat(a.marketCap.replace("B", "")),
          )
          .slice(0, 3);
      case "popular":
        return dados
          .sort(
            (a, b) =>
              parseFloat(b.volume?.replace("M", "") || "0") -
              parseFloat(a.volume?.replace("M", "") || "0"),
          )
          .slice(0, 3);
      case "new":
        return dados.sort((a, b) => b.variacao - a.variacao).slice(0, 3);
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/home" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  O
                </span>
              </div>
              <h1 className="text-2xl font-bold text-primary">Organizesee</h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
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

              <div className="flex items-center space-x-2">
                {user ? (
                  <Link to="/dashboard">
                    <Button className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{t("dashboard")}</span>
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login">
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-2"
                      >
                        <LogIn className="h-4 w-4" />
                        <span>{t("login")}</span>
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{t("signup")}</span>
                      </Button>
                    </Link>
                  </>
                )}
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
                  {user ? (
                    <Link to="/dashboard" className="w-full">
                      <Button
                        size="lg"
                        className="w-full justify-center flex items-center space-x-2 text-lg py-6 bg-primary hover:bg-primary/90"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span>{t("dashboard")}</span>
                      </Button>
                    </Link>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
                
                {/* Quick Actions */}
                <div className="px-2 pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">Navegação:</p>
                  <div className="grid grid-cols-1 gap-2">
                    <Link to="/home" className="w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Início
                      </Button>
                    </Link>
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
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-32 md:pb-8 space-y-8">
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["biggest", "popular", "new"].map((title) => (
            <Card key={title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{t(title)}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("ticker")} | {t("variation")} | {t("position")}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {getTopByCategory(title).map((item, idx) => (
                  <div
                    key={`${title}-${idx}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{item.ticker}</span>
                      <Badge className={getVariationClass(item.variacao)}>
                        {item.variacao > 0 ? "+" : ""}
                        {item.variacao.toFixed(2)}%
                      </Badge>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>{t("top_10_funds")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("funds_of_funds", {
                count: dadosOrdenados.length,
                total: dados.length,
              })}
            </p>
          </CardHeader>
          <CardContent>
            {/* Type Selector */}
            <div className="flex items-center space-x-2 mb-4">
              <Button
                variant={tipoAtivo === "fiis" ? "default" : "outline"}
                onClick={() => setTipoAtivo("fiis")}
              >
                {t("reits")}
              </Button>
              <Button
                variant={tipoAtivo === "acoes" ? "default" : "outline"}
                onClick={() => setTipoAtivo("acoes")}
              >
                {t("actions")}
              </Button>
            </div>

            {/* Sector Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {setoresAtivos.map((setor) => (
                <Button
                  key={setor}
                  variant={setorSelecionado === setor ? "default" : "outline"}
                  onClick={() => setSetorSelecionado(setor)}
                  className="flex-shrink-0"
                >
                  {t(setor)}
                </Button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("ranking")}</TableHead>
                    <TableHead>{t("ticker")}</TableHead>
                    <TableHead>{t("price")}</TableHead>
                    <TableHead>% {t("variation")} D-1</TableHead>
                    <TableHead>{t("market_cap")}</TableHead>
                    <TableHead>{t("sector")}</TableHead>
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dadosOrdenados.map((ativo, index) => (
                    <TableRow key={ativo.ticker} className="hover:bg-muted/50">
                      <TableCell className="font-bold text-primary">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {ativo.ticker}
                      </TableCell>
                      <TableCell>R$ {ativo.preco.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getVariationClass(ativo.variacao)}>
                          {ativo.variacao > 0 ? "+" : ""}
                          {ativo.variacao.toFixed(2)}%
                        </Badge>
                      </TableCell>
                      <TableCell>{ativo.marketCap}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ativo.setor}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAnalysisClick(ativo.ticker)}
                          className="h-8 w-8"
                          title={
                            user ? t("analyze_ticker") : t("login_to_analyze")
                          }
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="mt-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2 text-primary">
              {t("watch_system_presentation")}
            </h3>
            <div className="mb-4">
              <Link to="/demo">
                <Button variant="outline" className="mb-2">
                  {t("presentation")}
                </Button>
              </Link>
            </div>
            <p className="text-muted-foreground mb-4">
              {t("already_client_or_want")}
            </p>
            <div className="flex justify-center space-x-4">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg">{t("dashboard")}</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button size="lg">{t("login")}</Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="outline" size="lg">
                      {t("signup")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Floating Action Buttons for Mobile */}
      <div className="fixed bottom-6 left-4 right-4 md:hidden z-40">
        <div className="flex flex-col space-y-3">
          {user ? (
            <Link to="/dashboard" className="w-full">
              <Button
                size="lg"
                className="w-full justify-center flex items-center space-x-2 text-lg py-4 bg-primary hover:bg-primary/90 shadow-lg transform transition-transform hover:scale-105"
              >
                <User className="h-5 w-5" />
                <span className="font-semibold">{t("dashboard")}</span>
              </Button>
            </Link>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
