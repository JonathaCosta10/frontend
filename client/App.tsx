import "./global.css";

import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/core/auth/AuthContext";
import { TranslationProvider } from './contexts/TranslationContext';
import { PrivacyProvider } from './contexts/PrivacyContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from "@/core/auth/guards/ProtectedRoute";
import { OptimizedSuspense, withOptimizedLazy } from "@/core/performance/components/OptimizedSuspense";

// TODO: Implementar LazyContextProviders para reduzir entry chunk
// import { LazyContextProviders } from './contexts/LazyContexts';

// Dashboard Layout
const DashboardLayout = withOptimizedLazy(() => import("@/features/dashboard/components/DashboardLayout"), { preload: true });

// Loading component optimizado
const LoadingSpinner = React.memo(() => (
  <div className="flex items-center justify-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
));
LoadingSpinner.displayName = "LoadingSpinner";

// Public Pages - Convert all to lazy loading to reduce entry chunk
const Index = withOptimizedLazy(() => import("@/features/public/pages/HomePublicPages/Index"), { preload: true });
const Home = withOptimizedLazy(() => import("@/features/public/pages/HomePublicPages/Home"));
const Demo = withOptimizedLazy(() => import("@/features/public/pages/HomePublicPages/Demo"));
const PublicMarket = withOptimizedLazy(() => import("@/features/public/pages/HomePublicPages/PublicMarket"));
const MarketPage = withOptimizedLazy(() => import("@/features/market/pages/MarketPage"));
const PublicMarketPage = withOptimizedLazy(() => import("@/features/public/pages/HomePublicPages/Market"));
const CriptoMarket = withOptimizedLazy(() => import("@/features/public/pages/HomePublicPages/CriptoMarket"));
const LoginRequired = withOptimizedLazy(() => import("@/features/public/pages/HomePublicPages/LoginRequired"));
const Whitepaper = withOptimizedLazy(() => import("@/features/public/pages/HomePublicPages/Documents/Whitepaper"));
const About = withOptimizedLazy(() => import("@/features/public/pages/HomePublicPages/About"));
const PrivacyPolicy = withOptimizedLazy(() => import("@/features/public/pages/HomePublicPages/PrivacyPolicy"));
const Terms = withOptimizedLazy(() => import("@/features/public/pages/HomePublicPages/Terms"));
const Login = withOptimizedLazy(() => import("@/features/public/pages/HomePublicPages/Login"), { preload: true });
const Signup = withOptimizedLazy(() => import("@/features/public/pages/HomePublicPages/Signup"), { preload: true });
const ForgotPassword = withOptimizedLazy(() => import("@/features/public/pages/HomePublicPages/ForgotPassword"));
const PasswordResetSent = withOptimizedLazy(() => import("@/features/public/pages/HomePublicPages/PasswordResetSent"));
const VerifyResetCode = withOptimizedLazy(() => import("@/features/public/pages/HomePublicPages/VerifyResetCode"));
const ResetPassword = withOptimizedLazy(() => import("@/features/public/pages/HomePublicPages/ResetPassword"));

// Error Pages - also convert to lazy
const NotFound = withOptimizedLazy(() => import("@/features/errors/pages/ErrosTratamento/NotFound"));
const AuthenticationError = withOptimizedLazy(() => import("@/features/errors/pages/ErrosTratamento/AuthenticationError"));
const LoginError = withOptimizedLazy(() => import("@/features/errors/pages/ErrosTratamento/LoginError"));

// Auth Pages - also convert to lazy
const TwoFactorEmailSetup = withOptimizedLazy(() => import("@/core/auth/pages/TwoFactorEmailSetup"));

// Orcamento Pages - Budget Feature
const BudgetCustos = withOptimizedLazy(() => import("@/features/budget/pages/orcamento/custos"), { preload: true });
const BudgetEntradas = withOptimizedLazy(() => import("@/features/budget/pages/orcamento/entradas"), { preload: true });
const BudgetDividas = withOptimizedLazy(() => import("@/features/budget/pages/orcamento/dividas"));
const BudgetMetas = withOptimizedLazy(() => import("@/features/budget/pages/orcamento/metas"));
const BudgetIndex = withOptimizedLazy(() => import("@/features/budget/pages/orcamento/index"));

// Investimentos Pages - Investment Feature  
const InvestmentIndex = withOptimizedLazy(() => import("@/features/investments/pages/investimentos/index"), { preload: true });
const InvestmentCadastro = withOptimizedLazy(() => import("@/features/investments/pages/investimentos/cadastro"));
const InvestmentPatrimonio = withOptimizedLazy(() => import("@/features/investments/pages/investimentos/patrimonio"));
const InvestmentComparativos = withOptimizedLazy(() => import("@/features/investments/pages/investimentos/comparativos"));
const InvestmentRanking = withOptimizedLazy(() => import("@/features/investments/pages/investimentos/ranking"));

// Crypto Pages - Crypto Feature
const CryptoIndex = withOptimizedLazy(() => import("@/features/crypto/pages/cripto/index"));
const CryptoCadastro = withOptimizedLazy(() => import("@/features/crypto/pages/cripto/cadastro"));
const CryptoPortfolio = withOptimizedLazy(() => import("@/features/crypto/pages/cripto/portfolio"));
const CryptoMercado = withOptimizedLazy(() => import("@/features/crypto/pages/cripto/mercado"));
const CryptoDashboard = withOptimizedLazy(() => import("@/features/crypto/pages/cripto/DashboardCripto"));
const CriptoAnalise = withOptimizedLazy(() => import("@/features/crypto/pages/cripto/AnaliseCripto"));

