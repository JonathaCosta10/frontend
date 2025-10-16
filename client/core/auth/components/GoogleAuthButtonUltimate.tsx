import React, { useState } from "react";
import { Button } from '@/components/ui/button';
import { useTranslation } from '../../../contexts/TranslationContext';
import { useToast } from '@/shared/hooks/use-toast';
import { useAuth } from "@/core/auth/AuthContext";
import { clearAllAuthState, debugAuthState, validateAuthState } from '@/lib/authUtils';

type GoogleAuthContext = "signin" | "signup";

interface Props {
  context?: GoogleAuthContext;
}

export default function GoogleAuthButtonUltimate({ context = "signin" }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { revalidateAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    // Prevenir múltiplos cliques
    if (loading) {
      console.log("⚠️ Autenticação já em andamento, ignorando clique");
      return;
    }
    
    console.log("🚀 Iniciando autenticação Google - Método Direto...");
    setLoading(true);

    try {
      // Debug estado atual antes de limpar
      debugAuthState();
      
      // Limpar qualquer estado anterior para evitar conflitos
      clearAllAuthState();
      console.log("🧹 Estado anterior limpo");
      
      // Verificar configuração
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      // IMPORTANTE: Usar sempre 127.0.0.1 em vez de localhost para consistência com o backend
      const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('localhost', '127.0.0.1') || "http://127.0.0.1:8000";
      
      if (!clientId) {
        throw new Error("VITE_GOOGLE_CLIENT_ID não configurado");
      }

      console.log("✅ Configuração válida:", { clientId: clientId.substring(0, 20) + "...", backendUrl });

      // Gerar state único
      const state = 'google_auth_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();

      // Paridade de parâmetros com o fluxo direto (usar endpoint unificado do backend)
      const deviceId = `${navigator.platform}-${Math.random().toString(36).substring(2, 10)}`.substring(0, 40);
      const returnTo = `${window.location.origin}/dashboard`;
      const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
      const locale = navigator.language;

      // Salvar state localmente (útil para diagnósticos)
      localStorage.setItem('google_auth_state', state);
      localStorage.setItem('google_auth_timestamp', Date.now().toString());

      // Usar o endpoint do backend que redireciona para o Google com todos os parâmetros relevantes
      const signinParams = new URLSearchParams({
        login_context: context,
        return_to: returnTo,
        error_callback: `${window.location.origin}/auth/error`,
        app_version: appVersion,
        locale,
        device_id: deviceId,
        access_type: 'offline',
        prompt: 'consent',
        state
      });
      const signinUrl = `${backendUrl}/auth/unified/google/signin/?${signinParams.toString()}`;

      console.log("🔗 URL de autenticação (via backend signin):", signinUrl);
      console.log("🔑 State:", state);

      // Listener para mensagens do popup
      const handlePopupMessage = (event: MessageEvent) => {
        console.log("📨 Mensagem recebida do popup:", event.data);
        
        if (event.origin !== window.location.origin) {
          console.warn("⚠️ Origem inválida:", event.origin);
          return;
        }

        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          console.log("✅ Autenticação Google bem-sucedida!");
          
          window.removeEventListener('message', handlePopupMessage);
          
          // Revalidar estado de autenticação
          revalidateAuth().then(() => {
            setLoading(false);
            toast({
              title: "Sucesso!",
              description: "Login com Google realizado com sucesso",
            });
            
            // Redirecionar baseado no contexto
            if (event.data.action === 'LOGIN_COMPLETE') {
              window.location.href = '/dashboard';
            } else if (event.data.action === 'SIGNUP_REQUIRED') {
              window.location.href = `/signup?google_auth=true`;
            }
          }).catch((error) => {
            console.error("❌ Erro ao revalidar:", error);
            setLoading(false);
            toast({
              title: "Aviso",
              description: "Autenticação realizada, mas houve um problema na sincronização",
              variant: "destructive",
            });
          });
          
        } else if (event.data.type === 'GOOGLE_AUTH_EXPIRED') {
          console.log("⚠️ Código OAuth expirado, implementando retry automático...");
          
          window.removeEventListener('message', handlePopupMessage);
          
          const newAuthUrl = event.data.newAuthUrl;
          const shouldAutoRetry = event.data.autoRetry;
          
          if (shouldAutoRetry && newAuthUrl) {
            console.log("🔄 Usando nova URL de autenticação fornecida pelo backend:", newAuthUrl);
            
            toast({
              title: "Código expirado",
              description: "Reiniciando autenticação automaticamente...",
            });
            
            // Usar a nova URL fornecida pelo backend
            setTimeout(() => {
              console.log("🚀 Abrindo nova janela de autenticação com URL atualizada...");
              
              const popup = window.open(
                newAuthUrl,
                'google-oauth-popup-retry',
                'width=500,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no,left=' +
                (window.screenX + (window.outerWidth - 500) / 2) + ',top=' +
                (window.screenY + (window.outerHeight - 600) / 2)
              );

              if (!popup) {
                setLoading(false);
                toast({
                  title: "Popup bloqueado",
                  description: "Por favor, permita popups e tente novamente",
                  variant: "destructive",
                });
                return;
              }

              // Reconfigurar listeners para o novo popup
              window.addEventListener('message', handlePopupMessage);
              
              // Verificar se popup foi fechado manualmente
              const checkClosed = setInterval(() => {
                if (popup.closed) {
                  console.log("🚪 Popup de retry foi fechado manualmente");
                  clearInterval(checkClosed);
                  window.removeEventListener('message', handlePopupMessage);
                  setLoading(false);
                  
                  toast({
                    title: "Autenticação cancelada",
                    description: "A janela de autenticação foi fechada",
                  });
                }
              }, 1000);

            }, 1000);
            
          } else {
            // Fallback: tentar gerar nova autenticação manualmente
            setLoading(false);
            toast({
              title: "Código expirado",
              description: "Tentando novamente...",
            });
            
            setTimeout(() => {
              handleGoogleAuth();
            }, 1500);
          }
          
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          console.error("❌ Erro na autenticação:", event.data.error);
          
          window.removeEventListener('message', handlePopupMessage);
          setLoading(false);
          
          let errorMessage = event.data.message || event.data.error || "Erro desconhecido";
          let shouldRetry = false;
          
          // Tratar diferentes tipos de erro com mensagens específicas
          switch (event.data.error) {
            case 'expired_code':
              errorMessage = "Código de autenticação expirou. Tentando novamente...";
              shouldRetry = true;
              break;
              
            case 'invalid_grant':
              errorMessage = "Sessão de autenticação inválida. Iniciando nova autenticação...";
              shouldRetry = true;
              break;
              
            case 'access_denied':
              errorMessage = "Acesso negado pelo usuário. Tente novamente se desejar.";
              shouldRetry = false;
              break;
              
            case 'missing_params':
              errorMessage = "Parâmetros de autenticação ausentes. Tentando novamente...";
              shouldRetry = true;
              break;
              
            case 'authentication_failed':
              errorMessage = "Falha na verificação de autenticação. Verifique sua conexão.";
              shouldRetry = false;
              break;
              
            case 'callback_error':
              errorMessage = "Erro interno no processamento. Tentando novamente...";
              shouldRetry = true;
              break;
              
            default:
              errorMessage = event.data.message || `Erro: ${event.data.error}`;
              // Para erros desconhecidos, tentar uma vez
              shouldRetry = true;
              break;
          }
          
          toast({
            title: shouldRetry ? "Erro temporário" : "Erro na autenticação",
            description: errorMessage,
            variant: shouldRetry ? "default" : "destructive",
          });
          
          // Retry automático para erros recuperáveis
          if (shouldRetry) {
            setTimeout(() => {
              console.log(`🔄 Tentando novamente após erro: ${event.data.error}`);
              handleGoogleAuth();
            }, 2000);
          }
        }
      };

      // Adicionar listener
      window.addEventListener('message', handlePopupMessage);

      // Abrir popup
      console.log("🪟 Abrindo popup de autenticação...");
      const popup = window.open(
        signinUrl,
        'google-oauth-popup',
        'width=500,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no,left=' +
        (window.screenX + (window.outerWidth - 500) / 2) + ',top=' +
        (window.screenY + (window.outerHeight - 600) / 2)
      );

      if (!popup) {
        window.removeEventListener('message', handlePopupMessage);
        throw new Error("Popup foi bloqueado pelo navegador. Por favor, permita popups para este site.");
      }

      // Verificar se popup foi fechado manualmente
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          console.log("🚪 Popup foi fechado manualmente");
          clearInterval(checkClosed);
          window.removeEventListener('message', handlePopupMessage);
          setLoading(false);
          
          toast({
            title: "Autenticação cancelada",
            description: "A janela de autenticação foi fechada",
          });
        }
      }, 1000);

      // Timeout de segurança
      setTimeout(() => {
        if (!popup.closed) {
          console.log("⏰ Timeout da autenticação");
          popup.close();
          clearInterval(checkClosed);
          window.removeEventListener('message', handlePopupMessage);
          setLoading(false);
          
          toast({
            title: "Timeout",
            description: "A autenticação demorou muito para ser concluída",
            variant: "destructive",
          });
        }
      }, 300000); // 5 minutos

    } catch (error) {
      console.error("❌ Erro no handleGoogleAuth:", error);
      setLoading(false);
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido na autenticação",
        variant: "destructive",
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
          <span>Autenticando...</span>
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
            {context === "signin" ? t("signin_with_google") : t("signup_with_google")}
          </span>
        </div>
      )}
    </Button>
  );
}
