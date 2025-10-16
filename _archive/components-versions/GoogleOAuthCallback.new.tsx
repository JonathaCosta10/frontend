import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { localStorageManager } from '../lib/localStorage';
import { useToast } from '../hooks/use-toast';
import { useTranslation } from '@/contexts/TranslationContext';

const GoogleOAuthCallback: React.FC = () => {
  const [status, setStatus] = useState('Processando autenticação...');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Analise especial para capturar o URL com formato incorreto (callbackflowName=)
        const fullUrl = window.location.href;
        console.log("📌 URL completa do callback:", fullUrl);
        
        // Tentar corrigir um formato de URL malformado (sem o '?' entre callback e flowName)
        let searchParams;
        if (fullUrl.includes('callbackflowName=')) {
          // Para URL do tipo: /auth/callbackflowName=GeneralOAuthFlow&success=true&access_token=...
          const queryStart = fullUrl.indexOf('callbackflowName=');
          const queryString = fullUrl.substring(queryStart);
          // Adicionar um '?' no início se não existir
          const correctedQuery = queryString.startsWith('?') ? queryString : '?' + queryString;
          searchParams = new URLSearchParams(correctedQuery.replace('callbackflowName=', 'flowName='));
          console.log("🔧 Query string extraída e corrigida:", correctedQuery);
          console.log("🔧 SearchParams processados:", Array.from(searchParams.entries()));
        } else {
          searchParams = new URLSearchParams(location.search);
        }
        
        const error = searchParams.get('error');
        
        // Verificar se recebemos tokens diretamente na URL (sucesso do backend)
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const success = searchParams.get('success');
        const userId = searchParams.get('user_id');
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        const type = searchParams.get('type');
        
        console.log("🔄 Callback de autenticação recebido:", { 
          error: error || 'nenhum',
          flowName: searchParams.get('flowName') || 'não especificado',
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          success: success,
          type: type
        });
        
        if (error) {
          throw new Error(`Erro de autenticação: ${error}`);
        }
        
        // Se recebemos tokens diretamente na URL, processar imediatamente
        if (success === 'true' && accessToken && refreshToken) {
          console.log("✅ Tokens recebidos diretamente do backend, processando...");
          console.log("📊 Dados recebidos:", { 
            userId, email, name, type, 
            hasAccessToken: !!accessToken, 
            hasRefreshToken: !!refreshToken 
          });
          
          setStatus('Tokens recebidos, autenticando usuário...');
          
          // Decodificar o nome se estiver URL encoded
          const decodedName = name ? decodeURIComponent(name) : '';
          const decodedEmail = email ? decodeURIComponent(email) : '';
          
          // Montar dados do usuário
          const userData = {
            id: userId,
            email: decodedEmail,
            name: decodedName,
            full_name: decodedName,
            auth_type: type || 'google_login'
          };
          
          console.log("👤 Dados do usuário processados:", userData);
          
          // Armazenar tokens e dados do usuário
          localStorageManager.setAuthToken(accessToken);
          localStorageManager.setRefreshToken(refreshToken);
          localStorageManager.setUserData(userData);
          
          console.log("💾 Tokens e dados salvos no localStorage");
          
          // Disparar eventos de autenticação
          window.dispatchEvent(new CustomEvent('auth:login:success', { 
            detail: { user: userData }
          }));
          
          try {
            const { eventEmitter } = await import('../lib/eventEmitter');
            eventEmitter.emit('auth:login:success', { user: userData });
            console.log("✅ Eventos de autenticação disparados");
          } catch (ee) {
            console.warn("⚠️ Não foi possível emitir pelo eventEmitter:", ee);
          }
          
          setStatus('Login bem-sucedido! Redirecionando...');
          
          toast({
            title: "Login realizado com sucesso",
            description: "Redirecionando para o dashboard...",
          });
          
          // Redirecionar para o dashboard imediatamente
          console.log("🔀 Redirecionando para dashboard...");
          setTimeout(() => {
            window.location.replace('/dashboard');
          }, 1000);
          
          return;
        }
        
        // Se não temos success=true, é provavelmente um erro ou callback incompleto
        throw new Error('Callback OAuth incompleto ou inválido');
        
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
  }, [navigate, toast, t]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{status}</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Processando autenticação...</p>
        
        {/* Informações de depuração - remover em produção */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left max-w-lg">
            <h3 className="text-sm font-medium mb-2">Informações de depuração (apenas desenvolvimento)</h3>
            <div className="text-xs space-y-1">
              <p><span className="font-medium">URL:</span> {window.location.href}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;
