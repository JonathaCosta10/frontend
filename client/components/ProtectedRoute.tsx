import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute: Status atual:", {
    isAuthenticated,
    loading,
    hasUser: !!user,
    pathname: location.pathname,
  });

  if (loading) {
    console.log("ProtectedRoute: Aguardando verificação de autenticação...");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log(
      "ProtectedRoute: Usuário não autenticado, redirecionando para login",
    );
    // Salva a URL que o usuário tentou acessar para redirecionar após o login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("ProtectedRoute: Usuário autenticado, permitindo acesso");
  return <>{children}</>;
};

export default ProtectedRoute;
