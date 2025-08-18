import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { localStorageManager } from '../lib/localStorage';
import { useToast } from '../hooks/use-toast';
import { useTranslation } from '@/contexts/TranslationContext';
import OAuthService from '../services/oauth';

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
        
        const code = searchParams.get('code');
        const state = searchParams.get('state');
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
          hasCode: !!code,
          hasState: !!state,
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
        
        // Se recebemos tokens diretamente, processar imediatamente
        if (success === 'true' && accessToken && refreshToken) {
          console.log("✅ Tokens recebidos diretamente do backend, processando...");
          setStatus('Tokens recebidos, autenticando usuário...');
          
          // Montar dados do usuário
          const userData = {
            id: userId,
            email: email,
            name: name,
            auth_type: type
          };
          
          // Armazenar tokens e dados do usuário
          localStorageManager.setAuthToken(accessToken);
          localStorageManager.setRefreshToken(refreshToken);
          localStorageManager.setUserData(userData);
          
          // Disparar eventos de autenticação
          window.dispatchEvent(new CustomEvent('auth:login:success', { 
            detail: { user: userData }
          }));
          
          try {
            const { eventEmitter } = await import('../lib/eventEmitter');
            eventEmitter.emit('auth:login:success', { user: userData });
          } catch (ee) {
            console.warn("⚠️ Não foi possível emitir pelo eventEmitter:", ee);
          }
          
          setStatus('Login bem-sucedido! Redirecionando...');
          
          toast({
            title: t("login_success"),
            description: t("redirecting_to_dashboard"),
          });
          
          // Redirecionar para o dashboard
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1000);
          
          return;
        }
        
        if (!code || !state) {
          throw new Error('Parâmetros de autenticação incompletos');
        }
        
        // Processar o código de autorização
        setStatus('Processando código de autorização...');
        const result = await OAuthService.handleOAuthCallback();
        
        if (result.success && result.user) {
          setStatus('Login bem-sucedido! Redirecionando...');
          
          // Verificar se o token de autenticação foi armazenado corretamente
          const authToken = localStorageManager.getAuthToken();
          if (!authToken) {
            console.error("❌ Token de autenticação não encontrado após login");
            throw new Error('Token de autenticação não disponível');
          }
          
          console.log("✅ Token de autenticação verificado com sucesso");
          
          toast({
            title: t("login_success"),
            description: t("redirecting_to_dashboard"),
          });
          
          // Forçar definição do estado de autenticação
          try {
            // Garantir que os dados do usuário estão armazenados no localStorage
            if (result.user) {
              localStorageManager.setUserData(result.user);
            }
            
            // Garantir que os tokens estão armazenados no localStorage
            if (result.access) {
              localStorageManager.setAuthToken(result.access);
            } else if ((result as any).tokens?.access) {
              localStorageManager.setAuthToken((result as any).tokens.access);
            }
            
            if (result.refresh) {
              localStorageManager.setRefreshToken(result.refresh);
            } else if ((result as any).tokens?.refresh) {
              localStorageManager.setRefreshToken((result as any).tokens.refresh);
            }
            
            // Disparar evento de autenticação para que outros componentes saibam (CustomEvent)
            window.dispatchEvent(new CustomEvent('auth:login:success', { 
              detail: { user: result.user }
            }));
            console.log("✅ Evento de login bem-sucedido disparado (CustomEvent)");
            
            // Também disparar o evento para o sistema de eventos (eventEmitter)
            try {
              // Importar o eventEmitter diretamente
              const { eventEmitter } = await import('../lib/eventEmitter');
              eventEmitter.emit('auth:login:success', { user: result.user });
              console.log("✅ Evento eventEmitter disparado");
              
              // Solicitar revalidação global via evento
              window.dispatchEvent(new CustomEvent('auth:request:revalidation', { 
                detail: { source: 'GoogleOAuthCallback' }
              }));
              console.log("🔄 Solicitação de revalidação global enviada via evento");
            } catch (ee) {
              console.warn("⚠️ Não foi possível emitir pelo eventEmitter:", ee);
            }
          } catch (e) {
            console.warn("⚠️ Erro ao disparar evento de login:", e);
          }
          
          // Redirecionar para o dashboard ou página especificada
          const returnTo = searchParams.get('return_to') || '/dashboard';
          console.log("🔀 Redirecionando para:", returnTo);
          
          // Tentar atualizar estado antes do redirecionamento
          try {
            // Verificar novamente se o token está presente e tentar recarregar dados do usuário
            const userData = localStorageManager.getUserData();
            const finalAuthToken = localStorageManager.getAuthToken();
            
            console.log("👤 Verificação final antes do redirecionamento:", {
              tokenPresente: !!finalAuthToken,
              dadosUsuarioPresentes: !!userData,
              destino: returnTo
            });
            
            if (!finalAuthToken) {
              console.error("⚠️ Token não encontrado antes do redirecionamento, tentando última recuperação...");
              
              // Tentar recuperar os tokens diretamente do resultado
              const resultAny = result as any;
              if (resultAny.access) {
                localStorageManager.setAuthToken(resultAny.access);
                console.log("✅ Token recuperado do resultado: formato direto");
              } else if (resultAny.tokens?.access) {
                localStorageManager.setAuthToken(resultAny.tokens.access);
                console.log("✅ Token recuperado do resultado: formato aninhado");
              }
              
              if (resultAny.refresh) {
                localStorageManager.setRefreshToken(resultAny.refresh);
              } else if (resultAny.tokens?.refresh) {
                localStorageManager.setRefreshToken(resultAny.tokens.refresh);
              }
              
              // Verificação final após última tentativa
              const emergencyToken = localStorageManager.getAuthToken();
              console.log("� Resultado da recuperação de emergência:", emergencyToken ? "Sucesso" : "Falha");
            }
            
            // Forçar o estado de autenticação antes de redirecionar
            if (result.user) {
              localStorageManager.setUserData(result.user);
              console.log("👤 Dados do usuário atualizados antes do redirecionamento");
              
              // Disparar evento novamente para garantir
              window.dispatchEvent(new CustomEvent('auth:login:success', { 
                detail: { user: result.user }
              }));
            }
            
            // Verificar localhost vs 127.0.0.1 mismatch que pode causar problemas de sessão
            const currentOrigin = window.location.origin;
            const returnToLower = returnTo.toLowerCase();
            
            // Garantir que não estamos redirecionando entre localhost e 127.0.0.1
            let finalDestination = returnTo;
            if ((currentOrigin.includes('localhost') && returnToLower.includes('127.0.0.1')) ||
                (currentOrigin.includes('127.0.0.1') && returnToLower.includes('localhost'))) {
                
              // Substituir o host para corresponder ao origin atual
              const returnToUrl = new URL(returnTo);
              const currentUrl = new URL(currentOrigin);
              returnToUrl.host = currentUrl.host;
              finalDestination = returnToUrl.toString();
              console.log("⚠️ Corrigindo mismatch localhost/127.0.0.1:", finalDestination);
            }
            
            // Verificar se o destino é uma URL completa ou uma rota relativa
            if (!finalDestination.includes('://')) {
              // É uma rota relativa, adicionar o origin atual
              finalDestination = currentOrigin + finalDestination;
              console.log("⚠️ Convertendo rota relativa para absoluta:", finalDestination);
            }
            
            console.log("⏰ Redirecionando para " + finalDestination, {
              tokensArmazenados: {
                access: !!localStorageManager.getAuthToken(),
                refresh: !!localStorageManager.getRefreshToken()
              },
              dadosUsuarioArmazenados: !!localStorageManager.getUserData()
            });
            
            // Definir uma flag para rastrear o redirecionamento
            sessionStorage.setItem('auth_redirect_attempted', new Date().toString());
            
            // Preparar para o redirecionamento
            try {
              // Enviar um evento de telemetria para o console
              console.log("🚀 REDIRECIONAMENTO OAUTH INICIADO", { 
                timestamp: new Date().toString(),
                destino: finalDestination,
                origemCallback: window.location.href
              });
              
              // Forçar um refresh completo para garantir que a página carregue com o estado de autenticação atualizado
              window.location.replace(finalDestination);
            } catch (redirectError) {
              console.error("❌ Erro durante redirecionamento:", redirectError);
              // Fallback para o redirecionamento tradicional
              window.location.href = finalDestination;
            }
          } catch (e) {
            console.error("❌ Erro antes do redirecionamento:", e);
            // Fallback: usar o redirecionamento tradicional
            window.location.href = returnTo;
          }
        } else {
          throw new Error(result.error || 'Falha ao processar autenticação');
        }
      } catch (error) {
        // Falha na autenticação
        console.error('❌ Erro no callback OAuth:', error);
        
        // Mensagem de erro personalizada para CSRF
        const errorMessage = (error as Error).message;
        setStatus(`Erro na autenticação: ${errorMessage}`);
        
        // Verificar se é um erro de estado inválido (CSRF)
        if (errorMessage.includes('Estado OAuth inválido') || errorMessage.includes('CSRF')) {
          console.log('⚠️ Detectado erro de estado inválido, tentando regenerar o fluxo de autenticação...');
          
          // Opção 1: Tentar reautenticar automaticamente
          toast({
            title: t("auth_error"),
            description: "Erro na validação de segurança. Tentando novamente...",
            variant: "destructive"
          });
          
          // Redirecionar para página de login após um breve atraso
          setTimeout(() => {
            console.log('🔄 Redirecionando para login para nova tentativa');
            navigate('/login', { state: { forceRefresh: true } });
          }, 2000);
        } else {
          // Outros erros
          toast({
            title: t("auth_error"),
            description: t("login_failed"),
            variant: "destructive"
          });
          
          // Redirecionar para página de erro de login após um breve atraso
          setTimeout(() => navigate('/login-error'), 2000);
        }
      }
    };
    
    processOAuthCallback();
  }, [navigate, toast, t]);
  
  // Obtém parâmetros para exibição
  const params = new URLSearchParams(window.location.search);
  const urlState = params.get('state') || 'Não encontrado';
  const storedState = sessionStorage.getItem("oauth_state") || 'Não encontrado';
  const baseState = sessionStorage.getItem("oauth_base_state") || 'Não encontrado';
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{status}</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Redirecionando para o dashboard...</p>
        
        {/* Informações de depuração - remover em produção */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left max-w-lg">
            <h3 className="text-sm font-medium mb-2">Informações de depuração (apenas desenvolvimento)</h3>
            <div className="text-xs space-y-1">
              <p><span className="font-medium">URL:</span> {window.location.href}</p>
              <p><span className="font-medium">State na URL:</span> {urlState}</p>
              <p><span className="font-medium">State armazenado:</span> {storedState}</p>
              <p><span className="font-medium">Base state:</span> {baseState}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;
