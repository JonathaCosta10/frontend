import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/TranslationContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import OAuthService from "@/services/oauth";
import { decodeJWT } from "@/utils/jwt";

type GoogleAuthContext = "signin" | "signup";

interface Props {
  context?: GoogleAuthContext;
}

export default function GoogleAuthButton({ context = "signin" }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { revalidateAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = () => {
    console.log("🚀 Iniciando autenticação Google...");
    setLoading(true);

    // Construir a URL de autenticação do Google com os parâmetros corretos
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = window.location.origin + "/auth/callbackflowName=GeneralOAuthFlow";
    const state = `oauth_${Math.random().toString(36).substr(2)}`;
    
    // Parâmetros específicos para o contexto (login/signup)
    const extraParams = {
      login_context: context,
      return_to: `${window.location.origin}/dashboard`,
      error_callback: `${window.location.origin}/auth/error`,
      app_version: "1.0.0",
      locale: navigator.language,
      device_id: `${navigator.platform}-${Math.random().toString(36).substr(2, 8)}`,
    };

    // Construir URL de autenticação
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "email profile openid",
      access_type: "offline",
      state,
      prompt: "select_account",
      ...extraParams
    });

    // Redirecionar para o endpoint unificado do backend
    const authUrl = `${backendUrl}/auth/unified/google/signin/?${params.toString()}`;
    console.log("🔄 Redirecionando para autenticação:", authUrl);
    window.location.href = authUrl;
  };

  // Initialize Google Identity Services for popup auth
  useEffect(() => {
    const initGoogleAuth = async () => {
      try {
        console.log("🔄 Inicializando autenticação Google...");
        
        // Ensure GSI is loaded
        if (!window.google || !window.google.accounts || !window.google.accounts.id) {
          console.log("⚠️ Biblioteca Google não encontrada, tentando carregar...");
          
          // Add the Google client script to the main HTML instead of dynamically
          if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
            console.log("📦 Adicionando script do Google ao documento");
            
            // Create a script element in the head (better CSP compatibility)
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            
            // Add nonce if needed for CSP
            if (document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
              console.log("🔒 CSP detectado, adicionando atributo nonce ao script");
              script.setAttribute('nonce', 'google-auth-nonce');
            }
            
            document.head.appendChild(script);
            
            // Wait for script to load with a timeout
            console.log("⌛ Aguardando carregamento do script...");
            await new Promise(resolve => {
              script.onload = () => {
                console.log("✅ Script do Google carregado com sucesso");
                resolve(true);
              };
              script.onerror = () => {
                console.error("❌ Erro ao carregar script do Google");
                resolve(false);
              };
              // Timeout as fallback
              setTimeout(resolve, 2000);
            });
          }
        }

        if (window.google && window.google.accounts && window.google.accounts.id) {
          const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ||
            '460141148400-djs1tkkr0e4eneqmetf7gfsvotphutcu.apps.googleusercontent.com';

          console.log("🔑 Google Client ID sendo usado:", clientId);
          console.log("🔧 Inicializando Google Identity Services...");

          // Cancel any existing session
          try {
            if (window.google?.accounts?.id?.cancel) {
              window.google.accounts.id.cancel();
            }
          } catch {}

          // Initialize with popup mode
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              if (response && response.credential) {
                setLoading(true);
                try {
                  console.log("🎯 Google Auth token recebido, processando...");
                  
                  // Decode the JWT token to get user information
                  const decoded = decodeJWT(response.credential);
                  console.log("🔑 Token decodificado:", decoded);
                  
                  if (decoded && decoded.email && decoded.sub) {
                    // Pass the required parameters to the OAuth service
                    await OAuthService.handleGoogleLogin({
                      email: decoded.email,
                      googleId: decoded.sub,
                      accessToken: response.credential // Using the credential as the access token
                    });
                  } else {
                    throw new Error("Token JWT inválido ou incompleto");
                  }
                } catch (err) {
                  console.error('Erro ao processar autenticação Google:', err);
                  toast({
                    title: t("error_occurred"),
                    description: t("google_auth_error"),
                    variant: "destructive",
                  });
                } finally {
                  setLoading(false);
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
            context,
            ux_mode: 'popup',
            state_cookie_domain: window.location.hostname,
          });

          console.log('✅ Google Identity Services initialized for popup auth');
        } else {
          console.warn("❌ Google Identity Services não disponível");
        }
      } catch (error) {
        console.warn('Failed to initialize Google Identity Services:', error);
      }
    };

    // Listener para mensagens do popup OAuth
    const handlePopupMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return; // Ignorar mensagens de outras origens
      }

      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        console.log("✅ Autenticação Google bem-sucedida via popup");
        setLoading(true);
        
        if (event.data.action === 'LOGIN_COMPLETE') {
          // Usuário já tem conta e está logado
          console.log("🎯 Login completo, redirecionando para dashboard...");
          
          // Revalidar o estado de autenticação primeiro
          revalidateAuth().then(() => {
            setLoading(false);
            toast({
              title: "Sucesso!",
              description: "Login com Google realizado com sucesso",
            });
            // Redirecionar para dashboard
            window.location.href = '/dashboard';
          }).catch((error) => {
            console.error("❌ Erro ao revalidar autenticação:", error);
            setLoading(false);
            toast({
              title: "Erro",
              description: "Erro ao atualizar estado de autenticação",
              variant: "destructive",
            });
          });
          
        } else if (event.data.action === 'SIGNUP_REQUIRED') {
          // Precisa completar o cadastro
          console.log("🔄 Cadastro Google iniciado, redirecionando para finalizar...");
          
          setTimeout(() => {
            setLoading(false);
            toast({
              title: "Quase lá!",
              description: "Complete seu cadastro para acessar o sistema",
            });
            // Redirecionar para página de cadastro com dados do Google
            window.location.href = `/signup?google_auth=true&code=${encodeURIComponent(event.data.code)}`;
          }, 1000);
          
        } else {
          // Caso genérico de sucesso
          console.log("✅ Autenticação bem-sucedida");
          
          setTimeout(() => {
            setLoading(false);
            toast({
              title: "Sucesso!",
              description: "Autenticação com Google realizada com sucesso",
            });
            // Verificar se está na página de login ou signup para redirecionar adequadamente
            const currentPath = window.location.pathname;
            if (currentPath.includes('/login')) {
              window.location.href = '/dashboard';
            } else if (currentPath.includes('/signup')) {
              window.location.href = '/dashboard';
            } else {
              window.location.reload();
            }
          }, 1000);
        }
        
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        console.error("❌ Erro na autenticação Google via popup:", event.data.error);
        setLoading(false);
        toast({
          title: t("error_occurred"),
          description: "Erro na autenticação com Google. Tente novamente.",
          variant: "destructive",
        });
      }
    };

    window.addEventListener('message', handlePopupMessage);
    initGoogleAuth();

    return () => {
      window.removeEventListener('message', handlePopupMessage);
    };
  }, [context, t, toast]);

  const buttonText = context === "signin" ? t("login_with_google") : t("signup_with_google");

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleGoogleAuth}
      type="button"
      disabled={loading}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {t("loading_text")}
        </span>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {buttonText}
        </>
      )}
    </Button>
  );
}
