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
import { PrivacyProvider } from "./contexts/PrivacyContext";
import { ThemeProvider } from "./contexts/ThemeContext";
// TODO: Implementar LazyContextProviders para reduzir entry chunk
// import { LazyContextProviders } from "./contexts/LazyContexts";
import ProtectedRoute from "./components/ProtectedRoute";
const DashboardLayout = withOptimizedLazy(() => import("./components/DashboardLayout"), { preload: true });
import { OptimizedSuspense, withOptimizedLazy } from "./components/OptimizedSuspense";

// Loading component optimizado
const LoadingSpinner = React.memo(() => (
  <div className="flex items-center justify-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
));
LoadingSpinner.displayName = "LoadingSpinner";

// Public Pages - Convert all to lazy loading to reduce entry chunk
const Index = withOptimizedLazy(() => import("./pages/HomePublicPages/Index"), { preload: true });
const Home = withOptimizedLazy(() => import("./pages/HomePublicPages/Home"));
const Demo = withOptimizedLazy(() => import("./pages/HomePublicPages/Demo"));
const PublicMarket = withOptimizedLazy(() => import("./pages/HomePublicPages/PublicMarket"));
const MarketPage = withOptimizedLazy(() => import("./pages/MarketPage"));
const PublicMarketPage = withOptimizedLazy(() => import("./pages/HomePublicPages/Market"));
const CriptoMarket = withOptimizedLazy(() => import("./pages/HomePublicPages/CriptoMarket"));
const LoginRequired = withOptimizedLazy(() => import("./pages/HomePublicPages/LoginRequired"));
const Whitepaper = withOptimizedLazy(() => import("./pages/HomePublicPages/Documents/Whitepaper"));
const About = withOptimizedLazy(() => import("./pages/HomePublicPages/About"));
const PrivacyPolicy = withOptimizedLazy(() => import("./pages/HomePublicPages/PrivacyPolicy"));
const Terms = withOptimizedLazy(() => import("./pages/HomePublicPages/Terms"));
const Login = withOptimizedLazy(() => import("./pages/HomePublicPages/Login"), { preload: true });
const Signup = withOptimizedLazy(() => import("./pages/HomePublicPages/Signup"), { preload: true });
const ForgotPassword = withOptimizedLazy(() => import("./pages/HomePublicPages/ForgotPassword"));
const PasswordResetSent = withOptimizedLazy(() => import("./pages/HomePublicPages/PasswordResetSent"));
const VerifyResetCode = withOptimizedLazy(() => import("./pages/HomePublicPages/VerifyResetCode"));
const ResetPassword = withOptimizedLazy(() => import("./pages/HomePublicPages/ResetPassword"));

// Error Pages - also convert to lazy
const NotFound = withOptimizedLazy(() => import("./pages/ErrosTratamento/NotFound"));
const AuthenticationError = withOptimizedLazy(() => import("./pages/ErrosTratamento/AuthenticationError"));
const LoginError = withOptimizedLazy(() => import("./pages/ErrosTratamento/LoginError"));

// Auth Pages - also convert to lazy
const TwoFactorEmailSetup = withOptimizedLazy(() => import("./pages/PagesAuth/TwoFactorEmailSetup"));
const Pagamento = withOptimizedLazy(() => import("./pages/Pagamento"));

// Lazy loaded system pages - Budget (com preload)
const Budget = withOptimizedLazy(() => import("./pages/sistema/dashboard/orcamento/Budget"), { preload: true });
const BudgetOverview = withOptimizedLazy(() => import("./pages/sistema/dashboard/orcamento/index"));
const Entradas = withOptimizedLazy(() => import("./pages/sistema/dashboard/orcamento/entradas"));
const Custos = withOptimizedLazy(() => import("./pages/sistema/dashboard/orcamento/custos"));
const Dividas = withOptimizedLazy(() => import("./pages/sistema/dashboard/orcamento/dividas"));
const Metas = withOptimizedLazy(() => import("./pages/sistema/dashboard/orcamento/metas"));

// Lazy loaded system pages - Investments (com preload para Investment principal)
const Investment = withOptimizedLazy(() => import("./pages/sistema/dashboard/investimentos/Investment"), { preload: true });
const Investimentos = withOptimizedLazy(() => import("./pages/sistema/dashboard/investimentos/index"));
const Comparativos = withOptimizedLazy(() => import("./pages/sistema/dashboard/investimentos/comparativos"));
const Cadastro = withOptimizedLazy(() => import("./pages/sistema/dashboard/investimentos/cadastro"));
const Ranking = withOptimizedLazy(() => import("./pages/sistema/dashboard/investimentos/ranking"));
const Patrimonio = withOptimizedLazy(() => import("./pages/sistema/dashboard/investimentos/patrimonio"));

// Lazy loaded system pages - Market (sem preload - usuário precisa navegar primeiro)
const Market = withOptimizedLazy(() => import("./pages/sistema/dashboard/mercado/Market"));
const FIIMarket = withOptimizedLazy(() => import("./pages/sistema/dashboard/mercado/index"));
const IndicadoresEconomicos = withOptimizedLazy(() => import("./pages/sistema/dashboard/mercado/indicadores-economicos"));
const ListaDeDesejo = withOptimizedLazy(() => import("./pages/sistema/dashboard/mercado/lista-de-desejo"));
const AnaliseTicker = withOptimizedLazy(() => import("./pages/sistema/dashboard/mercado/analise-ticker"));
const FIIAnalise = withOptimizedLazy(() => import("./pages/sistema/dashboard/mercado/analise-ticker/fii/index"));
const AnaliseTickerAcoes = withOptimizedLazy(() => import("./pages/sistema/dashboard/mercado/analise-ticker-acoes"));
const CalculadoraFinanceira = withOptimizedLazy(() => import("./pages/sistema/dashboard/mercado/calculadora-financeira"));

