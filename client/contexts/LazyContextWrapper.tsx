/**
 * LazyContextWrapper - Wrapper que carrega contextos pesados lazily
 */

import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

// Lazy contexts
const AuthProvider = React.lazy(() => 
  import("./AuthContext").then(module => ({ default: module.AuthProvider }))
);

const TranslationProvider = React.lazy(() => 
  import("./TranslationContext").then(module => ({ default: module.TranslationProvider }))
);

// Lazy components
const AppRoutes = React.lazy(() => import('../AppRoutes'));

// Loading component
const ContextLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export default function LazyContextWrapper() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Suspense fallback={<ContextLoader />}>
        <AuthProvider>
          <Suspense fallback={<ContextLoader />}>
            <TranslationProvider>
              <Suspense fallback={<ContextLoader />}>
                <AppRoutes />
              </Suspense>
            </TranslationProvider>
          </Suspense>
        </AuthProvider>
      </Suspense>
    </TooltipProvider>
  );
}
