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
        
        // Fazer POST para o endpoint do backend
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/auth/frontend-oauth-callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': import.meta.env.VITE_API_KEY || 'dev-api-key-local'
          },
          body: JSON.stringify({
            code,
            state,
            return_to: returnTo
          })
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
          
          setTimeout(() => {
            window.location.replace(redirectTo);
          }, 1500);
          
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
