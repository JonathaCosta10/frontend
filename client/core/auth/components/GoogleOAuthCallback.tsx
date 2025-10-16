import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { localStorageManager } from '../../../lib';
import { useToast } from '@/shared/hooks/use-toast';
import { useTranslation } from '../../../contexts/TranslationContext';

const GoogleOAuthCallback: React.FC = () => {
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
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const returnTo = searchParams.get('return_to');
        
        console.log("🔄 Parâmetros recebidos:", { 
          hasCode: !!code,
          hasState: !!state,
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
        console.log("� Fazendo requisição para o backend...");
        
        // Fazer POST para o novo endpoint do backend
        const response = await fetch('https://restbackend-dc8667cf0950.herokuapp.com/auth/frontend-oauth-callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            state: state,
            return_to: returnTo || '/dashboard'
          })
        });
        
        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }
        
        const authData = await response.json();
        console.log("📦 Resposta do backend:", authData);
        
        if (authData.success) {
          setStatus('Login bem-sucedido! Processando dados...');
          
          // Armazenar tokens e dados do usuário no localStorage
          localStorageManager.setAuthToken(authData.tokens.access);
          localStorageManager.setRefreshToken(authData.tokens.refresh);
          localStorageManager.setUserData(authData.user);
          
          console.log("💾 Dados salvos no localStorage:", {
            hasAccessToken: !!authData.tokens.access,
            hasRefreshToken: !!authData.tokens.refresh,
            user: authData.user
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
            title: "Login realizado com sucesso",
            description: `Bem-vindo, ${authData.user.full_name || authData.user.email}!`,
          });
          
          // Redirecionar para a página especificada ou dashboard
          const redirectTo = authData.return_to || '/dashboard';
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
          title: "Erro na autenticação",
          description: "Ocorreu um erro durante o login. Redirecionando...",
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
        <p className="text-muted-foreground">Aguarde enquanto processamos sua autenticação...</p>
        
        {/* Informações de depuração - remover em produção */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left max-w-lg">
            <h3 className="text-sm font-medium mb-2">Informações de depuração (apenas desenvolvimento)</h3>
            <div className="text-xs space-y-1">
              <p><span className="font-medium">URL:</span> {window.location.href}</p>
              <p><span className="font-medium">Status:</span> {status}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;
