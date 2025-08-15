import "./global.css";

import React, { Suspense } from "react";
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

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

// Public Pages - Keep critical ones as direct imports
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

// Lazy loaded system pages - Budget
const Budget = React.lazy(() => import("./pages/sistema/dashboard/orcamento/Budget"));
const BudgetOverview = React.lazy(() => import("./pages/sistema/dashboard/orcamento/index"));
const Entradas = React.lazy(() => import("./pages/sistema/dashboard/orcamento/entradas"));
const Custos = React.lazy(() => import("./pages/sistema/dashboard/orcamento/custos"));
const Dividas = React.lazy(() => import("./pages/sistema/dashboard/orcamento/dividas"));
const Metas = React.lazy(() => import("./pages/sistema/dashboard/orcamento/metas"));

// Lazy loaded system pages - Investments
const Investment = React.lazy(() => import("./pages/sistema/dashboard/investimentos/Investment"));
// Usando a versão corrigida para produção
const Investimentos = React.lazy(() => import("./pages/sistema/dashboard/investimentos/index-prod"));
const Comparativos = React.lazy(() => import("./pages/sistema/dashboard/investimentos/comparativos"));
const Cadastro = React.lazy(() => import("./pages/sistema/dashboard/investimentos/cadastro"));
const Ranking = React.lazy(() => import("./pages/sistema/dashboard/investimentos/ranking"));
const Patrimonio = React.lazy(() => import("./pages/sistema/dashboard/investimentos/patrimonio"));

// Lazy loaded system pages - Market
const Market = React.lazy(() => import("./pages/sistema/dashboard/mercado/Market"));
const FIIMarket = React.lazy(() => import("./pages/sistema/dashboard/mercado/index"));
const IndicadoresEconomicos = React.lazy(() => import("./pages/sistema/dashboard/mercado/indicadores-economicos"));
const ListaDeDesejo = React.lazy(() => import("./pages/sistema/dashboard/mercado/lista-de-desejo"));
const AnaliseTicker = React.lazy(() => import("./pages/sistema/dashboard/mercado/analise-ticker"));
const CalculadoraFinanceira = React.lazy(() => import("./pages/sistema/dashboard/mercado/calculadora-financeira"));

// Lazy loaded system pages - Crypto
const DashboardCripto = React.lazy(() => import("./pages/sistema/dashboard/cripto/DashboardCripto"));
const CriptoDashboard = React.lazy(() => import("./pages/sistema/dashboard/cripto/index"));
const MercadoCripto = React.lazy(() => import("./pages/sistema/dashboard/cripto/mercado"));
const CriptoPortfolio = React.lazy(() => import("./pages/sistema/dashboard/cripto/portfolio"));
const CriptoCadastro = React.lazy(() => import("./pages/sistema/dashboard/cripto/cadastro"));

// Lazy loaded system pages - Training
const Training = React.lazy(() => import("./pages/sistema/dashboard/treinamentos/Training"));
const FundosInvestimentos = React.lazy(() => import("./pages/sistema/dashboard/treinamentos/fundos-investimentos"));
const RendaFixa = React.lazy(() => import("./pages/sistema/dashboard/treinamentos/renda-fixa"));
const Acoes = React.lazy(() => import("./pages/sistema/dashboard/treinamentos/acoes"));
const Macroeconomia = React.lazy(() => import("./pages/sistema/dashboard/treinamentos/macroeconomia"));

// Lazy loaded special pages
const InfoDiaria = React.lazy(() => import("./pages/sistema/dashboard/info-diaria"));
const Perfil = React.lazy(() => import("./pages/sistema/dashboard/perfil"));
const Configuracoes = React.lazy(() => import("./pages/sistema/dashboard/configuracoes"));
const Suporte = React.lazy(() => import("./pages/sistema/dashboard/suporte"));
const RiskAssessment = React.lazy(() => import("./pages/sistema/dashboard/risk-assessment"));
const ChangePassword = React.lazy(() => import("./pages/sistema/dashboard/change-password"));
const PaymentOptions = React.lazy(() => import("./pages/sistema/dashboard/payment-options"));

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
                
                {/* Protected Payment Route */}
                <Route 
                  path="/pagamento" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Pagamento />} />
                </Route>

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
                  <Route path="orcamento" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Budget />
                    </Suspense>
                  }>
                    <Route index element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <BudgetOverview />
                      </Suspense>
                    } />
                    <Route path="entradas" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Entradas />
                      </Suspense>
                    } />
                    <Route path="custos" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Custos />
                      </Suspense>
                    } />
                    <Route path="dividas" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Dividas />
                      </Suspense>
                    } />
                    <Route path="metas" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Metas />
                      </Suspense>
                    } />
                  </Route>

                  {/* Investment routes with nested routing */}
                  <Route path="investimentos" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Investment />
                    </Suspense>
                  }>
                    <Route index element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Investimentos />
                      </Suspense>
                    } />
                    <Route path="comparativos" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Comparativos />
                      </Suspense>
                    } />
                    <Route path="cadastro" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Cadastro />
                      </Suspense>
                    } />
                    <Route path="ranking" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Ranking />
                      </Suspense>
                    } />
                    <Route path="patrimonio" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Patrimonio />
                      </Suspense>
                    } />
                  </Route>

                  {/* Crypto routes with nested routing */}
                  <Route path="cripto" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <DashboardCripto />
                    </Suspense>
                  }>
                    <Route index element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <CriptoDashboard />
                      </Suspense>
                    } />
                    <Route path="mercado" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <MercadoCripto />
                      </Suspense>
                    } />
                    <Route path="portfolio" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <CriptoPortfolio />
                      </Suspense>
                    } />
                    <Route path="cadastro" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <CriptoCadastro />
                      </Suspense>
                    } />
                  </Route>

                  {/* Market routes with nested routing */}
                  <Route path="mercado" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Market />
                    </Suspense>
                  }>
                    <Route index element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <FIIMarket />
                      </Suspense>
                    } />
                    <Route
                      path="indicadores-economicos"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <IndicadoresEconomicos />
                        </Suspense>
                      }
                    />
                    <Route path="lista-de-desejo" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <ListaDeDesejo />
                      </Suspense>
                    } />
                    <Route path="analise-ticker" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <AnaliseTicker />
                      </Suspense>
                    } />
                    <Route
                      path="calculadora-financeira"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <CalculadoraFinanceira />
                        </Suspense>
                      }
                    />
                  </Route>

                  {/* Training routes with nested routing */}
                  <Route path="treinamentos" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Training />
                    </Suspense>
                  }>
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
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <FundosInvestimentos />
                        </Suspense>
                      }
                    />
                    <Route path="renda-fixa" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <RendaFixa />
                      </Suspense>
                    } />
                    <Route path="acoes" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Acoes />
                      </Suspense>
                    } />
                    <Route path="macroeconomia" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Macroeconomia />
                      </Suspense>
                    } />
                  </Route>

                  {/* Special routes */}
                  <Route path="info-diaria" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <InfoDiaria />
                    </Suspense>
                  } />
                  <Route path="perfil" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Perfil />
                    </Suspense>
                  } />
                  <Route path="configuracoes" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Configuracoes />
                    </Suspense>
                  } />
                  <Route path="suporte" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Suporte />
                    </Suspense>
                  } />
                  <Route path="risk-assessment" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <RiskAssessment />
                    </Suspense>
                  } />
                  <Route path="change-password" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <ChangePassword />
                    </Suspense>
                  } />
                  <Route path="payment-options" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <PaymentOptions />
                    </Suspense>
                  } />

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
