/**
 * App Component - Entry point balanceado
 * Carrega contextos pesados via lazy loading
 */

import React, { Suspense } from "react";
import "./global.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Loading component simples
const AppLoader = () => (
  <div className="flex items-center justify-center h-screen bg-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando aplicação...</p>
    </div>
  </div>
);

// Lazy load do router principal
const AppRouter = React.lazy(() => import('./AppRouter'));

// QueryClient otimizado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<AppLoader />}>
          <AppRouter />
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
