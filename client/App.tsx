import "./global.css";

import React from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { TranslationProvider } from "./contexts/TranslationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

// Public Pages
import Index from "./pages/HomePublicPages/Index";
import Home from "./pages/HomePublicPages/Home";
import Demo from "./pages/HomePublicPages/Demo";
import PublicMarket from "./pages/HomePublicPages/PublicMarket";
import LoginRequired from "./pages/HomePublicPages/LoginRequired";
import Login from "./pages/HomePublicPages/Login";
import Signup from "./pages/HomePublicPages/Signup";
import ForgotPassword from "./pages/HomePublicPages/ForgotPassword";
import PasswordResetSent from "./pages/HomePublicPages/PasswordResetSent";
import VerifyResetCode from "./pages/HomePublicPages/VerifyResetCode";
import ResetPassword from "./pages/HomePublicPages/ResetPassword";

// Error Pages
import NotFound from "./pages/ErrosTratamento/NotFound";
import AuthenticationError from "./pages/ErrosTratamento/AuthenticationError";
import LoginError from "./pages/ErrosTratamento/LoginError";

// Auth Pages (remain in original location)
import TwoFactorEmailSetup from "./pages/PagesAuth/TwoFactorEmailSetup";
import Pagamento from "./pages/Pagamento";

// System Pages - Dashboard Structure
import Budget from "./pages/sistema/dashboard/orcamento/Budget";
import BudgetOverview from "./pages/sistema/dashboard/orcamento/index";
import Entradas from "./pages/sistema/dashboard/orcamento/entradas";
import Custos from "./pages/sistema/dashboard/orcamento/custos";
import Dividas from "./pages/sistema/dashboard/orcamento/dividas";
import Metas from "./pages/sistema/dashboard/orcamento/metas";

import Investment from "./pages/sistema/dashboard/investimentos/Investment";
import Investimentos from "./pages/sistema/dashboard/investimentos/index";
import Comparativos from "./pages/sistema/dashboard/investimentos/comparativos";
import Cadastro from "./pages/sistema/dashboard/investimentos/cadastro";
import Ranking from "./pages/sistema/dashboard/investimentos/ranking";
import Patrimonio from "./pages/sistema/dashboard/investimentos/patrimonio";

import Market from "./pages/sistema/dashboard/mercado/Market";
import FIIMarket from "./pages/sistema/dashboard/mercado/index";
import IndicadoresEconomicos from "./pages/sistema/dashboard/mercado/indicadores-economicos";
import ListaDeDesejo from "./pages/sistema/dashboard/mercado/lista-de-desejo";
import AnaliseTicker from "./pages/sistema/dashboard/mercado/analise-ticker";
import CalculadoraFinanceira from "./pages/sistema/dashboard/mercado/calculadora-financeira";

import DashboardCripto from "./pages/sistema/dashboard/cripto/DashboardCripto";
import CriptoDashboard from "./pages/sistema/dashboard/cripto/index";
import MercadoCripto from "./pages/sistema/dashboard/cripto/mercado";
import CriptoPortfolio from "./pages/sistema/dashboard/cripto/portfolio";
import CriptoCadastro from "./pages/sistema/dashboard/cripto/cadastro";

import Training from "./pages/sistema/dashboard/treinamentos/Training";
import FundosInvestimentos from "./pages/sistema/dashboard/treinamentos/fundos-investimentos";
import RendaFixa from "./pages/sistema/dashboard/treinamentos/renda-fixa";
import Acoes from "./pages/sistema/dashboard/treinamentos/acoes";
import Macroeconomia from "./pages/sistema/dashboard/treinamentos/macroeconomia";

