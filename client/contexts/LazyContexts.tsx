/**
 * Lazy Context Providers - Sistema de carregamento dinâmico para contextos pesados
 * Reduz o entry chunk separando providers grandes
 */
import React, { Suspense, lazy, ReactNode } from "react";

// Lazy loading para contextos pesados
const TranslationProvider = lazy(() => 
  import("./TranslationContext").then(module => ({
    default: module.TranslationProvider
  }))
);

const AuthProvider = lazy(() =>
  import("./AuthContext").then(module => ({
    default: module.AuthProvider
  }))
);

// Fallback loading component para contextos
const ContextLoader: React.FC<{ name: string }> = ({ name }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Carregando {name}...</p>
    </div>
  </div>
);

// Wrapper para TranslationProvider lazy
export const LazyTranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <Suspense fallback={<ContextLoader name="traduções" />}>
    <TranslationProvider>
      {children}
    </TranslationProvider>
  </Suspense>
);

// Wrapper para AuthProvider lazy
export const LazyAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <Suspense fallback={<ContextLoader name="autenticação" />}>
    <AuthProvider>
      {children}
    </AuthProvider>
  </Suspense>
);

// Provider combinado com lazy loading
export const LazyContextProviders: React.FC<{ children: ReactNode }> = ({ children }) => (
  <LazyAuthProvider>
    <LazyTranslationProvider>
      {children}
    </LazyTranslationProvider>
  </LazyAuthProvider>
);
