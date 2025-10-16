/**
 * App Component - Entry point com contextos lazy-loaded
 */

import React, { Suspense } from "react";
import "./global.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

// Lazy load dos contextos pesados
const AuthProvider = React.lazy(() => 
  import("./contexts/AuthContext").then(module => ({ default: module.AuthProvider }))
);

const TranslationProvider = React.lazy(() => 
  import("./contexts/TranslationContext").then(module => ({ default: module.TranslationProvider }))
);

// Lazy load do router
const AppRoutes = React.lazy(() => import("./AppRoutes"));

// Loading component optimizado
const LoadingSpinner = React.memo(() => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
));
LoadingSpinner.displayName = "LoadingSpinner";

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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={<LoadingSpinner />}>
            <AuthProvider>
              <Suspense fallback={<LoadingSpinner />}>
                <TranslationProvider>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AppRoutes />
                  </Suspense>
                </TranslationProvider>
              </Suspense>
            </AuthProvider>
          </Suspense>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