// Special Pages
import InfoDiaria from "./pages/sistema/dashboard/info-diaria";
import Perfil from "./pages/sistema/dashboard/perfil";
import Configuracoes from "./pages/sistema/dashboard/configuracoes";
import Suporte from "./pages/sistema/dashboard/suporte";
import RiskAssessment from "./pages/sistema/dashboard/risk-assessment";
import ChangePassword from "./pages/sistema/dashboard/change-password";
import PaymentOptions from "./pages/sistema/dashboard/payment-options";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TranslationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<Home />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/market" element={<PublicMarket />} />
                <Route path="/login-required" element={<LoginRequired />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/password-reset-sent"
                  element={<PasswordResetSent />}
                />
                <Route
                  path="/verify-reset-code"
                  element={<VerifyResetCode />}
                />
                <Route
                  path="/reset-password"
                  element={<ResetPassword />}
                />

                {/* Auth Routes */}
                <Route path="/2fa/email" element={<TwoFactorEmailSetup />} />
                <Route path="/2fa/email" element={<TwoFactorEmailSetup />} />
                <Route path="/pagamento" element={<Pagamento />} />

                {/* Error Routes */}
                <Route
                  path="/authentication-error"
                  element={<AuthenticationError />}
                />
                <Route path="/login-error" element={<LoginError />} />

                {/* Protected Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Budget routes with nested routing */}
                  <Route path="orcamento" element={<Budget />}>
                    <Route index element={<BudgetOverview />} />
                    <Route path="entradas" element={<Entradas />} />
                    <Route path="custos" element={<Custos />} />
                    <Route path="dividas" element={<Dividas />} />
                    <Route path="metas" element={<Metas />} />
                  </Route>

                  {/* Investment routes with nested routing */}
                  <Route path="investimentos" element={<Investment />}>
                    <Route index element={<Investimentos />} />
                    <Route path="comparativos" element={<Comparativos />} />
                    <Route path="cadastro" element={<Cadastro />} />
                    <Route path="ranking" element={<Ranking />} />
                    <Route path="patrimonio" element={<Patrimonio />} />
                  </Route>

                  {/* Crypto routes with nested routing */}
                  <Route path="cripto" element={<DashboardCripto />}>
                    <Route index element={<CriptoDashboard />} />
                    <Route path="mercado" element={<MercadoCripto />} />
                    <Route path="portfolio" element={<CriptoPortfolio />} />
                    <Route path="cadastro" element={<CriptoCadastro />} />
                  </Route>

                  {/* Market routes with nested routing */}
                  <Route path="mercado" element={<Market />}>
                    <Route index element={<FIIMarket />} />
                    <Route
                      path="indicadores-economicos"
                      element={<IndicadoresEconomicos />}
                    />
                    <Route path="lista-de-desejo" element={<ListaDeDesejo />} />
                    <Route path="analise-ticker" element={<AnaliseTicker />} />
                    <Route
                      path="calculadora-financeira"
                      element={<CalculadoraFinanceira />}
                    />
                  </Route>

                  {/* Training routes with nested routing */}
                  <Route path="treinamentos" element={<Training />}>
                    <Route
                      index
                      element={
                        <Navigate
                          to="/dashboard/treinamentos/fundos-investimentos"
                          replace
                        />
                      }
                    />
                    <Route
                      path="fundos-investimentos"
                      element={<FundosInvestimentos />}
                    />
                    <Route path="renda-fixa" element={<RendaFixa />} />
                    <Route path="acoes" element={<Acoes />} />
                    <Route path="macroeconomia" element={<Macroeconomia />} />
                  </Route>

                  {/* Special routes */}
                  <Route path="info-diaria" element={<InfoDiaria />} />
                  <Route path="perfil" element={<Perfil />} />
                  <Route path="configuracoes" element={<Configuracoes />} />
                  <Route path="suporte" element={<Suporte />} />
                  <Route path="risk-assessment" element={<RiskAssessment />} />
                  <Route path="change-password" element={<ChangePassword />} />
                  <Route path="payment-options" element={<PaymentOptions />} />

                  {/* Default redirect to budget */}
                  <Route
                    index
                    element={<Navigate to="/dashboard/orcamento" replace />}
                  />
                </Route>

                {/* Catch-all route for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </TranslationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
