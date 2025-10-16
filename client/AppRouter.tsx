/**
 * AppRouter - Router principal com contextos lazy loaded
 */

import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Carregamento lazy dos contextos pesados
const LazyContextProvider = React.lazy(() => import('./contexts/LazyContextWrapper'));

// Loading simples
const RouteLoader = () => (
  <div className="flex items-center justify-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

export default function AppRouter() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <LazyContextProvider />
    </Suspense>
  );
}
