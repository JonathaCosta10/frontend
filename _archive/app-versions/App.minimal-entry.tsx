/**
 * App Component - ENTRY CHUNK MÍNIMO ABSOLUTO
 * Importa apenas React e CSS, tudo mais é lazy loaded
 */

import React from "react";
import "./global.css";

// Tipo para o AppCore
interface AppCoreComponent {
  default: React.ComponentType;
}

// Estado interno para o componente lazy
let AppCorePromise: Promise<AppCoreComponent> | null = null;
let AppCoreComponent: React.ComponentType | null = null;
let loadError: string | null = null;

// Função para carregar o AppCore
const loadAppCore = (): Promise<AppCoreComponent> => {
  if (!AppCorePromise) {
    AppCorePromise = import('./AppCore').catch((error) => {
      loadError = 'Erro ao carregar aplicação';
      console.error('Failed to load AppCore:', error);
      throw error;
    });
  }
  return AppCorePromise;
};

// Loading inline simples (sem dependencies)
const InlineLoader: React.FC = () => (
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
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    zIndex: 9999
  }}>
    <div style={{ textAlign: "center" }}>
      <div style={{
        width: "48px",
        height: "48px",
        border: "4px solid #e5e7eb",
        borderTop: "4px solid #3b82f6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        margin: "0 auto 16px"
      }} />
      <div style={{ 
        color: "#6b7280", 
        fontSize: "14px",
        fontWeight: "500"
      }}>
        Carregando aplicação...
      </div>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Error inline simples
const InlineError: React.FC<{ message: string }> = ({ message }) => (
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
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  }}>
    <div style={{ textAlign: "center", color: "#dc2626" }}>
      <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
        Erro
      </div>
      <div style={{ fontSize: "14px" }}>
        {message}
      </div>
      <button 
        onClick={() => window.location.reload()} 
        style={{
          marginTop: "16px",
          padding: "8px 16px",
          backgroundColor: "#3b82f6",
          color: "#ffffff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px"
        }}
      >
        Recarregar
      </button>
    </div>
  </div>
);

export default function App(): JSX.Element {
  const [component, setComponent] = React.useState<React.ComponentType | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Se já temos o componente carregado, usar ele
    if (AppCoreComponent) {
      setComponent(() => AppCoreComponent);
      setLoading(false);
      return;
    }

    // Se temos erro anterior, mostrar erro
    if (loadError) {
      setError(loadError);
      setLoading(false);
      return;
    }

    // Carregar o AppCore
    loadAppCore()
      .then((module) => {
        AppCoreComponent = module.default;
        setComponent(() => module.default);
        setLoading(false);
      })
      .catch(() => {
        setError('Falha ao carregar aplicação');
        setLoading(false);
      });
  }, []);

  // Estados de loading e erro
  if (error) {
    return <InlineError message={error} />;
  }

  if (loading || !component) {
    return <InlineLoader />;
  }

  // Renderizar o componente carregado
  return React.createElement(component);
}
