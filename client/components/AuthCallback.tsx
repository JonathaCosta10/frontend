import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { localStorageManager } from '../lib/localStorage';
import { useToast } from '../hooks/use-toast';
import { useTranslation } from '@/contexts/TranslationContext';

/**
 * Componente AuthCallback
 * 
 * Processa callbacks de autenticação OAuth do Google e outros provedores.
 * Este componente lida com diferentes formatos de URL que podem ser retornados
 * no processo de autenticação.
 */
const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState('Processando autenticação...');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        setStatus('Processando código de autorização...');
        console.log("📌 URL completa do callback:", window.location.href);
        
        // Extrair parâmetros da URL
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const flowName = urlParams.get('flowName');
        const returnTo = urlParams.get('return_to') || '/dashboard';
        
        console.log("🔄 Parâmetros recebidos:", { 
          hasCode: !!code,
          hasState: !!state,
          flowName: flowName || 'não especificado',
          error: error || 'nenhum',
          returnTo: returnTo || 'não especificado'
        });
        
        if (error) {
          throw new Error(`Erro de autenticação: ${error}`);
        }
        
        if (!code) {
          throw new Error('Código de autorização não encontrado');
        }
        
        setStatus('Validando com backend...');
        console.log("🔄 Fazendo requisição para o backend...");
        
        // Use a dedicated callback URL if available, otherwise construct from the backend URL
        const callbackUrl = import.meta.env.VITE_OAUTH_CALLBACK_URL || 
                          `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'}/auth/frontend-oauth-callback`;
                          
        console.log(`🔄 Enviando código de autorização para: ${callbackUrl}`);
        
        // Fazer POST para o endpoint do backend
        const response = await fetch(callbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': import.meta.env.VITE_API_KEY || 'dev-api-key-local'
          },
          body: JSON.stringify({
            code,
            state,
            return_to: returnTo
          }),
          // Ensure credentials are sent for local development CORS
          credentials: 'include'
        });
        
        if (!response.ok) {
          console.error("❌ Erro na resposta do backend:", response.status, response.statusText);
          throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }
        
        const authData = await response.json();
        console.log("📦 Resposta do backend:", authData);
        
        if (authData.success) {
          setStatus('Login bem-sucedido! Processando dados...');
          
          // Armazenar tokens e dados do usuário no localStorage
          if (authData.tokens?.access) {
            localStorageManager.setAuthToken(authData.tokens.access);
          }
          
          if (authData.tokens?.refresh) {
            localStorageManager.setRefreshToken(authData.tokens.refresh);
          }
          
          if (authData.user) {
            localStorageManager.setUserData(authData.user);
            
            // Armazenar explicitamente o status premium como boolean
            const isPaidUserBoolean = Boolean(authData.user.isPaidUser);
            localStorageManager.set("isPaidUser", isPaidUserBoolean);
            
            console.log("📊 Status premium explicitamente armazenado:", {
              valorOriginal: authData.user.isPaidUser,
              tipoOriginal: typeof authData.user.isPaidUser,
              valorArmazenado: isPaidUserBoolean,
              tipoArmazenado: typeof isPaidUserBoolean
            });
          }
          
          // IMPORTANTE: Armazenar session_id e device_fingerprint da nova estrutura
          if (authData.session) {
            console.log("🔐 Salvando dados da sessão:", authData.session);
            
            if (authData.session.session_id) {
              localStorageManager.setSessionId(authData.session.session_id);
              console.log("🆔 Session ID armazenado:", authData.session.session_id);
            }
            
            if (authData.session.device_fingerprint) {
              localStorageManager.setDeviceFingerprint(authData.session.device_fingerprint);
              console.log("👆 Device Fingerprint armazenado:", authData.session.device_fingerprint);
            }
          } else {
            console.warn("⚠️ Dados de sessão não encontrados na resposta! Isso causará erros nas chamadas API.");
          }
          
          console.log("💾 Dados salvos no localStorage:", {
            hasAccessToken: !!authData.tokens?.access,
            hasRefreshToken: !!authData.tokens?.refresh,
            hasUserData: !!authData.user
          });
          
          // Disparar eventos de autenticação
          window.dispatchEvent(new CustomEvent('auth:login:success', { 
            detail: { user: authData.user }
          }));
          
          try {
            const { eventEmitter } = await import('../lib/eventEmitter');
            eventEmitter.emit('auth:login:success', { user: authData.user });
            console.log("✅ Eventos de autenticação disparados");
          } catch (ee) {
            console.warn("⚠️ Não foi possível emitir pelo eventEmitter:", ee);
          }
          
          setStatus('Redirecionando para o dashboard...');
          
          toast({
            title: t("login_success") || "Login realizado com sucesso",
            description: `${t("welcome_message") || "Bem-vindo"}, ${authData.user?.full_name || authData.user?.name || authData.user?.email}!`,
          });
          
          // Redirecionar para a página especificada ou dashboard
          const redirectTo = authData.return_to || returnTo || '/dashboard';
          console.log("🔀 Redirecionando para:", redirectTo);
          
          // Configurar flag para evitar dupla navegação durante o processo de autenticação
          sessionStorage.setItem('auth_redirect_completed', 'true');
          
          // Verificar armazenamento completo antes de navegar
          const accessToken = localStorageManager.getAuthToken();
          const userData = localStorageManager.getUserData();
          const isPaidStatus = localStorageManager.get("isPaidUser");
          
          console.log("✅ Verificação final antes do redirecionamento:", {
            accessToken: !!accessToken,
            userData: !!userData,
            isPaidStatus: isPaidStatus,
            redirectTo: redirectTo
          });
          
          // Registrar a hora do login bem-sucedido
          localStorage.setItem('recentLoginAttempt', Date.now().toString());
          
          // Registrar o status da autenticação
          localStorage.setItem('authStatus', 'authenticated');
          
          // Disparar eventos adicionais para garantir sincronização entre componentes
          try {
            // Evento para notificar componentes sobre login bem-sucedido
            const loginSuccessEvent = new CustomEvent('login:success', { 
              detail: { 
                timestamp: new Date().toISOString(),
                user: authData.user
              } 
            });
            window.dispatchEvent(loginSuccessEvent);
            
            // Evento adicional para componentes antigos
            const authLoginEvent = new CustomEvent('authLogin', { 
              detail: { 
                success: true,
                user: authData.user
              } 
            });
            window.dispatchEvent(authLoginEvent);
            
            console.log("📡 Eventos de login bem-sucedido disparados");
          } catch (eventError) {
            console.warn("⚠️ Erro ao disparar eventos de login:", eventError);
          }
          
          setTimeout(() => {
            // Usar navigate do React Router para preservar o contexto da aplicação
            navigate(redirectTo);
            
            // Em caso de problema com o React Router, forçar um fallback após 500ms
            const fallbackTimer = setTimeout(() => {
              console.log("⚠️ Fallback: usando window.location para redirecionamento");
              window.location.href = redirectTo;
            }, 500);
            
            // Limpar o timer se a navegação for bem-sucedida
            return () => clearTimeout(fallbackTimer);
          }, 1000);
          
        } else {
          throw new Error(authData.error || 'Falha na autenticação');
        }
        
      } catch (error) {
        // Falha na autenticação
        console.error('❌ Erro no callback OAuth:', error);
        
        const errorMessage = (error as Error).message;
        setStatus(`Erro na autenticação: ${errorMessage}`);
        
        toast({
          title: t("auth_error") || "Erro na autenticação",
          description: t("auth_error_redirect") || "Ocorreu um erro durante o login. Redirecionando...",
          variant: "destructive"
        });
        
        // Redirecionar para página de login após um breve atraso
        setTimeout(() => {
          console.log('🔄 Redirecionando para login devido ao erro');
          navigate('/login');
        }, 3000);
      }
    };
    
    processOAuthCallback();
  }, [navigate, toast, t, location.search]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{status}</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        
        <p className="text-muted-foreground">
          {t("please_wait") || "Aguarde enquanto processamos seu login..."}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
