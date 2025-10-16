import React, { useState } from "react";
import { Button } from '@/components/ui/button';
import { useTranslation } from '../../../contexts/TranslationContext';
import { useToast } from '@/shared/hooks/use-toast';
import { useAuth } from "@/core/auth/AuthContext";
import { clearAllAuthState } from '@/lib/authUtils';

type GoogleAuthContext = "signin" | "signup";

interface Props {
  context?: GoogleAuthContext;
}

/**
 * DirectGoogleAuthButton - Simple direct Google OAuth button
 * This button directly redirects the user to the Google OAuth page using the backend's redirect URI
 * Avoids the popup approach which can cause issues with code reuse
 */
export default function DirectGoogleAuthButton({ context = "signin" }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    if (loading) {
      console.log("⚠️ Autenticação já em andamento, ignorando clique");
      return;
    }
    
    console.log("🚀 Iniciando autenticação Google - Método DIRETO...");
    setLoading(true);

    try {
      // Limpar completamente o estado anterior
      clearAllAuthState();
      
      // Usar o client ID da configuração
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error("VITE_GOOGLE_CLIENT_ID não configurado");
      }

      // Gerar state único para segurança
      const state = 'google_auth_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      
  // Backend URL sempre em 127.0.0.1 no dev
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000').replace('localhost','127.0.0.1');
  // Definir o URL de retorno após autenticação
  const returnUrl = `${window.location.origin}/dashboard`;
      
      // Salvar state no localStorage para verificação posterior
      localStorage.setItem('google_auth_state', state);
      localStorage.setItem('google_auth_timestamp', Date.now().toString());
      
      // Parâmetros para endpoint unificado do backend (server-driven)
      const deviceId = `${navigator.platform}-${Math.random().toString(36).substring(2, 10)}`.substring(0, 40);
      const signinParams = new URLSearchParams({
        login_context: context,
        return_to: returnUrl,
        error_callback: `${window.location.origin}/auth/error`,
        app_version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        locale: navigator.language,
        device_id: deviceId,
        access_type: 'offline',
        prompt: 'consent',
        state
      });

      // URL de autenticação via backend (redireciona para Google)
      const signinUrl = `${backendUrl}/auth/unified/google/signin/?${signinParams.toString()}`;
      
      console.log("🔗 URL de autenticação (server-driven):", signinUrl);
      console.log("🔙 Return URL:", returnUrl);
      console.log("🔑 State:", state);

      // Redirecionar para a página de autenticação do Google
      // Isso fará com que o usuário seja redirecionado para o backend após autenticação
      // E o backend fará o redirecionamento para a URL especificada em return_to
      window.location.href = signinUrl;
      
    } catch (error) {
      console.error("❌ Erro no handleGoogleAuth:", error);
      setLoading(false);
      
      // Capturar detalhes mais específicos do erro
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido na autenticação";
      const errorType = error instanceof Error ? error.name : "UnknownError";
      
      // Log detalhado para facilitar a depuração
      console.log({
        type: "GOOGLE_AUTH_ERROR",
        errorType,
        errorMessage,
        timestamp: new Date().toISOString(),
        context,
        clientIdPresent: !!import.meta.env.VITE_GOOGLE_CLIENT_ID,
      });
      
      // Determinar se é um erro que pode ser resolvido tentando novamente
      const isRetryableError = 
        errorMessage.includes("network") || 
        errorMessage.includes("timeout") || 
        errorMessage.toLowerCase().includes("conexão");
      
      // Redirecionar para página de erro em caso de problemas críticos
      if (!isRetryableError && error instanceof Error) {
        // Para erros críticos, redirecione para a página de tratamento de erros
        const errorParams = new URLSearchParams({
          error: errorType,
          message: encodeURIComponent(errorMessage),
          details: encodeURIComponent(JSON.stringify({
            timestamp: new Date().toISOString(),
            context,
            userAgent: navigator.userAgent,
            location: window.location.href
          }))
        });
        
        window.location.href = `/auth/error?${errorParams.toString()}`;
        return;
      }
      
      // Para erros menos críticos, apenas mostrar toast
      toast({
        title: "Erro na autenticação",
        description: errorMessage,
        variant: "destructive",
        action: isRetryableError ? (
          <Button variant="outline" onClick={() => handleGoogleAuth()}>
            Tentar novamente
          </Button>
        ) : undefined
      });
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleGoogleAuth}
      disabled={loading}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>Redirecionando...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>
            {context === "signin" ? t("signin_with_google") : t("signup_with_google")} (Direto)
          </span>
        </div>
      )}
    </Button>
  );
}
