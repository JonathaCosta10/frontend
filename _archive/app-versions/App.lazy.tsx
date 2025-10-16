/**
 * App Component - Entry point mínimo da aplicação
 * Importa apenas o CSS global e carrega o AppCore lazily
 */

import React, { Suspense } from "react";
import "./global.css";

// Loading component mínimo
const MinimalLoader = () => (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    zIndex: 9999
  }}>
    <div style={{
      width: "40px",
      height: "40px",
      border: "4px solid #f3f3f3",
      borderTop: "4px solid #3498db",
      borderRadius: "50%",
      animation: "spin 1s linear infinite"
    }}></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Lazy load do AppCore completo
const AppCore = React.lazy(() => import('./AppCore'));

export default function App() {
  return (
    <Suspense fallback={<MinimalLoader />}>
      <AppCore />
    </Suspense>
  );
}