// Market Pages - Market Feature
const MercadoIndex = withOptimizedLazy(() => import("@/features/market/pages/mercado/index"));
const MercadoCalculadora = withOptimizedLazy(() => import("@/features/market/pages/mercado/calculadora-financeira"));
const MercadoIndicadores = withOptimizedLazy(() => import("@/features/market/pages/mercado/indicadores-economicos"));
const MercadoListaDesejo = withOptimizedLazy(() => import("@/features/market/pages/mercado/lista-de-desejo"));

// Training Pages - Dashboard Feature
const Training = withOptimizedLazy(() => import("@/features/dashboard/pages/treinamentos/Training"));
const FundosInvestimentos = withOptimizedLazy(() => import("@/features/dashboard/pages/treinamentos/fundos-investimentos"));
const RendaFixa = withOptimizedLazy(() => import("@/features/dashboard/pages/treinamentos/renda-fixa"));
const Acoes = withOptimizedLazy(() => import("@/features/dashboard/pages/treinamentos/acoes"));
const Macroeconomia = withOptimizedLazy(() => import("@/features/dashboard/pages/treinamentos/macroeconomia"));

// Dashboard Pages - Dashboard Feature
const InfoDiaria = withOptimizedLazy(() => import("@/features/dashboard/pages/info-diaria"), { retryAttempts: 2 });
const Perfil = withOptimizedLazy(() => import("@/features/dashboard/pages/perfil"));
const Configuracoes = withOptimizedLazy(() => import("@/features/dashboard/pages/configuracoes"));
const Suporte = withOptimizedLazy(() => import("@/features/dashboard/pages/suporte"));
const RiskAssessment = withOptimizedLazy(() => import("@/features/dashboard/pages/risk-assessment"));
const ChangePassword = withOptimizedLazy(() => import("@/features/dashboard/pages/change-password"));
const PaymentOptions = withOptimizedLazy(() => import("@/features/dashboard/pages/payment-options"));

// Payment Page - Payments Feature
const Pagamento = withOptimizedLazy(() => import("@/features/payments/pages/Pagamento"));

// Profile Pages - Profile Feature
const DadosPessoais = withOptimizedLazy(() => import("@/features/profile/pages/DadosPessoais/Configuracoes"));

// Auth Components
const AuthCallback = withOptimizedLazy(() => import('@/core/auth/components/AuthCallback'));

// Lazy loaded system pages - Budget (com preload)
const Budget = withOptimizedLazy(() => import("@/features/budget/pages/orcamento/Budget"), { preload: true });
const BudgetOverview = withOptimizedLazy(() => import("@/features/budget/pages/orcamento/index"));
const Entradas = withOptimizedLazy(() => import("@/features/budget/pages/orcamento/entradas"));
const Custos = withOptimizedLazy(() => import("@/features/budget/pages/orcamento/custos"));
const Dividas = withOptimizedLazy(() => import("@/features/budget/pages/orcamento/dividas"));
const Metas = withOptimizedLazy(() => import("@/features/budget/pages/orcamento/metas"));

// Lazy loaded system pages - Investments (com preload para Investment principal)
const Investment = withOptimizedLazy(() => import("@/features/investments/pages/investimentos/Investment"), { preload: true });
const Investimentos = withOptimizedLazy(() => import("@/features/investments/pages/investimentos/index"));
const Comparativos = withOptimizedLazy(() => import("@/features/investments/pages/investimentos/comparativos"));
const Cadastro = withOptimizedLazy(() => import("@/features/investments/pages/investimentos/cadastro"));
const Ranking = withOptimizedLazy(() => import("@/features/investments/pages/investimentos/ranking"));
const Patrimonio = withOptimizedLazy(() => import("@/features/investments/pages/investimentos/patrimonio"));

// Lazy loaded system pages - Market (sem preload - usuário precisa navegar primeiro)
const Market = withOptimizedLazy(() => import("@/features/market/pages/mercado/Market"));
const FIIMarket = withOptimizedLazy(() => import("@/features/market/pages/mercado/page"));
const IndicadoresEconomicos = withOptimizedLazy(() => import("@/features/market/pages/mercado/indicadores-economicos"));
const ListaDeDesejo = withOptimizedLazy(() => import("@/features/market/pages/mercado/lista-de-desejo"));
const AnaliseTicker = withOptimizedLazy(() => import("@/features/market/pages/mercado/analise-ticker"));
const AnaliseAcoesCompleta = withOptimizedLazy(() => import("@/features/market/pages/mercado/analise-acoes-completa"));
const AnaliseFIICompleta = withOptimizedLazy(() => import("@/features/market/pages/mercado/analise-fii-completa"));
const CalculadoraFinanceira = withOptimizedLazy(() => import("@/features/market/pages/mercado/calculadora-financeira"));

// Lazy loaded system pages - Crypto (sem preload)
const DashboardCripto = withOptimizedLazy(() => import("@/features/crypto/pages/cripto/DashboardCripto"));
const CriptoDashboard = withOptimizedLazy(() => import("@/features/crypto/pages/cripto/index"));
const MercadoCripto = withOptimizedLazy(() => import("@/features/crypto/pages/cripto/mercado"));
const CriptoPortfolio = withOptimizedLazy(() => import("@/features/crypto/pages/cripto/portfolio"));
const CriptoCadastro = withOptimizedLazy(() => import("@/features/crypto/pages/cripto/cadastro"));

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
                        <AnaliseFIICompleta />
                      </Suspense>
                    } />
                    <Route path="analise-ticker-acoes" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <AnaliseAcoesCompleta />
                      </Suspense>
                    } />
                    <Route path="analise-ticker-fii" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <AnaliseFIICompleta />
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
