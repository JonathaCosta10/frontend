import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { localStorageManager } from "../lib/localStorage";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user, revalidateAuth } = useAuth();
  const location = useLocation();
  const [manualCheck, setManualCheck] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Verificação manual de autenticação como fallback
  useEffect(() => {
    // Se o contexto de autenticação já está carregado e definido, não precisamos fazer verificação manual
    if (!loading && isAuthenticated) {
      return;
    }
    
    // Verificar se acabamos de vir do processo de OAuth
    const redirectAttempted = sessionStorage.getItem('auth_redirect_attempted');
    
    if (redirectAttempted) {
      // Marcar que estamos verificando para evitar redirecionamentos prematuros
      setIsVerifying(true);
      
      // Limpar flag de redirecionamento
      sessionStorage.removeItem('auth_redirect_attempted');
      
      // Verificar tokens manualmente
      const authToken = localStorageManager.getAuthToken();
      const userData = localStorageManager.getUserData();
      
      console.log("🔍 ProtectedRoute: Verificação manual após redirecionamento OAuth:", {
        temToken: !!authToken,
        temDadosUsuario: !!userData,
        timestampRedirecionamento: redirectAttempted
      });
      
      // Se tivermos token e dados do usuário, definir como autenticado
      if (authToken && userData) {
        console.log("✅ ProtectedRoute: Autenticação manual bem-sucedida");
        setManualCheck(true);
        
        // Forçar revalidação no contexto para atualizar o estado em toda a aplicação
        revalidateAuth().then(() => {
          console.log("✅ ProtectedRoute: Revalidação do contexto concluída");
          setIsVerifying(false);
        }).catch(() => {
          console.log("❌ ProtectedRoute: Falha na revalidação do contexto");
          setIsVerifying(false);
        });
      } else {
        console.log("❌ ProtectedRoute: Verificação manual falhou");
        setManualCheck(false);
        setIsVerifying(false);
      }
    }
  }, [isAuthenticated, loading, revalidateAuth]);
  
  // Verificação contínua do localStorage se o estado do contexto estiver inconsistente
  useEffect(() => {
    // Se estamos autenticados pelo contexto ou pela verificação manual, não precisamos verificar
    if (isAuthenticated || manualCheck === true || isVerifying) {
      return;
    }
    
    // Última tentativa de verificar o localStorage
    const authToken = localStorageManager.getAuthToken();
    const userData = localStorageManager.getUserData();
    
    if (authToken && userData && !isAuthenticated) {
      console.log("⚠️ ProtectedRoute: Estado inconsistente detectado - revalidando...");
      // Tentar forçar atualização do contexto
      revalidateAuth().then(() => {
        console.log("✅ ProtectedRoute: Revalidação do contexto bem-sucedida");
      }).catch(err => {
        console.error("❌ ProtectedRoute: Falha na revalidação:", err);
      });
    }
  }, [isAuthenticated, manualCheck, revalidateAuth, isVerifying]);

  console.log("ProtectedRoute: Status atual:", {
    isAuthenticated,
    loading,
    manualCheck,
    hasUser: !!user,
    pathname: location.pathname,
    isVerifying
  });

  // Se ainda estamos carregando, verificando ou temos confirmação manual de autenticação
  if (loading || isVerifying || (manualCheck === true && !isAuthenticated)) {
    console.log("ProtectedRoute: Aguardando verificação de autenticação...");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Última verificação: token no localStorage como fallback absoluto
  const lastResortToken = localStorageManager.getAuthToken();
  const lastResortUserData = localStorageManager.getUserData();
  
  // Se não estamos autenticados pelo contexto nem pela verificação manual, mas temos token
  if (!isAuthenticated && manualCheck !== true && lastResortToken && lastResortUserData) {
    console.log("⚠️ ProtectedRoute: Estado inconsistente - Token presente mas não autenticado");
    // Forçar atualização do estado usando a revalidação do contexto
    revalidateAuth();
    
    // Mostrar loader enquanto revalidamos
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Revalidando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se definitivamente não estamos autenticados
  if (!isAuthenticated && manualCheck !== true) {
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
