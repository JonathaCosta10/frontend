/**
 * App Component - Entry point ABSOLUTO MÍNIMO
 * Zero dependências além do React e CSS
 */

import React from "react";
import "./global.css";

// Inline minimal loader para não importar nada
const InlineLoader = () => (
  <div 
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#ffffff",
      fontFamily: "system-ui, -apple-system, sans-serif",
      zIndex: 9999
    }}
  >
    <div>
      <div 
        style={{
          width: "40px",
          height: "40px",
          border: "4px solid #e5e7eb",
          borderTop: "4px solid #3b82f6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 16px"
        }}
      />
      <div style={{ color: "#6b7280", fontSize: "14px" }}>Carregando...</div>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// App state para lazy loading
let AppCorePromise: Promise<{ default: React.ComponentType }> | null = null;

function getAppCore() {
  if (!AppCorePromise) {
    AppCorePromise = import('./AppCore');
  }
  return AppCorePromise;
}

export default function App() {
  const [AppCore, setAppCore] = React.useState<React.ComponentType | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getAppCore()
      .then((module) => {
        setAppCore(() => module.default);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load AppCore:', err);
        setError('Falha ao carregar aplicação');
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
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
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#dc2626"
      }}>
        {error}
      </div>
    );
  }

  if (loading || !AppCore) {
    return <InlineLoader />;
  }

  return React.createElement(AppCore);
}