// Lazy loaded system pages - Crypto (sem preload)
const DashboardCripto = withOptimizedLazy(() => import("./pages/sistema/dashboard/cripto/DashboardCripto"));
const CriptoDashboard = withOptimizedLazy(() => import("./pages/sistema/dashboard/cripto/index"));
const MercadoCripto = withOptimizedLazy(() => import("./pages/sistema/dashboard/cripto/mercado"));
const CriptoPortfolio = withOptimizedLazy(() => import("./pages/sistema/dashboard/cripto/portfolio"));
const CriptoCadastro = withOptimizedLazy(() => import("./pages/sistema/dashboard/cripto/cadastro"));

// Lazy loaded system pages - Training (sem preload)
const Training = withOptimizedLazy(() => import("./pages/sistema/dashboard/treinamentos/Training"));
const FundosInvestimentos = withOptimizedLazy(() => import("./pages/sistema/dashboard/treinamentos/fundos-investimentos"));
const RendaFixa = withOptimizedLazy(() => import("./pages/sistema/dashboard/treinamentos/renda-fixa"));
const Acoes = withOptimizedLazy(() => import("./pages/sistema/dashboard/treinamentos/acoes"));
const Macroeconomia = withOptimizedLazy(() => import("./pages/sistema/dashboard/treinamentos/macroeconomia"));

// Lazy loaded special pages (com retry)
const InfoDiaria = withOptimizedLazy(() => import("./pages/sistema/dashboard/info-diaria"), { retryAttempts: 2 });
const Perfil = withOptimizedLazy(() => import("./pages/sistema/dashboard/perfil"));
const Configuracoes = withOptimizedLazy(() => import("./pages/sistema/dashboard/configuracoes"));
const Suporte = withOptimizedLazy(() => import("./pages/sistema/dashboard/suporte"));
const RiskAssessment = withOptimizedLazy(() => import("./pages/sistema/dashboard/risk-assessment"));
const ChangePassword = withOptimizedLazy(() => import("./pages/sistema/dashboard/change-password"));
const PaymentOptions = withOptimizedLazy(() => import("./pages/sistema/dashboard/payment-options"));

// QueryClient com configurações otimizadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy-load AuthCallback component
const AuthCallback = withOptimizedLazy(() => import('./components/AuthCallback'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TranslationProvider>
            <PrivacyProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
                <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Index />
                  </Suspense>
                } />
                <Route path="/home" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Home />
                  </Suspense>
                } />
                <Route path="/demo" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Demo />
                  </Suspense>
                } />
                <Route path="/market" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <PublicMarketPage />
                  </Suspense>
                } />
                <Route path="/cripto-market" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <CriptoMarket />
                  </Suspense>
                } />
                <Route path="/whitepaper" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Whitepaper />
                  </Suspense>
                } />
                <Route path="/about" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <About />
                  </Suspense>
                } />
                <Route path="/privacy-policy" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <PrivacyPolicy />
                  </Suspense>
                } />
                <Route path="/terms" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Terms />
                  </Suspense>
                } />
                <Route path="/login-required" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <LoginRequired />
                  </Suspense>
                } />
                <Route path="/login" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Login />
                  </Suspense>
                } />
                <Route path="/signup" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Signup />
                  </Suspense>
                } />
                <Route path="/forgot-password" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ForgotPassword />
                  </Suspense>
                } />
                <Route
                  path="/password-reset-sent"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <PasswordResetSent />
                    </Suspense>
                  }
                />
                <Route
                  path="/verify-reset-code"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <VerifyResetCode />
                    </Suspense>
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <ResetPassword />
                    </Suspense>
                  }
                />
                
                {/* OAuth Callback Routes */}
                <Route 
                  path="/auth/callback" 
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AuthCallback />
                    </Suspense>
                  }
                />

                {/* OAuth Callbacks removidos */}

                {/* Auth Routes */}
                <Route path="/2fa/email" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <TwoFactorEmailSetup />
                  </Suspense>
                } />
                <Route path="/2fa/totp" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <TwoFactorEmailSetup />
                  </Suspense>
                } />
                
                {/* Protected Payment Route */}
                <Route 
                  path="/pagamento" 
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <DashboardLayout />
                      </Suspense>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Pagamento />
                    </Suspense>
                  } />
                </Route>

                {/* Error Routes */}
                <Route
                  path="/authentication-error"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AuthenticationError />
                    </Suspense>
                  }
                />
                <Route path="/login-error" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <LoginError />
                  </Suspense>
                } />

                {/* Protected Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <DashboardLayout />
                      </Suspense>
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
                    <Route path="analise-ticker/fii" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <FIIAnalise />
                      </Suspense>
                    } />
                    <Route path="analise-ticker-acoes" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <AnaliseTickerAcoes />
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
                <Route path="*" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NotFound />
                  </Suspense>
                } />
              </Routes>
            </BrowserRouter>
            </TooltipProvider>
          </PrivacyProvider>
        </TranslationProvider>
      </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
